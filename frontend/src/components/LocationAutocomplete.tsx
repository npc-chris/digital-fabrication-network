'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

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

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

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

  // Fetch predictions from Google Places API
  const fetchPredictions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPredictions([]);
      return;
    }

    // If no API key, use fallback Nigerian locations
    if (!GOOGLE_PLACES_API_KEY) {
      const fallbackPredictions = getFallbackPredictions(query);
      setPredictions(fallbackPredictions);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        input: query,
        key: GOOGLE_PLACES_API_KEY,
        types: '(cities)',
        language: 'en',
      });

      // Restrict to Nigeria if enabled
      if (restrictToNigeria) {
        params.append('components', 'country:ng');
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch location predictions');
      }

      const data = await response.json();

      if (data.status === 'OK') {
        setPredictions(data.predictions);
      } else if (data.status === 'ZERO_RESULTS') {
        setPredictions([]);
      } else {
        // Fallback to hardcoded locations if API fails
        const fallbackPredictions = getFallbackPredictions(query);
        setPredictions(fallbackPredictions);
      }
    } catch (err) {
      console.error('Location autocomplete error:', err);
      // Use fallback on error
      const fallbackPredictions = getFallbackPredictions(query);
      setPredictions(fallbackPredictions);
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

  const handleSelectPrediction = (prediction: Prediction) => {
    const locationText = prediction.description;
    setInputValue(locationText);
    onChange(locationText);
    setIsOpen(false);
    setPredictions([]);
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
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            aria-label="Clear location"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                {prediction.structured_formatting ? (
                  <>
                    <p className="font-medium text-gray-900">
                      {prediction.structured_formatting.main_text}
                    </p>
                    <p className="text-sm text-gray-500">
                      {prediction.structured_formatting.secondary_text}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-900">{prediction.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && inputValue.length >= 2 && predictions.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
          No locations found
        </div>
      )}

      {/* API Notice */}
      {!GOOGLE_PLACES_API_KEY && isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700 z-40">
          Using offline location data. Configure NEXT_PUBLIC_GOOGLE_PLACES_API_KEY for live autocomplete.
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

// Fallback Nigerian locations when API is not available
function getFallbackPredictions(query: string): Prediction[] {
  const nigerianLocations = [
    // Major Cities
    { city: 'Lagos', state: 'Lagos State', country: 'Nigeria' },
    { city: 'Lagos Island', state: 'Lagos State', country: 'Nigeria' },
    { city: 'Victoria Island', state: 'Lagos State', country: 'Nigeria' },
    { city: 'Ikeja', state: 'Lagos State', country: 'Nigeria' },
    { city: 'Lekki', state: 'Lagos State', country: 'Nigeria' },
    { city: 'Abuja', state: 'FCT', country: 'Nigeria' },
    { city: 'Kano', state: 'Kano State', country: 'Nigeria' },
    { city: 'Ibadan', state: 'Oyo State', country: 'Nigeria' },
    { city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    { city: 'Benin City', state: 'Edo State', country: 'Nigeria' },
    { city: 'Kaduna', state: 'Kaduna State', country: 'Nigeria' },
    { city: 'Enugu', state: 'Enugu State', country: 'Nigeria' },
    { city: 'Calabar', state: 'Cross River State', country: 'Nigeria' },
    { city: 'Warri', state: 'Delta State', country: 'Nigeria' },
    { city: 'Owerri', state: 'Imo State', country: 'Nigeria' },
    { city: 'Onitsha', state: 'Anambra State', country: 'Nigeria' },
    { city: 'Jos', state: 'Plateau State', country: 'Nigeria' },
    { city: 'Maiduguri', state: 'Borno State', country: 'Nigeria' },
    { city: 'Aba', state: 'Abia State', country: 'Nigeria' },
    { city: 'Ilorin', state: 'Kwara State', country: 'Nigeria' },
    { city: 'Abeokuta', state: 'Ogun State', country: 'Nigeria' },
    { city: 'Akure', state: 'Ondo State', country: 'Nigeria' },
    { city: 'Osogbo', state: 'Osun State', country: 'Nigeria' },
    { city: 'Sokoto', state: 'Sokoto State', country: 'Nigeria' },
    { city: 'Yola', state: 'Adamawa State', country: 'Nigeria' },
    { city: 'Uyo', state: 'Akwa Ibom State', country: 'Nigeria' },
    { city: 'Asaba', state: 'Delta State', country: 'Nigeria' },
    { city: 'Makurdi', state: 'Benue State', country: 'Nigeria' },
    { city: 'Minna', state: 'Niger State', country: 'Nigeria' },
    { city: 'Lokoja', state: 'Kogi State', country: 'Nigeria' },
  ];

  const lowerQuery = query.toLowerCase();
  
  return nigerianLocations
    .filter(loc => 
      loc.city.toLowerCase().includes(lowerQuery) ||
      loc.state.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 5)
    .map((loc, index) => ({
      place_id: `fallback-${index}`,
      description: `${loc.city}, ${loc.state}, ${loc.country}`,
      structured_formatting: {
        main_text: loc.city,
        secondary_text: `${loc.state}, ${loc.country}`,
      },
    }));
}
