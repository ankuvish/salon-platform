import { Router } from 'express';
import { Promotion } from '../db/schema';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { salonId } = req.query;
    const query = salonId ? { salonId, isActive: true } : { isActive: true };
    const result = await Promotion.find(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

export default router;
