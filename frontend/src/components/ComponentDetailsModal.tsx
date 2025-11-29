'use client';

import { X, Minus, Plus, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface ComponentDetailsModalProps {
  component: any;
  onClose: () => void;
}

export default function ComponentDetailsModal({ component, onClose }: ComponentDetailsModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const images = component.images ? JSON.parse(component.images) : [];
  const technicalDetails = component.technicalDetails ? JSON.parse(component.technicalDetails) : {};
  const compatibilities = component.compatibilities ? JSON.parse(component.compatibilities) : [];

  const handleAddToCart = async () => {
    setCartLoading(true);
    try {
      await api.post('/api/cart/items', {
        componentId: component.id,
        quantity: quantity,
        price: component.price,
      });
      setInCart(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove from cart
      setInCart(false);
      setQuantity(1);
      return;
    }
    if (newQuantity > component.availability) {
      return;
    }
    setQuantity(newQuantity);
  };

  const handleRemoveFromCart = () => {
    setInCart(false);
    setQuantity(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{component.name}</h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">{component.type} • {component.location}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Product Preview - Compact (similar to RequestQuoteModal) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              {images.length > 0 && (
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[0]}
                    alt={component.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{component.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{component.description || 'No description available.'}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-2">
                  <span className="capitalize">Type: {component.type}</span>
                  <span>Location: {component.location}</span>
                </div>
              </div>
            </div>

            {/* Pricing Info - Compact Grid */}
            <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="font-semibold text-primary-600">${component.price}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Availability</p>
                <p className={`font-medium ${component.availability > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {component.availability > 0 ? `${component.availability} in stock` : 'Out of stock'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rating</p>
                <p className="font-medium">⭐ {component.rating || 'N/A'} ({component.reviewCount || 0})</p>
              </div>
            </div>
          </div>

          {/* Provider Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500">Provider</p>
              <p>
                {component.providerCompany || 
                 `${component.providerName || ''} ${component.providerLastName || ''}`.trim() || 
                 `Provider #${component.providerId}`}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          {Object.keys(technicalDetails).length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2">Technical Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                {Object.entries(technicalDetails).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibilities */}
          {compatibilities.length > 0 && (
            <div>
              <h3 className="text-base font-semibold mb-2">Compatible With</h3>
              <div className="flex flex-wrap gap-2">
                {compatibilities.map((item: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Datasheet Link */}
          {component.datasheetUrl && (
            <div>
              <a
                href={component.datasheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                📄 Download Datasheet
              </a>
            </div>
          )}

          {/* Contact Provider Info */}
          {showContactInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-3 text-blue-800">Provider Contact Details</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {component.providerCompany || 
                   `${component.providerName || ''} ${component.providerLastName || ''}`.trim() || 
                   'Provider'}
                </p>
                {component.providerPhone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${component.providerPhone}`} className="hover:text-primary-600">
                      {component.providerPhone}
                    </a>
                  </div>
                )}
                {component.providerEmail && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${component.providerEmail}`} className="hover:text-primary-600">
                      {component.providerEmail}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span>{component.location || 'Location not specified'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          {inCart ? (
            /* Quantity Controls when item is in cart */
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-3 font-semibold min-w-[60px] text-center border-x">
                  {quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  disabled={quantity >= component.availability}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleRemoveFromCart}
                className="flex items-center gap-2 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
              <button
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="flex-1 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition-colors"
              >
                {showContactInfo ? 'Hide Contact Info' : 'Contact Provider'}
              </button>
            </div>
          ) : (
            /* Add to Cart button when item is not in cart */
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || component.availability === 0}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setShowContactInfo(!showContactInfo)}
                className="flex-1 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition-colors"
              >
                {showContactInfo ? 'Hide Contact Info' : 'Contact Provider'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
