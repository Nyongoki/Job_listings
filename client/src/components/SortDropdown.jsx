import React from 'react';

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-select" className="text-sm text-slate-500 font-medium whitespace-nowrap">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
      >
        <option value="newest">Newest</option>
        <option value="budget_high">Budget High–Low</option>
        <option value="budget_low">Budget Low–High</option>
      </select>
    </div>
  );
}
