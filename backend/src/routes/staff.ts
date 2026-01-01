import { Router } from 'express';
import { Staff } from '../db/schema';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { salonId, salon_id } = req.query;
    const query = (salonId || salon_id) ? { salonId: salonId || salon_id } : {};
    const result = await Staff.find(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post('/', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: 'Staff not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Staff.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

export default router;
