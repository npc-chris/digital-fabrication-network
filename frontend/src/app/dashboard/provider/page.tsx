'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Wrench, Users, ShoppingCart, Calendar, Bell, Search, X, Menu, BarChart3, Plus, Truck, Clock, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import AddComponentModal from '@/components/AddComponentModal';
import AddServiceModal from '@/components/AddServiceModal';
import VerificationModal from '@/components/VerificationModal';
import Footer from '@/components/Footer';
import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'services' | 'orders'>('overview');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [stats, setStats] = useState({
    totalComponents: 0,
    totalServices: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [showAddComponentModal, setShowAddComponentModal] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Redirect if not a provider (not even pending)
      if (parsedUser.role !== 'provider') {
        router.push('/dashboard');
      }
      // Note: users with role='provider' and providerApproved=false are shown a pending state below
    } else {
      router.push('/auth/login');
    }

    // Check if welcome banner was dismissed in this session
    const bannerDismissed = sessionStorage.getItem('providerWelcomeBannerDismissed');
    if (bannerDismissed === 'true') {
      setShowWelcomeBanner(false);
    }

    // Fetch provider stats
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const statsResponse = await api.get('/api/providers/stats');
      setStats(statsResponse.data);

      const statusResponse = await api.get('/api/verification/status');
      setProfile(statusResponse.data);

      const ordersResponse = await api.get('/api/orders');
      // Filter for provider's orders
      const providerOrders = ordersResponse.data.filter((o: any) => o.providerId === JSON.parse(localStorage.getItem('user') || '{}').id);
      setActiveOrders(providerOrders);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    sessionStorage.setItem('providerWelcomeBannerDismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Pending Approval State */}
      {user && user.role === 'provider' && !user.providerApproved && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Awaiting Admin Approval</h2>
            <p className="text-gray-600 mb-6">
              Your provider upgrade request has been received and is currently under review by our admin team. You will receive full provider access once your account is approved.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">While you wait, you can:</p>
              <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
                <li>Complete your profile to speed up the review</li>
                <li>Browse components and services on the marketplace</li>
                <li>Connect with the community in the forum</li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explorer Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Full Provider Dashboard (approved providers only) */}
      {user && user.providerApproved && (
        <>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DFN</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">Provider Dashboard</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('components')}
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Package className="w-5 h-5 mr-2" />
                My Components
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                My Services
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center px-3 py-2 rounded-md ${activeTab === 'orders' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Orders
              </button>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary-600 transition-colors"
                title="Browse marketplace as explorer"
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Explorer View</span>
              </Link>
              <Link
                href="/dashboard"
                className="md:hidden p-2 rounded-full hover:bg-gray-100"
                aria-label="View Explorer Dashboard"
              >
                <Users className="w-5 h-5 text-gray-600" />
              </Link>
              <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              {user && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName[0] + '.' : ''}` : user.email.split('@')[0]}
                  </span>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => { setActiveTab('components'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Package className="w-5 h-5 mr-2" />
                My Components
              </button>
              <button
                onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                My Services
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${activeTab === 'orders' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Orders
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-8 mb-8 text-white relative">
            <button
              onClick={dismissWelcomeBanner}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss welcome banner"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-bold mb-2">Welcome to Your Provider Dashboard!</h2>
            <p className="text-lg opacity-90">Manage your components, services, and orders all in one place</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Total Components</h4>
                  <Package className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalComponents}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Total Services</h4>
                  <Wrench className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Pending Orders</h4>
                  <ShoppingCart className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">${stats.revenue}</p>
              </div>
            </div>

            {/* Verification Status Banner */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                <div className={`p-4 rounded-full ${profile?.verificationStatus === 'verified' ? 'bg-green-100 text-green-600' :
                  profile?.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                  <ShieldCheck size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    Supplier Verification
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider ${profile?.verificationStatus === 'verified' ? 'bg-green-600 text-white' :
                      profile?.verificationStatus === 'pending' ? 'bg-yellow-500 text-white' :
                        'bg-gray-400 text-white'
                      }`}>
                      {profile?.verificationStatus || 'unverified'}
                    </span>
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {profile?.verificationStatus === 'verified'
                      ? "You're a verified partner! Enjoy increased visibility and trust badges across the platform."
                      : profile?.verificationStatus === 'pending'
                        ? "Your documents are under review. This usually takes 24-48 hours."
                        : "Complete your verification to unlock premium supplier features and trust badges."}
                  </p>
                </div>
                {profile?.verificationStatus !== 'verified' && profile?.verificationStatus !== 'pending' && (
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    Get Verified Now
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowAddComponentModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Component
                </button>
                <button
                  onClick={() => setShowAddServiceModal(true)}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Service
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                >
                  <Truck className="w-5 h-5" />
                  Track Shipments
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">My Components</h3>
              <button
                onClick={() => setShowAddComponentModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Add Component
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-center py-8">No components listed yet. Start by adding your first component!</p>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">My Services</h3>
              <button
                onClick={() => setShowAddServiceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="w-5 h-5" />
                Add Service
              </button>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-center py-8">No services listed yet. Start by adding your first service!</p>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Orders & Fabrication Pipeline</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {activeOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-12">No orders yet. Orders will appear here once customers start purchasing.</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase ${order.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'in_production' ? 'bg-purple-100 text-purple-700' :
                              order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                            }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalPrice}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/orders/${order.id}/tracking`}
                            className="text-primary-600 hover:text-primary-900 flex items-center justify-end gap-1"
                          >
                            <Truck size={14} />
                            Track/Update
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
      {showAddComponentModal && (
        <AddComponentModal
          onClose={() => setShowAddComponentModal(false)}
          onSuccess={() => {
            fetchStats();
          }}
        />
      )}

      {showAddServiceModal && (
        <AddServiceModal
          onClose={() => setShowAddServiceModal(false)}
          onSuccess={() => {
            fetchStats();
          }}
        />
      )}
      {showVerificationModal && (
        <VerificationModal
          onClose={() => setShowVerificationModal(false)}
          onSuccess={fetchStats}
        />
      )}
      <Footer />
        </>
      )}
    </div>
  );
}
