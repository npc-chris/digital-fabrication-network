'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadAPI } from '@/lib/api-services';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onMultipleChange?: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  accept?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onMultipleChange,
  multiple = false,
  maxFiles = 5,
  className = '',
  placeholder = 'Click to upload an image',
  showPreview = true,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>(value ? [value] : []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const newUrls: string[] = [];
      const filesToUpload = Array.from(files).slice(0, maxFiles - uploadedImages.length);

      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files');
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        try {
          const result = await uploadAPI.uploadSingle(file);
          if (result.url) {
            newUrls.push(result.url);
          }
        } catch (uploadError: any) {
          // If upload API fails (e.g., no S3 configured), fall back to local storage
          // For development/demo purposes, we'll create a data URL
          console.warn('Upload API failed, using local fallback:', uploadError);
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      }

      if (newUrls.length > 0) {
        if (multiple) {
          const allUrls = [...uploadedImages, ...newUrls];
          setUploadedImages(allUrls);
          if (onMultipleChange) {
            onMultipleChange(allUrls);
          } else {
            onChange(allUrls[0]);
          }
        } else {
          setUploadedImages([newUrls[0]]);
          onChange(newUrls[0]);
        }
      }
    } catch (err: any) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    if (multiple && onMultipleChange) {
      onMultipleChange(newImages);
    } else {
      onChange(newImages[0] || '');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const input = fileInputRef.current;
      if (input) {
        // Create a new DataTransfer object to set the files
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach(file => dataTransfer.items.add(file));
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          uploading ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-500 hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
            <span className="text-sm text-primary-600">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">{placeholder}</span>
            <span className="text-xs text-gray-400 mt-1">
              Drag and drop or click to browse
            </span>
            {multiple && (
              <span className="text-xs text-gray-400">
                {uploadedImages.length}/{maxFiles} images
              </span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {/* Preview Images */}
      {showPreview && uploadedImages.length > 0 && (
        <div className={`mt-3 ${multiple ? 'grid grid-cols-3 gap-2' : ''}`}>
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative group">
              <div className={`${multiple ? 'aspect-square' : 'h-32'} bg-gray-200 rounded-lg overflow-hidden`}>
                {url.startsWith('data:') || url.startsWith('http') || url.startsWith('/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
