import { useState, useEffect } from 'react';

/**
 * Shows loading state only after a delay to prevent flash of loading indicator.
 * @param isLoading - actual loading state
 * @param delay - milliseconds to wait before showing loading (default 500ms)
 */
export function useDelayedLoading(isLoading: boolean, delay = 500): boolean {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowLoading(true), delay);
      return () => clearTimeout(timer);
    }
    setShowLoading(false);
  }, [isLoading, delay]);

  return showLoading;
}
