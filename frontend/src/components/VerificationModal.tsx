'use client';

import { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import api from '@/lib/api';

interface VerificationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function VerificationModal({ onClose, onSuccess }: VerificationModalProps) {
    const [documentType, setDocumentType] = useState('business_license');
    const [documentUrl, setDocumentUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentUrl) {
            setError('Please provide a document URL or upload a file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            await api.post('/api/verification/submit', {
                documentType,
                documentUrl
            });
            setSubmitted(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit document');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocumentUrl(response.data.url);
        } catch (err: any) {
            setError('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <h2 className="text-2xl font-bold">Supplier Verification</h2>
                    <p className="text-blue-100 text-sm mt-1">Get the "Verified" badge to boost your trust on DFN.</p>
                </div>

                <div className="p-8">
                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Documents Submitted!</h3>
                            <p className="text-gray-600 mt-2">
                                Our team will review your documents shortly. You'll be notified once verified.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                                <select
                                    value={documentType}
                                    onChange={(e) => setDocumentType(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    title="Select document type"
                                >
                                    <option value="business_license">Business License / RC Number</option>
                                    <option value="tax_id">Tax Identification Number (TIN)</option>
                                    <option value="address_proof">Utility Bill / Proof of Address</option>
                                    <option value="identity_proof">Government Issued ID (Founder)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="doc-upload"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        title="Upload document file"
                                    />
                                    <label
                                        htmlFor="doc-upload"
                                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 cursor-pointer group-hover:bg-blue-50 group-hover:border-blue-300 transition-all"
                                    >
                                        {documentUrl ? (
                                            <div className="flex flex-col items-center">
                                                <FileText className="text-blue-500 mb-2" size={32} />
                                                <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                                    Document Uploaded
                                                </span>
                                                <span className="text-xs text-gray-500 mt-1">Click to change</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <Upload className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" size={32} />
                                                <span className="text-sm font-medium text-gray-600">Click to upload or drag & drop</span>
                                                <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 5MB)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-start gap-2 text-sm">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="bg-blue-50 p-4 rounded-xl">
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    <strong>Note:</strong> Verification usually takes 24-48 hours. Verified suppliers get priority in search results and an exclusive badge on their profile.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !documentUrl}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? 'Processing...' : 'Submit for Verification'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
