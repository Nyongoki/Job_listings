import React from 'react';

export default function ResultsCount({ count, total }) {
  return (
    <p className="text-sm text-slate-500 font-medium" id="results-count">
      Showing <span className="text-slate-800 font-semibold">{count}</span> of{' '}
      <span className="text-slate-800 font-semibold">{total}</span> jobs
    </p>
  );
}
