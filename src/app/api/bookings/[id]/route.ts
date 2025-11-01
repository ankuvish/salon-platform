import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, salons, services, staff, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid booking ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking[0], { status: 200 });
  } catch (error) {
    console.error('GET booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid booking ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id);

    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      customerId,
      salonId,
      serviceId,
      staffId,
      bookingDate,
      startTime,
      endTime,
      status,
      notes,
    } = body;

    if (customerId !== undefined) {
      // Changed: customerId is now text, validate as string
      if (typeof customerId !== 'string' || !customerId.trim()) {
        return NextResponse.json(
          { error: 'Valid customer ID is required', code: 'INVALID_CUSTOMER_ID' },
          { status: 400 }
        );
      }

      const customer = await db
        .select()
        .from(user)
        .where(eq(user.id, customerId))
        .limit(1);

      if (customer.length === 0) {
        return NextResponse.json(
          { error: 'Customer not found', code: 'CUSTOMER_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    if (salonId !== undefined) {
      if (isNaN(parseInt(salonId))) {
        return NextResponse.json(
          { error: 'Valid salon ID is required', code: 'INVALID_SALON_ID' },
          { status: 400 }
        );
      }

      const salon = await db
        .select()
        .from(salons)
        .where(eq(salons.id, parseInt(salonId)))
        .limit(1);

      if (salon.length === 0) {
        return NextResponse.json(
          { error: 'Salon not found', code: 'SALON_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    if (serviceId !== undefined) {
      if (isNaN(parseInt(serviceId))) {
        return NextResponse.json(
          { error: 'Valid service ID is required', code: 'INVALID_SERVICE_ID' },
          { status: 400 }
        );
      }

      const service = await db
        .select()
        .from(services)
        .where(eq(services.id, parseInt(serviceId)))
        .limit(1);

      if (service.length === 0) {
        return NextResponse.json(
          { error: 'Service not found', code: 'SERVICE_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    if (staffId !== undefined) {
      if (isNaN(parseInt(staffId))) {
        return NextResponse.json(
          { error: 'Valid staff ID is required', code: 'INVALID_STAFF_ID' },
          { status: 400 }
        );
      }

      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, parseInt(staffId)))
        .limit(1);

      if (staffMember.length === 0) {
        return NextResponse.json(
          { error: 'Staff member not found', code: 'STAFF_NOT_FOUND' },
          { status: 400 }
        );
      }
    }

    if (bookingDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(bookingDate)) {
        return NextResponse.json(
          {
            error: 'Invalid booking date format. Use YYYY-MM-DD',
            code: 'INVALID_DATE_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    if (startTime !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(startTime)) {
        return NextResponse.json(
          {
            error: 'Invalid start time format. Use HH:MM',
            code: 'INVALID_START_TIME_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    if (endTime !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(endTime)) {
        return NextResponse.json(
          {
            error: 'Invalid end time format. Use HH:MM',
            code: 'INVALID_END_TIME_FORMAT',
          },
          { status: 400 }
        );
      }
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (customerId !== undefined) updateData.customerId = customerId.trim();
    if (salonId !== undefined) updateData.salonId = parseInt(salonId);
    if (serviceId !== undefined) updateData.serviceId = parseInt(serviceId);
    if (staffId !== undefined) updateData.staffId = parseInt(staffId);
    if (bookingDate !== undefined) updateData.bookingDate = bookingDate;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedBooking = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, bookingId))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update booking', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBooking[0], { status: 200 });
  } catch (error) {
    console.error('PATCH booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid booking ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const bookingId = parseInt(id);

    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (existingBooking.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'BOOKING_NOT_FOUND' },
        { status: 404 }
      );
    }

    const cancelledBooking = await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (cancelledBooking.length === 0) {
      return NextResponse.json(
        { error: 'Failed to cancel booking', code: 'CANCEL_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking cancelled successfully',
        booking: cancelledBooking[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}