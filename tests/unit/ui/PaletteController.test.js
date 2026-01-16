import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * PaletteController Unit Tests
 *
 * Tests node palette filtering and rendering in right panel.
 */

// Mock dependencies
vi.mock("../../../src/registries/NodeRegistry.js", () => {
  const mockRegistry = {
    PrintString: { title: "Print String", category: "Utilities|String" },
    AddActorTag: { title: "Add Tag", category: "Actor" },
    SpawnActor: { title: "Spawn Actor", category: "Gameplay", hidden: false },
    HiddenNode: { title: "Hidden", category: "Debug", hidden: true },
  };
  return {
    nodeRegistry: {
      getAll: vi.fn(() => mockRegistry),
      get: vi.fn((name) => mockRegistry[name] || { title: name, category: "" }),
    },
  };
});

vi.mock("../../../src/ui/ui-helpers.js", () => ({
  buildCategoryTree: vi.fn(() => ({ children: new Map(), items: [] })),
  renderCategoryTree: vi.fn(),
}));

vi.mock("../../../src/ui/BaseController.js", () => ({
  BaseController: class MockBaseController {
    constructor() {}
    addListener() {}
    cleanup() {}
  },
}));

// Import after mocks
import { PaletteController } from "../../../src/ui/PaletteController.js";

function createMockApp() {
  return {};
}

describe("PaletteController", () => {
  let controller;
  let mockApp;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="right-palette-content"></div>
      <input id="right-palette-filter" value="" />
    `;

    mockApp = createMockApp();
    controller = new PaletteController(mockApp);
  });

  describe("constructor", () => {
    it("should find container element", () => {
      expect(controller.container).toBeDefined();
      expect(controller.container.id).toBe("right-palette-content");
    });

    it("should find filter input element", () => {
      expect(controller.filterInput).toBeDefined();
    });
  });

  describe("populateList", () => {
    it("should not throw when container exists", () => {
      expect(() => controller.populateList()).not.toThrow();
    });

    it("should call _renderPalette with filter value", () => {
      const spy = vi.spyOn(controller, "_renderPalette");
      controller.filterInput.value = "print";

      controller.populateList();

      expect(spy).toHaveBeenCalledWith(controller.container, "print");
    });

    it("should use empty string if no filter input", () => {
      controller.filterInput = null;
      const spy = vi.spyOn(controller, "_renderPalette");

      controller.populateList();

      expect(spy).toHaveBeenCalledWith(controller.container, "");
    });
  });

  describe("_renderPalette", () => {
    it("should clear container before rendering", () => {
      controller.container.innerHTML = "<div>old content</div>";

      controller._renderPalette(controller.container, "");

      // Container gets cleared, then renderCategoryTree populates it
      // We check that it was cleared (renderCategoryTree is mocked to do nothing)
      expect(controller.container.innerHTML).toBe("");
    });

    // TODO: Dynamic import mocking not working correctly
    it.skip("should filter out hidden nodes", async () => {
      // The mock registry has HiddenNode with hidden: true
      // Import the mocked module to check calls
      const { buildCategoryTree } = await import(
        "../../../src/ui/ui-helpers.js"
      );

      controller._renderPalette(controller.container, "");

      const filteredNodes = buildCategoryTree.mock.calls[0][0];
      expect(filteredNodes).not.toContain("HiddenNode");
    });
  });
});
