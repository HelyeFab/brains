import { useEffect, useRef, useState } from 'react';

export type PollRate = 'fast' | 'normal' | 'slow';

export interface AdaptivePollingConfig {
  /**
   * Initial poll rate (default: 'normal')
   */
  initialRate?: PollRate;

  /**
   * Whether to automatically pause when widget is inactive (default: true)
   */
  pauseWhenInactive?: boolean;

  /**
   * Whether widget is currently active (default: true)
   */
  isActive?: boolean;

  /**
   * Custom poll intervals in milliseconds
   */
  intervals?: {
    fast?: number;
    normal?: number;
    slow?: number;
  };
}

const DEFAULT_INTERVALS = {
  fast: 250, // 4 times per second
  normal: 1000, // Once per second
  slow: 5000, // Once every 5 seconds
};

/**
 * Hook for adaptive polling that adjusts poll rates based on activity
 * and provides user control over polling frequency
 */
export function useAdaptivePolling(config: AdaptivePollingConfig = {}) {
  const {
    initialRate = 'normal',
    pauseWhenInactive = true,
    isActive = true,
    intervals = DEFAULT_INTERVALS,
  } = config;

  const [pollRate, setPollRate] = useState<PollRate>(initialRate);
  const [isPaused, setIsPaused] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Merge custom intervals with defaults
  const mergedIntervals = {
    ...DEFAULT_INTERVALS,
    ...intervals,
  };

  /**
   * Get current poll interval in milliseconds
   */
  const getCurrentInterval = (): number => {
    if (isPaused) return 0;
    return mergedIntervals[pollRate];
  };

  /**
   * Resume polling
   */
  const resume = () => {
    setIsPaused(false);
    lastActivityRef.current = Date.now();
  };

  /**
   * Pause polling
   */
  const pause = () => {
    setIsPaused(true);
  };

  /**
   * Toggle between paused and active
   */
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  /**
   * Change poll rate
   */
  const changePollRate = (rate: PollRate) => {
    setPollRate(rate);
    lastActivityRef.current = Date.now();
  };

  /**
   * Record user activity (resets inactivity timer)
   */
  const recordActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Auto-pause when widget becomes inactive
  useEffect(() => {
    if (pauseWhenInactive && !isActive) {
      pause();
    } else if (pauseWhenInactive && isActive && isPaused) {
      resume();
    }
  }, [isActive, pauseWhenInactive]);

  // Auto-adjust poll rate based on inactivity (optional feature)
  useEffect(() => {
    if (isPaused) return;

    const checkActivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;

      // After 30 seconds of inactivity, slow down to 'slow' rate
      if (inactiveTime > 30000 && pollRate === 'normal') {
        setPollRate('slow');
      }
      // After 60 seconds, pause entirely
      else if (inactiveTime > 60000 && !isPaused) {
        setIsPaused(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkActivity);
  }, [isPaused, pollRate]);

  return {
    pollRate,
    isPaused,
    interval: getCurrentInterval(),
    setPollRate: changePollRate,
    pause,
    resume,
    togglePause,
    recordActivity,
  };
}

/**
 * Hook for throttled updates (useful for CPU core displays)
 * Only updates at the specified interval even if data changes more frequently
 */
export function useThrottledValue<T>(value: T, throttleMs: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= throttleMs) {
      setThrottledValue(value);
      lastUpdateRef.current = now;
    } else {
      // Schedule update for remaining time
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdateRef.current = Date.now();
      }, throttleMs - timeSinceLastUpdate);

      return () => clearTimeout(timeoutId);
    }
  }, [value, throttleMs]);

  return throttledValue;
}
