import { Router } from 'express';
import { db } from '../db';
import { staff } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get staff by salon ID
router.get('/', async (req, res) => {
  try {
    const { salon_id } = req.query;

    if (!salon_id) {
      return res.status(400).json({ error: 'salon_id is required' });
    }

    const result = await db
      .select()
      .from(staff)
      .where(eq(staff.salonId, parseInt(salon_id as string)));

    res.json(result);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// Create staff member (owner only)
router.post('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { salonId, name, specialization, avatarUrl } = req.body;
    
    const result = await db.insert(staff).values({
      salonId,
      name,
      specialization,
      avatarUrl,
      createdAt: new Date().toISOString(),
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff' });
  }
});

// Update staff member (owner only)
router.put('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    await db.update(staff).set(updates).where(eq(staff.id, parseInt(id)));

    const updated = await db
      .select()
      .from(staff)
      .where(eq(staff.id, parseInt(id)))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff' });
  }
});

// Delete staff member (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await db.delete(staff).where(eq(staff.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: 'Failed to delete staff' });
  }
});

export default router;
