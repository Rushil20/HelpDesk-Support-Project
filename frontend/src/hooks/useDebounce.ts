import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a fast-changing value (e.g., search text input).
 * Updates and returns the debounced value only after the specified delay has passed
 * without new changes.
 *
 * @param value The value to debounce
 * @param delay Delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

