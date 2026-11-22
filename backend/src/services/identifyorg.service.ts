import axios, { AxiosInstance } from 'axios';
import { CacVerificationRequest, CacVerificationResult, CacCompanyData } from './kyc-provider.service';

export interface IdentifyOrgBusinessResponse {
  status: boolean;
  message?: string;
  data?: {
    registration_number: string;
    company_name: string;
    company_type?: string;
    status: string;
    registration_date?: string;
    address?: string;
    head_office_address?: string;
    directors?: Array<{ name: string; role?: string }>;
    risk_score?: number;
    sanctions_check?: boolean;
    pep_check?: boolean;
  };
}

export interface BvnVerificationParams {
  bvn: string;
  firstName?: string;
  lastName?: string;
}

export interface BvnVerificationResult {
  success: boolean;
  verified: boolean;
  bvn: string;
  nameMatched?: boolean;
  message: string;
  data?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
  };
}

export interface NinVerificationParams {
  nin: string;
}

export interface NinVerificationResult {
  success: boolean;
  verified: boolean;
  nin: string;
  message: string;
  data?: Record<string, any>;
}

/**
 * IdentifyOrg (identifyorg.com) Integration Service
 * Specializes in African & Nigerian Identity (BVN, NIN) and KYB / Business Screening.
 */
export class IdentifyOrgService {
  private apiKey: string;
  private baseUrl: string;
  private httpClient: AxiosInstance;
  public readonly isSandbox: boolean;

