import React from 'react';
import Header from './components/Header';
import JobsPage from './components/JobsPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Sticky Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow">
        <JobsPage />
      </main>

      {/* Semantic Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-16" aria-label="Global Footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            &copy; 2026 HomelandHub.org. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-slate-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
