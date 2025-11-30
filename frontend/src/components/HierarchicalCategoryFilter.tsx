'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Check, X, Filter } from 'lucide-react';
import { COMPONENT_CATEGORIES, CategoryDefinition, SubcategoryDefinition } from '@/config/componentCategories';

interface HierarchicalCategoryFilterProps {
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (categories: string[]) => void;
  onSubcategoryChange: (subcategories: string[]) => void;
  onClear: () => void;
}

export default function HierarchicalCategoryFilter({
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
  onClear,
}: HierarchicalCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      // Remove category and its subcategories
      onCategoryChange(selectedCategories.filter(c => c !== categoryId));
      const category = COMPONENT_CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        const subcatIds = category.subcategories.map(s => s.id);
        onSubcategoryChange(selectedSubcategories.filter(s => !subcatIds.includes(s)));
      }
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const toggleSubcategory = (categoryId: string, subcategoryId: string) => {
    const fullId = `${categoryId}:${subcategoryId}`;
    if (selectedSubcategories.includes(fullId)) {
      onSubcategoryChange(selectedSubcategories.filter(s => s !== fullId));
    } else {
      onSubcategoryChange([...selectedSubcategories, fullId]);
      // Also select parent category if not already selected
      if (!selectedCategories.includes(categoryId)) {
        onCategoryChange([...selectedCategories, categoryId]);
      }
    }
  };

  const isSubcategorySelected = (categoryId: string, subcategoryId: string) => {
    return selectedSubcategories.includes(`${categoryId}:${subcategoryId}`);
  };

  const getSelectedCount = () => {
    return selectedCategories.length + selectedSubcategories.length;
  };

  const getCategoryName = (categoryId: string) => {
    return COMPONENT_CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getSubcategoryName = (fullId: string) => {
    const [catId, subId] = fullId.split(':');
    const category = COMPONENT_CATEGORIES.find(c => c.id === catId);
    return category?.subcategories.find(s => s.id === subId)?.name || subId;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Filter by category"
      >
        <Filter className="w-4 h-4" />
        <span>Category</span>
        {getSelectedCount() > 0 && (
          <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
            {getSelectedCount()}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-sm font-medium text-gray-700">Filter by Category</span>
            {getSelectedCount() > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="max-h-72 overflow-y-auto">
            {COMPONENT_CATEGORIES.map((category) => (
              <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                {/* Category Header */}
                <div className="flex items-center">
                  <button
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.id ? null : category.id
                    )}
                    className="p-2 hover:bg-gray-50"
                  >
                    {expandedCategory === category.id ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <label className="flex-1 flex items-center gap-2 py-2 pr-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-500">
                      ({category.subcategories.length})
                    </span>
                  </label>
                </div>

                {/* Subcategories */}
                {expandedCategory === category.id && (
                  <div className="bg-gray-50 py-1">
                    {category.subcategories.map((subcategory) => (
                      <label
                        key={subcategory.id}
                        className="flex items-center gap-2 px-8 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={isSubcategorySelected(category.id, subcategory.id)}
                          onChange={() => toggleSubcategory(category.id, subcategory.id)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{subcategory.name}</span>
                        {subcategory.applications && (
                          <span className="text-xs text-gray-400">
                            ({subcategory.applications.length})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Tags Display */}
      {getSelectedCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map(catId => (
            <span
              key={catId}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
            >
              {getCategoryName(catId)}
              <button
                onClick={() => toggleCategory(catId)}
                className="hover:bg-primary-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {selectedSubcategories.map(fullId => (
            <span
              key={fullId}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
            >
              {getSubcategoryName(fullId)}
              <button
                onClick={() => {
                  const [catId, subId] = fullId.split(':');
                  toggleSubcategory(catId, subId);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
