import React from 'react';

export default function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-72 animate-pulse">
      <div>
        {/* Title and Rating Line */}
        <div className="flex justify-between items-start mb-2">
          <div className="h-5 bg-slate-200 rounded w-2/3"></div>
          <div className="h-4 bg-slate-200 rounded w-12"></div>
        </div>
        
        {/* Employer and Budget */}
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        
        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className="h-6 bg-slate-200 rounded-full w-14"></div>
          <div className="h-6 bg-slate-200 rounded-full w-16"></div>
          <div className="h-6 bg-slate-200 rounded-full w-12"></div>
        </div>
      </div>
      
      {/* Footer Info & Apply Button */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-50">
        <div className="space-y-1 w-1/3">
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 rounded w-3/4"></div>
        </div>
        <div className="h-9 bg-slate-200 rounded-lg w-20"></div>
      </div>
    </div>
  );
}
