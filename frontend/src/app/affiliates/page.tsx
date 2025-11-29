'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, MapPin, ExternalLink, Star, ShoppingCart, Search, 
  Filter, CheckCircle, ArrowLeft, Globe, Package
} from 'lucide-react';
import api from '@/lib/api';

interface AffiliateStore {
  store: {
    id: number;
    storeName: string;
    description: string | null;
    website: string | null;
    logo: string | null;
    location: string | null;
    supplierType: string;
    verificationStatus: string;
    rating: string | null;
    totalSales: number;
  };
  owner: {
    id: number;
    firstName: string | null;
    lastName: string | null;
  };
}

export default function AffiliatesPage() {
  const router = useRouter();
  const [stores, setStores] = useState<AffiliateStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedStore, setSelectedStore] = useState<AffiliateStore | null>(null);

  useEffect(() => {
    loadStores();
  }, [supplierTypeFilter, verifiedOnly]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (locationFilter) params.append('location', locationFilter);
      if (supplierTypeFilter !== 'all') params.append('supplierType', supplierTypeFilter);
      if (verifiedOnly) params.append('verified', 'true');

      const response = await api.get(`/api/affiliates?${params.toString()}`);
      setStores(response.data);
    } catch (err) {
      console.error('Failed to load affiliate stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStores();
  };

  const handleVisitStore = (store: AffiliateStore) => {
    if (store.store.website) {
      // Open in new tab
      window.open(store.store.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Affiliate Partners</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Shop from Our Affiliate Partners</h2>
          <p className="text-primary-100">
            Browse products from verified partner stores. Import items to your DFN cart for convenient bulk ordering.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={supplierTypeFilter}
              onChange={(e) => setSupplierTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="local">Local Suppliers</option>
              <option value="international">International Suppliers</option>
              <option value="manufacturer">Manufacturers</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded text-primary-600"
              />
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Verified Only</span>
            </label>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading affiliate stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Affiliate Stores Found</h3>
            <p className="text-gray-600">
              {search ? 'Try adjusting your search criteria' : 'Affiliate stores will appear here once approved'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((item) => (
              <div key={item.store.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {/* Store Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {item.store.logo ? (
                      <img
                        src={item.store.logo}
                        alt={item.store.storeName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Store className="w-8 h-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{item.store.storeName}</h3>
                        {item.store.verificationStatus === 'verified' && (
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{item.store.supplierType}</p>
                      {item.store.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {item.store.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {item.store.description && (
                    <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                      {item.store.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    {item.store.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {parseFloat(item.store.rating).toFixed(1)}
                      </span>
                    )}
                    {item.store.totalSales > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {item.store.totalSales} sales
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                  <button
                    onClick={() => setSelectedStore(item)}
                    className="flex-1 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50"
                  >
                    View Details
                  </button>
                  {item.store.website && (
                    <button
                      onClick={() => handleVisitStore(item)}
                      className="flex-1 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Store
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Store Details Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedStore.store.storeName}</h2>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Store Info */}
              <div className="flex items-start gap-4">
                {selectedStore.store.logo ? (
                  <img
                    src={selectedStore.store.logo}
                    alt={selectedStore.store.storeName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Store className="w-12 h-12 text-primary-600" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{selectedStore.store.storeName}</h3>
                    {selectedStore.store.verificationStatus === 'verified' && (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 capitalize mb-1">
                    {selectedStore.store.supplierType} Supplier
                  </p>
                  {selectedStore.store.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedStore.store.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedStore.store.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600">{selectedStore.store.description}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    {selectedStore.store.rating ? parseFloat(selectedStore.store.rating).toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold">{selectedStore.store.totalSales}</p>
                </div>
              </div>

              {/* Owner Info */}
              {selectedStore.owner && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">Store Owner</p>
                  <p className="text-blue-900">
                    {selectedStore.owner.firstName} {selectedStore.owner.lastName}
                  </p>
                </div>
              )}

              {/* Info about importing */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">How to Order</h4>
                <p className="text-sm text-yellow-700">
                  Visit the partner store to browse products. When you&apos;re ready to order, 
                  you can import your cart items to DFN for consolidated bulk ordering and delivery.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
              <button
                onClick={() => setSelectedStore(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {selectedStore.store.website && (
                <button
                  onClick={() => handleVisitStore(selectedStore)}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                >
                  <Globe className="w-5 h-5" />
                  Visit Store Website
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
