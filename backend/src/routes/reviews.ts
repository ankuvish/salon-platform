import { Router } from 'express';
import { db } from '../db';
import { reviews, salons } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get reviews by salon ID
router.get('/', async (req, res) => {
  try {
    const { salon_id } = req.query;

    if (!salon_id) {
      return res.status(400).json({ error: 'salon_id is required' });
    }

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.salonId, parseInt(salon_id as string)));

    res.json(result);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
router.post('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { salonId, bookingId, rating, comment } = req.body;

    const result = await db.insert(reviews).values({
      salonId,
      customerId: currentUser.id,
      bookingId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }).returning();

    // Update salon average rating
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.salonId, salonId));

    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;

    await db
      .update(salons)
      .set({ rating: avgRating })
      .where(eq(salons.id, salonId));

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

export default router;
