'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, User, AtSign } from 'lucide-react';
import api from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';

export default function GoogleProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [profileData, setProfileData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    avatar: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/register');
          return;
        }

        const response = await api.get('/api/auth/me');
        const { user, profile, token: refreshedToken } = response.data;
        if (refreshedToken) {
          localStorage.setItem('token', refreshedToken);
        }

        // If onboarding already completed, redirect to appropriate dashboard
        if (user.onboardingCompleted === true) {
          if (user.role === 'admin' || user.role === 'platform_manager') {
            router.push('/admin');
          } else {
            router.push('/');
          }
          return;
        }

        setEmail(user.email || '');

        if (profile) {
          setProfileData({
            username: profile.username || '',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            avatar: profile.avatar || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile', err);
        router.push('/auth/register');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Sanitize and validate username before submission
    const sanitizedUsername = profileData.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!sanitizedUsername) {
      setError('Username is required and must contain only letters, numbers or underscores.');
      setSaving(false);
      return;
    }

    try {
      await api.put('/api/profiles/me', { ...profileData, username: sanitizedUsername });
      router.push('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DFN!</h1>
          <p className="text-gray-600">
            We've imported your Google profile. Please review and confirm your details before continuing.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Verified email badge */}
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Verified via Google</p>
              <p className="text-sm text-green-900 font-medium truncate">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <ImageUpload
                    value={profileData.avatar}
                    onChange={(url) => setProfileData({ ...profileData, avatar: url })}
                    placeholder="Change profile picture"
                    showPreview={false}
                  />
                  {profileData.avatar && (
                    <p className="text-xs text-gray-500 mt-1">Imported from Google — you can change it above</p>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <AtSign className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="your_username"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })
                  }
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers and underscores only</p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
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

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Continue to Onboarding →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
