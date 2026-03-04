'use client';

import { useState, useEffect } from 'react';
import { Search, Star, ExternalLink, ShoppingBag, Target, Zap, Tag, Shield } from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { affiliatesAPI } from '@/lib/api-services';

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
      window.open(product.affiliateLink, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20 selection:bg-primary-500/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Hero */}
        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
            <Zap className="w-3 h-3 text-primary-500" />
            <span className="text-[10px] font-mono text-primary-400 font-bold uppercase tracking-widest">Curated Marketplace</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tighter">
            Partner_Store
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto italic leading-relaxed">
            Curated tools, precision components, and fabrication materials from verified DFN partners.
            Every purchase strengthens the network.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 mb-12 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Item Search</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tools, components, materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl pl-12 pr-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-mono text-sm placeholder:text-zinc-700 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest mb-3">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1c1c21] border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-primary-500 transition-all font-bold appearance-none shadow-inner text-sm"
                title="Filter by category"
              >
                <option value="">All Categories</option>
                <option value="tools">TOOLS_&_EQUIPMENT</option>
                <option value="components">ELECTRONICS_PARTS</option>
                <option value="materials">ADDITIVE_MATERIALS</option>
                <option value="kits">STARTER_KITS</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary-600/20"
              >
                Execute Search
              </button>
            </div>
          </form>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-24 font-mono text-xs tracking-[0.5em] text-zinc-600 animate-pulse">
              SCANNING_PARTNER_INVENTORY...
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-[#141417] border border-dashed border-zinc-800 rounded-3xl">
              <Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-mono uppercase text-xs tracking-widest">
                No items matching current filter parameters.
              </p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="group bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all duration-500 shadow-2xl flex flex-col">
                {/* Image */}
                <div className="h-52 bg-[#0a0a0c] relative p-6 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <ShoppingBag className="w-16 h-16 text-zinc-800 opacity-20" />
                  )}
                  {product.discountCode && (
                    <div className="absolute top-4 right-4 bg-red-500/90 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                      SALE
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3 h-3 text-primary-500" />
                    <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-white mb-3 line-clamp-2 tracking-tight group-hover:text-primary-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-zinc-500 text-sm mb-6 line-clamp-2 flex-1 italic leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-zinc-800/50">
                    <span className="text-xl font-black text-white font-mono">
                      {product.currency} {product.price}
                    </span>
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span className="text-[10px] font-mono font-bold text-amber-400">4.8</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleProductClick(product)}
                    className="w-full bg-zinc-900 hover:bg-primary-600 border border-zinc-800 hover:border-primary-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    View Deal <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 bg-primary-500/5 border border-primary-500/10 rounded-2xl p-6">
          <div className="flex gap-4">
            <Shield className="w-5 h-5 text-primary-500 shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Verified Partners Only</h4>
              <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                All partner products are verified by the DFN team. Affiliate commissions are transparently reinvested into network infrastructure and community development.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
