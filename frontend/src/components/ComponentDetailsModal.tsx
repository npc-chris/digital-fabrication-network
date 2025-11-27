'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ComponentDetailsModalProps {
  component: any;
  onClose: () => void;
}

export default function ComponentDetailsModal({ component, onClose }: ComponentDetailsModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{component.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((img: string, idx: number) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${component.name} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700">{component.description || 'No description available.'}</p>
          </div>

          {/* Pricing & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Price</p>
              <p className="text-2xl font-bold text-primary-600">${component.price}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Availability</p>
              <p className="text-xl font-semibold">
                {component.availability > 0 ? (
                  <span className="text-green-600">{component.availability} in stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Rating</p>
              <p className="text-xl font-semibold">
                ⭐ {component.rating || 'N/A'} ({component.reviewCount || 0} reviews)
              </p>
            </div>
          </div>

          {/* Component Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-base capitalize">{component.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-base">{component.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Provider</p>
              <p className="text-base">
                {component.providerCompany || 
                 `${component.providerName || ''} ${component.providerLastName || ''}`.trim() || 
                 `provider #${component.providerId}`}
              </p>
            </div>
          </div>

          {/* Technical Details */}
          {Object.keys(technicalDetails).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
              <h3 className="text-lg font-semibold mb-3">Compatible With</h3>
              <div className="flex flex-wrap gap-2">
                {compatibilities.map((item: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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
                className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                📄 Download Datasheet
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors">
            Add to Cart
          </button>
          <button className="flex-1 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition-colors">
            Contact provider
          </button>
        </div>
      </div>
    </div>
  );
}
