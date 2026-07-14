import React from 'react';

// Format helper to convert '2026-07-08' to '8 Jul 2026'
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Format helper for currency: 85000 -> 'KES 85,000'
const formatBudget = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('KES', 'KES ');
};

export default function JobCard({ job, onApply }) {
  return (
    <article className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between h-72 hover:-translate-y-0.5">
      <div>
        {/* Title and Rating Line */}
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
            {job.title}
          </h3>
          <div className="flex items-center text-amber-500 text-xs font-semibold shrink-0 ml-2" aria-label={`Employer rating: ${job.employerRating} stars`}>
            <span className="mr-0.5">⭐</span>
            <span>{job.employerRating.toFixed(1)}</span>
          </div>
        </div>
        
        {/* Employer and Budget */}
        <p className="text-sm font-medium text-slate-500 mb-3">{job.employer}</p>
        
        <p className="text-xl font-extrabold text-primary-600 mb-4">
          {formatBudget(job.budget)}
        </p>
        
        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4 max-h-16 overflow-hidden">
          {job.skills.map((skill) => (
            <span 
              key={skill} 
              className="px-2.5 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full border border-primary-100"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      {/* Footer Info & Apply Button */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-100 shrink-0">
        <div className="text-xs text-slate-400 space-y-0.5">
          <div className="flex items-center space-x-1">
            <span>📍</span>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <time dateTime={job.postedDate}>{formatDate(job.postedDate)}</time>
            <span>•</span>
            <span>{job.proposalCount} proposals</span>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => onApply(job)}
          className="px-4 py-2 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-150 shadow-sm"
        >
          Apply
        </button>
      </div>
    </article>
  );
}
