'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, Building2, MapPin, Phone, FileText, Wrench, Package, CheckCircle2, ArrowRight, ArrowLeft, Upload, ShieldCheck, Banknote } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LocationAutocomplete from '@/components/LocationAutocomplete';

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

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<OnboardingRole>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
                  user: { onboardingCompleted?: boolean };
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
      } catch (err) {
        console.error('Failed to check onboarding status', err);
      }
    };

    checkOnboardingStatus();
  }, [router]);

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
      if (!workflowData.firstName.trim() || !workflowData.lastName.trim() || !workflowData.phone.trim() || !workflowData.location.trim()) {
        setError('Complete your identity and logistics fields before continuing.');
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
            phone: workflowData.phone,
            location: workflowData.location,
            avatar: workflowData.avatar,
            githubProfileUrl: workflowData.githubProfileUrl,
            shippingAddress: workflowData.shippingAddress,
            contactEmail: workflowData.contactEmail,
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
    <div className="min-h-screen bg-[#f7f9fb] px-4 py-10 text-[#191c1e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-[0_20px_40px_rgba(0,96,152,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#006098]">Step {step} of {totalSteps}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {step === 1 && 'Identity Fork'}
              {step === 2 && 'Domain Calibration'}
              {step === 3 && 'Workflow Sync'}
              {step === 4 && 'Capability Mapping'}
              {step === 5 && 'Verification & Payouts'}
            </p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div key={idx} className={`h-1.5 flex-1 rounded-full ${idx + 1 <= step ? 'bg-[#006098]' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {error ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
        {successMessage ? <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{successMessage}</div> : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_40px_rgba(0,96,152,0.06)] md:p-8">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <h1 className="text-4xl font-black tracking-tight">Choose your trajectory</h1>
                <p className="mx-auto max-w-2xl text-slate-600">Select the profile that best describes your role in the digital fabrication ecosystem.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelection('explorer')}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${userRole === 'explorer' ? 'border-[#006098] bg-[#f2f8ff]' : 'border-slate-200 hover:border-[#006098]/40'}`}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[#cee5ff] text-[#004873]">
                    <User className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold">Explorer</h3>
                  <p className="mt-2 text-sm text-slate-600">I design and build products. I need tools, workflows, and provider matchmaking.</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelection('provider')}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${userRole === 'provider' ? 'border-[#006098] bg-[#f2f8ff]' : 'border-slate-200 hover:border-[#006098]/40'}`}
                >
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-[#cee5ff] text-[#004873]">
                    <Building2 className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold">Provider</h3>
                  <p className="mt-2 text-sm text-slate-600">I provide fabrication capability, inventory, assets, or logistics services.</p>
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-8">
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
                      className={`rounded-xl border p-4 text-left transition-all ${active ? 'border-[#006098] bg-[#eff6ff]' : 'border-slate-200 hover:border-[#006098]/40'}`}
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

              <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-4">
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
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Integrate your workflow</h2>
                <p className="text-slate-600">Set your profile identity and logistics defaults.</p>
              </div>

              <div className="grid gap-8 lg:grid-cols-5">
                <div className="space-y-4 lg:col-span-2">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Profile Image</p>
                  <div className="flex items-center gap-4">
                    {workflowData.avatar ? (
                      <img src={workflowData.avatar} alt="Profile" className="size-16 rounded-full object-cover ring-1 ring-slate-200" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <User className="size-8" />
                      </div>
                    )}
                    <div className="flex-1">
                      <ImageUpload value={workflowData.avatar} onChange={(url) => setWorkflowData((prev) => ({ ...prev, avatar: url }))} placeholder="Upload avatar" showPreview={false} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:col-span-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={workflowData.firstName}
                      onChange={(e) => setWorkflowData((prev) => ({ ...prev, firstName: e.target.value }))}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={workflowData.lastName}
                      onChange={(e) => setWorkflowData((prev) => ({ ...prev, lastName: e.target.value }))}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={workflowData.phone}
                      onChange={(e) => setWorkflowData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                    />
                    <input
                      type="email"
                      placeholder="Contact email"
                      value={workflowData.contactEmail}
                      onChange={(e) => setWorkflowData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                      className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                    />
                  </div>

                  <LocationAutocomplete
                    value={workflowData.location}
                    onChange={(location) => setWorkflowData((prev) => ({ ...prev, location }))}
                    placeholder="Search for your location in Nigeria"
                    required
                    restrictToNigeria={true}
                  />

                  <input
                    type="text"
                    placeholder="Shipping / lab address"
                    value={workflowData.shippingAddress}
                    onChange={(e) => setWorkflowData((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />

                  <input
                    type="url"
                    placeholder="GitHub profile or org URL (optional)"
                    value={workflowData.githubProfileUrl}
                    onChange={(e) => setWorkflowData((prev) => ({ ...prev, githubProfileUrl: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 && userRole === 'provider' ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Capability mapping</h2>
                <p className="text-slate-600">Choose all provider capability pillars and the subtypes you operate.</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {Object.entries(PROVIDER_CAPABILITY_TYPES).map(([typeKey, value]) => {
                  const selectedType = providerCapabilityData.providerTypes.includes(typeKey);
                  return (
                    <div key={typeKey} className={`rounded-xl border p-5 transition-all ${selectedType ? 'border-[#006098] bg-[#eff6ff]' : 'border-slate-200 bg-white'}`}>
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-bold">{value.label}</p>
                          <p className="text-sm text-slate-600">Select applicable subtypes</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProviderType(typeKey)}
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${selectedType ? 'bg-[#006098] text-white' : 'bg-slate-100 text-slate-700'}`}
                        >
                          {selectedType ? 'Selected' : 'Select'}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {value.subtypes.map((subtype) => {
                          const selectedSubtype = (providerCapabilityData.subtypes[typeKey] || []).includes(subtype);
                          return (
                            <button
                              key={subtype}
                              type="button"
                              onClick={() => toggleProviderSubtype(typeKey, subtype)}
                              disabled={!selectedType}
                              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${selectedSubtype ? 'border-[#006098] bg-[#006098] text-white' : 'border-slate-300 bg-white text-slate-700'} ${!selectedType ? 'cursor-not-allowed opacity-40' : ''}`}
                            >
                              {subtype}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 5 && userRole === 'provider' ? (
            <div className="space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Verification & payouts</h2>
                <p className="text-slate-600">Provide legal and payout details required for provider approval.</p>
              </div>

              <div className="grid gap-6 rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Tax Identification Number (TIN)"
                    value={providerVerificationData.taxIdentificationNumber}
                    onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, taxIdentificationNumber: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />
                  <input
                    type="text"
                    placeholder="Business Registration Number (optional)"
                    value={providerVerificationData.businessRegistrationNumber}
                    onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, businessRegistrationNumber: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Bank name"
                    value={providerVerificationData.bankName}
                    onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, bankName: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />
                  <input
                    type="text"
                    placeholder="Bank account number"
                    value={providerVerificationData.bankAccountNumber}
                    onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, bankAccountNumber: e.target.value }))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-300"
                    checked={providerVerificationData.isPersonalAccount}
                    onChange={(e) => setProviderVerificationData((prev) => ({ ...prev, isPersonalAccount: e.target.checked }))}
                  />
                  This is a personal account
                </label>
              </div>

              <div className="grid gap-4 rounded-xl border border-slate-200 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">Evidence Documents</p>

                <label className="grid gap-2 text-sm font-medium">
                  Proof of identity
                  <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'identityProofUrl')} />
                  {uploading.identityProofUrl ? <span className="text-xs text-slate-500">Uploading...</span> : null}
                  {verificationDocs.identityProofUrl ? <span className="text-xs text-emerald-700">Uploaded</span> : null}
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Proof of residence
                  <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'residenceProofUrl')} />
                  {uploading.residenceProofUrl ? <span className="text-xs text-slate-500">Uploading...</span> : null}
                  {verificationDocs.residenceProofUrl ? <span className="text-xs text-emerald-700">Uploaded</span> : null}
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Insurance policy (optional)
                  <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files?.[0] && uploadDocument(e.target.files[0], 'insurancePolicyUrl')} />
                  {uploading.insurancePolicyUrl ? <span className="text-xs text-slate-500">Uploading...</span> : null}
                  {verificationDocs.insurancePolicyUrl ? <span className="text-xs text-emerald-700">Uploaded</span> : null}
                </label>
              </div>

              <div className="grid gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
                <label className="inline-flex items-start gap-3 text-sm text-slate-700">
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
                  I understand DFN escrow and payout release rules.
                </label>
                <label className="inline-flex items-start gap-3 text-sm text-slate-700">
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
                  I agree to DFN terms, verification policies, and fee schedule.
                </label>
              </div>
            </div>
          ) : null}

          {step > 1 ? (
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
              <button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                <ArrowLeft className="size-4" />
                Back
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={goNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#006098] to-[#004873] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Saving...' : step === totalSteps || (userRole === 'explorer' && step === 3) ? 'Complete Onboarding' : 'Continue'}
                <ArrowRight className="size-4" />
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
