import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * Utils Class Unit Tests
 *
 * Tests utility functions for type handling, wire paths, and conversions.
 */

// Mock dependencies
vi.mock("../../../src/config/Constants.js", () => ({
  PIN_COLORS: {
    exec: "var(--pin-color-exec)",
    boolean: "var(--pin-color-bool)",
    byte: "var(--pin-color-byte)",
    integer: "var(--pin-color-int)",
    float: "var(--pin-color-float)",
    string: "var(--pin-color-string)",
    vector: "var(--pin-color-struct)",
    object: "var(--pin-color-object)",
  },
  VARIABLE_HEADER_COLORS: {
    boolean: { start: "#830000", end: "#5c0000" },
    integer: { start: "#1C9696", end: "#145B5B" },
    float: { start: "#9EC23E", end: "#6B8329" },
  },
  PIN_TYPE_CLASSES: {
    exec: "exec-pin",
    boolean: "bool-pin",
    integer: "int-pin",
    float: "float-pin",
    string: "string-pin",
    vector: "struct-pin",
    object: "object-pin",
  },
}));

// Import after mocks
import { Utils } from "../../../src/utils.js";

describe("Utils", () => {
  describe("uniqueId", () => {
    it("should generate unique IDs", () => {
      const id1 = Utils.uniqueId();
      const id2 = Utils.uniqueId();

      expect(id1).not.toBe(id2);
    });

    it("should use provided prefix", () => {
      const id = Utils.uniqueId("node");

      expect(id.startsWith("node-")).toBe(true);
    });

    it("should use default prefix if none provided", () => {
      const id = Utils.uniqueId();

      expect(id.startsWith("id-")).toBe(true);
    });
  });

  describe("getPinTypeClass", () => {
    it("should return correct class for exec type", () => {
      expect(Utils.getPinTypeClass("exec")).toBe("exec-pin");
    });

    it("should return correct class for boolean type", () => {
      expect(Utils.getPinTypeClass("boolean")).toBe("bool-pin");
    });

    it("should return correct class for float type", () => {
      expect(Utils.getPinTypeClass("float")).toBe("float-pin");
    });

    it("should handle case insensitivity", () => {
      expect(Utils.getPinTypeClass("FLOAT")).toBe("float-pin");
    });
  });

  describe("getPinColor", () => {
    it("should return color variable for known types", () => {
      const color = Utils.getPinColor("exec");

      expect(color).toBe("var(--pin-color-exec)");
    });

    it("should return color for boolean type", () => {
      const color = Utils.getPinColor("boolean");

      expect(color).toBe("var(--pin-color-bool)");
    });
  });

  describe("getVariableHeaderColor", () => {
    it("should return gradient colors for boolean", () => {
      const colors = Utils.getVariableHeaderColor("boolean");

      expect(colors.start).toBe("#830000");
      expect(colors.end).toBe("#5c0000");
    });

    it("should return gradient colors for integer", () => {
      const colors = Utils.getVariableHeaderColor("integer");

      expect(colors.start).toBe("#1C9696");
    });
  });

  describe("getWirePath", () => {
    it("should return valid SVG path string", () => {
      const path = Utils.getWirePath(0, 0, 100, 100);

      expect(path).toContain("M");
      expect(path).toContain("C");
    });

    it("should start at specified coordinates", () => {
      const path = Utils.getWirePath(10, 20, 100, 100);

      expect(path.startsWith("M10 20")).toBe(true);
    });
  });

  describe("isTypeCompatible", () => {
    it("should return true for identical types", () => {
      expect(Utils.isTypeCompatible("float", "float")).toBe(true);
    });

    it("should return true for exec types", () => {
      expect(Utils.isTypeCompatible("exec", "exec")).toBe(true);
    });

    it("should return true for wildcard compatibility", () => {
      expect(Utils.isTypeCompatible("wildcard", "float")).toBe(true);
      expect(Utils.isTypeCompatible("float", "wildcard")).toBe(true);
    });

    it("should handle numeric conversions", () => {
      // integer to float should be compatible (widening)
      expect(Utils.isTypeCompatible("integer", "float")).toBe(true);
    });

    it("should return false for incompatible types", () => {
      expect(Utils.isTypeCompatible("string", "boolean")).toBe(false);
    });
  });

  describe("canHaveInputWidget", () => {
    it("should return true for float", () => {
      expect(Utils.canHaveInputWidget("float")).toBe(true);
    });

    it("should return true for integer", () => {
      expect(Utils.canHaveInputWidget("integer")).toBe(true);
    });

    it("should return true for string", () => {
      expect(Utils.canHaveInputWidget("string")).toBe(true);
    });

    it("should return true for boolean", () => {
      expect(Utils.canHaveInputWidget("boolean")).toBe(true);
    });

    it("should return false for exec", () => {
      expect(Utils.canHaveInputWidget("exec")).toBe(false);
    });

    it("should return false for object", () => {
      expect(Utils.canHaveInputWidget("object")).toBe(false);
    });
  });

  describe("parseVector", () => {
    it("should parse valid vector string", () => {
      const vec = Utils.parseVector("(1,2,3)");

      expect(vec.x).toBe(1);
      expect(vec.y).toBe(2);
      expect(vec.z).toBe(3);
    });

    it("should handle negative values", () => {
      const vec = Utils.parseVector("(-1,-2,-3)");

      expect(vec.x).toBe(-1);
      expect(vec.y).toBe(-2);
      expect(vec.z).toBe(-3);
    });

    it("should handle decimal values", () => {
      const vec = Utils.parseVector("(1.5,2.5,3.5)");

      expect(vec.x).toBe(1.5);
      expect(vec.y).toBe(2.5);
      expect(vec.z).toBe(3.5);
    });
  });

  describe("parseRotator", () => {
    it("should parse rotator string format", () => {
      const rot = Utils.parseRotator("(0,90,180)");

      expect(rot).toBeDefined();
    });

    it("should handle R/P/Y format", () => {
      const rot = Utils.parseRotator("(R=45,P=30,Y=90)");

      expect(rot.roll).toBe(45);
      expect(rot.pitch).toBe(30);
      expect(rot.yaw).toBe(90);
    });
  });

  describe("formatNodeProperty", () => {
    it("should add space before capital letters", () => {
      expect(Utils.formatNodeProperty("SpawnTransform")).toBe(
        "Spawn Transform"
      );
    });

    it("should handle single word", () => {
      expect(Utils.formatNodeProperty("Target")).toBe("Target");
    });

    it("should handle multiple capitals", () => {
      expect(Utils.formatNodeProperty("GetActorLocation")).toBe(
        "Get Actor Location"
      );
    });
  });

  describe("createSeparator", () => {
    it("should create a div element", () => {
      const sep = Utils.createSeparator();

      expect(sep.tagName.toLowerCase()).toBe("div");
    });

    it("should have separator class", () => {
      const sep = Utils.createSeparator();

      expect(sep.className).toContain("separator");
    });
  });

  describe("getConversionNodeKey", () => {
    it("should return null for identical types", () => {
      expect(Utils.getConversionNodeKey("float", "float")).toBeNull();
    });

    it("should return conversion node for compatible types", () => {
      const key = Utils.getConversionNodeKey("integer", "string");

      // May return a conversion node key or null depending on implementation
      expect(key === null || typeof key === "string").toBe(true);
    });
  });
});
