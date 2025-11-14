'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Wrench, Users, Menu, X, Search, Bell, User } from 'lucide-react';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'services' | 'community'>('components');

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
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <User className="w-5 h-5 text-gray-600" />
              </button>
              
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2">Component Name {i}</h4>
                    <p className="text-gray-600 text-sm mb-2">Description of the component goes here...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-600 font-bold">$99.99</span>
                      <span className="text-sm text-gray-500">In Stock</span>
                    </div>
                    <button className="mt-4 w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <h4 className="font-semibold text-lg mb-2">Service Provider {i}</h4>
                    <p className="text-gray-600 text-sm mb-2">Professional fabrication services...</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">From $50/hour</span>
                      <span className="text-sm text-gray-500">⭐ 4.8</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Lead time: 3-5 days</div>
                    <button className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Innovation Request {i}</h4>
                      <p className="text-sm text-gray-500">Posted by User {i} • 2 hours ago</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">Open</span>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Looking for someone to help with machining a custom enclosure for my project. 
                    Need precise tolerances and good surface finish...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>👁 {i * 23} views</span>
                    <span>💬 {i * 5} replies</span>
                    <button className="text-primary-600 hover:text-primary-700 font-medium">View Discussion</button>
                  </div>
                </div>
              ))}
            </div>
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
