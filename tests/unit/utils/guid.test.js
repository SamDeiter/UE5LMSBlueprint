import { describe, it, expect } from "vitest";
import { generateGUID } from "../../../src/utils/guid.js";

describe("GUID Generation", () => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe("generateGUID", () => {
    it("should generate non-empty GUIDs", () => {
      const id1 = generateGUID();
      const id2 = generateGUID();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
    });

    it("should generate unique GUIDs", () => {
      const id1 = generateGUID();
      const id2 = generateGUID();

      expect(id1).not.toBe(id2);
    });

    it("should match UUID v4 format", () => {
      const id = generateGUID();
      expect(uuidRegex.test(id)).toBe(true);
    });

    it("should generate multiple unique UUIDs in sequence", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateGUID());
      }
      expect(ids.size).toBe(100);
    });

    it("should have correct version nibble (4)", () => {
      const id = generateGUID();
      const parts = id.split("-");
      const versionChar = parts[2][0];
      expect(versionChar).toBe("4");
    });

    it("should have correct variant bits", () => {
      const id = generateGUID();
      const parts = id.split("-");
      const variantChar = parts[3][0].toLowerCase();
      expect(["8", "9", "a", "b"]).toContain(variantChar);
    });
  });
});
