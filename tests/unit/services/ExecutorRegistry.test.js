import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExecutorRegistry } from "../../../src/services/executors/ExecutorRegistry.js";

describe("ExecutorRegistry", () => {
  let registry;
  let mockEngine;

  beforeEach(() => {
    mockEngine = { app: {} };
    registry = new ExecutorRegistry(mockEngine);
  });

  describe("constructor", () => {
    it("should store engine reference", () => {
      expect(registry.engine).toBe(mockEngine);
    });

    it("should initialize with empty executors map", () => {
      expect(registry.executors).toBeInstanceOf(Map);
      expect(registry.executors.size).toBe(0);
    });

    it("should initialize with empty pattern executors array", () => {
      expect(registry.patternExecutors).toBeInstanceOf(Array);
      expect(registry.patternExecutors.length).toBe(0);
    });
  });

  describe("register", () => {
    it("should register an executor by key", () => {
      const mockExecutor = { execute: vi.fn() };
      registry.register("TestNode", mockExecutor);
      expect(registry.executors.get("TestNode")).toBe(mockExecutor);
    });

    it("should overwrite existing executor for same key", () => {
      const executor1 = { execute: vi.fn() };
      const executor2 = { execute: vi.fn() };
      registry.register("TestNode", executor1);
      registry.register("TestNode", executor2);
      expect(registry.executors.get("TestNode")).toBe(executor2);
    });
  });

  describe("registerPattern", () => {
    it("should register a pattern-based executor", () => {
      const mockExecutor = { execute: vi.fn() };
      registry.registerPattern(/^Get_/, mockExecutor);
      expect(registry.patternExecutors.length).toBe(1);
    });

    it("should allow multiple pattern registrations", () => {
      const executor1 = { execute: vi.fn() };
      const executor2 = { execute: vi.fn() };
      registry.registerPattern(/^Get_/, executor1);
      registry.registerPattern(/^Set_/, executor2);
      expect(registry.patternExecutors.length).toBe(2);
    });
  });

  describe("getExecutor", () => {
    it("should return exact match executor first", () => {
      const exactExecutor = { execute: vi.fn(), name: "exact" };
      const patternExecutor = { execute: vi.fn(), name: "pattern" };
      registry.register("Get_Health", exactExecutor);
      registry.registerPattern(/^Get_/, patternExecutor);
      expect(registry.getExecutor("Get_Health")).toBe(exactExecutor);
    });

    it("should return pattern executor if no exact match", () => {
      const patternExecutor = { execute: vi.fn() };
      registry.registerPattern(/^Get_/, patternExecutor);
      expect(registry.getExecutor("Get_MyVar")).toBe(patternExecutor);
    });

    it("should return null for no match", () => {
      expect(registry.getExecutor("UnknownNode")).toBeNull();
    });

    it("should match first pattern in order", () => {
      const executor1 = { execute: vi.fn(), name: "first" };
      const executor2 = { execute: vi.fn(), name: "second" };
      registry.registerPattern(/^Test/, executor1);
      registry.registerPattern(/^TestNode/, executor2);
      expect(registry.getExecutor("TestNode")).toBe(executor1);
    });
  });

  describe("hasExecutor", () => {
    it("should return true for registered key", () => {
      registry.register("MyNode", { execute: vi.fn() });
      expect(registry.hasExecutor("MyNode")).toBe(true);
    });

    it("should return true for pattern match", () => {
      registry.registerPattern(/^Cast/, { execute: vi.fn() });
      expect(registry.hasExecutor("CastTo_Actor")).toBe(true);
    });

    it("should return false for unregistered key", () => {
      expect(registry.hasExecutor("UnknownNode")).toBe(false);
    });
  });

  describe("getRegisteredKeys", () => {
    it("should return all registered exact keys", () => {
      registry.register("Node1", { execute: vi.fn() });
      registry.register("Node2", { execute: vi.fn() });
      const keys = registry.getRegisteredKeys();
      expect(keys).toContain("Node1");
      expect(keys).toContain("Node2");
      expect(keys.length).toBe(2);
    });
  });
});
