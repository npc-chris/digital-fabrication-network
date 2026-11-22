import { PremblyKycService, premblyKycService, kycProviderService } from './kyc-provider.service';
import { db } from '../config/database';

jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  };
});

describe('PremblyKycService - Nigerian CAC & Identity Verification', () => {
  let service: PremblyKycService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PremblyKycService();
  });

  describe('normalizeRcNumber', () => {
    it('normalizes standard RC number with prefix', () => {
      const res = service.normalizeRcNumber('RC-1234567');
      expect(res.normalized).toBe('RC-1234567');
      expect(res.type).toBe('RC');
      expect(res.rawNumber).toBe('1234567');
    });

    it('normalizes unhyphenated RC prefix', () => {
      const res = service.normalizeRcNumber('rc1452390');
      expect(res.normalized).toBe('RC-1452390');
      expect(res.type).toBe('RC');
      expect(res.rawNumber).toBe('1452390');
    });

    it('normalizes Business Name (BN) registration number', () => {
      const res = service.normalizeRcNumber('BN-987654');
      expect(res.normalized).toBe('BN-987654');
      expect(res.type).toBe('BN');
      expect(res.rawNumber).toBe('987654');
    });

    it('assumes RC when bare digits are provided', () => {
      const res = service.normalizeRcNumber('1284920');
      expect(res.normalized).toBe('RC-1284920');
      expect(res.type).toBe('RC');
      expect(res.rawNumber).toBe('1284920');
    });

    it('throws when registration format is invalid', () => {
      expect(() => service.normalizeRcNumber('')).toThrow();
      expect(() => service.normalizeRcNumber('ABC-12')).toThrow(/Invalid CAC registration number format/);
    });
  });

  describe('verifyCac (Sandbox / Deterministic Mode)', () => {
    it('successfully verifies active registered company in sandbox', async () => {
      const res = await service.verifyCac({
        rcNumber: 'RC-1234567',
        companyName: 'PRECISION GEARS NIGERIA LTD',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.status).toBe('ACTIVE');
      expect(res.data?.rcNumber).toBe('RC-1234567');
      expect(res.data?.companyName).toBe('PRECISION GEARS NIGERIA LTD');
      expect(res.data?.directors?.length).toBeGreaterThan(0);
    });

    it('returns unverified when CAC record is not found in registry (flagged 999...)', async () => {
      const res = await service.verifyCac({
        rcNumber: 'RC-9991234',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('not found in registry');
    });

    it('returns unverified when CAC entity is inactive / dissolved (flagged 888...)', async () => {
      const res = await service.verifyCac({
        rcNumber: 'RC-8881234',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(false);
      expect(res.data?.status).toBe('INACTIVE');
    });
  });

  describe('verifyTin (Sandbox Mode)', () => {
    it('successfully validates formatted Tax Identification Number', async () => {
      const res = await service.verifyTin({
        tin: '12345678-0001',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.tin).toBe('123456780001');
    });

    it('rejects invalid TIN format', async () => {
      const res = await service.verifyTin({
        tin: 'TIN-99',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('Invalid Nigerian Tax Identification Number');
    });
  });

  describe('verifyWorkshop', () => {
    it('verifies workshop and records accreditation in database', async () => {
      const mockDoc = { id: 101, status: 'approved' };
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDoc]),
        }),
      });
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 202 }]),
        }),
      });

      const outcome = await service.verifyWorkshop(202, {
        rcNumber: 'RC-1452390',
        companyName: 'BENIN CNC FABRICATORS LTD',
      });

      expect(outcome.verified).toBe(true);
      expect(outcome.status).toBe('verified');
      expect(outcome.documentId).toBe(101);
      expect(outcome.verificationDetails?.companyName).toBe('BENIN CNC FABRICATORS LTD');
    });

    it('rejects unverified entity and records rejection in database', async () => {
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockResolvedValue([]),
      });
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const outcome = await service.verifyWorkshop(202, {
        rcNumber: 'RC-9994567',
      });

      expect(outcome.verified).toBe(false);
      expect(outcome.status).toBe('rejected');
    });
  });

  describe('KycProviderService (Multi-Provider Dispatcher)', () => {
    it('dispatches to identifyorg by default and verifies workshop', async () => {
      const mockDoc = { id: 301, status: 'approved' };
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDoc]),
        }),
      });
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 202 }]),
        }),
      });

      const outcome = await kycProviderService.verifyWorkshop(202, {
        rcNumber: 'RC-1452390',
        companyName: 'BENIN CNC FABRICATORS LTD',
      });

      expect(outcome.verified).toBe(true);
      expect(outcome.providerUsed).toBe('identifyorg');
      expect(outcome.status).toBe('verified');
    });

    it('honors explicit provider override for prembly', async () => {
      const mockDoc = { id: 302, status: 'approved' };
      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockDoc]),
        }),
      });
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 202 }]),
        }),
      });

      const outcome = await kycProviderService.verifyWorkshop(202, {
        rcNumber: 'RC-1452390',
        companyName: 'ABA METALS LTD',
        provider: 'prembly',
      });

      expect(outcome.verified).toBe(true);
      expect(outcome.providerUsed).toBe('prembly');
      expect(outcome.status).toBe('verified');
    });
  });
});
