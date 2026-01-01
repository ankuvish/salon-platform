import { Router } from 'express';
import { User } from '../db/schema';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sessionStore } from '../middleware/auth';

const router = Router();

const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    otpStore.set(phone, { otp, expiresAt });

    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      phone,
      otp, // DEV ONLY
      expiresIn: '10 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, gender, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || `user_${Date.now()}`,
      roles: role ? [role] : ['customer'],
      gender,
      emailVerified: false
    });
    await user.save();

    const token = crypto.randomBytes(32).toString('hex');
    sessionStore.set(token, { userId: user._id.toString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    res.json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        gender: user.gender
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name, email, gender, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const stored = otpStore.get(phone);
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found for this phone' });
    }

    if (new Date() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.delete(phone);

    let user = await User.findOne({ phone });

    if (!user) {
      if (!name) {
        return res.status(400).json({ error: 'Name is required for new users', code: 'NAME_REQUIRED' });
      }

      user = new User({
        name,
        email: email || `user_${Date.now()}@temp.com`,
        phone,
        roles: role ? [role] : ['customer'],
        gender,
        emailVerified: false
      });
      await user.save();
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessionStore.set(token, { userId: user._id.toString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        gender: user.gender
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/login-email', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.', code: 'USER_NOT_FOUND' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'This account uses OTP login. Please use OTP method.', code: 'NO_PASSWORD' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password', code: 'INVALID_PASSWORD' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessionStore.set(token, { userId: user._id.toString(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        gender: user.gender
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    otpStore.set(phone, { otp, expiresAt });

    console.log(`Password Reset OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      phone,
      otp, // DEV ONLY
      expiresIn: '10 minutes'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Phone, OTP, and new password are required' });
    }

    const stored = otpStore.get(phone);
    if (!stored) {
      return res.status(400).json({ error: 'No OTP found' });
    }

    if (new Date() > stored.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpStore.delete(phone);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/session', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const session = sessionStore.get(token);

    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ error: 'Session expired' });
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        gender: user.gender,
        username: user.username,
        image: user.image
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get session' });
  }
});

export default router;
