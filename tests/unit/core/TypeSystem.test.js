import { describe, it, expect, beforeEach } from "vitest";
import {
  TYPE_COLORS,
  TYPE_HEADER_COLORS,
  getTypeColor,
  getTypeHeaderColors,
  isTypeCompatible,
  PRIMITIVE_TYPES,
  STRUCT_TYPES,
  supportsInlineWidget,
  getConversionNodeKey,
} from "../../../src/core/TypeSystem.js";

describe("TypeSystem", () => {
  describe("TYPE_COLORS", () => {
    it("should have color for exec type", () => {
      expect(TYPE_COLORS.exec).toBe("#ffffff");
    });

    it("should have color for bool type", () => {
      expect(TYPE_COLORS.bool).toBe("#990000");
    });

    it("should have color for object type (blue)", () => {
      expect(TYPE_COLORS.object).toBe("#0066ff");
    });

    it("should have DEFAULT fallback color", () => {
      expect(TYPE_COLORS.DEFAULT).toBe("#cccccc");
    });
  });

  describe("getTypeColor", () => {
    it("should return correct color for known type", () => {
      expect(getTypeColor("float")).toBe("#00ff00");
    });

    it("should be case-insensitive", () => {
      expect(getTypeColor("FLOAT")).toBe("#00ff00");
      expect(getTypeColor("Float")).toBe("#00ff00");
    });

    it("should return DEFAULT for unknown type", () => {
      expect(getTypeColor("unknowntype")).toBe("#cccccc");
    });

    it("should return DEFAULT for null/undefined", () => {
      expect(getTypeColor(null)).toBe("#cccccc");
      expect(getTypeColor(undefined)).toBe("#cccccc");
    });

    it("should return blue for component types", () => {
      expect(getTypeColor("AudioComponent")).toBe("#0066ff");
      expect(getTypeColor("SceneComponent")).toBe("#0066ff");
      expect(getTypeColor("StaticMeshComponent")).toBe("#0066ff");
    });
  });

  describe("getTypeHeaderColors", () => {
    it("should return gradient for known type", () => {
      const colors = getTypeHeaderColors("bool");
      expect(colors.start).toBe("#880000");
      expect(colors.end).toBe("#660000");
    });

    it("should return DEFAULT for unknown type", () => {
      const colors = getTypeHeaderColors("unknowntype");
      expect(colors.start).toBe("#444444");
      expect(colors.end).toBe("#333333");
    });
  });

  describe("isTypeCompatible", () => {
    it("should return true for exact match", () => {
      expect(isTypeCompatible("float", "float")).toBe(true);
      expect(isTypeCompatible("int", "int")).toBe(true);
    });

    it("should return true for exec-to-exec", () => {
      expect(isTypeCompatible("exec", "exec")).toBe(true);
    });

    it("should return true for wildcard compatibility", () => {
      expect(isTypeCompatible("wildcard", "float")).toBe(true);
      expect(isTypeCompatible("int", "wildcard")).toBe(true);
    });

    it("should return true for component-to-object", () => {
      expect(isTypeCompatible("SceneComponent", "object")).toBe(true);
      expect(isTypeCompatible("AudioComponent", "object")).toBe(true);
    });

    it("should return false for incompatible types", () => {
      expect(isTypeCompatible("float", "string")).toBe(false);
      expect(isTypeCompatible("int", "bool")).toBe(false);
    });

    it("should return false for null inputs", () => {
      expect(isTypeCompatible(null, "float")).toBe(false);
      expect(isTypeCompatible("float", null)).toBe(false);
    });

    it("should handle component hierarchy", () => {
      expect(isTypeCompatible("StaticMeshComponent", "SceneComponent")).toBe(
        true
      );
      expect(isTypeCompatible("PointLightComponent", "SceneComponent")).toBe(
        true
      );
    });
  });

  describe("PRIMITIVE_TYPES", () => {
    it("should include bool", () => {
      expect(PRIMITIVE_TYPES).toContain("bool");
    });

    it("should include all primitive types", () => {
      expect(PRIMITIVE_TYPES).toContain("int");
      expect(PRIMITIVE_TYPES).toContain("float");
      expect(PRIMITIVE_TYPES).toContain("string");
    });
  });

  describe("STRUCT_TYPES", () => {
    it("should include vector, rotator, transform", () => {
      expect(STRUCT_TYPES).toContain("vector");
      expect(STRUCT_TYPES).toContain("rotator");
      expect(STRUCT_TYPES).toContain("transform");
    });
  });

  describe("supportsInlineWidget", () => {
    it("should return true for primitive types", () => {
      expect(supportsInlineWidget("bool")).toBe(true);
      expect(supportsInlineWidget("int")).toBe(true);
      expect(supportsInlineWidget("float")).toBe(true);
    });

    it("should return true for struct types", () => {
      expect(supportsInlineWidget("vector")).toBe(true);
      expect(supportsInlineWidget("rotator")).toBe(true);
    });

    it("should return false for non-widget types", () => {
      expect(supportsInlineWidget("exec")).toBe(false);
      expect(supportsInlineWidget("object")).toBe(false);
    });
  });

  describe("getConversionNodeKey", () => {
    it("should return conversion node for float->string", () => {
      expect(getConversionNodeKey("float", "string")).toBe(
        "Conv_FloatToString"
      );
    });

    it("should return conversion node for int->float", () => {
      expect(getConversionNodeKey("int", "float")).toBe("Conv_IntToFloat");
    });

    it("should return null for no conversion available", () => {
      expect(getConversionNodeKey("bool", "int")).toBeNull();
      expect(getConversionNodeKey("object", "string")).toBeNull();
    });
  });
});
