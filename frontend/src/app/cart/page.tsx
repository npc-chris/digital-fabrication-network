'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
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
      await api.put(`/cart/items/${itemId}`, { quantity: newQuantity });
      loadCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await api.delete(`/cart/items/${itemId}`);
      loadCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading cart...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <ShoppingCart className="w-8 h-8 mr-3" />
          Shopping Cart
        </h1>

        {!cart || cart.totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Your cart is empty</p>
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Grouped by Vendor */}
            <div className="lg:col-span-2 space-y-6">
              {cart.vendors.map((vendor: any) => (
                <div key={vendor.vendorKey} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Vendor Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg text-gray-900 flex items-center justify-between">
                      <span>{vendor.vendorName}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        vendor.vendorType === 'internal' ? 'bg-blue-100 text-blue-800' :
                        vendor.vendorType === 'affiliate' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {vendor.vendorType === 'internal' ? 'DFN Direct' : 'Partner Store'}
                      </span>
                    </h2>
                  </div>

                  {/* Vendor Items */}
                  <div className="divide-y divide-gray-200">
                    {vendor.items.map((item: any) => (
                      <div key={item.item.id} className="p-6 flex gap-4">
                        {/* Item Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                          {(item.component?.images || item.item.productImage) && (
                            <img
                              src={item.component?.images ? JSON.parse(item.component.images)[0] : item.item.productImage}
                              alt="Product"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.component?.name || item.item.productName}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.component?.description || ''}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.item.id, item.item.quantity - 1)}
                                className="p-1 rounded-md hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold w-8 text-center">{item.item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.item.id, item.item.quantity + 1)}
                                className="p-1 rounded-md hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg text-gray-900">
                                ${(parseFloat(item.item.price) * item.item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(item.item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vendor Subtotal */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal from {vendor.vendorName}:</span>
                      <span className="font-semibold text-lg">${vendor.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cart.totalItems}):</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${cart.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
                  Proceed to Checkout
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Continue Shopping
                </button>

                {/* Multi-vendor notice */}
                {cart.vendors.length > 1 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <strong>Note:</strong> Your cart contains items from {cart.vendors.length} different vendors. 
                    You may receive multiple shipments.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
