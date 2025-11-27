'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Wrench, Users, ShoppingCart, Calendar, Bell, Search, X, Menu, BarChart3, Plus } from 'lucide-react';
import api from '@/lib/api';

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

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Redirect if not a provider
      if (parsedUser.role !== 'provider') {
        router.push('/dashboard');
      }
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
      const response = await api.get('/api/providers/stats');
      setStats(response.data);
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
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('components')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                My Components
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                My Services
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'orders' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
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
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'overview' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => { setActiveTab('components'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                My Components
              </button>
              <button
                onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                My Services
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'orders' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
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

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Component
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Service
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  View All Orders
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
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
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
              <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Orders & Bookings</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-center py-8">No orders yet. Orders will appear here once customers start purchasing.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
