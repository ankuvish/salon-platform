import { Router } from 'express';
import { Booking, Salon } from '../db/schema';

const router = Router();

// Get current IST date and time
function getISTDateTime() {
  const utc = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc.getTime() + istOffset);
  
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  const hour = ist.getUTCHours();
  const minute = ist.getUTCMinutes();
  
  return {
    date: `${year}-${month}-${day}`,
    hour,
    minute,
    timeInMinutes: hour * 60 + minute
  };
}

router.get('/', async (req, res) => {
  try {
    const { salon_id, staff_id, date } = req.query;
    
    if (!salon_id || !staff_id || !date) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const salon = await Salon.findById(salon_id);
    if (!salon) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    const bookings = await Booking.find({
      salonId: salon_id,
      staffId: staff_id,
      bookingDate: date,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Block all time slots during booking duration (staff can only serve 1 customer at a time)
    const bookedSlots = new Set<string>();
    
    bookings.forEach(b => {
      const [startHour, startMin] = b.startTime.split(':').map(Number);
      const [endHour, endMin] = b.endTime.split(':').map(Number);
      const startTimeInMin = startHour * 60 + startMin;
      const endTimeInMin = endHour * 60 + endMin;
      
      // Block all 30-min slots from start to end
      for (let time = startTimeInMin; time < endTimeInMin; time += 30) {
        const h = Math.floor(time / 60);
        const m = time % 60;
        const slotTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        bookedSlots.add(slotTime);
      }
    });
    const [openHour, openMin] = salon.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = salon.closingTime.split(':').map(Number);
    
    const istNow = getISTDateTime();
    const requestedDate = String(date);
    const isToday = requestedDate === istNow.date;
    
    const allSlots = [];
    let hour = openHour;
    let min = openMin;
    const closeTimeInMin = closeHour * 60 + closeMin;

    while (hour * 60 + min < closeTimeInMin) {
      const slotTimeInMin = hour * 60 + min;
      const startTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      
      min += 30;
      if (min >= 60) {
        hour++;
        min = 0;
      }
      
      const endTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const isBooked = bookedSlots.has(startTime);
      const isPastSlot = isToday && slotTimeInMin <= istNow.timeInMinutes;
      const isBlocked = isBooked || isPastSlot;
      
      allSlots.push({
        startTime,
        endTime,
        available: !isBlocked,
        booked: isBlocked,
        isBooked: isBlocked,
        availableSeats: isBlocked ? 0 : 1
      });
    }

    res.json({ 
      slots: allSlots,
      closingTime: salon.closingTime,
      closingTimeInMin: closeTimeInMin
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
