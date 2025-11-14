'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Wrench, Users, Menu, X, User } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import { componentsAPI, servicesAPI, communityAPI } from '@/lib/api-services';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'services' | 'community'>('components');
  const [components, setComponents] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    
    // Load data based on active tab
    loadData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'components') {
        const data = await componentsAPI.getAll();
        setComponents(data);
      } else if (activeTab === 'services') {
        const data = await servicesAPI.getAll();
        setServices(data);
      } else if (activeTab === 'community') {
        const data = await communityAPI.getAll();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fall back to empty arrays on error
      if (activeTab === 'components') setComponents([]);
      if (activeTab === 'services') setServices([]);
      if (activeTab === 'community') setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">DFN</h1>
              <span className="ml-2 text-sm text-gray-600 hidden sm:block">Digital Fabrication Network</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                Components
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                Services
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'community' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Community
              </button>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <SearchBar />
              {isAuthenticated && <NotificationsDropdown />}
              {isAuthenticated ? (
                <Link href="/profile" className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                  <User className="w-5 h-5" />
                  Profile
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="hidden md:block px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">
                    Sign Up
                  </Link>
                </>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                onClick={() => { setActiveTab('components'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                Components
              </button>
              <button
                onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wrench className="w-5 h-5 mr-2" />
                Services
              </button>
              <button
                onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'community' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5 mr-2" />
                Community
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome to Digital Fabrication Network</h2>
          <p className="text-lg opacity-90">Connect with workshops, suppliers, and innovators to bring your ideas to life</p>
        </div>

        {/* Tab Content */}
        {activeTab === 'components' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Components & Parts Marketplace</h3>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Post Component
              </button>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="border rounded-md px-3 py-2">
                  <option>All Types</option>
                  <option>Electrical</option>
                  <option>Mechanical</option>
                  <option>Materials</option>
                  <option>Consumables</option>
                </select>
                <input type="text" placeholder="Location" className="border rounded-md px-3 py-2" />
                <input type="text" placeholder="Search components..." className="border rounded-md px-3 py-2 md:col-span-2" />
              </div>
            </div>

            {/* Components Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading components...</p>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No components found</p>
                <p className="text-sm text-gray-500">Be the first to post a component!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                  <div key={component.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {component.images ? (
                        <img src={JSON.parse(component.images)[0]} alt={component.name} className="w-full h-full object-cover rounded-t-lg" />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg flex-1 truncate">{component.name}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded">{component.type}</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{component.description || 'No description available'}</p>
                      {component.location && (
                        <p className="text-xs text-gray-400 mb-2">{component.location}</p>
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-primary-600 font-bold">${component.price}</span>
                        <span className={`text-sm ${component.availability > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {component.availability > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      {component.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <span>⭐ {component.rating}</span>
                          <span className="text-gray-400">({component.reviewCount || 0})</span>
                        </div>
                      )}
                      <button className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Services & Fabrication</h3>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Offer Service
              </button>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="border rounded-md px-3 py-2">
                  <option>All Categories</option>
                  <option>3D Printing</option>
                  <option>CNC Machining</option>
                  <option>PCB Assembly</option>
                  <option>Rapid Prototyping</option>
                  <option>Electronics Lab</option>
                </select>
                <input type="text" placeholder="Location" className="border rounded-md px-3 py-2" />
                <input type="text" placeholder="Search services..." className="border rounded-md px-3 py-2 md:col-span-2" />
              </div>
            </div>

            {/* Services Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading services...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Wrench className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No services found</p>
                <p className="text-sm text-gray-500">Be the first to offer a service!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {service.images ? (
                        <img src={JSON.parse(service.images)[0]} alt={service.name} className="w-full h-full object-cover rounded-t-lg" />
                      ) : (
                        <Wrench className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg flex-1 truncate">{service.name}</h4>
                      </div>
                      {service.category && (
                        <span className="inline-block text-xs px-2 py-1 bg-gray-100 rounded mb-2">{service.category}</span>
                      )}
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description || 'No description available'}</p>
                      {service.location && (
                        <p className="text-xs text-gray-400 mb-2">{service.location}</p>
                      )}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          {service.pricingModel === 'hourly' && `From $${service.pricePerUnit}/hour`}
                          {service.pricingModel === 'project' && `From $${service.pricePerUnit}/project`}
                          {service.pricingModel === 'per_unit' && `From $${service.pricePerUnit}/unit`}
                          {!service.pricingModel && 'Contact for pricing'}
                        </span>
                        {service.leadTime && (
                          <span className="text-xs text-gray-500">{service.leadTime} days</span>
                        )}
                      </div>
                      {service.rating && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                          <span>⭐ {service.rating}</span>
                          <span className="text-gray-400">({service.reviewCount || 0})</span>
                        </div>
                      )}
                      <button className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                        Request Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Community & Innovation Board</h3>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Create Post
              </button>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="border rounded-md px-3 py-2">
                  <option>All Categories</option>
                  <option>Fabrication Request</option>
                  <option>Innovation</option>
                  <option>Challenge</option>
                  <option>Partnership</option>
                </select>
                <select className="border rounded-md px-3 py-2">
                  <option>All Status</option>
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Closed</option>
                </select>
                <input type="text" placeholder="Search posts..." className="border rounded-md px-3 py-2 md:col-span-2" />
              </div>
            </div>

            {/* Posts List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No posts found</p>
                <p className="text-sm text-gray-500">Be the first to start a discussion!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{post.title}</h4>
                        <p className="text-sm text-gray-500">
                          Posted by User #{post.authorId} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        post.status === 'open' ? 'bg-green-100 text-green-800' :
                        post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status?.charAt(0).toUpperCase() + post.status?.slice(1) || 'Open'}
                      </span>
                    </div>
                    {post.category && (
                      <span className="inline-block text-xs px-2 py-1 bg-gray-100 rounded mb-2">{post.category}</span>
                    )}
                    <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👁 {post.viewCount || 0} views</span>
                      <button className="text-primary-600 hover:text-primary-700 font-medium">View Discussion</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-semibold mb-4">About DFN</h5>
              <p className="text-sm text-gray-600">
                Connecting the digital fabrication ecosystem to accelerate innovation.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Buyers</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">Find Components</Link></li>
                <li><Link href="#">Book Services</Link></li>
                <li><Link href="#">Request Help</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Sellers</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">List Components</Link></li>
                <li><Link href="#">Offer Services</Link></li>
                <li><Link href="#">Manage Orders</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">Help Center</Link></li>
                <li><Link href="#">Contact Us</Link></li>
                <li><Link href="#">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            © 2024 Digital Fabrication Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
