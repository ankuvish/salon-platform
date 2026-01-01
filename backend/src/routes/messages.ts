import { Router } from 'express';
import { Message, User } from '../db/schema';
import { auth } from '../lib/auth';

const router = Router();

const authMiddleware = async (req: any, res: any, next: any) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = session.user;
  next();
};

// Get conversations list
router.get('/conversations', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image')
      .sort({ createdAt: -1 });

    const conversationsMap = new Map();
    messages.forEach(msg => {
      const otherUserId = msg.senderId._id.toString() === userId ? msg.receiverId._id.toString() : msg.senderId._id.toString();
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId,
          lastMessage: msg,
          unreadCount: 0
        });
      }
      if (msg.receiverId._id.toString() === userId && !msg.isRead) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages between two users
router.get('/', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.query;
    if (!otherUserId) return res.status(400).json({ error: 'otherUserId required' });

    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image')
      .populate('salonId', 'name imageUrl address')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, messageType, content, imageUrl, salonId } = req.body;

    if (!receiverId || !messageType) return res.status(400).json({ error: 'receiverId and messageType required' });

    await User.findByIdAndUpdate(senderId, { lastSeen: new Date() });

    const message = new Message({
      senderId,
      receiverId,
      messageType,
      content: content?.substring(0, 5000),
      imageUrl,
      salonId
    });

    await message.save();
    const populated = await Message.findById(message._id)
      .populate('senderId', 'name image')
      .populate('receiverId', 'name image')
      .populate('salonId', 'name imageUrl address');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.body;
    if (!otherUserId) return res.status(400).json({ error: 'otherUserId required' });

    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const count = await Message.countDocuments({ receiverId: userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;
