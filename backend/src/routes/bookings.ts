import { Router } from 'express';
import { db } from '../db';
import { bookings, salons, services, staff } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get all bookings (filtered by user)
router.get('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { customer_id, salon_id, status } = req.query;

    let query = db
      .select({
        booking: bookings,
        salon: salons,
        service: services,
        staffMember: staff,
      })
      .from(bookings)
      .leftJoin(salons, eq(bookings.salonId, salons.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(staff, eq(bookings.staffId, staff.id));

    const conditions: any[] = [];

    // Customers can only see their bookings
    if (currentUser.role === 'customer') {
      conditions.push(eq(bookings.customerId, currentUser.id));
    }
    // Owners can see bookings for their salons
    else if (currentUser.role === 'owner' && salon_id) {
      conditions.push(eq(bookings.salonId, parseInt(salon_id as string)));
    }

    if (status) {
      conditions.push(eq(bookings.status, status as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const result = await db
      .select({
        booking: bookings,
        salon: salons,
        service: services,
        staffMember: staff,
      })
      .from(bookings)
      .leftJoin(salons, eq(bookings.salonId, salons.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .leftJoin(staff, eq(bookings.staffId, staff.id))
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      salonId,
      serviceId,
      staffId,
      bookingDate,
      startTime,
      endTime,
      notes,
      paymentMethod,
      paymentStatus,
    } = req.body;

    const result = await db.insert(bookings).values({
      customerId: currentUser.id,
      salonId,
      serviceId,
      staffId,
      bookingDate,
      startTime,
      endTime,
      status: 'confirmed',
      notes,
      paymentMethod,
      paymentStatus: paymentStatus || 'pending',
      createdAt: new Date().toISOString(),
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Cancel booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking[0].customerId !== currentUser.id && currentUser.role !== 'owner') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db
      .update(bookings)
      .set({ status: 'cancelled' })
      .where(eq(bookings.id, parseInt(id)));

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Reschedule booking
router.post('/:id/reschedule', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { bookingDate, startTime, endTime } = req.body;

    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking[0].customerId !== currentUser.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db
      .update(bookings)
      .set({ bookingDate, startTime, endTime })
      .where(eq(bookings.id, parseInt(id)));

    const updated = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

export default router;
