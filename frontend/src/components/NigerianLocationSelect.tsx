'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X, Check } from 'lucide-react';

// Nigerian states and major cities
const NIGERIAN_LOCATIONS = [
  // Southwest
  { state: 'Lagos', cities: ['Lagos Island', 'Victoria Island', 'Ikeja', 'Lekki', 'Surulere', 'Yaba', 'Ikoyi', 'Ajah', 'Oshodi', 'Apapa'] },
  { state: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin'] },
  { state: 'Osun', cities: ['Osogbo', 'Ile-Ife', 'Ede', 'Ilesa'] },
  { state: 'Ondo', cities: ['Akure', 'Ondo', 'Owo'] },
  { state: 'Ogun', cities: ['Abeokuta', 'Sagamu', 'Ijebu-Ode'] },
  { state: 'Ekiti', cities: ['Ado-Ekiti', 'Ikere', 'Ijero'] },
  // Southeast
  { state: 'Enugu', cities: ['Enugu', 'Nsukka', 'Oji River'] },
  { state: 'Anambra', cities: ['Awka', 'Onitsha', 'Nnewi'] },
  { state: 'Imo', cities: ['Owerri', 'Orlu', 'Okigwe'] },
  { state: 'Abia', cities: ['Umuahia', 'Aba'] },
  { state: 'Ebonyi', cities: ['Abakaliki'] },
  // South-South
  { state: 'Rivers', cities: ['Port Harcourt', 'Bonny', 'Eleme'] },
  { state: 'Delta', cities: ['Warri', 'Asaba', 'Sapele'] },
  { state: 'Akwa Ibom', cities: ['Uyo', 'Eket'] },
  { state: 'Cross River', cities: ['Calabar', 'Ogoja'] },
  { state: 'Edo', cities: ['Benin City', 'Auchi'] },
  { state: 'Bayelsa', cities: ['Yenagoa'] },
  // North Central
  { state: 'FCT', cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Bwari'] },
  { state: 'Plateau', cities: ['Jos', 'Bukuru'] },
  { state: 'Kwara', cities: ['Ilorin', 'Offa'] },
  { state: 'Kogi', cities: ['Lokoja', 'Okene'] },
  { state: 'Nasarawa', cities: ['Lafia', 'Keffi'] },
  { state: 'Niger', cities: ['Minna', 'Suleja', 'Bida'] },
  { state: 'Benue', cities: ['Makurdi', 'Otukpo'] },
  // Northwest
  { state: 'Kano', cities: ['Kano'] },
  { state: 'Kaduna', cities: ['Kaduna', 'Zaria'] },
  { state: 'Katsina', cities: ['Katsina', 'Funtua', 'Daura'] },
  { state: 'Sokoto', cities: ['Sokoto'] },
  { state: 'Kebbi', cities: ['Birnin Kebbi'] },
  { state: 'Zamfara', cities: ['Gusau'] },
  { state: 'Jigawa', cities: ['Dutse', 'Hadejia'] },
  // Northeast
  { state: 'Bauchi', cities: ['Bauchi'] },
  { state: 'Borno', cities: ['Maiduguri'] },
  { state: 'Adamawa', cities: ['Yola', 'Jimeta'] },
  { state: 'Gombe', cities: ['Gombe'] },
  { state: 'Taraba', cities: ['Jalingo'] },
  { state: 'Yobe', cities: ['Damaturu'] },
];

interface NigerianLocationSelectProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function NigerianLocationSelect({
  value,
  onChange,
  placeholder = 'Select your location',
  required = false,
  className = '',
}: NigerianLocationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedState(null);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = NIGERIAN_LOCATIONS.filter((loc) => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;
    
    return (
      loc.state.toLowerCase().includes(query) ||
      loc.cities.some((city) => city.toLowerCase().includes(query))
    );
  });

  const handleSelectCity = (state: string, city: string) => {
    onChange(`${city}, ${state}, Nigeria`);
    setIsOpen(false);
    setSelectedState(null);
    setSearchQuery('');
  };

  const handleSelectState = (state: string) => {
    if (selectedState === state) {
      setSelectedState(null);
    } else {
      setSelectedState(state);
    }
  };

  const clearSelection = () => {
    onChange('');
    setIsOpen(false);
    setSelectedState(null);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input/Trigger */}
      <div
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 cursor-pointer flex items-center justify-between ${
          isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {value ? (
            <span className="text-gray-900 truncate">{value}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Hidden input for form validation */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search state or city..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Location List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No locations found
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <div key={loc.state}>
                  {/* State Header */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectState(loc.state);
                    }}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                  >
                    <span>{loc.state}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        selectedState === loc.state ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Cities */}
                  {selectedState === loc.state && (
                    <div className="bg-white">
                      {loc.cities.map((city) => {
                        const fullLocation = `${city}, ${loc.state}, Nigeria`;
                        const isSelected = value === fullLocation;
                        
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCity(loc.state, city);
                            }}
                            className={`w-full px-6 py-2 text-left text-sm flex items-center justify-between hover:bg-primary-50 ${
                              isSelected ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                            }`}
                          >
                            <span>{city}</span>
                            {isSelected && <Check className="w-4 h-4 text-primary-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the locations for use in other components
export { NIGERIAN_LOCATIONS };
