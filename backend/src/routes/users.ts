import { Router } from 'express';
import { User, Booking } from '../db/schema';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/:id/update', async (req, res) => {
  try {
    const { username, ...otherData } = req.body;
    const updateData: any = { ...otherData };
    
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updateData.username = username;
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.post('/:id/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.password) {
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.post('/promote-admin', async (req, res) => {
  try {
    const { email, secretKey } = req.body;
    
    if (secretKey !== 'SUPER_ADMIN_SECRET_2024') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.roles.includes('admin')) {
      user.roles.push('admin');
      await user.save();
    }
    
    res.json({ message: 'User promoted to admin', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

router.post('/promote-moderator', async (req, res) => {
  try {
    const { email, secretKey, region } = req.body;
    
    if (secretKey !== 'MODERATOR_SECRET_2024') {
      return res.status(403).json({ error: 'Invalid secret key' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.roles.includes('moderator')) {
      user.roles.push('moderator');
    }
    if (region) user.region = region;
    await user.save();
    
    res.json({ message: 'User promoted to moderator', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to promote user' });
  }
});

router.get('/moderators', async (req, res) => {
  try {
    const moderators = await User.find({ roles: 'moderator' }).select('-password');
    res.json(moderators);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moderators' });
  }
});

router.get('/:id/data', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const bookings = await Booking.find({ customerId: req.params.id })
      .populate('salonId', 'name')
      .populate('serviceId', 'name price')
      .populate('staffId', 'name');
    
    const data = {
      user: user.toObject(),
      bookings: bookings.map(b => b.toObject())
    };
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

export default router;
