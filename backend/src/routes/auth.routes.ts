import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import passport from '../config/passport';
import authService from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { users, profiles } from '../models/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['buyer', 'seller', 'service_provider', 'researcher']),
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
  body('email').isEmail(),
  body('password').notEmpty(),
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

export default router;
