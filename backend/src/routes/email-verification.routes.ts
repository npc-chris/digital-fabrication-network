import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { emailVerificationCodes, users } from '../models/schema';
import emailService from '../services/email.service';
import { eq, and, gt, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// Rate limiting store for email verification requests
const emailRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const inFlightEmailSends = new Set<string>();

// Rate limiter: 3 verification requests per email per 15 minutes
function checkEmailRateLimit(email: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 3;
  
  const record = emailRateLimitStore.get(email);
  
  if (!record || now > record.resetTime) {
    emailRateLimitStore.set(email, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Send verification code to email
router.post('/send-code', async (req: Request, res: Response) => {
  let normalizedEmail = '';
  try {
    const { email } = req.body;
    normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // De-duplicate concurrent requests for the same email.
    if (inFlightEmailSends.has(normalizedEmail)) {
      return res.status(202).json({ message: 'Verification code request is already in progress' });
    }
    inFlightEmailSends.add(normalizedEmail);

    // Check rate limit
    if (!checkEmailRateLimit(normalizedEmail)) {
      return res.status(429).json({ 
        error: 'Too many verification requests. Please try again later.',
        retryAfter: 15 * 60, // 15 minutes in seconds
      });
    }

    // If an unexpired unverified code was sent very recently, do not send another email.
    const [latestCode] = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, normalizedEmail),
          eq(emailVerificationCodes.verified, false),
          gt(emailVerificationCodes.expiresAt, new Date())
        )
      )
      .orderBy(desc(emailVerificationCodes.createdAt))
      .limit(1);

    if (latestCode?.createdAt && (Date.now() - latestCode.createdAt.getTime()) < 60_000) {
      return res.json({
        message: 'Verification code already sent recently',
        ...(process.env.NODE_ENV === 'development' && { code: latestCode.code }),
      });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing codes for this email
    await db.delete(emailVerificationCodes)
      .where(eq(emailVerificationCodes.email, normalizedEmail));

    // Store the verification code
    await db.insert(emailVerificationCodes)
      .values({
        email: normalizedEmail,
        code,
        expiresAt,
      });

    // Send email with verification code
    try {
      await emailService.sendEmail(
        normalizedEmail,
        'Your DFN Verification Code',
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4F46E5;">Email Verification</h1>
            <p>Your verification code for Digital Fabrication Network is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #4F46E5;">${code}</span>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p>Best regards,<br>The DFN Team</p>
          </div>
        `
      );
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success but log the error - for development without SMTP
      console.log('Verification code for', normalizedEmail, ':', code);
    }

    res.json({ 
      message: 'Verification code sent',
      // Only include code in development for testing
      ...(process.env.NODE_ENV === 'development' && { code }),
    });
  } catch (error: any) {
    console.error('Send verification code error:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  } finally {
    if (normalizedEmail) {
      inFlightEmailSends.delete(normalizedEmail);
    }
  }
});

// Verify the code
router.post('/verify-code', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find the verification code
    const [record] = await db.select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.code, code),
          eq(emailVerificationCodes.verified, false),
          gt(emailVerificationCodes.expiresAt, new Date())
        )
      );

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Mark the code as verified
    await db.update(emailVerificationCodes)
      .set({ verified: true })
      .where(eq(emailVerificationCodes.id, record.id));

    // Update user's isVerified status if they exist
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));

    if (user) {
      await db.update(users)
        .set({ isVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    res.json({ 
      message: 'Email verified successfully',
      verified: true,
    });
  } catch (error: any) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Check if email is verified
router.get('/check-status', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if there's a verified code for this email
    const [verifiedCode] = await db.select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email as string),
          eq(emailVerificationCodes.verified, true)
        )
      );

    // Also check user verification status
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email as string));

    res.json({
      verified: !!(verifiedCode || user?.isVerified),
      userExists: !!user,
    });
  } catch (error: any) {
    console.error('Check verification status error:', error);
    res.status(500).json({ error: 'Failed to check verification status' });
  }
});

export default router;
