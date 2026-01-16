import { describe, it, expect, beforeEach } from "vitest";

/**
 * NodeRegistry Unit Tests
 *
 * Tests node definition registration and retrieval.
 */

// Import directly since it's a simple class
import { NodeRegistry } from "../../../src/registries/NodeRegistry.js";

describe("NodeRegistry", () => {
  let registry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  describe("constructor", () => {
    it("should initialize with empty nodes Map", () => {
      expect(registry.nodes).toBeInstanceOf(Map);
      expect(registry.nodes.size).toBe(0);
    });
  });

  describe("register", () => {
    it("should register a node definition", () => {
      const def = { title: "Print String", category: "Utilities" };

      registry.register("PrintString", def);

      expect(registry.has("PrintString")).toBe(true);
    });

    it("should store the definition correctly", () => {
      const def = { title: "Print String", category: "Utilities" };

      registry.register("PrintString", def);

      expect(registry.get("PrintString")).toBe(def);
    });

    it("should allow overwriting existing definition", () => {
      registry.register("PrintString", { title: "Old" });
      registry.register("PrintString", { title: "New" });

      expect(registry.get("PrintString").title).toBe("New");
    });
  });

  describe("registerBatch", () => {
    it("should register multiple definitions", () => {
      const defs = {
        PrintString: { title: "Print String" },
        AddActorTag: { title: "Add Tag" },
        SpawnActor: { title: "Spawn Actor" },
      };

      registry.registerBatch(defs);

      expect(registry.has("PrintString")).toBe(true);
      expect(registry.has("AddActorTag")).toBe(true);
      expect(registry.has("SpawnActor")).toBe(true);
    });
  });

  describe("get", () => {
    it("should return definition for existing node", () => {
      registry.register("PrintString", { title: "Print String" });

      expect(registry.get("PrintString").title).toBe("Print String");
    });

    it("should return undefined for non-existent node", () => {
      expect(registry.get("NonExistent")).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should return all definitions as object", () => {
      registry.register("NodeA", { title: "A" });
      registry.register("NodeB", { title: "B" });

      const all = registry.getAll();

      expect(all.NodeA.title).toBe("A");
      expect(all.NodeB.title).toBe("B");
    });

    it("should return empty object if no nodes", () => {
      const all = registry.getAll();

      expect(Object.keys(all).length).toBe(0);
    });
  });

  describe("unregister", () => {
    it("should remove a node definition", () => {
      registry.register("PrintString", { title: "Print" });

      registry.unregister("PrintString");

      expect(registry.has("PrintString")).toBe(false);
    });

    it("should not throw for non-existent node", () => {
      expect(() => registry.unregister("NonExistent")).not.toThrow();
    });
  });

  describe("has", () => {
    it("should return true for existing node", () => {
      registry.register("PrintString", {});

      expect(registry.has("PrintString")).toBe(true);
    });

    it("should return false for non-existent node", () => {
      expect(registry.has("NonExistent")).toBe(false);
    });
  });
});
