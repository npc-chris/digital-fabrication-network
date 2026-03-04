'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Bell, Shield, Save, Camera, ShoppingBag, Truck } from 'lucide-react';
import api from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'orders'>('profile');
  const [orders, setOrders] = useState<any[]>([]);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    company: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await api.get('/api/auth/me');
        const { user, profile } = response.data;

        if (profile) {
          setProfileData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            phone: profile.phone || '',
            location: profile.location || '',
            company: profile.company || '',
            bio: profile.bio || '',
            avatar: profile.avatar || '',
          });
        }

        const ordersRes = await api.get('/api/orders');
        setOrders(ordersRes.data.filter((o: any) => o.explorerId === user.id));
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/api/profiles/me', profileData);

      // Update localStorage user data
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        localStorage.setItem('user', JSON.stringify({
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        }));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumbs />
        <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">Settings</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${activeTab === 'profile'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${activeTab === 'notifications'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${activeTab === 'security'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${activeTab === 'orders'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            My Orders
          </button>
        </div>

        {/* Message */}
        {
          message.text && (
            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
              {message.text}
            </div>
          )
        }

        {/* Profile Tab */}
        {
          activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

              {/* Avatar */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
                <div className="flex items-center gap-4">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <ImageUpload
                      value={profileData.avatar}
                      onChange={(url) => setProfileData({ ...profileData, avatar: url })}
                      placeholder="Upload profile photo"
                      showPreview={false}
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload an image or use your Google profile photo</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )
        }

        {/* Notifications Tab */}
        {
          activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email updates about orders and messages</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Quote Notifications</p>
                    <p className="text-sm text-gray-500">Get notified when you receive quote responses</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-primary-600" defaultChecked />
                </label>
                <label className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">Community Updates</p>
                    <p className="text-sm text-gray-500">Stay updated on community posts and discussions</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5 text-primary-600" />
                </label>
              </div>
            </div>
          )
        }

        {/* Security Tab */}
        {
          activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Change Password</h3>
                  <p className="text-sm text-gray-500 mb-4">Update your password to keep your account secure</p>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                      Update Password
                    </button>
                  </div>
                </div>

                <hr />

                <div>
                  <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">Permanently delete your account and all associated data</p>
                  <button className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Purchase History</h2>
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <Link href="/dashboard" className="mt-4 inline-block text-primary-600 font-medium">
                  Browse Marketplace
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${order.totalPrice}</p>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>

                        <Link
                          href={`/orders/${order.id}/tracking`}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-primary-700 transition-all"
                        >
                          <Truck size={16} />
                          Track Package
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main >
      <Footer />
    </div >
  );
}
