'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { quotesAPI } from '@/lib/api-services';

interface RequestQuoteModalProps {
  service: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RequestQuoteModal({ service, onClose, onSuccess }: RequestQuoteModalProps) {
  const [projectDescription, setProjectDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let specsObj = {};
      if (specifications.trim()) {
        try {
          specsObj = JSON.parse(specifications);
        } catch {
          // If not valid JSON, store as plain text
          specsObj = { details: specifications };
        }
      }

      await quotesAPI.create({
        serviceId: service.id,
        projectDescription,
        specifications: specsObj,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const images = service.images ? JSON.parse(service.images) : [];
  const equipmentSpecs = service.equipmentSpecs ? JSON.parse(service.equipmentSpecs) : {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Request Quote</h2>
            <p className="text-sm text-gray-500 mt-1">{service.name}</p>
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
        <div className="p-6 space-y-6">
          {/* Service Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              {images.length > 0 && (
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Category: {service.category}</span>
                  <span>Location: {service.location}</span>
                </div>
              </div>
            </div>

            {/* Equipment Specs */}
            {Object.keys(equipmentSpecs).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Equipment Specifications:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(equipmentSpecs).slice(0, 4).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}: </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Info */}
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Pricing Model</p>
                <p className="font-medium capitalize">{service.pricingModel?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rate</p>
                <p className="font-semibold text-primary-600">${service.pricePerUnit}/
                  {service.pricingModel === 'hourly' ? 'hour' :
                   service.pricingModel === 'project' ? 'project' : 'unit'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Lead Time</p>
                <p className="font-medium">{service.leadTime ? `${service.leadTime} days` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quote Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="projectDescription"
                rows={5}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe your project requirements, goals, and any specific details..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
                Technical Specifications (Optional)
              </label>
              <textarea
                id="specifications"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter specific technical requirements (JSON format or plain text)"
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can provide specifications as JSON or plain text. Example: {"{"}"material": "PLA", "dimensions": "100x100x50mm"{"}"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> After submitting this request, the service provider will review your requirements 
                and send you a detailed quote with pricing and timeline estimates.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !projectDescription.trim()}
            className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
