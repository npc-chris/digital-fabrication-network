'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { API_URL } from '@/lib/auth';

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  restrictToNigeria?: boolean;
}

interface Prediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface PlaceDetailsResponse {
  formattedAddress?: string;
  name?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a location...',
  required = false,
  className = '',
  restrictToNigeria = true,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions from the backend Google Places proxy
  const fetchPredictions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPredictions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        input: query,
        restrictToNigeria: String(restrictToNigeria),
      });
      const response = await fetch(
        `${API_URL}/api/locations/autocomplete?${params.toString()}`
      );

      if (!response.ok) {
        let message = 'Failed to fetch location predictions';

        try {
          const errorData = await response.json();
          if (typeof errorData.error === 'string' && errorData.error.trim()) {
            message = errorData.error;
          }
        } catch {
          // Ignore JSON parsing failures and keep the generic message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      if (Array.isArray(data.predictions)) {
        setPredictions(data.predictions);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Location autocomplete error:', err);
      setPredictions([]);
      setError(err instanceof Error ? err.message : 'Location search is temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [restrictToNigeria]);

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setInputValue(query);
    setIsOpen(true);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      fetchPredictions(query);
    }, 300);
  };

  const handleSelectPrediction = async (prediction: Prediction) => {
    setIsLoading(true);

    try {
      let locationText = prediction.description;

      const params = new URLSearchParams({
        placeId: prediction.place_id,
      });

      const response = await fetch(`${API_URL}/api/locations/details?${params.toString()}`);
      if (response.ok) {
        const data = (await response.json()) as PlaceDetailsResponse;
        if (typeof data.formattedAddress === 'string' && data.formattedAddress.trim()) {
          locationText = data.formattedAddress.trim();
        }
      }

      setInputValue(locationText);
      onChange(locationText);
      setIsOpen(false);
      setPredictions([]);
    } catch (err) {
      console.error('Location details error:', err);
      const locationText = prediction.description;
      setInputValue(locationText);
      onChange(locationText);
      setIsOpen(false);
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-10 text-sm text-[#191c1e] outline-none transition-all placeholder:text-slate-400 focus:border-[#006098] focus:ring-2 focus:ring-[#006098]/15"
        />
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-slate-100"
            aria-label="Clear location"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-slate-50 last:border-b-0"
            >
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <div>
                {prediction.structured_formatting ? (
                  <>
                    <p className="font-medium text-[#191c1e]">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-sm text-slate-500">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </>
                ) : (
                  <p className="text-[#191c1e]">{prediction.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && inputValue.length >= 2 && predictions.length === 0 && !isLoading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-slate-500 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
          No locations found
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
