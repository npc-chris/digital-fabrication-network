import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import passport from '../config/passport';
import authService from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { db } from '../config/database';
import { users, profiles, onboardingSubmissions, verificationDocuments } from '../models/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Rate limiting for auth routes to prevent brute force attacks
const authRateLimitStore = new Map<string, { count: number; resetTime: number }>();

const authRateLimiter = (prefix: string, maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${prefix}:${req.ip || 'unknown'}`;
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
const registerRateLimit = authRateLimiter('register', 5, 15 * 60 * 1000);

// Moderate rate limit for login (10 attempts per 15 minutes)
const loginRateLimit = authRateLimiter('login', 10, 15 * 60 * 1000);

// Strict rate limit for provider upgrade requests (3 attempts per hour)
const upgradeRateLimit = authRateLimiter('upgrade', 3, 60 * 60 * 1000);

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
      const statusCode = error.statusCode || error.status || 400;
      res.status(statusCode).json({ error: error.message });
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
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({ error: 'FRONTEND_URL is not configured' });
    }

    // Redirect to frontend with token
    const redirectUrl = `${frontendUrl}/auth/callback?token=${result.token}`;
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
    const [onboarding] = await db.select().from(onboardingSubmissions).where(eq(onboardingSubmissions.userId, userId));

    // Remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user as any;

    // Return a refreshed token if the user's role has changed from what is embedded
    // in their current JWT.
    const tokenUser = req.user;
    const needsTokenRefresh = user.role !== tokenUser?.role;

    const responseData: Record<string, unknown> = { user: safeUser, profile: profile || null, onboarding: onboarding || null };
    if (needsTokenRefresh) {
      responseData.token = authService.generateToken(user);
    }

    res.json(responseData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complete onboarding
router.post('/complete-onboarding', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      role,
      onboardingData,
      businessType,
      categories,
      componentTypes,
      serviceableLocations,
    } = req.body as {
      role: string;
      onboardingData?: any;
      businessType?: string[];
      categories?: string[];
      componentTypes?: string[];
      serviceableLocations?: string[];
    };

    if (role !== 'explorer' && role !== 'provider') {
      return res.status(400).json({ error: 'Invalid onboarding role' });
    }

    // Backward-compatible fallback for old frontend payloads.
    const normalizedOnboarding = onboardingData || {
      identityFork: { role },
      domainCalibration: {
        domains: [],
        unitPreference: 'si',
      },
      workflowSync: {
        firstName: req.body?.firstName || null,
        lastName: req.body?.lastName || null,
        phone: req.body?.phone || null,
        location: req.body?.location || null,
        avatar: req.body?.avatar || null,
      },
      providerCapabilities:
        role === 'provider'
          ? {
              providerTypes: businessType || [],
              subtypes: {
                services: categories || [],
                components: componentTypes || [],
                logistics: serviceableLocations || [],
              },
            }
          : undefined,
      providerVerification: undefined,
    };

    if (!normalizedOnboarding?.workflowSync) {
      return res.status(400).json({ error: 'Missing workflow sync data' });
    }

    if (role === 'provider') {
      const providerCapabilities = normalizedOnboarding?.providerCapabilities;
      const providerVerification = normalizedOnboarding?.providerVerification;
      const hasCapabilities = Array.isArray(providerCapabilities?.providerTypes) && providerCapabilities.providerTypes.length > 0;
      const agreementsAccepted =
        providerVerification?.agreements?.escrowAccepted === true && providerVerification?.agreements?.termsAccepted === true;

      if (!hasCapabilities) {
        return res.status(400).json({ error: 'Provider onboarding requires capability mapping (step 4).' });
      }

      if (!providerVerification || !agreementsAccepted) {
        return res.status(400).json({ error: 'Provider onboarding requires verification and accepted agreements (step 5).' });
      }
    }

    const workflowSync = normalizedOnboarding.workflowSync || {};
    const providerVerification = normalizedOnboarding.providerVerification || null;
    const now = new Date();

    // Update user role and mark onboarding as completed
    await db.update(users)
      .set({
        role: role as any,
        onboardingCompleted: true,
        updatedAt: now,
      })
      .where(eq(users.id, userId));

    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    const profilePatch: Record<string, unknown> = {
      firstName: workflowSync.firstName || null,
      lastName: workflowSync.lastName || null,
      phone: workflowSync.phone || null,
      location: workflowSync.location || null,
      avatar: workflowSync.avatar || null,
      portfolio: workflowSync.githubProfileUrl || null,
      updatedAt: now,
    };

    if (existingProfile) {
      await db.update(profiles).set(profilePatch).where(eq(profiles.userId, userId));
    } else {
      await db.insert(profiles).values({
        userId,
        firstName: (profilePatch.firstName as string | null) || null,
        lastName: (profilePatch.lastName as string | null) || null,
        phone: (profilePatch.phone as string | null) || null,
        location: (profilePatch.location as string | null) || null,
        avatar: (profilePatch.avatar as string | null) || null,
        portfolio: (profilePatch.portfolio as string | null) || null,
      });
    }

    const [existingSubmission] = await db
      .select()
      .from(onboardingSubmissions)
      .where(eq(onboardingSubmissions.userId, userId));

    const submissionPayload = {
      role: role as any,
      currentStep: role === 'provider' ? 5 : 3,
      identityFork: normalizedOnboarding.identityFork ? JSON.stringify(normalizedOnboarding.identityFork) : null,
      domainCalibration: normalizedOnboarding.domainCalibration ? JSON.stringify(normalizedOnboarding.domainCalibration) : null,
      workflowSync: normalizedOnboarding.workflowSync ? JSON.stringify(normalizedOnboarding.workflowSync) : null,
      providerCapabilities: normalizedOnboarding.providerCapabilities ? JSON.stringify(normalizedOnboarding.providerCapabilities) : null,
      providerVerification: normalizedOnboarding.providerVerification ? JSON.stringify(normalizedOnboarding.providerVerification) : null,
      completedAt: now,
      updatedAt: now,
    };

    if (existingSubmission) {
      await db.update(onboardingSubmissions).set(submissionPayload).where(eq(onboardingSubmissions.userId, userId));
    } else {
      await db.insert(onboardingSubmissions).values({
        userId,
        ...submissionPayload,
      });
    }

    if (role === 'provider' && providerVerification?.documents) {
      const docs = providerVerification.documents;
      const docMappings = [
        { type: 'proof_of_identity', url: docs.identityProofUrl as string | undefined },
        { type: 'proof_of_residence', url: docs.residenceProofUrl as string | undefined },
        { type: 'insurance_policy', url: docs.insurancePolicyUrl as string | undefined },
      ];

      for (const doc of docMappings) {
        if (!doc.url) continue;

        const [existingDoc] = await db
          .select()
          .from(verificationDocuments)
          .where(and(
            eq(verificationDocuments.userId, userId),
            eq(verificationDocuments.documentType, doc.type),
            eq(verificationDocuments.documentUrl, doc.url)
          ));

        if (!existingDoc) {
          await db.insert(verificationDocuments).values({
            userId,
            documentType: doc.type,
            documentUrl: doc.url,
            status: 'pending',
          });
        }
      }

      if (Array.isArray(docs.additionalDocumentUrls)) {
        for (const url of docs.additionalDocumentUrls) {
          if (!url) continue;
          const [existingDoc] = await db
            .select()
            .from(verificationDocuments)
            .where(and(
              eq(verificationDocuments.userId, userId),
              eq(verificationDocuments.documentType, 'additional_document'),
              eq(verificationDocuments.documentUrl, url)
            ));

          if (!existingDoc) {
            await db.insert(verificationDocuments).values({
              userId,
              documentType: 'additional_document',
              documentUrl: url,
              status: 'pending',
            });
          }
        }
      }
    }

    // Fetch updated user
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    const [onboarding] = await db.select().from(onboardingSubmissions).where(eq(onboardingSubmissions.userId, userId));

    // Remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = updatedUser as any;

    res.json({ user: safeUser, profile: profile || null, onboarding: onboarding || null, message: 'Onboarding completed successfully' });
  } catch (error: any) {
    console.error('Complete onboarding error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Request upgrade from explorer to provider
router.post('/request-provider-upgrade', upgradeRateLimit, authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [currentUser] = await db.select().from(users).where(eq(users.id, userId));
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    if (currentUser.role === 'provider') {
      return res.status(400).json({ error: 'Account is already a provider' });
    }

    // Set role to provider directly.
    const [updated] = await db.update(users)
      .set({ role: 'provider' as any, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    const { password, ...safeUser } = updated as any;

    // Issue a new token so the updated role is reflected immediately
    const token = authService.generateToken(updated);

    res.json({ user: safeUser, token, message: 'Provider role granted successfully.' });
  } catch (error: any) {
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
