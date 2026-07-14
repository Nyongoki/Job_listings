import React from 'react';

export default function LocationFilter({ value, onChange, locations }) {
  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor="location-select" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Location
      </label>
      <select
        id="location-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
      >
        <option value="">All Locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
}
