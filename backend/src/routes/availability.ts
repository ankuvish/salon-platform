import { Router } from 'express';
import { db } from '../db';
import { bookings, services, salons } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Get availability for a specific staff, service, and date
router.get('/', async (req, res) => {
  try {
    const { staff_id, service_id, date, salon_id } = req.query;

    if (!staff_id || !service_id || !date) {
      return res.status(400).json({ 
        error: 'staff_id, service_id, and date are required' 
      });
    }

    // Get service duration
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(service_id as string)))
      .limit(1);

    if (service.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const serviceDuration = service[0].durationMinutes;

    // Get salon hours
    let openingTime = '09:00';
    let closingTime = '20:00';

    if (salon_id) {
      const salon = await db
        .select()
        .from(salons)
        .where(eq(salons.id, parseInt(salon_id as string)))
        .limit(1);

      if (salon.length > 0) {
        openingTime = salon[0].openingTime;
        closingTime = salon[0].closingTime;
      }
    }

    // Get existing bookings for this staff on this date
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.staffId, parseInt(staff_id as string)),
          eq(bookings.bookingDate, date as string),
          eq(bookings.status, 'confirmed')
        )
      );

    // Generate time slots
    const slots = [];
    const bookedSlots = existingBookings.map(b => b.startTime);
    
    let currentTime = openingTime;
    const closing = closingTime;

    while (currentTime < closing) {
      const isBooked = bookedSlots.includes(currentTime);
      slots.push({
        time: currentTime,
        available: !isBooked,
        booked: isBooked,
      });

      // Increment by 30 minutes
      const [hours, minutes] = currentTime.split(':').map(Number);
      let newMinutes = minutes + 30;
      let newHours = hours;

      if (newMinutes >= 60) {
        newMinutes -= 60;
        newHours += 1;
      }

      currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    }

    res.json({
      slots,
      serviceDuration,
      openingTime,
      closingTime,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
