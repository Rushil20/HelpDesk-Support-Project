import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 400));
    expect(result.current).toBe("initial");
  });

  it("should not update debounced value before the delay period", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 400 },
      }
    );

    rerender({ value: "second", delay: 400 });

    // Advance by less than delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Still holds the original value
    expect(result.current).toBe("first");
  });

  it("should update debounced value after the delay has passed", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "first", delay: 400 },
      }
    );

    rerender({ value: "second", delay: 400 });

    // Advance beyond delay
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(result.current).toBe("second");
  });

  it("should reset the timer when value changes rapidly within delay window", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "term-1", delay: 300 },
      }
    );

    // Keystroke 1 at t=100ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "term-2", delay: 300 });

    // Keystroke 2 at t=200ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "term-3", delay: 300 });

    // Keystroke 3 at t=300ms
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ value: "final-term", delay: 300 });

    // At this point (300ms total elapsed, but only 0ms since last keystroke)
    expect(result.current).toBe("term-1");

    // Advance 299ms after last keystroke
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe("term-1");

    // Advance 1ms more to complete 300ms since last change
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("final-term");
  });
});

