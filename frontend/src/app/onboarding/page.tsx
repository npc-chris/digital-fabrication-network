'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  User,
  Building2,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Banknote,
  Loader2,
  Plus,
  X,
  Github,
  Mail,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type OnboardingRole = 'explorer' | 'provider' | '';
type UnitPreference = 'si' | 'imperial';

type VerificationDocs = {
  identityProofUrl: string;
  residenceProofUrl: string;
  insurancePolicyUrl: string;
  additionalDocumentUrls: string[];
};

type UploadingState = {
  identityProofUrl: boolean;
  residenceProofUrl: boolean;
  insurancePolicyUrl: boolean;
  additionalDocumentUrls: boolean;
};

const DOMAIN_OPTIONS = [
  { id: 'mechanical', title: 'Mechanical', subtitle: 'Dynamics & Statics' },
  { id: 'electronics', title: 'Electronics', subtitle: 'VLSI & Control Systems' },
  { id: 'bioengineering', title: 'Bio-Engineering', subtitle: 'Synthetic & Med-Tech' },
  { id: 'chemical', title: 'Chemical', subtitle: 'Process & Reactions' },
  { id: 'robotics', title: 'Robotics', subtitle: 'Kinematics & AI' },
];

const PROVIDER_CAPABILITY_TYPES: Record<string, { label: string; subtypes: string[] }> = {
  transformation: {
    label: 'Transformation Provider',
    subtypes: ['Micro-Fabber', 'Industrial Contractor'],
  },
  inventory: {
    label: 'Inventory Provider',
    subtypes: ['The Producer (OEM)', 'The Reseller (Stockist)'],
  },
  asset: {
    label: 'Asset Provider',
    subtypes: ['Makerspace/Hub', 'Heavy Equipment Leaser'],
  },
  logistics: {
    label: 'Logistics Provider',
    subtypes: ['Regional Courier', 'International Agent'],
  },
};

type PhoneCodeOption = {
  code: string;
  label: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeGithubHandle(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '');
}

function buildGithubProfileUrl(handle: string) {
  const normalized = normalizeGithubHandle(handle);
  return normalized ? `https://github.com/${normalized}` : '';
}

function isValidEmailAddress(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}

