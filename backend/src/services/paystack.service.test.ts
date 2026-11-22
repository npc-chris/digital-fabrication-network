import { PaystackService, paystackService } from './paystack.service';

describe('PaystackService - Nigerian Payment & Escrow Client', () => {
  let service: PaystackService;

  beforeEach(() => {
    service = new PaystackService();
  });

  describe('initializePayment', () => {
    it('initializes checkout transaction in sandbox with generated reference and URL', async () => {
      const result = await service.initializePayment({
        email: 'founder@hardware.ng',
        amount: 150000,
        metadata: { rfqId: 42 },
      });

      expect(result.authorizationUrl).toContain('checkout.paystack.com');
      expect(result.accessCode).toBeDefined();
      expect(result.reference).toContain('DFN-PAY-');
    });

    it('preserves custom caller reference if provided', async () => {
      const customRef = 'CUSTOM-RFQ-REF-9988';
      const result = await service.initializePayment({
        email: 'client@fabrication.ng',
        amount: 85000,
        reference: customRef,
      });

      expect(result.reference).toBe(customRef);
    });

    it('throws error when amount is non-positive or email is missing', async () => {
      await expect(
        service.initializePayment({
          email: '',
          amount: 50000,
        })
      ).rejects.toThrow(/Valid email and positive amount are required/);

      await expect(
        service.initializePayment({
          email: 'test@example.com',
          amount: 0,
        })
      ).rejects.toThrow(/Valid email and positive amount are required/);
    });
  });

  describe('verifyPayment', () => {
    it('verifies standard transaction reference successfully in sandbox', async () => {
      const result = await service.verifyPayment('DFN-PAY-TEST-SUCCESS-1234');

      expect(result.status).toBe('success');
      expect(result.reference).toBe('DFN-PAY-TEST-SUCCESS-1234');
      expect(result.amount).toBeGreaterThan(0);
      expect(result.currency).toBe('NGN');
      expect(result.gatewayResponse).toBe('Successful');
    });

    it('identifies simulated failed transaction references', async () => {
      const result = await service.verifyPayment('DFN-PAY-FAIL-5678');

      expect(result.status).toBe('failed');
      expect(result.gatewayResponse).toContain('Declined');
    });

    it('throws error when reference is empty', async () => {
      await expect(service.verifyPayment('')).rejects.toThrow(/Valid transaction reference is required/);
    });
  });

  describe('createSubaccount', () => {
    it('creates machine shop subaccount for split disbursement', async () => {
      const result = await service.createSubaccount({
        businessName: 'IKEJA CNC MACHINING LTD',
        settlementBank: '058',
        accountNumber: '0123456789',
        percentageCharge: 5,
      });

      expect(result.subaccountCode).toMatch(/^ACCT_/);
      expect(result.businessName).toBe('IKEJA CNC MACHINING LTD');
      expect(result.settlementBank).toBe('058');
      expect(result.accountNumber).toBe('0123456789');
    });

    it('throws error when required subaccount parameters are missing', async () => {
      await expect(
        service.createSubaccount({
          businessName: '',
          settlementBank: '058',
          accountNumber: '0123456789',
        })
      ).rejects.toThrow(/businessName, settlementBank, and 10-digit accountNumber are required/);
    });
  });

  describe('initiateTransfer', () => {
    it('initiates fund transfer payout to recipient', async () => {
      const result = await service.initiateTransfer({
        amount: 75000,
        recipient: 'RCP_test_recipient_123',
        reason: 'Milestone 1 Material Allocation',
      });

      expect(result.transferCode).toMatch(/^TRF_/);
      expect(result.status).toBe('success');
      expect(result.amount).toBe(75000);
    });

    it('throws error when amount is non-positive or recipient is missing', async () => {
      await expect(
        service.initiateTransfer({
          amount: 0,
          recipient: 'RCP_test',
        })
      ).rejects.toThrow(/amount and recipient are required/);
    });
  });
});
