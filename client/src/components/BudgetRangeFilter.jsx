import React from 'react';

export default function BudgetRangeFilter({ minBudget, maxBudget, onChange }) {
  const handleMinChange = (e) => {
    onChange('minBudget', e.target.value);
  };

  const handleMaxChange = (e) => {
    onChange('maxBudget', e.target.value);
  };

  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Budget Range (KES)
      </span>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="number"
            id="min-budget"
            placeholder="Min KES"
            value={minBudget}
            onChange={handleMinChange}
            min="0"
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
            aria-label="Minimum budget in KES"
          />
        </div>
        <span className="text-slate-400 text-sm">-</span>
        <div className="relative flex-1">
          <input
            type="number"
            id="max-budget"
            placeholder="Max KES"
            value={maxBudget}
            onChange={handleMaxChange}
            min="0"
            className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
            aria-label="Maximum budget in KES"
          />
        </div>
      </div>
    </div>
  );
}
