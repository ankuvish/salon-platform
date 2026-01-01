import { Router } from 'express';
import { Review, Salon } from '../db/schema';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { salonId } = req.query;
    const query = salonId ? { salonId } : {};
    const result = await Review.find(query).populate('customerId');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { salonId, customerId, rating, bookingId, comment } = req.body;
    
    // Check if user already reviewed this salon
    const existingReview = await Review.findOne({ salonId, customerId });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      if (comment) existingReview.comment = comment;
      if (bookingId) existingReview.bookingId = bookingId;
      await existingReview.save();
    } else {
      // Create new review
      const review = new Review({
        salonId,
        customerId,
        rating,
        comment: comment || undefined,
        bookingId: bookingId || null
      });
      await review.save();
    }

    // Update salon's average rating
    const allReviews = await Review.find({ salonId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Salon.findByIdAndUpdate(salonId, { rating: avgRating });
    
    res.json({ success: true, rating: avgRating });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review', details: error.message });
  }
});

export default router;
