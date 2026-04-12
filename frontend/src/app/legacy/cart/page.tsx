'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Box } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/api/cart/items/${itemId}`, { quantity: newQuantity });
      loadCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`/api/cart/items/${itemId}`);
      loadCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-zinc-500 font-mono tracking-widest">
        FETCHING_CART_MANIFEST...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-300 pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        <div className="flex items-center justify-between mb-12 mt-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center">
            <ShoppingCart className="w-10 h-10 mr-4 text-primary-500" />
            Inventory_Cart
          </h1>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Session ID</p>
            <p className="text-sm font-mono text-zinc-300">DFN-SRV-{Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
        </div>

        {!cart || cart.totalItems === 0 ? (
          <div className="bg-[#141417] border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
            <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Cart is Empty</h2>
            <p className="text-zinc-500 max-w-sm mx-auto mb-8">
              Your hardware procurement list is empty. Explore the marketplace to add components or services.
            </p>
            <Link href="/dashboard">
              <button className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95">
                Browse Marketplace
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items - Grouped by Vendor */}
            <div className="lg:col-span-2 space-y-8">
              {cart.vendors.map((vendor: any) => (
                <div key={vendor.vendorKey} className="bg-[#141417] border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                  {/* Vendor Header */}
                  <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Provider Manifest</p>
                      <h2 className="font-bold text-white flex items-center gap-3">
                        {vendor.vendorName}
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${vendor.vendorType === 'internal' ? 'border-primary-500/30 text-primary-400 bg-primary-500/5' :
                          vendor.vendorType === 'affiliate' ? 'border-purple-500/30 text-purple-400 bg-purple-500/5' :
                            'border-orange-500/30 text-orange-400 bg-orange-500/5'
                          }`}>
                          {vendor.vendorType === 'internal' ? 'DFN_VERIFIED' :
                            vendor.vendorType === 'affiliate' ? 'PARTNER_NODE' :
                              vendor.vendorType === 'campaign' ? 'GROUP_BUY' : 'OTHER'}
                        </span>
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Subtotal</p>
                      <p className="font-mono text-white">${vendor.subtotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Vendor Items */}
                  <div className="divide-y divide-zinc-800/50">
                    {vendor.items.map((item: any) => (
                      <div key={item.item.id} className="p-6 flex gap-6 hover:bg-zinc-900/30 transition-colors">
                        {/* Item Image */}
                        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-xl flex-shrink-0 overflow-hidden relative group">
                          {(item.component?.images || item.campaign?.images || item.item.productImage) ? (
                            <img
                              src={
                                item.component?.images ? JSON.parse(item.component.images)[0] :
                                  item.campaign?.images ? JSON.parse(item.campaign.images)[0] :
                                    item.item.productImage
                              }
                              alt="Product"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <Box size={24} />
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-bold text-white text-lg">
                                {item.component?.name || item.campaign?.title || item.item.productName}
                              </h3>
                              <button
                                onClick={() => removeItem(item.item.id)}
                                className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                                title="Remove Item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p className="text-sm text-zinc-500 line-clamp-2 mb-2 max-w-md italic">
                              {item.component?.description || item.campaign?.description || 'No additional specifications provided.'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                              <button
                                onClick={() => updateQuantity(item.item.id, item.item.quantity - 1)}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-white w-10 text-center text-sm">{item.item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.item.id, item.item.quantity + 1)}
                                className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-0.5">Unit Price</p>
                              <p className="font-mono text-white font-bold text-lg">
                                ${(parseFloat(item.item.price) * item.item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-8 sticky top-24 shadow-2xl overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-32 h-32 rotate-12" />
                </div>

                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <Box className="w-5 h-5 text-primary-500" />
                  Order_Summary
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">Inventory Items</span>
                    <span className="text-zinc-300 font-mono">{cart.totalItems} Units</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">Gross Total</span>
                    <span className="text-zinc-300 font-mono">${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-mono">Shipping</span>
                    <span className="text-emerald-500 font-mono uppercase text-[10px] tracking-tighter">Calc_at_checkout</span>
                  </div>

                  <div className="h-px bg-zinc-800 my-6" />

                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Net Total</span>
                    <span className="text-3xl font-bold font-mono text-white">
                      ${cart.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link href="/checkout">
                  <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-primary-500 transition-all active:scale-95 shadow-lg shadow-primary-600/20 mb-4">
                    Initialize Secure Checkout
                  </button>
                </Link>

                <Link href="/dashboard">
                  <button className="w-full bg-transparent border border-zinc-800 text-zinc-500 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:border-zinc-700 hover:text-zinc-300 transition-all">
                    Continue Discovery
                  </button>
                </Link>

                <div className="mt-8 pt-6 border-t border-zinc-800 flex gap-4 items-start">
                  <ShieldCheck className="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase tracking-tight">
                    All transactions on the DFN are secured via escrow. Funds are only released to providers upon successful delivery verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
