import { Router } from 'express';
import { Notification } from '../db/schema';

const router = Router();

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20 } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    const notifications = await Notification.find({ userId })
      .populate('relatedUserId', 'name image')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread/count', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;
