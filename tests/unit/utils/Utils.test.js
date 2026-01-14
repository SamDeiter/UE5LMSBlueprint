import { describe, it, expect, beforeEach, vi } from "vitest";
import { Utils } from "../../../src/utils.js";

describe("Utils", () => {
  describe("uniqueId", () => {
    it("should generate unique IDs", () => {
      const id1 = Utils.uniqueId();
      const id2 = Utils.uniqueId();
      expect(id1).not.toBe(id2);
    });

    it("should use default prefix", () => {
      const id = Utils.uniqueId();
      expect(id.startsWith("id-")).toBe(true);
    });

    it("should use custom prefix", () => {
      const id = Utils.uniqueId("node");
      expect(id.startsWith("node-")).toBe(true);
    });
  });

  describe("getPinTypeClass", () => {
    it("should return correct class for known type", () => {
      const result = Utils.getPinTypeClass("float");
      expect(result).toContain("float");
    });
  });

  describe("getPinColor", () => {
    it("should return color for known type", () => {
      const color = Utils.getPinColor("float");
      expect(color).toBeTruthy();
    });

    it("should return blue for component types", () => {
      expect(Utils.getPinColor("SceneComponent")).toBe("#0066ff");
      expect(Utils.getPinColor("AudioComponent")).toBe("#0066ff");
    });
  });

  describe("getTypeColor", () => {
    it("should be alias for getPinColor", () => {
      expect(Utils.getTypeColor("float")).toBe(Utils.getPinColor("float"));
    });
  });

  describe("getWirePath", () => {
    it("should return valid SVG path string", () => {
      const path = Utils.getWirePath(0, 0, 100, 100);
      expect(path).toMatch(/^M .* C .* .*$/);
    });

    it("should start at origin point", () => {
      const path = Utils.getWirePath(10, 20, 100, 100);
      expect(path.startsWith("M 10,20")).toBe(true);
    });
  });

  describe("canHaveInputWidget", () => {
    it("should return true for primitive types", () => {
      expect(Utils.canHaveInputWidget("bool")).toBe(true);
      expect(Utils.canHaveInputWidget("int")).toBe(true);
      expect(Utils.canHaveInputWidget("float")).toBe(true);
      expect(Utils.canHaveInputWidget("string")).toBe(true);
    });

    it("should return true for struct types", () => {
      expect(Utils.canHaveInputWidget("vector")).toBe(true);
      expect(Utils.canHaveInputWidget("rotator")).toBe(true);
    });

    it("should return false for exec type", () => {
      expect(Utils.canHaveInputWidget("exec")).toBe(false);
    });
  });

  describe("isTypeCompatible", () => {
    it("should return true for exact match", () => {
      expect(Utils.isTypeCompatible("float", "float")).toBe(true);
    });

    it("should return true for wildcard", () => {
      expect(Utils.isTypeCompatible("wildcard", "int")).toBe(true);
    });

    it("should handle component hierarchy", () => {
      expect(Utils.isTypeCompatible("SceneComponent", "object")).toBe(true);
    });

    it("should return false for incompatible types", () => {
      expect(Utils.isTypeCompatible("int", "string")).toBe(false);
    });
  });

  describe("parseVector", () => {
    it("should parse vector string", () => {
      const result = Utils.parseVector("(1,2,3)");
      expect(result).toEqual({ x: 1, y: 2, z: 3 });
    });

    it("should handle missing values", () => {
      const result = Utils.parseVector("(5)");
      expect(result.x).toBe(5);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe("parseRotator", () => {
    it("should parse RPY format", () => {
      const result = Utils.parseRotator("(R=10,P=20,Y=30)");
      expect(result).toEqual({ roll: 10, pitch: 20, yaw: 30 });
    });

    it("should parse CSV format", () => {
      const result = Utils.parseRotator("(10,20,30)");
      expect(result).toEqual({ roll: 10, pitch: 20, yaw: 30 });
    });
  });

  describe("formatNodeProperty", () => {
    it("should add spaces to CamelCase", () => {
      expect(Utils.formatNodeProperty("SpawnTransform")).toBe(
        "Spawn Transform"
      );
    });

    it("should handle empty string", () => {
      expect(Utils.formatNodeProperty("")).toBe("");
    });

    it("should handle null/undefined", () => {
      expect(Utils.formatNodeProperty(null)).toBe("");
      expect(Utils.formatNodeProperty(undefined)).toBe("");
    });
  });

  describe("createSeparator", () => {
    it("should create div element", () => {
      const sep = Utils.createSeparator();
      expect(sep.tagName).toBe("DIV");
      expect(sep.className).toBe("menu-separator");
    });
  });
});
