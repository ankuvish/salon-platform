import { Request, Response, NextFunction } from 'express';
import { User } from '../db/schema';

const sessionStore = new Map<string, { userId: string; expiresAt: Date }>();
export { sessionStore };

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Middleware to authenticate requests using Bearer token
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const session = sessionStore.get(token);
    if (!session || new Date() > session.expiresAt) {
      sessionStore.delete(token);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findById(session.userId).select('-password');
    if (!user) {
      sessionStore.delete(token);
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
