import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
  providerApproved?: boolean;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Provider role requires admin approval before accessing provider endpoints
    if (req.user.role === 'provider' && !req.user.providerApproved) {
      return res.status(403).json({ error: 'Forbidden: Provider account pending admin approval' });
    }

    next();
  };
};
