import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import passport from '../config/passport';
import authService from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { users, profiles } from '../models/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Rate limiting for auth routes to prevent brute force attacks
const authRateLimitStore = new Map<string, { count: number; resetTime: number }>();

const authRateLimiter = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const record = authRateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      authRateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    
    record.count++;
    return next();
  };
};

// Strict rate limit for registration (5 attempts per 15 minutes)
const registerRateLimit = authRateLimiter(5, 15 * 60 * 1000);

// Moderate rate limit for login (10 attempts per 15 minutes)
const loginRateLimit = authRateLimiter(10, 15 * 60 * 1000);

router.post('/register',
  registerRateLimit,
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['explorer', 'provider']).withMessage('Role must be either "explorer" or "provider"'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role } = req.body;
      console.log('Registration attempt:', { email, role });
      const result = await authService.register(email, password, role);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Registration route error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
);

router.post('/login',
  loginRateLimit,
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth/login' }),
  (req, res) => {
    const result = req.user as any;
    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.token}`;
    res.redirect(redirectUrl);
  }
);

// Get current authenticated user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    // Remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user as any;

    res.json({ user: safeUser, profile: profile || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete onboarding
router.post('/complete-onboarding', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { role, businessType, categories, componentTypes, serviceableLocations } = req.body;

    // Update user role and mark onboarding as completed
    await db.update(users)
      .set({
        role: role as any,
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // If provider, store additional business info in profile (or metadata)
    if (role === 'provider' && (businessType || categories || componentTypes || serviceableLocations)) {
      const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
      
      if (existingProfile) {
        // Store provider-specific data in portfolio field as JSON for now
        const providerData = {
          businessType: businessType || [],
          categories: categories || [],
          componentTypes: componentTypes || [],
          serviceableLocations: serviceableLocations || [],
        };
        
        await db.update(profiles)
          .set({
            portfolio: JSON.stringify(providerData),
            updatedAt: new Date(),
          })
          .where(eq(profiles.userId, userId));
      }
    }

    // Fetch updated user
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    // Remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updatedUser as any;

    res.json({ user: safeUser, profile: profile || null, message: 'Onboarding completed successfully' });
  } catch (error: any) {
    console.error('Complete onboarding error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side token removal, but we can track for analytics)
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the event or invalidate tokens in a blacklist if needed
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
