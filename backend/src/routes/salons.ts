import { Router } from 'express';
import { Salon, User } from '../db/schema';

const router = Router();

router.get('/regional-stats', async (req, res) => {
  try {
    const salons = await Salon.find({});
    const moderators = await User.find({ role: 'moderator' });
    
    const regionMap = new Map();
    
    salons.forEach(salon => {
      const region = salon.city?.toLowerCase() || 'unknown';
      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region: salon.city || 'Unknown',
          approved: 0,
          pending: 0,
          rejected: 0,
          rejectedSalons: [],
          moderator: null
        });
      }
      
      const stats = regionMap.get(region);
      if (salon.approvalStatus === 'approved') stats.approved++;
      else if (salon.approvalStatus === 'pending') stats.pending++;
      else if (salon.approvalStatus === 'rejected') {
        stats.rejected++;
        stats.rejectedSalons.push({
          name: salon.name,
          reason: salon.rejectionReason || 'No reason provided'
        });
      }
    });
    
    moderators.forEach(mod => {
      const modRegion = mod.region?.toLowerCase();
      if (modRegion && regionMap.has(modRegion)) {
        regionMap.get(modRegion).moderator = {
          name: mod.name,
          email: mod.email
        };
      }
    });
    
    res.json(Array.from(regionMap.values()));
  } catch (error) {
    console.error('Error fetching regional stats:', error);
    res.status(500).json({ error: 'Failed to fetch regional stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { limit = '50', city, minRating, salonType, search, status } = req.query;
    
    const query: any = {};
    
    if (city && city !== 'all') query.city = city;
    if (minRating) query.rating = { $gte: parseFloat(minRating as string) };
    if (salonType && salonType !== 'all') query.salonType = salonType;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    // Only show approved salons to public, unless status filter is specified (for moderators/owners)
    if (status) {
      if (status === 'all') {
        // Don't filter by status - show all
      } else {
        query.approvalStatus = status;
      }
    } else {
      query.approvalStatus = 'approved';
    }

    console.log('Fetching salons with query:', query);
    const result = await Salon.find(query).limit(parseInt(limit as string));
    console.log(`Found ${result.length} salons`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching salons:', error);
    res.status(500).json({ error: 'Failed to fetch salons' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const result = await Salon.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);

    res.json(result);
  } catch (error) {
    console.error('Error searching salons:', error);
    res.status(500).json({ error: 'Failed to search salons' });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const result = await Salon.find().limit(20);
    res.json(result);
  } catch (error) {
    console.error('Error fetching nearby salons:', error);
    res.status(500).json({ error: 'Failed to fetch nearby salons' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ error: 'Invalid salon ID' });
    }
    const result = await Salon.findById(req.params.id);
    if (!result) return res.status(404).json({ error: 'Salon not found' });
    res.json(result);
  } catch (error) {
    console.error('Error fetching salon:', error);
    res.status(500).json({ error: 'Failed to fetch salon' });
  }
});

router.post('/', async (req, res) => {
  try {
    const salon = new Salon(req.body);
    await salon.save();
    res.status(201).json(salon);
  } catch (error) {
    console.error('Error creating salon:', error);
    res.status(500).json({ error: 'Failed to create salon' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ error: 'Invalid salon ID' });
    }
    console.log('Updating salon:', req.params.id, 'with data:', req.body);
    const result = await Salon.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true, runValidators: false }
    );
    if (!result) return res.status(404).json({ error: 'Salon not found' });
    console.log('Salon updated successfully');
    res.json(result);
  } catch (error: any) {
    console.error('Error updating salon:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update salon', details: error.message });
  }
});

export default router;
