'use client';

import { useState, useEffect, useRef } from 'react';
import { componentsAPI, servicesAPI, communityAPI } from '@/lib/api-services';
import Link from 'next/link';
import { Package, Wrench, Users, Menu, X, Search, Bell, ChevronDown, FilterIcon, Plus, Store } from 'lucide-react';
import ComponentDetailsModal from '@/components/ComponentDetailsModal';
import RequestQuoteModal from '@/components/RequestQuoteModal';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import UserDropdown from '@/components/UserDropdown';
import CreatePostModal from '@/components/CreatePostModal';
import ViewDiscussionModal from '@/components/ViewDiscussionModal';
import HierarchicalCategoryFilter from '@/components/HierarchicalCategoryFilter';

export default function Dashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'services' | 'community'>('components');
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showProviderUpgradeModal, setShowProviderUpgradeModal] = useState(false);

  // Components & Parts filter state
  const [componentCategories, setComponentCategories] = useState<string[]>([]);
  const [componentSubcategories, setComponentSubcategories] = useState<string[]>([]);
  const [componentTypes, setComponentTypes] = useState<string[]>([]);
  const [componentLocations, setComponentLocations] = useState<string[]>([]);
  const [componentSearch, setComponentSearch] = useState<string>('');
  const [componentsList, setComponentsList] = useState<any[]>([]);
  const [componentsLoading, setComponentsLoading] = useState<boolean>(false);
  const [componentLocationOptions, setComponentLocationOptions] = useState<string[]>([]);
  const [componentTypeOptions] = useState<string[]>(['electrical', 'mechanical', 'materials', 'consumables', 'sensors', 'thermal', 'chemical', 'tools']);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Services filter state
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [serviceLocations, setServiceLocations] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState<string>('');
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState<boolean>(false);
  const [serviceLocationOptions, setServiceLocationOptions] = useState<string[]>([]);
  const [serviceCategoryOptions] = useState<string[]>(['3D printing', 'CNC machining', 'PCB assembly', 'Rapid prototyping', 'Electronics lab']);
  const [showServiceCategoryDropdown, setShowServiceCategoryDropdown] = useState(false);
  const [showServiceLocationDropdown, setShowServiceLocationDropdown] = useState(false);
  const serviceCategoryDropdownRef = useRef<HTMLDivElement>(null);
  const serviceLocationDropdownRef = useRef<HTMLDivElement>(null);

  // Community filter state
  const [communityCategory, setCommunityCategory] = useState<string>('all');
  const [communityStatus, setCommunityStatus] = useState<string>('all');
  const [communitySearch, setCommunitySearch] = useState<string>('');
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState<boolean>(false);

  // Modal state
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Check if welcome banner was dismissed in this session
    const bannerDismissed = sessionStorage.getItem('welcomeBannerDismissed');
    if (bannerDismissed === 'true') {
      setShowWelcomeBanner(false);
    }
  }, []);

  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    sessionStorage.setItem('welcomeBannerDismissed', 'true');
  };

  const handleProviderAction = () => {
    if (!user) {
      // Not logged in, redirect to register
      window.location.href = '/auth/register';
      return;
    }
    
    if (user.role === 'provider') {
      // Already a provider, go to provider dashboard
      window.location.href = '/dashboard/provider';
    } else {
      // Explorer trying to access provider features
      setShowProviderUpgradeModal(true);
    }
  };

  useEffect(() => {
    if (activeTab === 'components') {
      fetchComponents();
      fetchComponentFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentCategories, componentSubcategories, componentTypes, componentLocations, componentSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
      fetchServiceFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceCategories, serviceLocations, serviceSearch, activeTab]);

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityCategory, communityStatus, communitySearch, activeTab]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (serviceCategoryDropdownRef.current && !serviceCategoryDropdownRef.current.contains(event.target as Node)) {
        setShowServiceCategoryDropdown(false);
      }
      if (serviceLocationDropdownRef.current && !serviceLocationDropdownRef.current.contains(event.target as Node)) {
        setShowServiceLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchComponents = async () => {
    setComponentsLoading(true);
    try {
      const filters: any = {};
      if (componentCategories.length > 0) filters.category = componentCategories;
      if (componentSubcategories.length > 0) filters.subcategory = componentSubcategories;
      if (componentTypes.length > 0) filters.type = componentTypes;
      if (componentLocations.length > 0) filters.location = componentLocations;
      if (componentSearch) filters.search = componentSearch;
      const data = await componentsAPI.getAll(filters);
      setComponentsList(data);
    } catch (e) {
      setComponentsList([]);
    } finally {
      setComponentsLoading(false);
    }
  };

  const fetchComponentFilters = async () => {
    try {
      const data = await componentsAPI.getFilters({ type: componentTypes.length === 1 ? componentTypes[0] : undefined });
      if (data?.locations?.length) {
        setComponentLocationOptions(data.locations);
      } else {
        // TODO: Remove placeholder locations after confirming UI
        setComponentLocationOptions(['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']);
      }
    } catch {
      // Fallback placeholders
      setComponentLocationOptions(['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']);
    }
  };

  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const filters: any = {};
      if (serviceCategories.length > 0) filters.category = serviceCategories;
      if (serviceLocations.length > 0) filters.location = serviceLocations;
      if (serviceSearch) filters.search = serviceSearch;
      const data = await servicesAPI.getAll(filters);
      setServicesList(data);
    } catch (e) {
      setServicesList([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const fetchServiceFilters = async () => {
    try {
      const data = await servicesAPI.getFilters({ category: serviceCategories.length === 1 ? serviceCategories[0] : undefined });
      if (data?.locations?.length) {
        setServiceLocationOptions(data.locations);
      } else {
        // TODO: Remove placeholder locations after confirming UI
        setServiceLocationOptions(['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']);
      }
    } catch {
      // Fallback placeholders
      setServiceLocationOptions(['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']);
    }
  };

  const toggleComponentType = (type: string) => {
    setComponentTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleComponentLocation = (location: string) => {
    setComponentLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const toggleServiceCategory = (category: string) => {
    setServiceCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleServiceLocation = (location: string) => {
    setServiceLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const clearComponentFilters = () => {
    setComponentCategories([]);
    setComponentSubcategories([]);
    setComponentTypes([]);
    setComponentLocations([]);
    setComponentSearch('');
  };

  const clearServiceFilters = () => {
    setServiceCategories([]);
    setServiceLocations([]);
    setServiceSearch('');
  };

  const removeComponentTypeChip = (type: string) => {
    setComponentTypes(prev => prev.filter(t => t !== type));
  };

  const removeComponentLocationChip = (location: string) => {
    setComponentLocations(prev => prev.filter(l => l !== location));
  };

  const removeServiceCategoryChip = (category: string) => {
    setServiceCategories(prev => prev.filter(c => c !== category));
  };

  const removeServiceLocationChip = (location: string) => {
    setServiceLocations(prev => prev.filter(l => l !== location));
  };

  const fetchCommunityPosts = async () => {
    setCommunityLoading(true);
    try {
      const filters: any = {};
      if (communityCategory && communityCategory !== 'all') filters.category = communityCategory;
      if (communityStatus && communityStatus !== 'all') filters.status = communityStatus;
      if (communitySearch) filters.search = communitySearch;
      const data = await communityAPI.getPosts(filters);
      setCommunityPosts(data);
    } catch (e) {
      setCommunityPosts([]);
    } finally {
      setCommunityLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
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
            <nav className="hidden md:flex space-x-2">
              <button
                onClick={() => setActiveTab('components')}
                className={`flex items-center px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                Components & Parts
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
              <Link
                href="/affiliates"
                className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Store className="w-5 h-5 mr-2" />
                Affiliates
              </Link>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Open search">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <NotificationsDropdown />
              {user ? (
                <div className="hidden md:block">
                  <UserDropdown user={user} />
                </div>
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
                onClick={() => { setActiveTab('components'); setMobileMenuOpen(false); }}
                className={`flex items-center w-full px-3 py-2 rounded-md ${
                  activeTab === 'components' ? 'bg-primary-100 text-primary-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 mr-2" />
                Components & Parts
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
              <Link
                href="/affiliates"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <Store className="w-5 h-5 mr-2" />
                Affiliates
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 mb-8 text-white relative">
            <button
              onClick={dismissWelcomeBanner}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss welcome banner"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-bold mb-2">Welcome to Digital Fabrication Network</h2>
            <p className="text-lg opacity-90">Connect with workshops, suppliers, and innovators to bring your ideas to life</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'components' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Components & Parts Marketplace</h3>
              <button 
                onClick={handleProviderAction}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Post Component or Part
              </button>
            </div>
            
            {/* Enhanced Filter UI with Dropdowns and Chips */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {/* Filter Buttons Row */}
              <div className="flex flex-wrap items-start gap-3 mb-4">
                {/* Hierarchical Category Filter */}
                <HierarchicalCategoryFilter
                  selectedCategories={componentCategories}
                  selectedSubcategories={componentSubcategories}
                  onCategoryChange={setComponentCategories}
                  onSubcategoryChange={setComponentSubcategories}
                  onClear={() => {
                    setComponentCategories([]);
                    setComponentSubcategories([]);
                  }}
                />

                {/* Type Filter Dropdown (Legacy - for backward compatibility) */}
                <div className="relative" ref={typeDropdownRef}>
                  <button
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Filter by type"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span>Type</span>
                    {componentTypes.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">{componentTypes.length}</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showTypeDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {componentTypeOptions.map((type) => (
                          <label
                            key={type}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={componentTypes.includes(type)}
                              onChange={() => toggleComponentType(type)}
                              className="mr-3 w-4 h-4 text-primary-600 rounded"
                            />
                            <span className="capitalize">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Filter Dropdown */}
                <div className="relative" ref={locationDropdownRef}>
                  <button
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Filter by location"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span>Location</span>
                    {componentLocations.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">{componentLocations.length}</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {componentLocationOptions.map((location) => (
                          <label
                            key={location}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={componentLocations.includes(location)}
                              onChange={() => toggleComponentLocation(location)}
                              className="mr-3 w-4 h-4 text-primary-600 rounded"
                            />
                            <span>{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search components & parts..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={componentSearch}
                    onChange={e => setComponentSearch(e.target.value)}
                  />
                </div>

                {/* Clear All Button */}
                {(componentCategories.length > 0 || componentSubcategories.length > 0 || componentTypes.length > 0 || componentLocations.length > 0 || componentSearch) && (
                  <button
                    onClick={clearComponentFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Active Filter Chips - Types and Locations only (Categories handled by HierarchicalCategoryFilter) */}
              {(componentTypes.length > 0 || componentLocations.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {componentTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      <span className="capitalize">{type}</span>
                      <button
                        onClick={() => removeComponentTypeChip(type)}
                        className="hover:bg-primary-200 rounded-full p-0.5"
                        aria-label={`Remove ${type} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {componentLocations.map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{location}</span>
                      <button
                        onClick={() => removeComponentLocationChip(location)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        aria-label={`Remove ${location} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Components & Parts Grid */}
            {componentsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : componentsList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No components or parts found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {componentsList.map((item, i) => (
                  <div key={item.id || i} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {item.images && Array.isArray(JSON.parse(item.images)) && JSON.parse(item.images)[0] ? (
                        <img src={JSON.parse(item.images)[0]} alt={item.name} className="h-full w-full object-cover rounded-t-lg" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-primary-600 font-bold">${item.price}</span>
                        <span className="text-sm text-gray-500">{item.availability > 0 ? 'In Stock' : 'Out of Stock'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Type: <span className="capitalize">{item.type}</span></div>
                      <div className="text-xs text-gray-500 mb-1">Location: {item.location}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Provider: {item.providerCompany || `${item.providerName || ''} ${item.providerLastName || ''}`.trim() || `provider #${item.providerId}`}
                      </div>
                      <button 
                        onClick={() => setSelectedComponent(item)}
                        className="mt-2 w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
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
              <button 
                onClick={handleProviderAction}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Offer Service
              </button>
            </div>
            
            {/* Enhanced Filter UI with Dropdowns and Chips */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {/* Filter Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Category Filter Dropdown */}
                <div className="relative" ref={serviceCategoryDropdownRef}>
                  <button
                    onClick={() => setShowServiceCategoryDropdown(!showServiceCategoryDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Filter by category"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span>Category</span>
                    {serviceCategories.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">{serviceCategories.length}</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showServiceCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {serviceCategoryOptions.map((category) => (
                          <label
                            key={category}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={serviceCategories.includes(category)}
                              onChange={() => toggleServiceCategory(category)}
                              className="mr-3 w-4 h-4 text-primary-600 rounded"
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Filter Dropdown */}
                <div className="relative" ref={serviceLocationDropdownRef}>
                  <button
                    onClick={() => setShowServiceLocationDropdown(!showServiceLocationDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    aria-label="Filter by location"
                  >
                    <FilterIcon className="w-4 h-4" />
                    <span>Location</span>
                    {serviceLocations.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">{serviceLocations.length}</span>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showServiceLocationDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 max-h-64 overflow-y-auto">
                        {serviceLocationOptions.map((location) => (
                          <label
                            key={location}
                            className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={serviceLocations.includes(location)}
                              onChange={() => toggleServiceLocation(location)}
                              className="mr-3 w-4 h-4 text-primary-600 rounded"
                            />
                            <span>{location}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={serviceSearch}
                    onChange={e => setServiceSearch(e.target.value)}
                  />
                </div>

                {/* Clear All Button */}
                {(serviceCategories.length > 0 || serviceLocations.length > 0 || serviceSearch) && (
                  <button
                    onClick={clearServiceFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Active Filter Chips */}
              {(serviceCategories.length > 0 || serviceLocations.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {serviceCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => removeServiceCategoryChip(category)}
                        className="hover:bg-primary-200 rounded-full p-0.5"
                        aria-label={`Remove ${category} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {serviceLocations.map((location) => (
                    <span
                      key={location}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      <span>{location}</span>
                      <button
                        onClick={() => removeServiceLocationChip(location)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        aria-label={`Remove ${location} filter`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Services Grid */}
            {servicesLoading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : servicesList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No services found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesList.map((item, i) => (
                  <div key={item.id || i} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      {item.images && Array.isArray(JSON.parse(item.images)) && JSON.parse(item.images)[0] ? (
                        <img src={JSON.parse(item.images)[0]} alt={item.name} className="h-full w-full object-cover rounded-t-lg" />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg mb-2">{item.name}</h4>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          {item.pricingModel === 'hourly' ? `From $${item.pricePerUnit}/hour` : 
                           item.pricingModel === 'project' ? `From $${item.pricePerUnit}/project` : 
                           item.pricingModel === 'per_unit' ? `From $${item.pricePerUnit}/unit` : ''}
                        </span>
                        <span className="text-sm text-gray-500">⭐ {item.rating || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">Category: {item.category}</div>
                      <div className="text-xs text-gray-500 mb-1">Location: {item.location}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Provider: {item.providerCompany || `${item.providerName || ''} ${item.providerLastName || ''}`.trim() || `Provider #${item.providerId}`}
                      </div>
                      <div className="text-xs text-gray-500 mb-3">Lead time: {item.leadTime ? `${item.leadTime} days` : 'N/A'}</div>
                      <button 
                        onClick={() => setSelectedService(item)}
                        className="w-full py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
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
              <button 
                onClick={() => setShowCreatePostModal(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Post
              </button>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  className="border rounded-md px-3 py-2" 
                  aria-label="Community category filter"
                  value={communityCategory}
                  onChange={e => setCommunityCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="fabrication_request">Fabrication Request</option>
                  <option value="innovation">Innovation</option>
                  <option value="challenge">Challenge</option>
                  <option value="partnership">Partnership</option>
                </select>
                <select 
                  className="border rounded-md px-3 py-2" 
                  aria-label="Community status filter"
                  value={communityStatus}
                  onChange={e => setCommunityStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Search posts..." 
                  className="border rounded-md px-3 py-2 md:col-span-2"
                  value={communitySearch}
                  onChange={e => setCommunitySearch(e.target.value)}
                />
              </div>
            </div>

            {/* Posts List */}
            {communityLoading ? (
              <div className="text-center py-12 text-gray-500">Loading posts...</div>
            ) : communityPosts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No posts found. Be the first to create one!</div>
            ) : (
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{post.title}</h4>
                        <p className="text-sm text-gray-500">
                          Posted by {post.authorCompany || `${post.authorName || ''} ${post.authorLastName || ''}`.trim() || `User #${post.authorId}`}
                          {' • '}
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        post.status === 'open' ? 'bg-green-100 text-green-800' :
                        post.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status === 'in_progress' ? 'In Progress' : post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    {post.category && (
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                          {post.category.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👁 {post.viewCount || 0} views</span>
                      <span>💬 {post.replyCount || 0} replies</span>
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View Discussion
                      </button>
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
              <h5 className="font-semibold mb-4">For Explorers</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">Find Components & Parts</Link></li>
                <li><Link href="#">Book Services</Link></li>
                <li><Link href="#">Request Help</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Providers</h5>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#">List Components & Parts</Link></li>
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
            © 2026 Digital Fabrication Network. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedComponent && (
        <ComponentDetailsModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
      {selectedService && (
        <RequestQuoteModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            alert('Quote request submitted successfully! The provider will contact you soon.');
          }}
        />
      )}
      
      {/* Provider Upgrade Modal */}
      {showProviderUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upgrade to Provider Account</h3>
              <button
                onClick={() => setShowProviderUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              To post components or offer services, you need to upgrade your account to a Provider account.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Provider account upgrades require manual verification by our admin team. 
                You can access the provider dashboard to prepare your listings, but they won&apos;t be publicly visible 
                until your account is upgraded.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowProviderUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/provider'}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Continue to Provider Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          onClose={() => setShowCreatePostModal(false)}
          onSuccess={() => {
            fetchCommunityPosts();
            alert('Post created successfully!');
          }}
        />
      )}
      
      {/* View Discussion Modal */}
      {selectedPost && (
        <ViewDiscussionModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
}
