'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Wrench, Users, FileText } from 'lucide-react';
import { searchAPI } from '@/lib/api-services';

interface SearchResult {
  components: any[];
  services: any[];
  posts: any[];
  users: any[];
}

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setResults(null);
    }
  }, [query, selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const performSearch = async () => {
    try {
      setLoading(true);
      const type = selectedType === 'all' ? undefined : selectedType;
      const data = await searchAPI.search(query, type);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults(null);
    inputRef.current?.focus();
  };

  const getTotalResults = () => {
    if (!results) return 0;
    return (
      results.components.length +
      results.services.length +
      results.posts.length +
      results.users.length
    );
  };

  const renderResultSection = (title: string, items: any[], icon: any, type: string) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-sm font-semibold text-gray-700">
          {icon}
          <span>{title}</span>
          <span className="text-gray-500">({items.length})</span>
        </div>
        <div className="divide-y divide-gray-100">
          {items.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => {
                // Navigate to item detail page
                console.log(`Navigate to ${type}:`, item);
                setIsOpen(false);
              }}
            >
              <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                {item.name || item.title || item.email}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                  {item.description}
                </p>
              )}
              {item.location && (
                <p className="text-xs text-gray-400 mt-1">{item.location}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[600px] overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search components, services, posts, users..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mt-3">
                {['all', 'components', 'services', 'posts', 'users'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2">Searching...</p>
                </div>
              ) : query.length < 2 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Type at least 2 characters to search</p>
                </div>
              ) : results && getTotalResults() === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No results found for &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              ) : results ? (
                <div className="py-2">
                  {renderResultSection(
                    'Components',
                    results.components,
                    <Package className="w-4 h-4" />,
                    'component'
                  )}
                  {renderResultSection(
                    'Services',
                    results.services,
                    <Wrench className="w-4 h-4" />,
                    'service'
                  )}
                  {renderResultSection(
                    'Posts',
                    results.posts,
                    <FileText className="w-4 h-4" />,
                    'post'
                  )}
                  {renderResultSection(
                    'Users',
                    results.users,
                    <Users className="w-4 h-4" />,
                    'user'
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {results && getTotalResults() > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 text-center text-sm text-gray-500">
                Found {getTotalResults()} result{getTotalResults() !== 1 ? 's' : ''} for &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