function getVisibleSubtypes(typeKey: string, selectedSubtypes: string[]) {
  const defaults = PROVIDER_CAPABILITY_TYPES[typeKey]?.subtypes || [];
  const selectedSet = new Set(selectedSubtypes);
  const overflowSelected = selectedSubtypes.filter((subtype) => !defaults.includes(subtype));

  return defaults.slice(0, 2).map((defaultSubtype) => {
    if (selectedSet.has(defaultSubtype)) {
      return { subtype: defaultSubtype, selected: true };
    }

    const replacement = overflowSelected.shift();
    if (replacement) {
      return { subtype: replacement, selected: true };
    }

    return { subtype: defaultSubtype, selected: false };
  });
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<OnboardingRole>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [contactEmailSameAsProfile, setContactEmailSameAsProfile] = useState(true);
  const [phoneCountryCode, setPhoneCountryCode] = useState('');
  const [phoneCodeOptions, setPhoneCodeOptions] = useState<PhoneCodeOption[]>([]);
  const [subtypeDialogType, setSubtypeDialogType] = useState<string | null>(null);

  const [identityData, setIdentityData] = useState({
    role: '' as '' | 'explorer' | 'provider',
  });

  const [domainData, setDomainData] = useState({
    domains: [] as string[],
    unitPreference: 'si' as UnitPreference,
  });

  const [workflowData, setWorkflowData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    avatar: '',
    githubProfileUrl: '',
    shippingAddress: '',
    contactEmail: '',
    useCurrentLocation: false,
  });

  const [providerCapabilityData, setProviderCapabilityData] = useState({
    providerTypes: [] as string[],
    subtypes: {} as Record<string, string[]>,
  });

  const [providerVerificationData, setProviderVerificationData] = useState({
    taxIdentificationNumber: '',
    businessRegistrationNumber: '',
    bankName: '',
    bankAccountNumber: '',
    isPersonalAccount: false,
    agreements: {
      escrowAccepted: false,
      termsAccepted: false,
    },
  });

  const [verificationDocs, setVerificationDocs] = useState<VerificationDocs>({
    identityProofUrl: '',
    residenceProofUrl: '',
    insurancePolicyUrl: '',
    additionalDocumentUrls: [],
  });

  const [uploading, setUploading] = useState<UploadingState>({
    identityProofUrl: false,
    residenceProofUrl: false,
    insurancePolicyUrl: false,
    additionalDocumentUrls: false,
  });

  const totalSteps = userRole === 'provider' ? 5 : 3;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/register');
          return;
        }
        
        const response = await api.get('/api/auth/me');
                const { user, profile } = response.data as {
                  user: { onboardingCompleted?: boolean; email?: string };
                  profile?: {
                    firstName?: string;
                    lastName?: string;
                    phone?: string;
                    location?: string;
                    avatar?: string;
                  } | null;
                };
        
        if (user.onboardingCompleted) {
                  router.push('/');
          return;
        }
        
        if (profile) {
                  setWorkflowData(prev => ({
            ...prev,
            firstName: profile.firstName || prev.firstName,
            lastName: profile.lastName || prev.lastName,
            avatar: profile.avatar || prev.avatar,
                    phone: profile.phone || prev.phone,
                    location: profile.location || prev.location,
          }));
        }

        if (user.email) {
          setProfileEmail(user.email);
          setContactEmailSameAsProfile(true);
          setWorkflowData(prev => ({
            ...prev,
            contactEmail: user.email || prev.contactEmail,
          }));
        }
      } catch (err) {
        console.error('Failed to check onboarding status', err);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPhoneCodes = async () => {
      try {
        const response = await api.get('/api/locations/phone-codes', {
          signal: controller.signal,
        });

        const options = (response.data?.phoneCodes || []) as PhoneCodeOption[];

        setPhoneCodeOptions(options);
        if (!phoneCountryCode && options.length > 0) {
          setPhoneCountryCode(options[0].code);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Failed to load phone codes', err);
        }
      }
    };

    loadPhoneCodes();

    return () => controller.abort();
  }, []);

  const handleRoleSelection = (role: 'explorer' | 'provider') => {
    setIdentityData({ role });
    setUserRole(role);
    setStep(2);
    setError('');
    setSuccessMessage('');
  };

  const toggleDomain = (domainId: string) => {
    setDomainData((prev) => ({
      ...prev,
      domains: prev.domains.includes(domainId) ? prev.domains.filter((d) => d !== domainId) : [...prev.domains, domainId],
    }));
  };

  const toggleProviderType = (providerType: string) => {
    setProviderCapabilityData((prev) => {
      const exists = prev.providerTypes.includes(providerType);
      const nextTypes = exists ? prev.providerTypes.filter((t) => t !== providerType) : [...prev.providerTypes, providerType];
      const nextSubtypes = { ...prev.subtypes };
      if (!nextTypes.includes(providerType)) {
        delete nextSubtypes[providerType];
      }

      return {
        providerTypes: nextTypes,
        subtypes: nextSubtypes,
      };
    });
  };

  const toggleProviderSubtype = (providerType: string, subtype: string) => {
    setProviderCapabilityData((prev) => {
      const current = prev.subtypes[providerType] || [];
      const next = current.includes(subtype) ? current.filter((s) => s !== subtype) : [...current, subtype];

      return {
        ...prev,
        subtypes: {
          ...prev.subtypes,
          [providerType]: next,
        },
      };
    });
  };

  const uploadDocument = async (file: File, targetKey: keyof UploadingState) => {
    setError('');
    setSuccessMessage('');
    setUploading((prev) => ({ ...prev, [targetKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = response.data?.url as string;
      if (!fileUrl) {
        throw new Error('Upload failed: missing file URL');
      }

      if (targetKey === 'identityProofUrl' || targetKey === 'residenceProofUrl' || targetKey === 'insurancePolicyUrl') {
        setVerificationDocs((prev) => ({ ...prev, [targetKey]: fileUrl }));
      }
      setSuccessMessage('Document uploaded successfully.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setUploading((prev) => ({ ...prev, [targetKey]: false }));
    }
  };

  const uploadAdditionalDocuments = async (files: File[]) => {
    if (files.length === 0) return;

    setError('');
    setSuccessMessage('');
    setUploading((prev) => ({ ...prev, additionalDocumentUrls: true }));

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const fileUrl = response.data?.url as string;
        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        setVerificationDocs((prev) => ({
          ...prev,
          additionalDocumentUrls: [...prev.additionalDocumentUrls, ...uploadedUrls],
        }));
        setSuccessMessage('Additional document uploaded successfully.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload additional document');
    } finally {
      setUploading((prev) => ({ ...prev, additionalDocumentUrls: false }));
    }
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!identityData.role) {
        setError('Select how you want to use the platform to continue.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (domainData.domains.length === 0) {
        setError('Select at least one domain for your workspace calibration.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      const emailToValidate = contactEmailSameAsProfile ? profileEmail : workflowData.contactEmail;

      if (!workflowData.firstName.trim() || !workflowData.lastName.trim() || !workflowData.phone.trim() || !workflowData.shippingAddress.trim() || !phoneCountryCode.trim()) {
        setError('Complete your identity and logistics fields before continuing.');
        return false;
      }

      if (!emailToValidate.trim() || !isValidEmailAddress(emailToValidate)) {
        setError('Use a valid contact email before continuing.');
        return false;
      }

      return true;
    }

    if (step === 4 && userRole === 'provider') {
      if (providerCapabilityData.providerTypes.length === 0) {
        setError('Select at least one capability type.');
        return false;
      }
      const hasSubtypeForEachSelected = providerCapabilityData.providerTypes.every((type) => (providerCapabilityData.subtypes[type] || []).length > 0);
      if (!hasSubtypeForEachSelected) {
        setError('Select at least one subtype for each selected capability type.');
        return false;
      }
      return true;
    }

    if (step === 5 && userRole === 'provider') {
      if (!providerVerificationData.taxIdentificationNumber.trim() || !providerVerificationData.bankName.trim() || !providerVerificationData.bankAccountNumber.trim()) {
        setError('TIN, bank name, and bank account number are required.');
        return false;
      }
      if (!verificationDocs.identityProofUrl || !verificationDocs.residenceProofUrl) {
        setError('Upload proof of identity and proof of residence before completing onboarding.');
        return false;
      }
      if (!providerVerificationData.agreements.escrowAccepted || !providerVerificationData.agreements.termsAccepted) {
        setError('You must accept both compliance agreements to continue.');
        return false;
      }
      return true;
    }

    return true;
  };

  const goNext = async () => {
    setError('');
    setSuccessMessage('');
    if (!validateCurrentStep()) return;

    if (step === 3 && userRole === 'explorer') {
      await completeOnboarding();
      return;
    }

    if (step === 5 && userRole === 'provider') {
      await completeOnboarding();
      return;
    }

    setStep((prev) => prev + 1);
  };

  const goBack = () => {
    setError('');
    setSuccessMessage('');
    if (step === 1) return;
    setStep((prev) => Math.max(1, prev - 1));
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const githubProfileUrl = buildGithubProfileUrl(workflowData.githubProfileUrl);
      const normalizedPhone = `${phoneCountryCode}${workflowData.phone.replace(/[^0-9]/g, '')}`;
      const contactEmail = contactEmailSameAsProfile ? profileEmail : workflowData.contactEmail;

      await api.post('/api/auth/complete-onboarding', {
        role: userRole,
        onboardingData: {
          identityFork: {
            role: userRole,
          },
          domainCalibration: {
            domains: domainData.domains,
            unitPreference: domainData.unitPreference,
          },
          workflowSync: {
            firstName: workflowData.firstName,
            lastName: workflowData.lastName,
            phone: normalizedPhone,
            location: workflowData.shippingAddress,
            avatar: workflowData.avatar,
            githubProfileUrl,
            shippingAddress: workflowData.shippingAddress,
            contactEmail,
            useCurrentLocation: workflowData.useCurrentLocation,
          },
          providerCapabilities:
            userRole === 'provider'
              ? {
                  providerTypes: providerCapabilityData.providerTypes,
                  subtypes: providerCapabilityData.subtypes,
                }
              : undefined,
          providerVerification:
            userRole === 'provider'
              ? {
                  taxIdentificationNumber: providerVerificationData.taxIdentificationNumber,
                  businessRegistrationNumber: providerVerificationData.businessRegistrationNumber,
                  bankName: providerVerificationData.bankName,
                  bankAccountNumber: providerVerificationData.bankAccountNumber,
                  isPersonalAccount: providerVerificationData.isPersonalAccount,
                  documents: verificationDocs,
                  agreements: providerVerificationData.agreements,
                }
              : undefined,
        },
      });

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] px-4 pb-28 pt-4 text-[#191c1e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="sticky top-4 z-30 mb-5 rounded-[1.75rem] border border-slate-200 bg-white/90 px-5 py-4 shadow-[0_20px_40px_rgba(0,96,152,0.06)] backdrop-blur">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#006098]">Step {step} of {totalSteps}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {step === 1 && 'Identity Fork'}
                {step === 2 && 'Domain Calibration'}
                {step === 3 && 'Workflow Sync'}
                {step === 4 && 'Capability Mapping'}
                {step === 5 && 'Verification & Payouts'}
              </p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Compact onboarding flow</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-colors ${idx + 1 <= step ? 'bg-[#006098]' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_40px_rgba(0,96,152,0.06)] sm:p-6 lg:p-8">
          {step === 1 ? (
            <div className="space-y-7">
              <div className="space-y-3 text-center">
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Choose your trajectory</h1>
                <p className="mx-auto max-w-2xl text-slate-600">Select the profile that best describes your role in the digital fabrication ecosystem.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelection('explorer')}
                  className={`rounded-[1.5rem] border p-5 text-left transition-all sm:p-6 ${userRole === 'explorer' ? 'border-[#006098] bg-[#f2f8ff] shadow-[0_16px_32px_rgba(0,96,152,0.08)]' : 'border-slate-200 hover:border-[#006098]/40 hover:bg-slate-50'}`}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                    <User className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold">Explorer</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">I design and build products. I need tools, workflows, and provider matchmaking.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelection('provider')}
                  className={`rounded-[1.5rem] border p-5 text-left transition-all sm:p-6 ${userRole === 'provider' ? 'border-[#006098] bg-[#f2f8ff] shadow-[0_16px_32px_rgba(0,96,152,0.08)]' : 'border-slate-200 hover:border-[#006098]/40 hover:bg-slate-50'}`}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                    <Building2 className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold">Provider</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">I provide fabrication capability, inventory, assets, or logistics services.</p>
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-7">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Define your engineering perimeter</h2>
                <p className="text-slate-600">Select your primary fields and preferred output units for calculations.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DOMAIN_OPTIONS.map((option) => {
                  const active = domainData.domains.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleDomain(option.id)}
                      className={`rounded-[1.35rem] border p-4 text-left transition-all ${active ? 'border-[#006098] bg-[#eff6ff] shadow-[0_12px_24px_rgba(0,96,152,0.08)]' : 'border-slate-200 bg-white hover:border-[#006098]/40 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold">{option.title}</p>
                          <p className="text-xs text-slate-600">{option.subtitle}</p>
                        </div>
                        {active ? <CheckCircle2 className="size-5 text-[#006098]" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[1.35rem] border border-slate-200 bg-[#f8fafc] p-4">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Unit Preference</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDomainData((prev) => ({ ...prev, unitPreference: 'si' }))}
                    className={`rounded-xl border px-4 py-3 text-left ${domainData.unitPreference === 'si' ? 'border-[#006098] bg-[#eff6ff]' : 'border-slate-200 bg-white'}`}
                  >
                    <p className="font-bold">SI / Metric</p>
                    <p className="text-xs text-slate-600">kg, m, s</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDomainData((prev) => ({ ...prev, unitPreference: 'imperial' }))}
                    className={`rounded-xl border px-4 py-3 text-left ${domainData.unitPreference === 'imperial' ? 'border-[#006098] bg-[#eff6ff]' : 'border-slate-200 bg-white'}`}
                  >
                    <p className="font-bold">Imperial</p>
                    <p className="text-xs text-slate-600">lb, ft, s</p>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-7">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Integrate your workflow</h2>
                <p className="text-slate-600">Set your profile identity and logistics defaults.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                  <p className="mb-4 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Profile image</p>
                  <div className="flex items-center gap-4">
                    {workflowData.avatar ? (
                      <img src={workflowData.avatar} alt="Profile" className="size-16 rounded-full object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User className="size-8" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <ImageUpload value={workflowData.avatar} onChange={(url) => setWorkflowData((prev) => ({ ...prev, avatar: url }))} placeholder="Upload avatar" showPreview={false} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>First name</span>
                      <input
                        type="text"
                        value={workflowData.firstName}
                        onChange={(e) => setWorkflowData((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition-all placeholder:text-slate-400 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                      />
                    </label>
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>Last name</span>
                      <input
                        type="text"
                        value={workflowData.lastName}
                        onChange={(e) => setWorkflowData((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition-all placeholder:text-slate-400 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>Phone code</span>
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        disabled={phoneCodeOptions.length === 0}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                      >
                        <option value="">{phoneCodeOptions.length === 0 ? 'Loading codes...' : 'Select code'}</option>
                        {phoneCodeOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.code} {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>Phone number</span>
                      <input
                        type="tel"
                        value={workflowData.phone}
                        onChange={(e) => setWorkflowData((prev) => ({ ...prev, phone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition-all placeholder:text-slate-400 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        placeholder="812 345 6789"
                      />
                    </label>
                  </div>

                  <div className="space-y-3 rounded-[1.35rem] border border-slate-200 bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={contactEmailSameAsProfile}
                          onChange={(e) => {
                            setContactEmailSameAsProfile(e.target.checked);
                            if (e.target.checked && profileEmail) {
                              setWorkflowData((prev) => ({ ...prev, contactEmail: profileEmail }));
                            }
                          }}
                          className="size-4 rounded border-slate-300"
                        />
                        Same as profile?
                      </label>
                      <span className="text-xs text-slate-500">Profile email: {profileEmail || 'not available yet'}</span>
                    </div>
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>Contact email</span>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={contactEmailSameAsProfile ? profileEmail : workflowData.contactEmail}
                          onChange={(e) => setWorkflowData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                          disabled={contactEmailSameAsProfile}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm font-normal outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        />
                      </div>
                      {!contactEmailSameAsProfile ? (
                        <p className="text-xs font-normal text-slate-500">We’ll validate this before continuing.</p>
                      ) : null}
                    </label>
                  </div>

                  <div className="grid gap-3">
                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>Shipping / Lab Address</span>
                      <LocationAutocomplete
                        value={workflowData.shippingAddress}
                        onChange={(location) => setWorkflowData((prev) => ({ ...prev, shippingAddress: location, location }))}
                        placeholder="Start with a street, landmark, or full address"
                        required
                        restrictToNigeria={true}
                        className="w-full"
                      />
                    </label>

                    <label className="block space-y-2 text-sm font-bold text-slate-700">
                      <span>GitHub profile</span>
                      <div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white transition-all focus-within:border-[#006098] focus-within:ring-2 focus-within:ring-[#006098]/15">
                        <span className="inline-flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                          <Github className="mr-2 size-4" /> https://github.com/
                        </span>
                        <input
                          type="text"
                          value={workflowData.githubProfileUrl}
                          onChange={(e) => setWorkflowData((prev) => ({ ...prev, githubProfileUrl: e.target.value }))}
                          placeholder="username"
                          className="min-w-0 flex-1 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 && userRole === 'provider' ? (
            <div className="space-y-7">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Capability mapping</h2>
                <p className="text-slate-600">Choose all provider capability pillars and the subtypes you operate.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {Object.entries(PROVIDER_CAPABILITY_TYPES).map(([typeKey, value]) => {
                  const selectedType = providerCapabilityData.providerTypes.includes(typeKey);
                  const selectedSubtypes = providerCapabilityData.subtypes[typeKey] || [];
                  const quickAccess = getVisibleSubtypes(typeKey, selectedSubtypes);

                  return (
                    <div
                      key={typeKey}
                      onClick={() => toggleProviderType(typeKey)}
                      className={`cursor-pointer rounded-[1.5rem] border p-5 transition-all ${selectedType ? 'border-[#006098] bg-[#eff6ff] shadow-[0_16px_32px_rgba(0,96,152,0.08)]' : 'border-slate-200 bg-white hover:border-[#006098]/40 hover:bg-slate-50'}`}
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold">{value.label}</p>
                          <p className="text-sm text-slate-600">Tap anywhere on the card to select this capability.</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${selectedType ? 'bg-[#006098] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {selectedType ? 'Selected' : 'Select'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {quickAccess.map((subtype) => {
                            const active = selectedSubtypes.includes(subtype.subtype);
                            return (
                              <button
                                key={`${typeKey}-${subtype.subtype}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleProviderSubtype(typeKey, subtype.subtype);
                                }}
                                disabled={!selectedType}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${active ? 'border-[#006098] bg-[#006098] text-white' : 'border-slate-300 bg-white text-slate-700'} ${!selectedType ? 'cursor-not-allowed opacity-40' : ''}`}
                              >
                                {subtype.subtype}
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubtypeDialogType(typeKey);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#006098] hover:text-[#006098]"
                          >
                            <Plus className="size-3.5" /> More
                          </button>
                        </div>

                        {selectedSubtypes.length > quickAccess.filter((item) => item.selected).length ? (
                          <p className="text-xs text-slate-500">
                            {selectedSubtypes.length} subtype{selectedSubtypes.length === 1 ? '' : 's'} selected.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 5 && userRole === 'provider' ? (
            <div className="space-y-7">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Verification & payouts</h2>
                <p className="text-slate-600">Provide legal and payout details required for provider approval.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <section className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                        <ShieldCheck className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#191c1e]">Legal identity</h3>
                        <p className="text-sm text-slate-600">Tax and registration details.</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-2 text-sm font-bold text-slate-700">
                        <span>TIN</span>
                        <input
                          type="text"
                          value={providerVerificationData.taxIdentificationNumber}
                          onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, taxIdentificationNumber: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none transition-all focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        />
                      </label>
                      <label className="block space-y-2 text-sm font-bold text-slate-700">
                        <span>Business registration number</span>
                        <input
                          type="text"
                          value={providerVerificationData.businessRegistrationNumber}
                          onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, businessRegistrationNumber: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-normal outline-none transition-all focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                        <Banknote className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#191c1e]">Payout account</h3>
                        <p className="text-sm text-slate-600">Bank details for releases.</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block space-y-2 text-sm font-bold text-slate-700">
                        <span>Bank name</span>
                        <input
                          type="text"
                          value={providerVerificationData.bankName}
                          onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, bankName: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition-all focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        />
                      </label>
                      <label className="block space-y-2 text-sm font-bold text-slate-700">
                        <span>Bank account number</span>
                        <input
                          type="text"
                          value={providerVerificationData.bankAccountNumber}
                          onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-normal outline-none transition-all focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                        />
                      </label>
                    </div>

                    <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-slate-300"
                        checked={providerVerificationData.isPersonalAccount}
                        onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, isPersonalAccount: e.target.checked }))}
                      />
                      This is a personal account
                    </label>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#191c1e]">Evidence documents</h3>
                          <p className="text-sm text-slate-600">Upload verification files.</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                        Required
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="group block cursor-pointer rounded-[1.25rem] border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-[#006098]/50 hover:bg-[#f7fbff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-[#004873] shadow-sm">
                              <ShieldCheck className="size-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#191c1e]">Proof of identity</p>
                              <p className="text-xs text-slate-500">PDF, JPG, PNG</p>
                            </div>
                          </div>
                          {uploading.identityProofUrl ? <Loader2 className="size-4 animate-spin text-slate-400" /> : verificationDocs.identityProofUrl ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Upload className="size-4 text-slate-400" />}
                        </div>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'identityProofUrl')} />
                        <p className="mt-4 text-xs text-slate-500">Tap to browse or drop a file here.</p>
                      </label>

                      <label className="group block cursor-pointer rounded-[1.25rem] border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-[#006098]/50 hover:bg-[#f7fbff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-[#004873] shadow-sm">
                              <MapPin className="size-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#191c1e]">Proof of residence</p>
                              <p className="text-xs text-slate-500">PDF, JPG, PNG</p>
                            </div>
                          </div>
                          {uploading.residenceProofUrl ? <Loader2 className="size-4 animate-spin text-slate-400" /> : verificationDocs.residenceProofUrl ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Upload className="size-4 text-slate-400" />}
                        </div>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'residenceProofUrl')} />
                        <p className="mt-4 text-xs text-slate-500">Tap to browse or drop a file here.</p>
                      </label>

                      <label className="group block cursor-pointer rounded-[1.25rem] border-2 border-dashed border-slate-300 bg-slate-50 p-4 transition-all hover:border-[#006098]/50 hover:bg-[#f7fbff]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-[#004873] shadow-sm">
                              <Banknote className="size-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#191c1e]">Insurance policy</p>
                              <p className="text-xs text-slate-500">Optional</p>
                            </div>
                          </div>
                          {uploading.insurancePolicyUrl ? <Loader2 className="size-4 animate-spin text-slate-400" /> : verificationDocs.insurancePolicyUrl ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Upload className="size-4 text-slate-400" />}
                        </div>
                        <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'insurancePolicyUrl')} />
                        <p className="mt-4 text-xs text-slate-500">Tap to browse or drop a file here.</p>
                      </label>

                      <label className="group block cursor-pointer rounded-[1.25rem] border-2 border-dashed border-[#006098]/30 bg-[#eff6ff] p-4 transition-all hover:border-[#006098] hover:bg-[#eaf4ff] sm:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white text-[#004873] shadow-sm">
                              <Plus className="size-5" />
                            </div>
                            <div>
                              <p className="font-bold text-[#191c1e]">Additional documents</p>
                              <p className="text-xs text-slate-500">Upload more files at once</p>
                            </div>
                          </div>
                          {uploading.additionalDocumentUrls ? <Loader2 className="size-4 animate-spin text-slate-400" /> : <Upload className="size-4 text-slate-400" />}
                        </div>
                        <input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip" multiple className="sr-only" onChange={(e) => e.target.files && uploadAdditionalDocuments(Array.from(e.target.files))} />
                        <p className="mt-4 text-xs text-slate-500">Tap to browse or drop a batch of supporting documents.</p>
                        {verificationDocs.additionalDocumentUrls.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {verificationDocs.additionalDocumentUrls.map((url, index) => (
                              <span key={`${url}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                                <CheckCircle2 className="size-3.5 text-emerald-600" />
                                Extra doc {index + 1}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </label>
                    </div>
                  </section>

                  <section className="rounded-[1.5rem] border border-slate-200 bg-[#f8fafc] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#cee5ff] text-[#004873]">
                        <AlertCircle className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#191c1e]">Compliance & agreement</h3>
                        <p className="text-sm text-slate-600">Confirm escrow and terms.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 rounded border-slate-300"
                          checked={providerVerificationData.agreements.escrowAccepted}
                          onChange={(e) =>
                            setProviderVerificationData((prev) => ({
                              ...prev,
                              agreements: { ...prev.agreements, escrowAccepted: e.target.checked },
                            }))
                          }
                        />
                        <span>I understand DFN escrow and payout release rules.</span>
                      </label>

                      <label className="flex items-start gap-3 rounded-2xl border border-white bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
                        <input
                          type="checkbox"
                          className="mt-0.5 size-4 rounded border-slate-300"
                          checked={providerVerificationData.agreements.termsAccepted}
                          onChange={(e) =>
                            setProviderVerificationData((prev) => ({
                              ...prev,
                              agreements: { ...prev.agreements, termsAccepted: e.target.checked },
                            }))
                          }
                        />
                        <span>I agree to DFN terms, verification policies, and fee schedule.</span>
                      </label>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : null}

          {step > 1 ? (
            <div className="sticky bottom-4 z-20 mt-8 rounded-[1.5rem] border border-slate-200 bg-white/95 px-4 py-4 shadow-[0_20px_40px_rgba(0,96,152,0.08)] backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={goBack} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                  <ArrowLeft className="size-4" />
                  Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={goNext}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#004873] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Saving...' : step === totalSteps || (userRole === 'explorer' && step === 3) ? 'Complete Onboarding' : 'Continue'}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <Dialog open={Boolean(subtypeDialogType)} onOpenChange={(open) => {
        if (!open) {
          setSubtypeDialogType(null);
        }
      }}>
        <DialogContent className="max-w-2xl border border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle>Choose sub-types</DialogTitle>
            <DialogDescription>Use the quick access chips or select any subtype from the full list.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            {subtypeDialogType ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{PROVIDER_CAPABILITY_TYPES[subtypeDialogType].label}</p>
                    <p className="mt-1 text-sm text-slate-600">Selected sub-types stay visible in the quick access row above.</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {providerCapabilityData.subtypes[subtypeDialogType]?.length || 0} selected
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {PROVIDER_CAPABILITY_TYPES[subtypeDialogType].subtypes.map((subtype) => {
                    const selected = (providerCapabilityData.subtypes[subtypeDialogType] || []).includes(subtype);

                    return (
                      <button
                        key={`${subtypeDialogType}-${subtype}`}
                        type="button"
                        onClick={() => toggleProviderSubtype(subtypeDialogType, subtype)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-all ${selected ? 'border-[#006098] bg-[#eff6ff] text-[#004873]' : 'border-slate-200 bg-white text-slate-700 hover:border-[#006098]/40 hover:bg-slate-50'}`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span>{subtype}</span>
                          {selected ? <CheckCircle2 className="size-4 text-[#006098]" /> : <ChevronDown className="size-4 text-slate-400" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSubtypeDialogType(null)}
                    className="rounded-xl bg-[#006098] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
