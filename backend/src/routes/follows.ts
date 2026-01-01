import { Router } from 'express';
import { Follow, Notification, User } from '../db/schema';

const router = Router();

// Follow a user
router.post('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const existing = await Follow.findOne({ followerId, followingId });
    if (existing) {
      return res.status(400).json({ error: 'Already following' });
    }
    
    const follow = new Follow({ followerId, followingId });
    await follow.save();
    
    // Create notification for the followed user
    const follower = await User.findById(followerId);
    if (follower) {
      await Notification.create({
        userId: followingId,
        type: 'follow',
        title: 'New Follower',
        message: `${follower.name} started following you`,
        relatedUserId: followerId
      });
    }
    
    res.status(201).json(follow);
  } catch (error) {
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.query;
    await Follow.findOneAndDelete({ followerId, followingId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get followers count
router.get('/followers/count', async (req, res) => {
  try {
    const { userId } = req.query;
    const count = await Follow.countDocuments({ followingId: userId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get followers count' });
  }
});

// Get following count
router.get('/following/count', async (req, res) => {
  try {
    const { userId } = req.query;
    const count = await Follow.countDocuments({ followerId: userId });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get following count' });
  }
});

// Check if following
router.get('/check', async (req, res) => {
  try {
    const { followerId, followingId } = req.query;
    const exists = await Follow.exists({ followerId, followingId });
    res.json({ isFollowing: !!exists });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Get followers list
router.get('/followers', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    const follows = await Follow.find({ followingId: userId }).populate('followerId', 'name email image role');
    const followers = follows.map(f => f.followerId);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get following list
router.get('/following', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    
    const follows = await Follow.find({ followerId: userId }).populate('followingId', 'name email image role');
    const following = follows.map(f => f.followingId);
    res.json(following);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get following' });
  }
});

export default router;
