import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../../../src/utils/debounce.js";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delay function execution", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should cancel previous calls when called multiple times", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("call1");
    vi.advanceTimersByTime(50);
    debounced("call2");
    vi.advanceTimersByTime(50);
    debounced("call3");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("call3");
  });

  it("should pass arguments correctly", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("arg1", "arg2", "arg3");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  it("should handle multiple separate debounce chains", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    // First chain
    debounced("first");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("first");

    // Second chain
    fn.mockClear();
    debounced("second");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("should work with zero delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 0);

    debounced();
    vi.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should preserve the latest arguments when rapidly called", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    for (let i = 0; i < 10; i++) {
      debounced(i);
      vi.advanceTimersByTime(50);
    }

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(9);
  });
});