  constructor(options?: { apiKey?: string; baseUrl?: string }) {
    this.apiKey = options?.apiKey || process.env.IDENTIFYORG_API_KEY || '';
    this.baseUrl = options?.baseUrl || process.env.IDENTIFYORG_BASE_URL || 'https://api.identifyorg.com';

    this.isSandbox =
      process.env.NODE_ENV === 'test' ||
      process.env.IDENTIFYORG_MOCK_MODE === 'true' ||
      !this.apiKey ||
      this.apiKey === 'test' ||
      this.apiKey.startsWith('io_test_') ||
      this.apiKey.startsWith('mock_');

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 12000,
      headers: {
        'X-IdentifyOrg-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Normalizes CAC registration number format.
   */
  public normalizeRcNumber(input: string): { normalized: string; type: 'RC' | 'BN' | 'IT'; rawNumber: string } {
    if (!input || typeof input !== 'string') {
      throw new Error('CAC registration number is required');
    }

    const trimmed = input.trim().toUpperCase().replace(/[\s\-_]/g, '');
    let type: 'RC' | 'BN' | 'IT' = 'RC';
    let rawNumber = trimmed;

    if (trimmed.startsWith('RC')) {
      type = 'RC';
      rawNumber = trimmed.substring(2);
    } else if (trimmed.startsWith('BN')) {
      type = 'BN';
      rawNumber = trimmed.substring(2);
    } else if (trimmed.startsWith('IT')) {
      type = 'IT';
      rawNumber = trimmed.substring(2);
    }

    if (!/^\d{5,8}$/.test(rawNumber)) {
      throw new Error(`Invalid CAC registration number format: ${input}. Must contain 5 to 8 digits.`);
    }

    return {
      normalized: `${type}-${rawNumber}`,
      type,
      rawNumber,
    };
  }

  /**
   * Verify Nigerian Business / Workshop via IdentifyOrg KYB & Business Screening API.
   */
  public async verifyBusiness(params: CacVerificationRequest): Promise<CacVerificationResult> {
    try {
      const { normalized, type, rawNumber } = this.normalizeRcNumber(params.rcNumber);
      const companyType = params.companyType || type;

      // Sandbox / Deterministic fallback mode
      if (this.isSandbox) {
        return this.executeSandboxBusinessVerification(normalized, companyType, rawNumber, params.companyName);
      }

      // Live IdentifyOrg API call (/v1/screening/kyb or /v1/framl/business)
      const response = await this.httpClient.post('/v1/screening/kyb', {
        registration_number: rawNumber,
        company_type: companyType,
        company_name: params.companyName,
        country: 'NG',
      });

      const resData = response.data;
      if (!resData || resData.status === false || !resData.data) {
        return {
          success: false,
          verified: false,
          message: resData?.message || 'IdentifyOrg business verification failed',
        };
      }

      const entity = resData.data;
      const isActive = String(entity.status || '').toUpperCase() === 'ACTIVE';

      const companyData: CacCompanyData = {
        rcNumber: normalized,
        companyName: entity.company_name || params.companyName || 'REGISTERED WORKSHOP',
        companyType: entity.company_type || companyType,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        registrationDate: entity.registration_date || new Date().toISOString().split('T')[0],
        headOfficeAddress: entity.head_office_address || entity.address || 'Lagos, Nigeria',
        directors: Array.isArray(entity.directors)
          ? entity.directors.map((d: any) => ({
              name: d.name || 'DIRECTOR',
              designation: d.role || 'DIRECTOR',
            }))
          : undefined,
        raw: entity,
      };

      return {
        success: true,
        verified: isActive,
        message: isActive
          ? 'IdentifyOrg: CAC business registration verified and active'
          : 'IdentifyOrg: CAC entity is inactive or dissolved',
        data: companyData,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Error communicating with IdentifyOrg API';
      return {
        success: false,
        verified: false,
        message: errorMessage,
        error: error.message,
      };
    }
  }

  /**
   * Verify Nigerian Director / Individual Bank Verification Number (BVN).
   */
  public async verifyBvn(params: BvnVerificationParams): Promise<BvnVerificationResult> {
    try {
      const cleanBvn = (params.bvn || '').trim().replace(/\D/g, '');
      if (cleanBvn.length !== 11) {
        return {
          success: false,
          verified: false,
          bvn: params.bvn,
          message: 'Bank Verification Number (BVN) must be exactly 11 digits',
        };
      }

      if (this.isSandbox) {
        if (cleanBvn.startsWith('000') || cleanBvn.startsWith('999')) {
          return {
            success: false,
            verified: false,
            bvn: cleanBvn,
            message: 'BVN record not found in NIBSS database',
          };
        }

        return {
          success: true,
          verified: true,
          bvn: cleanBvn,
          nameMatched: true,
          message: 'IdentifyOrg: BVN verified successfully with financial registry',
          data: {
            firstName: params.firstName || 'Verified',
            lastName: params.lastName || 'Director',
            phone: '08012345678',
            dateOfBirth: '1985-05-15',
          },
        };
      }

      const response = await this.httpClient.post('/v1/verify/bvn', {
        bvn: cleanBvn,
        first_name: params.firstName,
        last_name: params.lastName,
      });

      const resData = response.data;
      const isVerified = resData?.status === true;

      return {
        success: isVerified,
        verified: isVerified,
        bvn: cleanBvn,
        nameMatched: resData?.data?.name_matched ?? true,
        message: resData?.message || (isVerified ? 'BVN verified' : 'BVN verification failed'),
        data: resData?.data,
      };
    } catch (error: any) {
      return {
        success: false,
        verified: false,
        bvn: params.bvn,
        message: error.response?.data?.message || error.message || 'IdentifyOrg BVN verification error',
      };
    }
  }

  /**
   * Verify National Identification Number (NIN).
   */
  public async verifyNin(params: NinVerificationParams): Promise<NinVerificationResult> {
    try {
      const cleanNin = (params.nin || '').trim().replace(/\D/g, '');
      if (cleanNin.length !== 11) {
        return {
          success: false,
          verified: false,
          nin: params.nin,
          message: 'National Identification Number (NIN) must be exactly 11 digits',
        };
      }

      if (this.isSandbox) {
        if (cleanNin.startsWith('000') || cleanNin.startsWith('999')) {
          return {
            success: false,
            verified: false,
            nin: cleanNin,
            message: 'NIN record not found in NIMC database',
          };
        }

        return {
          success: true,
          verified: true,
          nin: cleanNin,
          message: 'IdentifyOrg: National Identification Number verified with NIMC',
          data: {
            nin: cleanNin,
            status: 'ACTIVE',
          },
        };
      }

      const response = await this.httpClient.post('/v1/verify/nin', {
        nin: cleanNin,
      });

      const resData = response.data;
      const isVerified = resData?.status === true;

      return {
        success: isVerified,
        verified: isVerified,
        nin: cleanNin,
        message: resData?.message || (isVerified ? 'NIN verified' : 'NIN verification failed'),
        data: resData?.data,
      };
    } catch (error: any) {
      return {
        success: false,
        verified: false,
        nin: params.nin,
        message: error.response?.data?.message || error.message || 'IdentifyOrg NIN verification error',
      };
    }
  }

  /**
   * Executes deterministic sandbox simulation for testing and local dev.
   */
  private executeSandboxBusinessVerification(
    normalized: string,
    companyType: string,
    rawNumber: string,
    requestedName?: string
  ): CacVerificationResult {
    // Flagged missing record
    if (rawNumber.startsWith('999') || rawNumber.startsWith('000')) {
      return {
        success: false,
        verified: false,
        message: 'IdentifyOrg: CAC registration not found in registry',
        error: 'ENTITY_NOT_FOUND',
      };
    }

    // Flagged inactive record
    if (rawNumber.startsWith('888')) {
      return {
        success: true,
        verified: false,
        message: 'IdentifyOrg: Corporate Affairs Commission entity is inactive or dissolved',
        data: {
          rcNumber: normalized,
          companyName: requestedName || 'INACTIVE FABRICATION ENTERPRISE',
          companyType,
          status: 'INACTIVE',
          registrationDate: '2016-03-20',
          headOfficeAddress: 'Plot 10 Industrial Crescent, Ikeja, Lagos',
        },
      };
    }

    const companyName = requestedName
      ? requestedName.trim().toUpperCase()
      : `IDENTIFYORG VERIFIED WORKSHOP ${companyType === 'BN' ? 'VENTURES' : 'LTD'}`;

    return {
      success: true,
      verified: true,
      message: 'IdentifyOrg: Corporate Affairs Commission registration verified and active',
      data: {
        rcNumber: normalized,
        companyName,
        companyType,
        status: 'ACTIVE',
        registrationDate: '2021-08-10',
        headOfficeAddress: '18 Commercial Way, Ikeja Industrial Zone, Lagos, Nigeria',
        classification: companyType === 'BN' ? 'Business Name' : 'Private Limited Company',
        directors: [
          {
            name: 'Lead Technical Director',
            designation: companyType === 'BN' ? 'PROPRIETOR' : 'MANAGING DIRECTOR',
          },
        ],
      },
    };
  }
}

export const identifyOrgService = new IdentifyOrgService();
