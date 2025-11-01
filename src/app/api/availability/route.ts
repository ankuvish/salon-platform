import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, salons, services, staff } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function generateTimeSlots(
  openingMinutes: number,
  closingMinutes: number,
  bookedSlots: TimeSlot[],
  slotDuration: number
): { availableSlots: TimeSlot[], bookedSlots: TimeSlot[] } {
  const availableSlots: TimeSlot[] = [];
  const allBookedSlots: TimeSlot[] = [];
  
  // Sort booked slots by start time
  const sortedBookings = bookedSlots
    .map(slot => ({
      start: parseTime(slot.startTime),
      end: parseTime(slot.endTime)
    }))
    .sort((a, b) => a.start - b.start);

  let currentTime = openingMinutes;

  // Generate all possible slots and mark them as available or booked
  while (currentTime + slotDuration <= closingMinutes) {
    const slotStart = currentTime;
    const slotEnd = currentTime + slotDuration;
    
    // Check if this slot overlaps with any booking
    const isBooked = sortedBookings.some(booking => {
      return (slotStart < booking.end && slotEnd > booking.start);
    });

    const slot = {
      startTime: formatTime(currentTime),
      endTime: formatTime(currentTime + slotDuration)
    };

    if (isBooked) {
      allBookedSlots.push({ ...slot, isBooked: true });
    } else {
      availableSlots.push(slot);
    }

    currentTime += slotDuration;
  }

  return { availableSlots, bookedSlots: allBookedSlots };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const salonId = searchParams.get('salonId');
    const staffId = searchParams.get('staffId');
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');

    // Validate required parameters
    if (!salonId || !staffId || !date) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters: salonId, staffId, and date are required',
          code: 'MISSING_REQUIRED_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Validate ID formats
    if (isNaN(parseInt(salonId)) || isNaN(parseInt(staffId))) {
      return NextResponse.json(
        { 
          error: 'Invalid salonId or staffId format',
          code: 'INVALID_ID_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { 
          error: 'Invalid date format. Use YYYY-MM-DD',
          code: 'INVALID_DATE_FORMAT'
        },
        { status: 400 }
      );
    }

    // Validate serviceId if provided
    if (serviceId && isNaN(parseInt(serviceId))) {
      return NextResponse.json(
        { 
          error: 'Invalid serviceId format',
          code: 'INVALID_SERVICE_ID'
        },
        { status: 400 }
      );
    }

    const parsedSalonId = parseInt(salonId);
    const parsedStaffId = parseInt(staffId);

    // Check if salon exists
    const salon = await db.select()
      .from(salons)
      .where(eq(salons.id, parsedSalonId))
      .limit(1);

    if (salon.length === 0) {
      return NextResponse.json(
        { 
          error: 'Salon not found',
          code: 'SALON_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if staff exists and belongs to the salon
    const staffMember = await db.select()
      .from(staff)
      .where(
        and(
          eq(staff.id, parsedStaffId),
          eq(staff.salonId, parsedSalonId)
        )
      )
      .limit(1);

    if (staffMember.length === 0) {
      return NextResponse.json(
        { 
          error: 'Staff member not found or does not belong to this salon',
          code: 'STAFF_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Get service duration if serviceId provided
    let slotDuration = 30; // Default 30 minutes
    if (serviceId) {
      const parsedServiceId = parseInt(serviceId);
      const service = await db.select()
        .from(services)
        .where(
          and(
            eq(services.id, parsedServiceId),
            eq(services.salonId, parsedSalonId)
          )
        )
        .limit(1);

      if (service.length === 0) {
        return NextResponse.json(
          { 
            error: 'Service not found or does not belong to this salon',
            code: 'SERVICE_NOT_FOUND'
          },
          { status: 404 }
        );
      }

      slotDuration = service[0].durationMinutes;
    }

    // Get all bookings for this staff member on the specified date (confirmed and pending)
    const existingBookings = await db.select()
      .from(bookings)
      .where(
        and(
          eq(bookings.staffId, parsedStaffId),
          eq(bookings.bookingDate, date)
        )
      );

    // Extract booked time slots (including pending bookings to avoid double-booking)
    const bookedSlots: TimeSlot[] = existingBookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'pending')
      .map(booking => ({
        startTime: booking.startTime,
        endTime: booking.endTime
      }));

    // Get salon opening and closing times
    const openingMinutes = parseTime(salon[0].openingTime);
    const closingMinutes = parseTime(salon[0].closingTime);

    // Generate available and booked time slots
    const { availableSlots, bookedSlots: markedBookedSlots } = generateTimeSlots(
      openingMinutes,
      closingMinutes,
      bookedSlots,
      slotDuration
    );

    return NextResponse.json({
      date,
      salonId: parsedSalonId,
      staffId: parsedStaffId,
      availableSlots,
      bookedSlots: markedBookedSlots
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      },
      { status: 500 }
    );
  }
}