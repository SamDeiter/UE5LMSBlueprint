import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../../../src/utils/throttle.js";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should execute immediately on first call", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("should ignore calls within the throttle period", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("call1");
    throttled("call2");
    throttled("call3");

    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("call1");
  });

  it("should allow execution after throttle period expires", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("call1");
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);

    throttled("call2");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, "call1");
    expect(fn).toHaveBeenNthCalledWith(2, "call2");
  });

  it("should pass arguments correctly", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("arg1", "arg2", "arg3");
    expect(fn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  it("should handle rapid successive calls", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    // First call executes immediately
    throttled(0);
    expect(fn).toHaveBeenCalledTimes(1);

    // Next 9 calls are throttled
    for (let i = 1; i < 10; i++) {
      throttled(i);
    }
    expect(fn).toHaveBeenCalledTimes(1);

    // After period, next call executes
    vi.advanceTimersByTime(100);
    throttled(10);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(2, 10);
  });

  it("should work with zero limit", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 0);

    throttled();
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(0);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should maintain separate throttle states for different throttled functions", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const throttled1 = throttle(fn1, 100);
    const throttled2 = throttle(fn2, 100);

    throttled1("fn1-call1");
    throttled2("fn2-call1");

    expect(fn1).toHaveBeenCalledWith("fn1-call1");
    expect(fn2).toHaveBeenCalledWith("fn2-call1");

    throttled1("fn1-call2");
    throttled2("fn2-call2");

    // Both should be throttled
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});
