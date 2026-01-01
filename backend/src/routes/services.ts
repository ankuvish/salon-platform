import { Router } from 'express';
import { Service } from '../db/schema';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { salonId, salon_id } = req.query;
    const query = (salonId || salon_id) ? { salonId: salonId || salon_id } : {};
    const result = await Service.find(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.post('/', async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!result) return res.status(404).json({ error: 'Service not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Service.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Service not found' });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
