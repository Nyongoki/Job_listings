import React from 'react';

export default function EmptyState({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      {/* Search Icon SVG */}
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-3xl mb-4 text-slate-400">
        🔍
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1">
        No jobs found
      </h3>
      
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        Try adjusting your filters, modifying your search term, or clearing all inputs.
      </p>
      
      <button
        type="button"
        onClick={onClear}
        className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm transition-all duration-150"
      >
        Clear Filters
      </button>
    </div>
  );
}
