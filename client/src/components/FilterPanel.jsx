import React from 'react';
import CategoryFilter from './CategoryFilter';
import LocationFilter from './LocationFilter';
import BudgetRangeFilter from './BudgetRangeFilter';

export default function FilterPanel({ filters, onChange, categories, locations }) {
  const handleBudgetChange = (key, value) => {
    onChange(key, value);
  };

  const handleFilterChange = (key, value) => {
    onChange(key, value);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-6 md:items-end">
      <div className="flex-1">
        <CategoryFilter
          value={filters.category}
          onChange={(val) => handleFilterChange('category', val)}
          categories={categories}
        />
      </div>
      
      <div className="flex-1">
        <LocationFilter
          value={filters.location}
          onChange={(val) => handleFilterChange('location', val)}
          locations={locations}
        />
      </div>
      
      <div className="flex-1">
        <BudgetRangeFilter
          minBudget={filters.minBudget}
          maxBudget={filters.maxBudget}
          onChange={handleBudgetChange}
        />
      </div>
    </div>
  );
}
