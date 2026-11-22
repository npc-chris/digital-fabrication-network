import { Router, Response } from 'express';
import { db } from '../config/database';
import { verificationDocuments, profiles, users } from '../models/schema';
import { authenticate, authorize } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';
import { premblyKycService, kycProviderService } from '../services/kyc-provider.service';
import { identifyOrgService } from '../services/identifyorg.service';

const router = Router();

// Multi-Provider Status & Capability Matrix
router.get('/providers', (_req, res: Response) => {
  res.json({
    primaryProvider: kycProviderService.primaryProvider,
    providers: {
      identifyorg: {
        name: 'IdentifyOrg (identifyorg.com)',
        mode: identifyOrgService.isSandbox ? 'sandbox' : 'live',
        capabilities: ['CAC_KYB', 'BVN', 'NIN', 'TAX_ID', 'FRAML_SCREENING'],
      },
      prembly: {
        name: 'Prembly (Identitypass)',
        mode: premblyKycService.isSandbox ? 'sandbox' : 'live',
        capabilities: ['CAC_KYB', 'TIN_FIRS'],
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// IdentifyOrg Health & Capability Check
router.get('/identifyorg/health', (_req, res: Response) => {
  res.json({
    status: 'ok',
    provider: 'IdentifyOrg (identifyorg.com)',
    mode: identifyOrgService.isSandbox ? 'sandbox' : 'live',
    capabilities: ['CAC_KYB', 'BVN', 'NIN', 'TAX_ID', 'FRAML_SCREENING'],
    timestamp: new Date().toISOString(),
  });
});

// Prembly Health & Capability Check
router.get('/prembly/health', (_req, res: Response) => {
  res.json({
    status: 'ok',
    provider: 'Prembly (Identitypass)',
    mode: premblyKycService.isSandbox ? 'sandbox' : 'live',
    capabilities: ['CAC_KYB', 'TIN_FIRS'],
    timestamp: new Date().toISOString(),
  });
});

// Automated Nigerian Workshop CAC Registration Verification (IdentifyOrg & Prembly)
router.post('/verify-cac', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { rcNumber, companyType, companyName, provider } = req.body;

    if (!rcNumber || typeof rcNumber !== 'string') {
      return res.status(400).json({ error: 'CAC registration number (rcNumber) is required' });
    }

    const outcome = await kycProviderService.verifyWorkshop(userId, {
      rcNumber,
      companyType,
      companyName,
      provider,
    });

    if (!outcome.verified) {
      return res.status(422).json(outcome);
    }

    res.status(200).json(outcome);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error verifying CAC registration' });
  }
});

// Automated Director Bank Verification Number (BVN) Verification (IdentifyOrg)
router.post('/verify-bvn', authenticate, async (req: any, res: Response) => {
  try {
    const { bvn, firstName, lastName } = req.body;

    if (!bvn || typeof bvn !== 'string') {
      return res.status(400).json({ error: 'Bank Verification Number (bvn) is required' });
    }

    const result = await identifyOrgService.verifyBvn({ bvn, firstName, lastName });
    if (!result.verified) {
      return res.status(422).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error verifying BVN' });
  }
});

// Automated National Identification Number (NIN) Verification (IdentifyOrg)
router.post('/verify-nin', authenticate, async (req: any, res: Response) => {
  try {
    const { nin } = req.body;

    if (!nin || typeof nin !== 'string') {
      return res.status(400).json({ error: 'National Identification Number (nin) is required' });
    }

    const result = await identifyOrgService.verifyNin({ nin });
    if (!result.verified) {
      return res.status(422).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error verifying NIN' });
  }
});

// Automated Tax Identification Number (TIN) Verification
router.post('/verify-tin', authenticate, async (req: any, res: Response) => {
  try {
    const { tin, channel } = req.body;

    if (!tin || typeof tin !== 'string') {
      return res.status(400).json({ error: 'Tax Identification Number (tin) is required' });
    }

    const result = await premblyKycService.verifyTin({ tin, channel });
    if (!result.verified) {
      return res.status(422).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal error verifying TIN' });
  }
});

// Submit verification documents (manual upload fallback)
router.post('/submit', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { documentType, documentUrl } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({ error: 'Document type and URL required' });
    }

    const [document] = await db
      .insert(verificationDocuments)
      .values({
        userId,
        documentType,
        documentUrl,
        status: 'pending',
      })
      .returning();

    res.status(201).json(document);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get my verification documents
router.get('/my-documents', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const documents = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId))
      .orderBy(desc(verificationDocuments.createdAt));

    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending verifications (admin only)
router.get('/pending', authenticate, authorize('admin', 'platform_manager'), async (req: any, res: Response) => {
  try {
    const pending = await db
      .select({
        document: verificationDocuments,
        user: {
          id: users.id,
          email: users.email,
        },
        profile: profiles,
      })
      .from(verificationDocuments)
      .leftJoin(users, eq(verificationDocuments.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(eq(verificationDocuments.status, 'pending'))
      .orderBy(desc(verificationDocuments.createdAt));

    res.json(pending);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Review verification document (admin only)
router.post('/:id/review', authenticate, authorize('admin', 'platform_manager'), async (req: any, res: Response) => {
  try {
    const documentId = parseInt(req.params.id);
    const reviewerId = req.user.id;
    const { status, reviewNotes, verificationStatus } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected' });
    }

    // Get document to find user
    const [document] = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.id, documentId));

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update document
    const [updated] = await db
      .update(verificationDocuments)
      .set({
        status,
        reviewedBy: reviewerId,
        reviewNotes: reviewNotes || null,
        reviewedAt: new Date(),
      })
      .where(eq(verificationDocuments.id, documentId))
      .returning();

    // If approved, update profile verification status
    if (status === 'approved' && verificationStatus) {
      await db
        .update(profiles)
        .set({
          verificationStatus,
          verifiedAt: new Date(),
        })
        .where(eq(profiles.userId, document.userId));
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get verification status
router.get('/status', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const documents = await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId))
      .orderBy(desc(verificationDocuments.createdAt));

    res.json({
      verificationStatus: profile.verificationStatus,
      verifiedAt: profile.verifiedAt,
      documents,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
