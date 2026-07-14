import React, { useState, useMemo } from 'react';
import { useJobs } from '../hooks/useJobs';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ResultsCount from './ResultsCount';
import SortDropdown from './SortDropdown';
import JobGrid from './JobGrid';
import EmptyState from './EmptyState';
import JobDetailModal from './JobDetailModal';

export default function JobsPage() {
  const { jobs, isLoading, error, retry } = useJobs();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  
  // Sort State
  const [sortBy, setSortBy] = useState('newest');

  // Selected Job for Modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Dynamically extract unique categories and locations from the loaded dataset
  const { categories, locations } = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return { categories: [], locations: [] };
    }
    const cats = Array.from(new Set(jobs.map((job) => job.category)));
    const locs = Array.from(new Set(jobs.map((job) => job.location)));
    return { categories: cats, locations: locs };
  }, [jobs]);

  // Combined real-time filtering & sorting logic pipeline
  const processedJobs = useMemo(() => {
    if (!jobs) return [];

    // Step 1-4: Filter sequentially
    let result = jobs.filter((job) => {
      // 1. Text search (title and description - case-insensitive)
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(query);
        const matchDesc = job.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }

      // 2. Category match
      if (category) {
        if (job.category !== category) return false;
      }

      // 3. Location match
      if (location) {
        if (job.location !== location) return false;
      }

      // 4. Budget range matches (inclusive)
      if (minBudget) {
        const minVal = parseFloat(minBudget);
        if (!isNaN(minVal) && job.budget < minVal) return false;
      }
      if (maxBudget) {
        const maxVal = parseFloat(maxBudget);
        if (!isNaN(maxVal) && job.budget > maxVal) return false;
      }

      return true;
    });

    // Step 5: Sort the filtered result set
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.postedDate) - new Date(a.postedDate);
      }
      if (sortBy === 'budget_high') {
        return b.budget - a.budget;
      }
      if (sortBy === 'budget_low') {
        return a.budget - b.budget;
      }
      return 0;
    });

    return result;
  }, [jobs, search, category, location, minBudget, maxBudget, sortBy]);

  // Handler to clear all filter and search inputs
  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setLocation('');
    setMinBudget('');
    setMaxBudget('');
    setSortBy('newest');
  };

  const handleFilterChange = (key, value) => {
    if (key === 'category') setCategory(value);
    if (key === 'location') setLocation(value);
    if (key === 'minBudget') setMinBudget(value);
    if (key === 'maxBudget') setMaxBudget(value);
  };

  // If error simulation is triggered (SIMULATE_ERROR = true)
  if (error) {
    return (
      <section 
        className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-fade-in"
        aria-label="Error State"
      >
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
          ⚠️
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-500 max-w-md mb-8">
          We couldn't load the job listings. Please try again.
        </p>
        <button
          type="button"
          onClick={retry}
          className="px-6 py-3 font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md transition-all duration-150"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" aria-label="Job Openings Page">
      {/* Page Title & Intro */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Find Your Next Opportunity
        </h1>
        <p className="text-base text-slate-500 max-w-2xl">
          Browse verified local and remote jobs. Submit a proposal directly to employers in KES with escrow protection.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Filter panel (categories & locations dynamically compiled from mock data) */}
      <FilterPanel
        filters={{ category, location, minBudget, maxBudget }}
        onChange={handleFilterChange}
        categories={categories}
        locations={locations}
      />

      {/* Count & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 gap-4 border-t border-slate-100">
        <ResultsCount count={processedJobs.length} total={jobs.length} />
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Job Grid or Empty State */}
      {processedJobs.length === 0 && !isLoading ? (
        <EmptyState onClear={handleClearFilters} />
      ) : (
        <JobGrid 
          jobs={processedJobs} 
          isLoading={isLoading} 
          onApply={setSelectedJob} 
        />
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </section>
  );
}
