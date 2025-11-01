import { Router } from 'express';
import { db } from '../db';
import { services } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get services by salon ID
router.get('/', async (req, res) => {
  try {
    const { salon_id } = req.query;

    if (!salon_id) {
      return res.status(400).json({ error: 'salon_id is required' });
    }

    const result = await db
      .select()
      .from(services)
      .where(eq(services.salonId, parseInt(salon_id as string)));

    res.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Create service (owner only)
router.post('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { salonId, name, description, durationMinutes, price } = req.body;
    
    const result = await db.insert(services).values({
      salonId,
      name,
      description,
      durationMinutes,
      price,
      createdAt: new Date().toISOString(),
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service (owner only)
router.put('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    await db.update(services).set(updates).where(eq(services.id, parseInt(id)));

    const updated = await db
      .select()
      .from(services)
      .where(eq(services.id, parseInt(id)))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await db.delete(services).where(eq(services.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
