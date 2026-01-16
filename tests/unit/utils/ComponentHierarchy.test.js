import { describe, it, expect } from "vitest";
import { Utils } from "../../../src/utils.js";

describe("Component Hierarchy Type Compatibility", () => {
  describe("exact matches", () => {
    it("should match identical types", () => {
      expect(Utils.isTypeCompatible("SceneComponent", "SceneComponent")).toBe(
        true
      );
      expect(
        Utils.isTypeCompatible("StaticMeshComponent", "StaticMeshComponent")
      ).toBe(true);
    });
  });

  describe("inheritance chain compatibility", () => {
    it("should allow StaticMeshComponent -> SceneComponent", () => {
      // StaticMeshComponent -> MeshComponent -> PrimitiveComponent -> SceneComponent
      expect(
        Utils.isTypeCompatible("StaticMeshComponent", "SceneComponent")
      ).toBe(true);
    });

    it("should allow PointLightComponent -> SceneComponent", () => {
      // PointLightComponent -> LightComponent -> SceneComponent
      expect(
        Utils.isTypeCompatible("PointLightComponent", "SceneComponent")
      ).toBe(true);
    });

    it("should allow BoxComponent -> PrimitiveComponent", () => {
      // BoxComponent -> ShapeComponent -> PrimitiveComponent
      expect(Utils.isTypeCompatible("BoxComponent", "PrimitiveComponent")).toBe(
        true
      );
    });

    it("should allow any component -> Object", () => {
      expect(Utils.isTypeCompatible("CameraComponent", "Object")).toBe(true);
      expect(Utils.isTypeCompatible("StaticMeshComponent", "Object")).toBe(
        true
      );
    });
  });

  describe("incompatible type pairs", () => {
    it("should reject parent -> child assignments", () => {
      // Parent cannot substitute for child
      expect(
        Utils.isTypeCompatible("SceneComponent", "StaticMeshComponent")
      ).toBe(false);
    });

    it("should reject sibling type assignments", () => {
      // Siblings in the hierarchy are not compatible
      expect(
        Utils.isTypeCompatible("PointLightComponent", "StaticMeshComponent")
      ).toBe(false);
    });
  });
});
