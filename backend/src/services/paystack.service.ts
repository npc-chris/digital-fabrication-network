import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface InitializePaymentParams {
  email: string;
  amount: number; // in NGN (Naira)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
  subaccount?: string;
  splitCode?: string;
  currency?: string;
}

export interface InitializePaymentResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface VerifyPaymentResult {
  status: 'success' | 'failed' | 'abandoned';
  reference: string;
  amount: number; // in NGN (Naira)
  currency: string;
  paidAt?: Date;
  customerEmail: string;
  channel?: string;
  gatewayResponse: string;
  raw?: Record<string, any>;
}

export interface SubaccountParams {
  businessName: string;
  settlementBank: string; // Bank code (e.g. 058, 011, 057)
  accountNumber: string; // 10-digit NUBAN
  percentageCharge?: number;
  description?: string;
}

export interface SubaccountResult {
  subaccountCode: string;
  businessName: string;
  settlementBank: string;
  accountNumber: string;
}

export interface TransferParams {
  amount: number; // in NGN (Naira)
  recipient: string; // Recipient code RCP_xxx
  reason?: string;
  reference?: string;
}

export interface TransferResult {
  transferCode: string;
  reference: string;
  status: string;
  amount: number;
}

/**
 * Paystack Payment & Escrow Client Service
 * Handles outbound Nigerian transaction initialization, verification, subaccounts, and transfers.
 */
export class PaystackService {
  private secretKey: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  public readonly isSandbox: boolean;

  constructor(options?: { secretKey?: string; baseUrl?: string }) {
    this.secretKey = options?.secretKey || process.env.PAYSTACK_SECRET_KEY || '';
    this.baseUrl = options?.baseUrl || 'https://api.paystack.co';

    this.isSandbox =
      process.env.NODE_ENV === 'test' ||
      process.env.PAYSTACK_MOCK_MODE === 'true' ||
      !this.secretKey ||
      this.secretKey === 'test' ||
      this.secretKey.startsWith('mock_') ||
      this.secretKey.startsWith('test-');

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 12000,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Initializes a transaction on Paystack and generates a secure checkout URL.
   * Paystack requires the amount in kobo (NGN * 100).
   */
  public async initializePayment(params: InitializePaymentParams): Promise<InitializePaymentResult> {
    if (!params.email || !params.amount || params.amount <= 0) {
      throw new Error('Valid email and positive amount are required to initialize Paystack payment');
    }

    const reference = params.reference || `DFN-PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const amountInKobo = Math.round(params.amount * 100);

    if (this.isSandbox) {
      const mockAccessCode = `pstk_acc_${crypto.randomBytes(6).toString('hex')}`;
      return {
        authorizationUrl: `https://checkout.paystack.com/${mockAccessCode}`,
        accessCode: mockAccessCode,
        reference,
      };
    }

    try {
      const response = await this.httpClient.post('/transaction/initialize', {
        email: params.email,
        amount: amountInKobo,
        reference,
        callback_url: params.callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
        metadata: params.metadata,
        subaccount: params.subaccount,
        split_code: params.splitCode,
        currency: params.currency || 'NGN',
      });

      const data = response.data?.data;
      if (!data?.authorization_url || !data?.reference) {
        throw new Error(response.data?.message || 'Failed to initialize Paystack payment');
      }

      return {
        authorizationUrl: data.authorization_url,
        accessCode: data.access_code,
        reference: data.reference,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Paystack initialization error';
      throw new Error(`Paystack Payment Initialization Error: ${message}`);
    }
  }

  /**
   * Verifies a completed transaction reference with Paystack.
   */
  public async verifyPayment(reference: string): Promise<VerifyPaymentResult> {
    if (!reference || typeof reference !== 'string') {
      throw new Error('Valid transaction reference is required for verification');
    }

    if (this.isSandbox) {
      if (reference.includes('FAIL') || reference.includes('INVALID')) {
        return {
          status: 'failed',
          reference,
          amount: 0,
          currency: 'NGN',
          customerEmail: 'failed@example.com',
          gatewayResponse: 'Declined or Simulated Failure',
        };
      }

      return {
        status: 'success',
        reference,
        amount: 50000,
        currency: 'NGN',
        paidAt: new Date(),
        customerEmail: 'payer@example.com',
        channel: 'card',
        gatewayResponse: 'Successful',
      };
    }

    try {
      const response = await this.httpClient.get(`/transaction/verify/${encodeURIComponent(reference)}`);
      const data = response.data?.data;

      if (!data) {
        throw new Error('No transaction data returned from Paystack');
      }

      const amountInNaira = data.amount ? data.amount / 100 : 0;
      const status = data.status === 'success' ? 'success' : data.status === 'failed' ? 'failed' : 'abandoned';

      return {
        status,
        reference: data.reference || reference,
        amount: amountInNaira,
        currency: data.currency || 'NGN',
        paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        customerEmail: data.customer?.email || '',
        channel: data.channel,
        gatewayResponse: data.gateway_response || 'OK',
        raw: data,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Paystack verification error';
      throw new Error(`Paystack Payment Verification Error: ${message}`);
    }
  }

  /**
   * Creates a dedicated subaccount for a machine shop/workshop for automated split settlements.
   */
  public async createSubaccount(params: SubaccountParams): Promise<SubaccountResult> {
    if (!params.businessName || !params.settlementBank || !params.accountNumber) {
      throw new Error('businessName, settlementBank, and 10-digit accountNumber are required');
    }

    if (this.isSandbox) {
      const subaccountCode = `ACCT_${crypto.randomBytes(6).toString('hex').toLowerCase()}`;
      return {
        subaccountCode,
        businessName: params.businessName,
        settlementBank: params.settlementBank,
        accountNumber: params.accountNumber,
      };
    }

    try {
      const response = await this.httpClient.post('/subaccount', {
        business_name: params.businessName,
        settlement_bank: params.settlementBank,
        account_number: params.accountNumber,
        percentage_charge: params.percentageCharge ?? 0,
        description: params.description || `DFN Workshop Subaccount - ${params.businessName}`,
      });

      const data = response.data?.data;
      if (!data?.subaccount_code) {
        throw new Error(response.data?.message || 'Failed to create Paystack subaccount');
      }

      return {
        subaccountCode: data.subaccount_code,
        businessName: data.business_name,
        settlementBank: data.settlement_bank,
        accountNumber: data.account_number,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Subaccount creation error';
      throw new Error(`Paystack Subaccount Error: ${message}`);
    }
  }

  /**
   * Initiates a fund transfer / disbursement from platform balance to recipient.
   */
  public async initiateTransfer(params: TransferParams): Promise<TransferResult> {
    if (!params.amount || params.amount <= 0 || !params.recipient) {
      throw new Error('amount and recipient are required for fund transfer');
    }

    const reference = params.reference || `DFN-TRF-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const amountInKobo = Math.round(params.amount * 100);

    if (this.isSandbox) {
      const transferCode = `TRF_${crypto.randomBytes(6).toString('hex').toLowerCase()}`;
      return {
        transferCode,
        reference,
        status: 'success',
        amount: params.amount,
      };
    }

    try {
      const response = await this.httpClient.post('/transfer', {
        source: 'balance',
        amount: amountInKobo,
        recipient: params.recipient,
        reason: params.reason || 'DFN Milestone Release Payout',
        reference,
      });

      const data = response.data?.data;
      return {
        transferCode: data.transfer_code,
        reference: data.reference || reference,
        status: data.status || 'pending',
        amount: params.amount,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Transfer initiation error';
      throw new Error(`Paystack Transfer Error: ${message}`);
    }
  }
}

export const paystackService = new PaystackService();
