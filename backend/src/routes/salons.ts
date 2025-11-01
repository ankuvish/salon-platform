import { Router } from 'express';
import { db } from '../db';
import { salons, services, staff, reviews, user } from '../db/schema';
import { eq, like, or, and, sql, gte } from 'drizzle-orm';
import { validateSession } from '../lib/auth';

const router = Router();

// Get all salons with filters
router.get('/', async (req, res) => {
  try {
    const { 
      limit = '50', 
      city, 
      minRating, 
      salonType,
      search 
    } = req.query;

    let query = db.select().from(salons);
    const conditions: any[] = [];

    if (city && city !== 'all') {
      conditions.push(eq(salons.city, city as string));
    }

    if (minRating) {
      conditions.push(gte(salons.rating, parseFloat(minRating as string)));
    }

    if (salonType && salonType !== 'all') {
      conditions.push(eq(salons.salonType, salonType as string));
    }

    if (search) {
      conditions.push(
        or(
          like(salons.name, `%${search}%`),
          like(salons.description, `%${search}%`),
          like(salons.city, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query.limit(parseInt(limit as string));
    res.json(result);
  } catch (error) {
    console.error('Error fetching salons:', error);
    res.status(500).json({ error: 'Failed to fetch salons' });
  }
});

// Search salons
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const result = await db
      .select()
      .from(salons)
      .where(
        or(
          like(salons.name, `%${q}%`),
          like(salons.description, `%${q}%`),
          like(salons.city, `%${q}%`)
        )
      )
      .limit(10);

    res.json(result);
  } catch (error) {
    console.error('Error searching salons:', error);
    res.status(500).json({ error: 'Failed to search salons' });
  }
});

// Get nearby salons (placeholder - would need geolocation logic)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = '10' } = req.query;
    
    // Simple implementation - in production, use proper geospatial queries
    const result = await db.select().from(salons).limit(20);
    res.json(result);
  } catch (error) {
    console.error('Error fetching nearby salons:', error);
    res.status(500).json({ error: 'Failed to fetch nearby salons' });
  }
});

// Get single salon by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db
      .select()
      .from(salons)
      .where(eq(salons.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching salon:', error);
    res.status(500).json({ error: 'Failed to fetch salon' });
  }
});

// Update salon (owner only)
router.put('/:id', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const salonId = parseInt(id);

    // Check if user owns this salon
    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId))
      .limit(1);

    if (salon.length === 0) {
      return res.status(404).json({ error: 'Salon not found' });
    }

    if (salon[0].ownerId !== currentUser.id) {
      return res.status(403).json({ error: 'Not authorized to update this salon' });
    }

    const updates = req.body;
    await db.update(salons).set(updates).where(eq(salons.id, salonId));

    const updated = await db
      .select()
      .from(salons)
      .where(eq(salons.id, salonId))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating salon:', error);
    res.status(500).json({ error: 'Failed to update salon' });
  }
});

export default router;
