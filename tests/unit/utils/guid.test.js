import { describe, it, expect } from "vitest";
import { generateGUID } from "../../../src/utils/guid.js";

describe("generateGUID", () => {
  it("should generate a valid GUID format", () => {
    const guid = generateGUID();

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(guid).toMatch(uuidRegex);
  });

  it("should generate unique GUIDs", () => {
    const guid1 = generateGUID();
    const guid2 = generateGUID();
    const guid3 = generateGUID();

    expect(guid1).not.toBe(guid2);
    expect(guid2).not.toBe(guid3);
    expect(guid1).not.toBe(guid3);
  });

  it("should generate GUIDs with correct version (4) and variant bits", () => {
    const guid = generateGUID();
    const parts = guid.split("-");

    // Version should be 4 (13th character)
    expect(parts[2][0]).toBe("4");

    // Variant should be 8, 9, a, or b (17th character)
    expect(["8", "9", "a", "b", "A", "B"]).toContain(parts[3][0]);
  });

  it("should consistently produce 36-character strings", () => {
    for (let i = 0; i < 10; i++) {
      const guid = generateGUID();
      expect(guid).toHaveLength(36);
      expect(guid.split("-")).toHaveLength(5);
    }
  });
});
