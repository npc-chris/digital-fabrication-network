'use client';

import { X, Upload, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';
import api from '@/lib/api';
import { uploadAPI } from '@/lib/api-services';

interface AddServiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const SERVICE_CATEGORIES = [
    '3D Printing',
    'CNC Machining',
    'PCB Assembly',
    'Laser Cutting',
    'Injection Molding',
    'Design Services',
    'Consultation',
    'Repair'
];

const PRICING_MODELS = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'per_unit', label: 'Per Unit' },
    { value: 'project', label: 'Per Project' }
];

export default function AddServiceModal({ onClose, onSuccess }: AddServiceModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '3D Printing',
        pricingModel: 'hourly',
        pricePerUnit: '',
        leadTime: '',
        location: '',
        equipmentSpecs: '{}',
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.size > 5 * 1024 * 1024) {
                    setError(`File ${file.name} is too large (max 5MB)`);
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await uploadAPI.uploadSingle(file);
                setImages(prev => [...prev, response.url]);
            }
        } catch (err: any) {
            setError('Failed to upload image');
            console.error(err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate JSON
            let equipmentSpecsObj = {};
            try {
                if (formData.equipmentSpecs) {
                    equipmentSpecsObj = JSON.parse(formData.equipmentSpecs);
                }
            } catch (err) {
                throw new Error('Invalid JSON in Equipment Specs');
            }

            const payload = {
                ...formData,
                pricePerUnit: parseFloat(formData.pricePerUnit),
                leadTime: parseInt(formData.leadTime),
                images: JSON.stringify(images),
                equipmentSpecs: JSON.stringify(equipmentSpecsObj),
            };

            await api.post('/api/services', payload);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || err.response?.data?.error || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold">Add New Service</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Precision 3D Printing"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Describe your service capabilities..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                {SERVICE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Model *</label>
                            <select
                                name="pricingModel"
                                value={formData.pricingModel}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                {PRICING_MODELS.map(model => (
                                    <option key={model.value} value={model.value}>{model.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rate/Price ($) *</label>
                            <input
                                type="number"
                                name="pricePerUnit"
                                required
                                min="0"
                                step="0.01"
                                value={formData.pricePerUnit}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lead Time (days) *</label>
                            <input
                                type="number"
                                name="leadTime"
                                required
                                min="1"
                                value={formData.leadTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. 3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="e.g. Lagos, Nigeria"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    {uploading ? (
                                        <span className="text-sm">Uploading...</span>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 mb-2" />
                                            <span className="text-xs">Add Image</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Equipment Specifications (JSON Format)
                            </label>
                            <textarea
                                name="equipmentSpecs"
                                rows={4}
                                value={formData.equipmentSpecs}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                placeholder='{"make": "Creality", "model": "Ender 3 V2", "bed_size": "220x220x250mm"}'
                            />
                            <p className="text-xs text-gray-500 mt-1">Must be valid JSON</p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 px-4 py-3 bg-primary-600 rounded-lg text-white font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
