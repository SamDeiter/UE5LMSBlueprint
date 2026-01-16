import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventBus, AppEvents } from "../../../src/core/EventBus.js";

/**
 * EventBus Unit Tests
 *
 * Tests pub/sub event system functionality.
 */

describe("EventBus", () => {
  beforeEach(() => {
    // Clear all listeners before each test
    EventBus.clear();
  });

  describe("on()", () => {
    it("should subscribe to an event", () => {
      const callback = vi.fn();
      EventBus.on("test:event", callback);

      EventBus.emit("test:event", { data: "test" });

      expect(callback).toHaveBeenCalledWith({ data: "test" });
    });

    it("should allow multiple subscribers", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      EventBus.on("test:event", callback1);
      EventBus.on("test:event", callback2);
      EventBus.emit("test:event");

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should return an unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = EventBus.on("test:event", callback);

      unsubscribe();
      EventBus.emit("test:event");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("once()", () => {
    it("should only fire callback once", () => {
      const callback = vi.fn();
      EventBus.once("test:event", callback);

      EventBus.emit("test:event");
      EventBus.emit("test:event");
      EventBus.emit("test:event");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should receive event data", () => {
      const callback = vi.fn();
      EventBus.once("test:event", callback);

      EventBus.emit("test:event", { value: 42 });

      expect(callback).toHaveBeenCalledWith({ value: 42 });
    });
  });

  describe("off()", () => {
    it("should unsubscribe a callback", () => {
      const callback = vi.fn();
      EventBus.on("test:event", callback);

      EventBus.off("test:event", callback);
      EventBus.emit("test:event");

      expect(callback).not.toHaveBeenCalled();
    });

    it("should only remove the specified callback", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      EventBus.on("test:event", callback1);
      EventBus.on("test:event", callback2);
      EventBus.off("test:event", callback1);
      EventBus.emit("test:event");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe("emit()", () => {
    it("should emit event with data", () => {
      const callback = vi.fn();
      EventBus.on("test:event", callback);

      EventBus.emit("test:event", { id: 123, name: "test" });

      expect(callback).toHaveBeenCalledWith({ id: 123, name: "test" });
    });

    it("should emit event without data", () => {
      const callback = vi.fn();
      EventBus.on("test:event", callback);

      EventBus.emit("test:event");

      expect(callback).toHaveBeenCalledWith(null);
    });

    it("should not throw if no listeners", () => {
      expect(() => EventBus.emit("nonexistent:event")).not.toThrow();
    });

    it("should catch errors in listeners", () => {
      const errorCallback = vi.fn(() => {
        throw new Error("Test error");
      });
      const normalCallback = vi.fn();

      EventBus.on("test:event", errorCallback);
      EventBus.on("test:event", normalCallback);

      expect(() => EventBus.emit("test:event")).not.toThrow();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe("clear()", () => {
    it("should clear specific event listeners", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      EventBus.on("event1", callback1);
      EventBus.on("event2", callback2);
      EventBus.clear("event1");

      EventBus.emit("event1");
      EventBus.emit("event2");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should clear all listeners when no event specified", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      EventBus.on("event1", callback1);
      EventBus.on("event2", callback2);
      EventBus.clear();

      EventBus.emit("event1");
      EventBus.emit("event2");

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe("listenerCount()", () => {
    it("should return count for specific event", () => {
      EventBus.on("test:event", vi.fn());
      EventBus.on("test:event", vi.fn());
      EventBus.once("test:event", vi.fn());

      expect(EventBus.listenerCount("test:event")).toBe(3);
    });

    it("should return 0 for event with no listeners", () => {
      expect(EventBus.listenerCount("nonexistent")).toBe(0);
    });

    it("should return total count when no event specified", () => {
      EventBus.on("event1", vi.fn());
      EventBus.on("event2", vi.fn());
      EventBus.on("event2", vi.fn());

      expect(EventBus.listenerCount()).toBe(3);
    });
  });

  describe("AppEvents constants", () => {
    it("should have graph events", () => {
      expect(AppEvents.GRAPH_SWITCHED).toBe("graph:switched");
      expect(AppEvents.GRAPH_SAVED).toBe("graph:saved");
      expect(AppEvents.GRAPH_LOADED).toBe("graph:loaded");
    });

    it("should have node events", () => {
      expect(AppEvents.NODE_ADDED).toBe("node:added");
      expect(AppEvents.NODE_DELETED).toBe("node:deleted");
      expect(AppEvents.NODE_SELECTED).toBe("node:selected");
    });

    it("should have simulation events", () => {
      expect(AppEvents.SIM_STARTED).toBe("sim:started");
      expect(AppEvents.SIM_PAUSED).toBe("sim:paused");
      expect(AppEvents.SIM_STOPPED).toBe("sim:stopped");
    });
  });
});
