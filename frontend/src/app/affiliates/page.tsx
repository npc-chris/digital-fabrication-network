'use client';

import { useState, useEffect } from 'react';
import { affiliatesAPI } from '@/lib/api-services';
import { ExternalLink, Search, ShoppingBag, Star } from 'lucide-react';

export default function AffiliatesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await affiliatesAPI.getAllProducts({ 
        category,
        search: searchTerm 
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleProductClick = async (product: any) => {
    try {
      await affiliatesAPI.trackClick(product.id);
      window.open(product.affiliateLink, '_blank');
    } catch (error) {
      console.error('Failed to track click:', error);
      // Open link anyway
      window.open(product.affiliateLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner Store</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Curated tools, components, and materials from our trusted partners. 
            Support the community with every purchase.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for tools, parts, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              title="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="tools">Tools & Equipment</option>
              <option value="components">Electronics Components</option>
              <option value="materials">3D Printing Materials</option>
              <option value="kits">Starter Kits</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No products found.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-200 relative p-4 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-gray-300" />
                  )}
                  {product.discountCode && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {product.category}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      {product.currency} {product.price}
                    </span>
                    <div className="flex items-center text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      4.8
                    </div>
                  </div>

                  <button
                    onClick={() => handleProductClick(product)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    View Deal <ExternalLink className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
