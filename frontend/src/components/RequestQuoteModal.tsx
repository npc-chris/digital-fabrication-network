'use client';

import { X, Paperclip, FileText, Trash2, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { quotesAPI, uploadAPI } from '@/lib/api-services';

interface RequestQuoteModalProps {
  service: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RequestQuoteModal({ service, onClose, onSuccess }: RequestQuoteModalProps) {
  const [projectDescription, setProjectDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const newAttachments: { name: string; url: string }[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }
        
        // Mock upload - in production, this would upload to the server
        // For now, we'll create a data URL for demonstration
        const result = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        newAttachments.push({
          name: file.name,
          url: result,
        });
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (err: any) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      let specsObj: any = {};
      if (specifications.trim()) {
        try {
          specsObj = JSON.parse(specifications);
        } catch {
          // If not valid JSON, store as plain text
          specsObj = { details: specifications };
        }
      }

      // Add attachments to specifications
      if (attachments.length > 0) {
        specsObj.attachments = attachments;
      }

      await quotesAPI.create({
        serviceId: service.id,
        projectDescription,
        specifications: specsObj,
      });

      setSuccessMessage('Quote request submitted successfully! The provider will review your request and send you a quote.');
      if (onSuccess) onSuccess();
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
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
            <h2 className="text-xl font-bold">Request Quote</h2>
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
        <div className="p-6 space-y-5">
          {/* Service Preview - Compact */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4">
              {images.length > 0 && (
                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={images[0]}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{service.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-1">{service.description}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span>Category: {service.category}</span>
                  <span>Location: {service.location}</span>
                </div>
              </div>
            </div>

            {/* Pricing Info - Compact */}
            <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-gray-500">Pricing</p>
                <p className="font-medium capitalize">{service.pricingModel?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rate</p>
                <p className="font-semibold text-primary-600">${service.pricePerUnit}/
                  {service.pricingModel === 'hourly' ? 'hr' :
                   service.pricingModel === 'project' ? 'proj' : 'unit'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Lead Time</p>
                <p className="font-medium">{service.leadTime ? `${service.leadTime}d` : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quote Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                {successMessage}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="projectDescription"
                rows={4}
                required
                disabled={!!successMessage}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100"
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
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Enter specific technical requirements..."
                value={specifications}
                onChange={(e) => setSpecifications(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: {`{"material": "PLA", "dimensions": "100x100x50mm"}`}
              </p>
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.stl,.step,.iges"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    {uploading ? 'Uploading...' : 'Click to upload files'}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PDF, DOC, TXT, Images, CAD files (max 10MB each)
                  </span>
                </label>
              </div>

              {/* Attached Files List */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> The provider will review your request and send you a quote with pricing and timeline.
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
