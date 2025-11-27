'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, Building2, MapPin, Phone, FileText, Wrench, Package } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<'explorer' | 'provider' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Common profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
  });

  // Provider-specific data
  const [providerData, setProviderData] = useState({
    company: '',
    bio: '',
    portfolio: '',
    businessType: [] as string[], // 'components', 'services', 'both'
    categories: [] as string[], // For services
    componentTypes: [] as string[], // For components
  });

  useEffect(() => {
    // Check if user is already logged in and has completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/register');
          return;
        }
        
        const response = await api.get('/api/auth/me');
        const user = response.data;
        
        // If user has completed onboarding, redirect to appropriate dashboard
        if (user.onboardingCompleted) {
          if (user.role === 'provider') {
            router.push('/dashboard/provider');
          } else {
            router.push('/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to check onboarding status', err);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleRoleSelection = (role: 'explorer' | 'provider') => {
    setUserRole(role);
    setStep(2);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userRole === 'explorer') {
      // For explorers, complete onboarding immediately
      await completeOnboarding();
    } else {
      // For providers, go to next step
      setStep(3);
    }
  };

  const handleProviderDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      // Update profile
      await api.put('/api/profiles/me', {
        ...profileData,
        ...(userRole === 'provider' ? {
          company: providerData.company,
          bio: providerData.bio,
          portfolio: providerData.portfolio,
        } : {}),
      });

      // Mark onboarding as complete
      await api.post('/api/auth/complete-onboarding', {
        role: userRole,
        businessType: userRole === 'provider' ? providerData.businessType : undefined,
        categories: userRole === 'provider' ? providerData.categories : undefined,
        componentTypes: userRole === 'provider' ? providerData.componentTypes : undefined,
      });

      // Redirect to appropriate dashboard
      if (userRole === 'provider') {
        router.push('/dashboard/provider');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const toggleBusinessType = (type: string) => {
    setProviderData(prev => ({
      ...prev,
      businessType: prev.businessType.includes(type)
        ? prev.businessType.filter(t => t !== type)
        : [...prev.businessType, type],
    }));
  };

  const toggleCategory = (category: string) => {
    setProviderData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleComponentType = (type: string) => {
    setProviderData(prev => ({
      ...prev,
      componentTypes: prev.componentTypes.includes(type)
        ? prev.componentTypes.filter(t => t !== type)
        : [...prev.componentTypes, type],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            {userRole === 'provider' && (
              <>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`} />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  3
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-center mb-2">Welcome to DFN!</h2>
              <p className="text-center text-gray-600 mb-8">Let's get you started. How will you be using the platform?</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleRoleSelection('explorer')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all group"
                >
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-600 group-hover:text-primary-600" />
                  <h3 className="text-xl font-semibold mb-2">Explorer</h3>
                  <p className="text-gray-600 text-sm">
                    I'm looking to find components, book services, and connect with the fabrication community.
                  </p>
                </button>

                <button
                  onClick={() => handleRoleSelection('provider')}
                  className="p-6 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all group"
                >
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-600 group-hover:text-primary-600" />
                  <h3 className="text-xl font-semibold mb-2">Provider</h3>
                  <p className="text-gray-600 text-sm">
                    I want to sell components, offer fabrication services, and grow my business.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Basic Profile Info */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lagos, Nigeria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {userRole === 'explorer' ? (loading ? 'Completing...' : 'Complete Setup') : 'Continue'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Provider Details (Only for providers) */}
          {step === 3 && userRole === 'provider' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Provider Details</h2>
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleProviderDetailsSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Company/Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={providerData.company}
                    onChange={(e) => setProviderData({ ...providerData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Bio/Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={providerData.bio}
                    onChange={(e) => setProviderData({ ...providerData, bio: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What will you be offering? *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 text-primary-600"
                        checked={providerData.businessType.includes('components')}
                        onChange={() => toggleBusinessType('components')}
                      />
                      <Package className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Components & Parts</span>
                    </label>
                    <label className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 text-primary-600"
                        checked={providerData.businessType.includes('services')}
                        onChange={() => toggleBusinessType('services')}
                      />
                      <Wrench className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Fabrication Services</span>
                    </label>
                  </div>
                </div>

                {providerData.businessType.includes('services') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Categories *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['3D printing', 'CNC machining', 'PCB assembly', 'Rapid prototyping', 'Electronics lab', 'Laser cutting'].map((category) => (
                        <label key={category} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-primary-600"
                            checked={providerData.categories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <span className="text-sm">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {providerData.businessType.includes('components') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Component Types *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['electrical', 'mechanical', 'materials', 'consumables'].map((type) => (
                        <label key={type} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-primary-600"
                            checked={providerData.componentTypes.includes(type)}
                            onChange={() => toggleComponentType(type)}
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio/Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={providerData.portfolio}
                    onChange={(e) => setProviderData({ ...providerData, portfolio: e.target.value })}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || providerData.businessType.length === 0}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {loading ? 'Completing...' : 'Complete Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
