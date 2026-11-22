import { IdentifyOrgService, identifyOrgService } from './identifyorg.service';

describe('IdentifyOrgService - African/Nigerian Identity & KYB Screening', () => {
  let service: IdentifyOrgService;

  beforeEach(() => {
    service = new IdentifyOrgService();
  });

  describe('normalizeRcNumber', () => {
    it('normalizes standard RC number with prefix', () => {
      const res = service.normalizeRcNumber('RC-1849201');
      expect(res.normalized).toBe('RC-1849201');
      expect(res.type).toBe('RC');
      expect(res.rawNumber).toBe('1849201');
    });

    it('normalizes Business Name (BN) number', () => {
      const res = service.normalizeRcNumber('BN-543210');
      expect(res.normalized).toBe('BN-543210');
      expect(res.type).toBe('BN');
      expect(res.rawNumber).toBe('543210');
    });

    it('throws error when registration format is invalid', () => {
      expect(() => service.normalizeRcNumber('')).toThrow(/required/);
      expect(() => service.normalizeRcNumber('INVALID-9')).toThrow(/Invalid CAC registration number format/);
    });
  });

  describe('verifyBusiness (Sandbox / Deterministic Mode)', () => {
    it('successfully verifies active registered company in sandbox', async () => {
      const res = await service.verifyBusiness({
        rcNumber: 'RC-1452390',
        companyName: 'BENIN CNC FABRICATORS LTD',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.status).toBe('ACTIVE');
      expect(res.data?.rcNumber).toBe('RC-1452390');
      expect(res.data?.companyName).toBe('BENIN CNC FABRICATORS LTD');
      expect(res.data?.directors?.length).toBeGreaterThan(0);
    });

    it('returns unverified when CAC record is not found (flagged 999...)', async () => {
      const res = await service.verifyBusiness({
        rcNumber: 'RC-9994567',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('not found in registry');
    });

    it('returns unverified when CAC entity is inactive (flagged 888...)', async () => {
      const res = await service.verifyBusiness({
        rcNumber: 'RC-8884567',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(false);
      expect(res.data?.status).toBe('INACTIVE');
    });
  });

  describe('verifyBvn', () => {
    it('successfully verifies 11-digit BVN in sandbox', async () => {
      const res = await service.verifyBvn({
        bvn: '22212345678',
        firstName: 'Emeka',
        lastName: 'Okonkwo',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.bvn).toBe('22212345678');
      expect(res.nameMatched).toBe(true);
      expect(res.data?.phone).toBeDefined();
    });

    it('returns unverified for flagged non-existent BVN (000...)', async () => {
      const res = await service.verifyBvn({
        bvn: '00012345678',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('not found');
    });

    it('rejects BVN with invalid digit count', async () => {
      const res = await service.verifyBvn({
        bvn: '12345',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('must be exactly 11 digits');
    });
  });

  describe('verifyNin', () => {
    it('successfully verifies 11-digit National Identification Number in sandbox', async () => {
      const res = await service.verifyNin({
        nin: '11122233344',
      });

      expect(res.success).toBe(true);
      expect(res.verified).toBe(true);
      expect(res.nin).toBe('11122233344');
    });

    it('returns unverified for flagged non-existent NIN (999...)', async () => {
      const res = await service.verifyNin({
        nin: '99922233344',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('not found');
    });

    it('rejects NIN with invalid digit count', async () => {
      const res = await service.verifyNin({
        nin: '1234',
      });

      expect(res.success).toBe(false);
      expect(res.verified).toBe(false);
      expect(res.message).toContain('must be exactly 11 digits');
    });
  });
});
