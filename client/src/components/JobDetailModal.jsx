import React, { useEffect, useRef } from 'react';
import ProposalForm from './ProposalForm';

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

// Format helper for currency
const formatBudget = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('KES', 'KES ');
};

export default function JobDetailModal({ job, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Accessibility: Focus trap within modal elements
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: loop back to end if focus is on first element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: loop to start if focus is on last element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Save focused element to restore focus when modal closes
    const previousActiveElement = document.activeElement;
    
    // Set initial focus to the cover letter textarea (which has tabIndex=1)
    setTimeout(() => {
      const firstInput = modalRef.current?.querySelector('#cover-letter');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    // Close modal only if clicking the background mask
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-modal-scale"
      >
        {/* Left Side: Job Info */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-50 border-r border-slate-100 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-none">
          <div className="space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full border border-primary-100">
                  {job.category}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium flex items-center">
                  📍 {job.location}
                </span>
              </div>
              
              <h2 id="modal-title" className="text-2xl font-bold text-slate-800 leading-tight">
                {job.title}
              </h2>
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-sm font-semibold text-slate-600">{job.employer}</span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center text-amber-500 text-sm font-semibold" aria-label={`Employer rating: ${job.employerRating} stars`}>
                  <span className="mr-0.5">⭐</span>
                  <span>{job.employerRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Job Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
            
            {/* Skills required */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Metadata Block */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 shrink-0">
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                BUDGET
              </span>
              <span className="text-lg font-extrabold text-primary-600">
                {formatBudget(job.budget)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium block">
                DEADLINE
              </span>
              <span className="text-sm font-semibold text-slate-700">
                {formatDate(job.deadline)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Side: Proposal Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[45vh] md:max-h-none relative">
          {/* Close button inside modal body */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors duration-150"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <ProposalForm job={job} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
