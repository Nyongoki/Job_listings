import React, { useState, useRef } from 'react';

export default function ProposalForm({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedBudget, setProposedBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // References for focus management
  const firstInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate Cover Letter: Required, Min 100 chars
    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required.";
    } else if (coverLetter.trim().length < 100) {
      newErrors.coverLetter = `Cover letter must be at least 100 characters. Current: ${coverLetter.length} / 100.`;
    }

    // Validate Proposed Budget: Required, > 0
    const budgetNum = parseFloat(proposedBudget);
    if (!proposedBudget) {
      newErrors.proposedBudget = "Proposed budget is required.";
    } else if (isNaN(budgetNum) || budgetNum <= 0) {
      newErrors.proposedBudget = "Budget must be greater than 0.";
    }

    // Validate Timeline: Required, between 1 and 365
    const timelineNum = parseInt(timeline, 10);
    if (!timeline) {
      newErrors.timeline = "Timeline is required.";
    } else if (isNaN(timelineNum) || timelineNum < 1 || timelineNum > 365) {
      newErrors.timeline = "Timeline must be between 1 and 365 days.";
    }

    // Validate Portfolio URL: Optional, must be valid URL
    if (portfolioUrl.trim()) {
      try {
        new URL(portfolioUrl);
      } catch (err) {
        newErrors.portfolioUrl = "Please provide a valid URL (e.g. https://myportfolio.com).";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors if any
    setErrors({});
    setIsSubmitting(true);

    // Simulate API call with 800ms delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-emerald-50 rounded-2xl border border-emerald-100 h-full animate-fade-in">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mb-4 shadow-sm">
          ✓
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Proposal submitted successfully!
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mb-6">
          We'll notify you when the employer responds.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all duration-150 shadow-sm"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h3 className="text-lg font-bold text-slate-800">Submit a Proposal</h3>
      <p className="text-xs text-slate-400">
        Apply for the position at <span className="font-semibold text-slate-600">{job.employer}</span>
      </p>

      {/* Cover Letter Field */}
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between items-center">
          <label htmlFor="cover-letter" className="text-xs font-bold text-slate-600">
            Cover Letter *
          </label>
          <span className={`text-xs ${coverLetter.length >= 100 ? 'text-slate-400' : 'text-amber-600 font-medium'}`}>
            {coverLetter.length} / 100 min
          </span>
        </div>
        <textarea
          id="cover-letter"
          ref={firstInputRef}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows="4"
          placeholder="Describe your relevant skills, experience, and why you are the best fit for this project..."
          className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 ${
            errors.coverLetter ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
          }`}
          tabIndex="1"
          required
        />
        {errors.coverLetter && (
          <span className="text-xs text-red-500 font-semibold" role="alert">
            {errors.coverLetter}
          </span>
        )}
      </div>

      {/* Proposed Budget Field */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="proposed-budget" className="text-xs font-bold text-slate-600">
          Proposed Budget (KES) *
        </label>
        <input
          type="number"
          id="proposed-budget"
          value={proposedBudget}
          onChange={(e) => setProposedBudget(e.target.value)}
          placeholder={`Job Budget: KES ${job.budget.toLocaleString()}`}
          className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 ${
            errors.proposedBudget ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
          }`}
          tabIndex="2"
          min="1"
          required
        />
        {errors.proposedBudget && (
          <span className="text-xs text-red-500 font-semibold" role="alert">
            {errors.proposedBudget}
          </span>
        )}
      </div>

      {/* Timeline Field */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="timeline" className="text-xs font-bold text-slate-600">
          Timeline (days) *
        </label>
        <input
          type="number"
          id="timeline"
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          placeholder="e.g. 14 days"
          className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 ${
            errors.timeline ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
          }`}
          tabIndex="3"
          min="1"
          max="365"
          required
        />
        {errors.timeline && (
          <span className="text-xs text-red-500 font-semibold" role="alert">
            {errors.timeline}
          </span>
        )}
      </div>

      {/* Portfolio URL Field */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="portfolio-url" className="text-xs font-bold text-slate-600">
          Portfolio URL (Optional)
        </label>
        <input
          type="url"
          id="portfolio-url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://myportfolio.com"
          className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150 ${
            errors.portfolioUrl ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
          }`}
          tabIndex="4"
        />
        {errors.portfolioUrl && (
          <span className="text-xs text-red-500 font-semibold" role="alert">
            {errors.portfolioUrl}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center space-x-2"
        tabIndex="5"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit Proposal</span>
        )}
      </button>
    </form>
  );
}
