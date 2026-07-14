import { useState, useEffect, useCallback } from 'react';
import { mockJobs } from '../data/jobs';

// Set this to true to simulate database/API connection errors for testing purposes
const SIMULATE_ERROR = false;

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setJobs([]);

    // Simulate network delay of 1.5 seconds
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        setError(new Error("Failed to load job listings. Please try again."));
        setIsLoading(false);
      } else {
        setJobs(mockJobs);
        setIsLoading(false);
      }
    }, 1500);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    isLoading,
    error,
    retry: fetchJobs
  };
}
