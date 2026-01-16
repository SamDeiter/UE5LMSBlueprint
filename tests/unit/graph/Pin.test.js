import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Pin Class Unit Tests
 *
 * Tests the Pin class which represents data pins on Blueprint nodes.
 */

// Mock dependencies
vi.mock("../../../src/config/NodeDefaults.js", () => ({
  PinDefaults: {
    INTEGER: 0,
    FLOAT: 0.0,
    BOOLEAN: false,
    STRING: "",
    VECTOR: "(0,0,0)",
    ROTATOR: "(0,0,0)",
    EXEC: null,
    DEFAULT: null,
  },
  StructComponents: {
    VECTOR: [
      { name: "X", type: "float", default: 0 },
      { name: "Y", type: "float", default: 0 },
      { name: "Z", type: "float", default: 0 },
    ],
    ROTATOR: [
      { name: "Roll", type: "float", default: 0 },
      { name: "Pitch", type: "float", default: 0 },
      { name: "Yaw", type: "float", default: 0 },
    ],
  },
}));

// Import after mocks
import { Pin } from "../../../src/graph/Pin.js";

// Helper to create mock node
function createMockNode(id = "node-123") {
  return { id };
}

describe("Pin", () => {
  let mockNode;

  beforeEach(() => {
    mockNode = createMockNode();
  });

  describe("constructor", () => {
    it("should create a pin with proper ID", () => {
      const pin = new Pin(mockNode, {
        id: "exec_in",
        name: "Exec",
        type: "exec",
        dir: "in",
      });

      expect(pin.id).toBe("node-123-exec_in");
    });

    it("should not double-prefix node ID", () => {
      const pin = new Pin(mockNode, {
        id: "node-123-exec_in",
        name: "Exec",
        type: "exec",
        dir: "in",
      });

      expect(pin.id).toBe("node-123-exec_in");
    });

    it("should store node reference", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.node).toBe(mockNode);
    });

    it("should lowercase the type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "FLOAT",
        dir: "in",
      });

      expect(pin.type).toBe("float");
    });

    it("should initialize links as empty array", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.links).toEqual([]);
    });

    it("should default containerType to single", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.containerType).toBe("single");
    });

    it("should accept custom containerType", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
        containerType: "array",
      });

      expect(pin.containerType).toBe("array");
    });

    it("should use provided defaultValue", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "integer",
        dir: "in",
        defaultValue: 42,
      });

      expect(pin.defaultValue).toBe(42);
    });
  });

  describe("getDefaultValue", () => {
    it("should return 0 for integer type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "integer",
        dir: "in",
      });

      expect(pin.getDefaultValue()).toBe(0);
    });

    it("should return false for boolean type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "boolean",
        dir: "in",
      });

      expect(pin.getDefaultValue()).toBe(false);
    });

    it("should return empty string for string type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "string",
        dir: "in",
      });

      expect(pin.getDefaultValue()).toBe("");
    });

    it("should return null for exec type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "exec",
        dir: "in",
      });

      expect(pin.getDefaultValue()).toBeNull();
    });
  });

  describe("isConnected", () => {
    it("should return false when no links", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.isConnected()).toBe(false);
    });

    it("should return true when has links", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });
      pin.links.push("link-1");

      expect(pin.isConnected()).toBe(true);
    });
  });

  describe("getMaxLinks", () => {
    it("should return 1 for input data pins", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.getMaxLinks()).toBe(1);
    });

    it("should return Infinity for output pins", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "out",
      });

      expect(pin.getMaxLinks()).toBe(Infinity);
    });

    it("should return Infinity for exec input pins", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "exec",
        dir: "in",
      });

      expect(pin.getMaxLinks()).toBe(Infinity);
    });
  });

  describe("canSplit", () => {
    it("should return true for vector type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });

      expect(pin.canSplit()).toBe(true);
    });

    it("should return true for rotator type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "rotator",
        dir: "in",
      });

      expect(pin.canSplit()).toBe(true);
    });

    it("should return false for float type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      expect(pin.canSplit()).toBe(false);
    });

    it("should return false if already split", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });
      pin.isSplit = true;

      expect(pin.canSplit()).toBe(false);
    });
  });

  describe("split", () => {
    it("should set isSplit to true", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });

      pin.split();

      expect(pin.isSplit).toBe(true);
    });

    it("should create sub-pins for vector", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });

      pin.split();

      expect(pin.subPins.length).toBe(3);
      expect(pin.subPins[0].name).toBe("X");
      expect(pin.subPins[1].name).toBe("Y");
      expect(pin.subPins[2].name).toBe("Z");
    });

    it("should not split if canSplit returns false", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "float",
        dir: "in",
      });

      pin.split();

      expect(pin.isSplit).toBe(false);
      expect(pin.subPins.length).toBe(0);
    });
  });

  describe("recombine", () => {
    it("should set isSplit to false", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });
      pin.split();

      pin.recombine();

      expect(pin.isSplit).toBe(false);
    });

    it("should clear sub-pins", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });
      pin.split();
      expect(pin.subPins.length).toBe(3);

      pin.recombine();

      expect(pin.subPins.length).toBe(0);
    });
  });

  describe("getStructComponents", () => {
    it("should return X/Y/Z for vector", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "vector",
        dir: "in",
      });

      const components = pin.getStructComponents();

      expect(components.length).toBe(3);
      expect(components[0].name).toBe("X");
    });

    it("should return Roll/Pitch/Yaw for rotator", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "rotator",
        dir: "in",
      });

      const components = pin.getStructComponents();

      expect(components.length).toBe(3);
      expect(components[0].name).toBe("Roll");
    });

    it("should return empty array for unknown type", () => {
      const pin = new Pin(mockNode, {
        id: "test",
        name: "Test",
        type: "unknown",
        dir: "in",
      });

      const components = pin.getStructComponents();

      expect(components).toEqual([]);
    });
  });
});
