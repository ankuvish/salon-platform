import { Router } from 'express';
import { db } from '../db';
import { user, account, salons } from '../db/schema';
import { eq } from 'drizzle-orm';
import { validateSession } from '../lib/auth';
import bcrypt from 'bcrypt';

const router = Router();

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's salon if they're an owner
    let userSalon = null;
    if (currentUser.role === 'owner') {
      const salon = await db
        .select()
        .from(salons)
        .where(eq(salons.ownerId, currentUser.id))
        .limit(1);
      
      if (salon.length > 0) {
        userSalon = salon[0];
      }
    }

    res.json({
      ...currentUser,
      salon: userSalon,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/me', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, phone, gender, image } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (gender !== undefined) updates.gender = gender;
    if (image !== undefined) updates.image = image;
    
    updates.updatedAt = new Date();

    await db.update(user).set(updates).where(eq(user.id, currentUser.id));

    const updated = await db
      .select()
      .from(user)
      .where(eq(user.id, currentUser.id))
      .limit(1);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Set/update password
router.post('/set-password', async (req, res) => {
  try {
    const currentUser = await validateSession(req);
    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { password, currentPassword } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check if user already has a password
    const userAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, currentUser.id))
      .limit(1);

    if (userAccount.length > 0 && userAccount[0].password) {
      // Verify current password
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }

      const isValid = await bcrypt.compare(currentPassword, userAccount[0].password);
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userAccount.length > 0) {
      await db
        .update(account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(account.userId, currentUser.id));
    } else {
      await db.insert(account).values({
        id: `${currentUser.id}-password`,
        accountId: currentUser.id,
        providerId: 'credential',
        userId: currentUser.id,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error setting password:', error);
    res.status(500).json({ error: 'Failed to set password' });
  }
});

export default router;
