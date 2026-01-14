import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { BaseController } from "../../../src/ui/BaseController.js";

// Test implementation
class TestController extends BaseController {
  constructor(app) {
    super(app);
  }
}

describe("BaseController", () => {
  let controller;
  let mockApp;
  let mockElement;

  beforeEach(() => {
    mockApp = { graph: {}, variables: new Map() };
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    controller = new TestController(mockApp);
  });

  describe("constructor", () => {
    it("should store app reference", () => {
      expect(controller.app).toBe(mockApp);
    });

    it("should initialize empty listeners array", () => {
      expect(controller.listeners).toBeInstanceOf(Array);
      expect(controller.listeners.length).toBe(0);
    });

    it("should initialize empty timers array", () => {
      expect(controller.timers).toBeInstanceOf(Array);
      expect(controller.timers.length).toBe(0);
    });

    it("should initialize empty intervals array", () => {
      expect(controller.intervals).toBeInstanceOf(Array);
      expect(controller.intervals.length).toBe(0);
    });
  });

  describe("addListener", () => {
    it("should add event listener to element", () => {
      const handler = vi.fn();
      controller.addListener(mockElement, "click", handler);

      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        "click",
        handler,
        {}
      );
    });

    it("should track listener for cleanup", () => {
      const handler = vi.fn();
      controller.addListener(mockElement, "click", handler);

      expect(controller.listeners.length).toBe(1);
    });

    it("should handle null element gracefully", () => {
      const handler = vi.fn();
      // Should not throw
      controller.addListener(null, "click", handler);
      expect(controller.listeners.length).toBe(0);
    });
  });

  describe("addListeners", () => {
    it("should add multiple listeners", () => {
      controller.addListeners(mockElement, {
        click: vi.fn(),
        keydown: vi.fn(),
      });

      expect(mockElement.addEventListener).toHaveBeenCalledTimes(2);
      expect(controller.listeners.length).toBe(2);
    });
  });

  describe("addTimeout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should call callback after delay", () => {
      const callback = vi.fn();
      controller.addTimeout(callback, 100);

      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should track timer for cleanup", () => {
      controller.addTimeout(vi.fn(), 100);
      expect(controller.timers.length).toBe(1);
    });

    it("should auto-remove timer after execution", () => {
      controller.addTimeout(vi.fn(), 100);
      expect(controller.timers.length).toBe(1);

      vi.advanceTimersByTime(100);
      expect(controller.timers.length).toBe(0);
    });
  });

  describe("addInterval", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should call callback repeatedly", () => {
      const callback = vi.fn();
      controller.addInterval(callback, 50);

      vi.advanceTimersByTime(150);
      expect(callback).toHaveBeenCalledTimes(3);
    });

    it("should track interval for cleanup", () => {
      controller.addInterval(vi.fn(), 100);
      expect(controller.intervals.length).toBe(1);
    });
  });

  describe("cleanup", () => {
    it("should remove all event listeners", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      controller.addListener(mockElement, "click", handler1);
      controller.addListener(mockElement, "keydown", handler2);

      controller.cleanup();

      expect(mockElement.removeEventListener).toHaveBeenCalled();
    });

    it("should clear listeners array", () => {
      controller.addListener(mockElement, "click", vi.fn());
      controller.cleanup();
      expect(controller.listeners.length).toBe(0);
    });

    it("should clear all timers and intervals", () => {
      vi.useFakeTimers();
      controller.addTimeout(vi.fn(), 1000);
      controller.addInterval(vi.fn(), 500);

      expect(controller.timers.length).toBe(1);
      expect(controller.intervals.length).toBe(1);

      controller.cleanup();

      expect(controller.timers.length).toBe(0);
      expect(controller.intervals.length).toBe(0);
      vi.useRealTimers();
    });
  });

  describe("getStats", () => {
    it("should return statistics object", () => {
      controller.addListener(mockElement, "click", vi.fn());
      const stats = controller.getStats();

      expect(stats.listeners).toBe(1);
      expect(stats.timers).toBe(0);
      expect(stats.intervals).toBe(0);
    });
  });
});
