import { Router } from 'express';
import { Booking, Notification } from '../db/schema';
import { notificationService } from '../lib/notifications';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { customerId, salonId, salon_id } = req.query;
    const query: any = {};
    if (customerId) query.customerId = customerId;
    if (salonId || salon_id) query.salonId = salonId || salon_id;
    
    console.log('Fetching bookings with query:', query);
    const result = await Booking.find(query)
      .populate('customerId', 'name email phone')
      .populate('salonId', 'name')
      .populate('serviceId', 'name price durationMinutes')
      .populate('staffId', 'name specialization')
      .sort({ bookingDate: 1, startTime: 1 });
    console.log(`Found ${result.length} bookings`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await Booking.findById(req.params.id)
      .populate('customerId')
      .populate('salonId')
      .populate('serviceId')
      .populate('staffId');
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('Creating booking with data:', JSON.stringify(req.body, null, 2));
    const booking = new Booking(req.body);
    const saved = await booking.save();
    console.log('Booking created successfully:', saved._id);
    
    // Populate booking details for notification
    const populated = await Booking.findById(saved._id)
      .populate('customerId', 'name email phone')
      .populate({ path: 'salonId', populate: { path: 'ownerId', select: 'name email phone' } })
      .populate('serviceId', 'name');
    
    if (populated) {
      const notificationData = {
        customerName: populated.customerId.name,
        customerEmail: populated.customerId.email,
        customerPhone: populated.customerId.phone,
        salonName: populated.salonId.name,
        serviceName: populated.serviceId.name,
        bookingDate: populated.bookingDate,
        startTime: populated.startTime,
        endTime: populated.endTime,
        bookingId: saved._id.toString()
      };
      
      // Send notification to customer
      await notificationService.sendBookingConfirmation(notificationData);
      
      // Send notification to salon owner
      if (populated.salonId.ownerId) {
        await notificationService.sendOwnerBookingNotification({
          ...notificationData,
          ownerEmail: populated.salonId.ownerId.email,
          ownerPhone: populated.salonId.ownerId.phone
        });
        
        // Create in-app notification
        await Notification.create({
          userId: populated.salonId.ownerId._id,
          type: 'booking',
          title: 'New Booking',
          message: `${populated.customerId.name} booked ${populated.serviceId.name} for ${populated.bookingDate} at ${populated.startTime}`,
          relatedUserId: populated.customerId._id,
          relatedId: saved._id.toString()
        });
      }
    }
    
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Booking creation error:', error.message);
    console.error('Error details:', error);
    res.status(400).json({ 
      error: 'Failed to create booking', 
      details: error.message,
      validation: error.errors 
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json(result);
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: 'Failed to update booking', details: error.message });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Booking.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Booking delete error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Get unread booking count for salon owner
router.get('/unread/count', async (req, res) => {
  try {
    const { salonId } = req.query;
    if (!salonId) return res.status(400).json({ error: 'salonId required' });
    
    const count = await Booking.countDocuments({
      salonId,
      viewedByOwner: { $ne: true }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Mark bookings as viewed
router.post('/mark-viewed', async (req, res) => {
  try {
    const { salonId } = req.body;
    if (!salonId) return res.status(400).json({ error: 'salonId required' });
    
    await Booking.updateMany(
      { salonId, viewedByOwner: { $ne: true } },
      { $set: { viewedByOwner: true } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking bookings as viewed:', error);
    res.status(500).json({ error: 'Failed to mark bookings as viewed' });
  }
});

export default router;
