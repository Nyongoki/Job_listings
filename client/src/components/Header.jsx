import React from 'react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo brand */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              HomelandJobs
            </span>
          </div>
          
          {/* Navigation links */}
          <nav className="flex space-x-8 items-center" aria-label="Main Navigation">
            <a 
              href="#" 
              className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors duration-150"
            >
              Home
            </a>
            <a 
              href="#" 
              className="text-primary-600 border-b-2 border-primary-500 font-semibold text-sm h-16 flex items-center"
            >
              Jobs
            </a>
            <a 
              href="#" 
              className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors duration-150"
            >
              Post a Job
            </a>
            <a 
              href="#" 
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-sm transition-all duration-150 hover:shadow"
            >
              Sign In
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
