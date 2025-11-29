'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, Package, Wrench, MessageSquare, Shield, Search, 
  ChevronDown, CheckCircle, XCircle, Trash2, ArrowUpCircle,
  ArrowDownCircle, BarChart3, AlertTriangle, Eye
} from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  users: { total: number; explorers: number; providers: number };
  content: { components: number; services: number; posts: number };
  pending: { providerRequests: number; verifications: number };
}

interface User {
  id: number;
  email: string;
  role: string;
  isVerified: boolean;
  onboardingCompleted: boolean;
  providerApproved: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  location?: string;
  phone?: string;
}

interface ProviderRequest {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  bio?: string;
  location?: string;
  phone?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'content'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Users tab state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  
  // Provider requests state
  const [providerRequests, setProviderRequests] = useState<ProviderRequest[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  // Selected user for details
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/auth/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'admin' && parsedUser.role !== 'platform_manager') {
          router.push('/dashboard');
          return;
        }
        
        setUser(parsedUser);
        await loadStats();
      } catch (err: any) {
        setError('Failed to load admin dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  const loadStats = async () => {
    try {
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadUsers = async (page: number = 1) => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      if (userSearch) params.append('search', userSearch);
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await api.get(`/api/admin/users?${params.toString()}`);
      setUsersList(response.data.users);
      setUsersPagination(response.data.pagination);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadProviderRequests = async () => {
    setProvidersLoading(true);
    try {
      const response = await api.get('/api/admin/provider-requests');
      setProviderRequests(response.data);
    } catch (err: any) {
      console.error('Failed to load provider requests:', err);
    } finally {
      setProvidersLoading(false);
    }
  };

  const loadUserDetails = async (userId: number) => {
    setUserDetailsLoading(true);
    try {
      const response = await api.get(`/api/admin/users/${userId}`);
      setSelectedUser(response.data);
    } catch (err: any) {
      console.error('Failed to load user details:', err);
    } finally {
      setUserDetailsLoading(false);
    }
  };

  const handleApproveProvider = async (userId: number) => {
    try {
      await api.patch(`/api/admin/provider-requests/${userId}`, { approved: true });
      loadProviderRequests();
      loadStats();
    } catch (err: any) {
      alert('Failed to approve provider');
    }
  };

  const handleRejectProvider = async (userId: number) => {
    const reason = prompt('Enter reason for rejection (optional):');
    try {
      await api.patch(`/api/admin/provider-requests/${userId}`, { approved: false, reason });
      loadProviderRequests();
      loadStats();
    } catch (err: any) {
      alert('Failed to reject provider');
    }
  };

  const handleUpgradeUser = async (userId: number) => {
    if (!confirm('Are you sure you want to upgrade this user to provider?')) return;
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: 'provider', providerApproved: true });
      loadUsers(usersPagination.page);
      loadStats();
    } catch (err: any) {
      alert('Failed to upgrade user');
    }
  };

  const handleDowngradeUser = async (userId: number) => {
    if (!confirm('Are you sure you want to downgrade this user to explorer?')) return;
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: 'explorer', providerApproved: false });
      loadUsers(usersPagination.page);
      loadStats();
    } catch (err: any) {
      alert('Failed to downgrade user');
    }
  };

  const handleBanUser = async (userId: number, currentlyBanned: boolean) => {
    const action = currentlyBanned ? 'unban' : 'ban';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    try {
      await api.patch(`/api/admin/users/${userId}/ban`, { banned: !currentlyBanned });
      loadUsers(usersPagination.page);
    } catch (err: any) {
      alert(`Failed to ${action} user`);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'providers') {
      loadProviderRequests();
    }
  }, [activeTab]);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <Link href="/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">DFN Admin</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">Platform Management</span>
            </div>
            
            <nav className="hidden md:flex space-x-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'overview' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'users' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Users
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`flex items-center px-3 py-2 rounded-md relative ${
                  activeTab === 'providers' ? 'bg-red-100 text-red-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5 mr-2" />
                Provider Requests
                {stats && stats.pending.providerRequests > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.pending.providerRequests}
                  </span>
                )}
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Exit Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Total Users</h4>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {stats.users.explorers} explorers, {stats.users.providers} providers
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Components</h4>
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.content.components}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Services</h4>
                  <Wrench className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.content.services}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-600">Community Posts</h4>
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.content.posts}</p>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Pending Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-800">Provider Upgrade Requests</p>
                      <p className="text-2xl font-bold text-yellow-900">{stats.pending.providerRequests}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('providers')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Review
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-blue-800">Verification Documents</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.pending.verifications}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">User Management</h2>
            
            {/* Search and Filters */}
            <form onSubmit={handleUserSearch} className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by ID, email, name, or company..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="explorer">Explorers</option>
                  <option value="provider">Providers</option>
                </select>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {usersLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users found</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{u.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : 'No name'}
                            </p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            {u.company && <p className="text-xs text-gray-400">{u.company}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            u.role === 'provider' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {u.isVerified ? (
                              <span className="text-xs text-green-600">✓ Active</span>
                            ) : (
                              <span className="text-xs text-red-600">✗ Banned</span>
                            )}
                            {u.role === 'provider' && (
                              u.providerApproved ? (
                                <span className="text-xs text-green-600">✓ Approved</span>
                              ) : (
                                <span className="text-xs text-yellow-600">⏳ Pending</span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => loadUserDetails(u.id)}
                              className="p-1 text-gray-600 hover:text-gray-900"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {u.role === 'explorer' ? (
                              <button
                                onClick={() => handleUpgradeUser(u.id)}
                                className="p-1 text-green-600 hover:text-green-900"
                                title="Upgrade to provider"
                              >
                                <ArrowUpCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDowngradeUser(u.id)}
                                className="p-1 text-orange-600 hover:text-orange-900"
                                title="Downgrade to explorer"
                              >
                                <ArrowDownCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleBanUser(u.id, !u.isVerified)}
                              className={`p-1 ${u.isVerified ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                              title={u.isVerified ? 'Ban user' : 'Unban user'}
                            >
                              {u.isVerified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Pagination */}
              {usersPagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Page {usersPagination.page} of {usersPagination.totalPages} ({usersPagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadUsers(usersPagination.page - 1)}
                      disabled={usersPagination.page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => loadUsers(usersPagination.page + 1)}
                      disabled={usersPagination.page === usersPagination.totalPages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Provider Requests Tab */}
        {activeTab === 'providers' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Provider Upgrade Requests</h2>
            
            {providersLoading ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : providerRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                No pending provider requests
              </div>
            ) : (
              <div className="space-y-4">
                {providerRequests.map((req) => (
                  <div key={req.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {req.firstName && req.lastName ? `${req.firstName} ${req.lastName}` : 'No name provided'}
                        </h3>
                        <p className="text-gray-600">{req.email}</p>
                        {req.company && <p className="text-sm text-gray-500 mt-1">Company: {req.company}</p>}
                        {req.location && <p className="text-sm text-gray-500">Location: {req.location}</p>}
                        {req.phone && <p className="text-sm text-gray-500">Phone: {req.phone}</p>}
                        {req.bio && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Bio:</p>
                            <p className="text-sm text-gray-600">{req.bio}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Requested: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveProvider(req.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectProvider(req.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">User Details #{selectedUser.user.id}</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {userDetailsLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{selectedUser.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="capitalize">{selectedUser.user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p>{selectedUser.profile?.firstName} {selectedUser.profile?.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Company</p>
                      <p>{selectedUser.profile?.company || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p>{selectedUser.profile?.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p>{selectedUser.profile?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Activity Stats</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-2xl font-bold">{selectedUser.stats.components}</p>
                        <p className="text-sm text-gray-500">Components</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-2xl font-bold">{selectedUser.stats.services}</p>
                        <p className="text-sm text-gray-500">Services</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-2xl font-bold">{selectedUser.stats.posts}</p>
                        <p className="text-sm text-gray-500">Posts</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
