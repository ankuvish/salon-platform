import { Router } from 'express';
import { db } from '../db';
import { promotions } from '../db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get active promotions
router.get('/', async (req, res) => {
  try {
    const { salon_id } = req.query;
    const currentDate = new Date().toISOString();

    let query = db.select().from(promotions);
    const conditions: any[] = [
      eq(promotions.isActive, true),
      lte(promotions.validFrom, currentDate),
      gte(promotions.validUntil, currentDate),
    ];

    if (salon_id) {
      conditions.push(eq(promotions.salonId, parseInt(salon_id as string)));
    }

    query = query.where(and(...conditions)) as any;

    const result = await query;
    res.json(result);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// Create promotion (owner only)
router.post('/', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      salonId,
      title,
      description,
      discountPercentage,
      validFrom,
      validUntil,
      isActive,
    } = req.body;

    const result = await db.insert(promotions).values({
      salonId,
      title,
      description,
      discountPercentage,
      validFrom,
      validUntil,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString(),
    }).returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// Update promotion (owner only)
router.put('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    await db.update(promotions).set(updates).where(eq(promotions.id, parseInt(id)));

    const updated = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, parseInt(id)))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

// Delete promotion (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser || currentUser.role !== 'owner') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    await db.delete(promotions).where(eq(promotions.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

export default router;
