import React from 'react';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';

export default function JobGrid({ jobs, isLoading, onApply }) {
  if (isLoading) {
    return (
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-label="Loading job listings"
      >
        {Array.from({ length: 6 }).map((_, idx) => (
          <JobCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onApply={onApply} 
        />
      ))}
    </div>
  );
}
