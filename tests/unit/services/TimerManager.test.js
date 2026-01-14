import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  TimerManager,
  timerManager,
} from "../../../src/services/TimerManager.js";

describe("TimerManager", () => {
  let manager;

  beforeEach(() => {
    manager = new TimerManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    manager.clearAll();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should initialize with empty timers map", () => {
      expect(manager.timers).toBeInstanceOf(Map);
      expect(manager.timers.size).toBe(0);
    });
  });

  describe("setTimer", () => {
    it("should set a one-shot timer", () => {
      const callback = vi.fn();
      manager.setTimer("test", callback, 1.0, false);

      expect(manager.isActive("test")).toBe(true);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should set a looping timer", () => {
      const callback = vi.fn();
      manager.setTimer("loop", callback, 0.5, true);

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(2);

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should replace existing timer with same name", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.setTimer("replace", callback1, 1.0);
      manager.setTimer("replace", callback2, 1.0);

      vi.advanceTimersByTime(1000);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it("should auto-cleanup one-shot timers after firing", () => {
      const callback = vi.fn();
      manager.setTimer("oneshot", callback, 0.5, false);

      expect(manager.isActive("oneshot")).toBe(true);
      vi.advanceTimersByTime(500);
      expect(manager.isActive("oneshot")).toBe(false);
    });

    it("should return true on success", () => {
      const result = manager.setTimer("test", vi.fn(), 1.0);
      expect(result).toBe(true);
    });
  });

  describe("clearTimer", () => {
    it("should clear an active timer", () => {
      const callback = vi.fn();
      manager.setTimer("clear", callback, 1.0);

      const result = manager.clearTimer("clear");
      expect(result).toBe(true);
      expect(manager.isActive("clear")).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(callback).not.toHaveBeenCalled();
    });

    it("should return false for non-existent timer", () => {
      const result = manager.clearTimer("nonexistent");
      expect(result).toBe(false);
    });

    it("should clear looping timer", () => {
      const callback = vi.fn();
      manager.setTimer("loop", callback, 0.5, true);

      vi.advanceTimersByTime(500);
      expect(callback).toHaveBeenCalledTimes(1);

      manager.clearTimer("loop");
      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("isActive", () => {
    it("should return true for active timer", () => {
      manager.setTimer("active", vi.fn(), 1.0);
      expect(manager.isActive("active")).toBe(true);
    });

    it("should return false for non-existent timer", () => {
      expect(manager.isActive("nonexistent")).toBe(false);
    });
  });

  describe("clearAll", () => {
    it("should clear all active timers", () => {
      manager.setTimer("timer1", vi.fn(), 1.0);
      manager.setTimer("timer2", vi.fn(), 2.0);
      manager.setTimer("timer3", vi.fn(), 0.5, true);

      expect(manager.getActiveCount()).toBe(3);

      manager.clearAll();

      expect(manager.getActiveCount()).toBe(0);
      expect(manager.isActive("timer1")).toBe(false);
      expect(manager.isActive("timer2")).toBe(false);
      expect(manager.isActive("timer3")).toBe(false);
    });
  });

  describe("getActiveCount", () => {
    it("should return correct count", () => {
      expect(manager.getActiveCount()).toBe(0);

      manager.setTimer("a", vi.fn(), 1.0);
      expect(manager.getActiveCount()).toBe(1);

      manager.setTimer("b", vi.fn(), 1.0);
      expect(manager.getActiveCount()).toBe(2);

      manager.clearTimer("a");
      expect(manager.getActiveCount()).toBe(1);
    });
  });

  describe("singleton", () => {
    it("should export a singleton instance", () => {
      expect(timerManager).toBeInstanceOf(TimerManager);
    });
  });
});
