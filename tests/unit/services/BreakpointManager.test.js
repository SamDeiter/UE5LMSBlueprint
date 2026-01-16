import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * BreakpointManager Unit Tests
 *
 * Tests breakpoint management for Blueprint debugging.
 */

// Mock sessionStorage
const mockSessionStorage = {
  data: {},
  getItem: vi.fn((key) => mockSessionStorage.data[key] || null),
  setItem: vi.fn((key, value) => {
    mockSessionStorage.data[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete mockSessionStorage.data[key];
  }),
  clear: vi.fn(() => {
    mockSessionStorage.data = {};
  }),
};

vi.stubGlobal("sessionStorage", mockSessionStorage);

// Import after mocks
import { BreakpointManager } from "../../../src/services/BreakpointManager.js";

describe("BreakpointManager", () => {
  let manager;

  beforeEach(() => {
    mockSessionStorage.data = {};
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    manager = new BreakpointManager();
  });

  describe("constructor", () => {
    it("should initialize with empty breakpoints", () => {
      expect(manager.breakpoints).toBeInstanceOf(Map);
    });

    it("should call loadFromSession", () => {
      expect(mockSessionStorage.getItem).toHaveBeenCalled();
    });
  });

  describe("addBreakpoint", () => {
    it("should add a new breakpoint", () => {
      manager.addBreakpoint("node-1");

      expect(manager.hasBreakpoint("node-1")).toBe(true);
    });

    it("should set breakpoint as enabled by default", () => {
      manager.addBreakpoint("node-1");

      expect(manager.isEnabled("node-1")).toBe(true);
    });

    it("should initialize hitCount to 0", () => {
      manager.addBreakpoint("node-1");

      const bp = manager.getBreakpoint("node-1");
      expect(bp.hitCount).toBe(0);
    });

    it("should save to session after adding", () => {
      manager.addBreakpoint("node-1");

      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });

    it("should not overwrite existing breakpoint", () => {
      manager.addBreakpoint("node-1");
      const created = manager.getBreakpoint("node-1").createdAt;

      manager.addBreakpoint("node-1");

      expect(manager.getBreakpoint("node-1").createdAt).toBe(created);
    });
  });

  describe("removeBreakpoint", () => {
    it("should remove an existing breakpoint", () => {
      manager.addBreakpoint("node-1");

      manager.removeBreakpoint("node-1");

      expect(manager.hasBreakpoint("node-1")).toBe(false);
    });

    it("should save to session after removing", () => {
      manager.addBreakpoint("node-1");
      mockSessionStorage.setItem.mockClear();

      manager.removeBreakpoint("node-1");

      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("toggleEnabled", () => {
    it("should disable an enabled breakpoint", () => {
      manager.addBreakpoint("node-1");

      manager.toggleEnabled("node-1");

      expect(manager.isEnabled("node-1")).toBe(false);
    });

    it("should enable a disabled breakpoint", () => {
      manager.addBreakpoint("node-1");
      manager.toggleEnabled("node-1"); // disable

      manager.toggleEnabled("node-1"); // enable

      expect(manager.isEnabled("node-1")).toBe(true);
    });
  });

  describe("toggleBreakpoint", () => {
    it("should add breakpoint if not exists", () => {
      manager.toggleBreakpoint("node-1");

      expect(manager.hasBreakpoint("node-1")).toBe(true);
    });

    it("should remove breakpoint if exists", () => {
      manager.addBreakpoint("node-1");

      manager.toggleBreakpoint("node-1");

      expect(manager.hasBreakpoint("node-1")).toBe(false);
    });
  });

  describe("hasBreakpoint", () => {
    it("should return true for existing breakpoint", () => {
      manager.addBreakpoint("node-1");

      expect(manager.hasBreakpoint("node-1")).toBe(true);
    });

    it("should return false for non-existent breakpoint", () => {
      expect(manager.hasBreakpoint("node-999")).toBe(false);
    });
  });

  describe("shouldBreak", () => {
    it("should return true for enabled breakpoint", () => {
      manager.addBreakpoint("node-1");

      expect(manager.shouldBreak("node-1")).toBe(true);
    });

    it("should return false for disabled breakpoint", () => {
      manager.addBreakpoint("node-1");
      manager.toggleEnabled("node-1");

      expect(manager.shouldBreak("node-1")).toBe(false);
    });

    it("should increment hitCount", () => {
      manager.addBreakpoint("node-1");

      manager.shouldBreak("node-1");
      manager.shouldBreak("node-1");

      expect(manager.getBreakpoint("node-1").hitCount).toBe(2);
    });
  });

  describe("getAllBreakpoints", () => {
    it("should return array of all breakpoints", () => {
      manager.addBreakpoint("node-1");
      manager.addBreakpoint("node-2");

      const all = manager.getAllBreakpoints();

      expect(all.length).toBe(2);
    });

    it("should include nodeId in each entry", () => {
      manager.addBreakpoint("node-1");

      const all = manager.getAllBreakpoints();

      expect(all[0].nodeId).toBe("node-1");
    });
  });

  describe("clearAll", () => {
    it("should remove all breakpoints", () => {
      manager.addBreakpoint("node-1");
      manager.addBreakpoint("node-2");

      manager.clearAll();

      expect(manager.getAllBreakpoints().length).toBe(0);
    });
  });

  describe("getEnabledCount", () => {
    it("should count enabled breakpoints", () => {
      manager.addBreakpoint("node-1");
      manager.addBreakpoint("node-2");
      manager.addBreakpoint("node-3");
      manager.toggleEnabled("node-2");

      expect(manager.getEnabledCount()).toBe(2);
    });
  });

  describe("getStats", () => {
    it("should return stats object", () => {
      manager.addBreakpoint("node-1");
      manager.addBreakpoint("node-2");
      manager.toggleEnabled("node-2");
      manager.shouldBreak("node-1");

      const stats = manager.getStats();

      expect(stats.total).toBe(2);
      expect(stats.enabled).toBe(1);
      expect(stats.disabled).toBe(1);
      expect(stats.totalHits).toBe(1);
    });
  });
});
