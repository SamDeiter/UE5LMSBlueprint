import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * VariableController Unit Tests
 *
 * Tests variable creation, deletion, and property management.
 */

// Mock dependencies
vi.mock("../../../src/utils.js", () => ({
  Utils: {
    uniqueId: vi.fn(() => `id-${Math.random().toString(36).substr(2, 9)}`),
    getPinColor: vi.fn(() => "#00ff00"),
    getPinTypeClass: vi.fn(() => "float-pin"),
  },
}));

vi.mock("../../../src/utils/guid.js", () => ({
  generateGUID: vi.fn(() => `var-${Date.now()}`),
}));

vi.mock("../../../src/registries/NodeRegistry.js", () => {
  // Create a mock registry as a regular object (not using defineProperty)
  const mockRegistry = {
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => ({})),
  };
  return { nodeRegistry: mockRegistry };
});

vi.mock("../../../src/ui/ui-helpers.js", () => ({
  createCollapsibleHeader: vi.fn(() => document.createElement("div")),
}));

vi.mock("../../../src/utils/UE5Renderer.js", () => ({
  UE5Renderer: {
    renderIcon: vi.fn(() => ""),
    renderPinIcon: vi.fn(() => ""),
  },
}));

vi.mock("../../../src/ui/BaseController.js", () => ({
  BaseController: class MockBaseController {
    constructor(app) {
      this.app = app;
      this.eventListeners = [];
    }
    addListener() {}
    cleanup() {}
  },
}));

vi.mock("../../../src/ui/ContextMenuHelper.js", () => ({
  ContextMenuHelper: {
    show: vi.fn(),
  },
}));

// Import after mocks
import { VariableController } from "../../../src/ui/VariableController.js";

// Create mock app that matches real app structure
function createMockApp() {
  return {
    variables: [],
    variableController: null,
    graph: {
      nodes: new Map(),
      findPinById: vi.fn(),
      requestRedraw: vi.fn(),
      redrawNodeWires: vi.fn(),
    },
    wiring: {
      links: new Map(),
      findLinksByNodeId: vi.fn(() => []),
      breakLinkById: vi.fn(),
    },
    compiler: {
      markDirty: vi.fn(),
      registerRename: vi.fn(),
      log: vi.fn(),
    },
    persistence: {
      autoSave: vi.fn(),
    },
    palette: {
      populateList: vi.fn(),
    },
    details: {
      currentVariable: null,
      clear: vi.fn(),
      showVariableDetails: vi.fn(),
    },
    components: new Map(),
    componentsController: {
      selectedComponentIds: new Set(),
      selectComponent: vi.fn(),
    },
    eventGraph: {
      nodes: [],
    },
    functions: [],
  };
}

describe("VariableController", () => {
  let controller;
  let mockApp;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="variables-list"></div>
      <input id="new-variable-input" />
    `;

    mockApp = createMockApp();
    controller = new VariableController(mockApp);
    mockApp.variableController = controller;
  });

  describe("constructor", () => {
    it("should initialize with app reference", () => {
      expect(controller.app).toBe(mockApp);
    });

    it("should find list container element", () => {
      expect(controller.listContainer).toBeDefined();
    });
  });

  describe("getVariableTypes", () => {
    it("should return array of variable types", () => {
      const types = controller.getVariableTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
    });

    it("should include boolean type", () => {
      const types = controller.getVariableTypes();

      // Implementation returns string array, not objects
      expect(types.includes("bool")).toBe(true);
    });

    it("should include float type", () => {
      const types = controller.getVariableTypes();

      expect(types.includes("float")).toBe(true);
    });
  });

  describe("getDefaultValueForType", () => {
    it("should return false for boolean", () => {
      expect(controller.getDefaultValueForType("bool")).toBe(false);
    });

    it("should return 0 for integer", () => {
      expect(controller.getDefaultValueForType("int")).toBe(0);
    });

    it("should return 0.0 for float", () => {
      expect(controller.getDefaultValueForType("float")).toBe(0);
    });

    it("should return empty string for string", () => {
      expect(controller.getDefaultValueForType("string")).toBe("");
    });
  });

  describe("isNameTaken", () => {
    it("should return false for unique name", () => {
      // Implementation uses this.variables (Map), not app.variables
      controller.variables = new Map();
      controller.variables.set("var1", { id: "var1", name: "Health" });

      expect(controller.isNameTaken("Speed")).toBe(false);
    });

    it("should return true for taken name", () => {
      controller.variables = new Map();
      controller.variables.set("var1", { id: "var1", name: "Health" });

      expect(controller.isNameTaken("Health")).toBe(true);
    });

    it("should exclude current variable from check", () => {
      controller.variables = new Map();
      controller.variables.set("var1", { id: "var1", name: "Health" });

      expect(controller.isNameTaken("Health", "var1")).toBe(false);
    });
  });

  describe("generateUniqueVarName", () => {
    it("should return base name if not taken", () => {
      // Implementation uses controller.variables (Map)
      controller.variables = new Map();

      const name = controller.generateUniqueVarName("Health");

      expect(name).toBe("Health");
    });

    it("should append underscore and number if name taken", () => {
      // Need to set variables on the controller itself
      controller.variables = new Map();
      controller.variables.set("v1", { id: "v1", name: "NewVar" });

      const name = controller.generateUniqueVarName("NewVar");

      // Implementation uses underscore format: NewVar_0, NewVar_1, etc.
      expect(name).toMatch(/NewVar_\d+/);
    });
  });

  describe("createVariableObject", () => {
    it("should create variable with all properties", () => {
      const variable = controller.createVariableObject(
        "var1",
        "Health",
        "float",
        "single",
        true
      );

      expect(variable.id).toBe("var1");
      expect(variable.name).toBe("Health");
      expect(variable.type).toBe("float");
      expect(variable.containerType).toBe("single");
      // isPublic parameter is stored as isInstanceEditable
      expect(variable.isInstanceEditable).toBe(true);
    });

    it("should set default value based on type", () => {
      const boolVar = controller.createVariableObject(
        "v1",
        "Flag",
        "bool",
        "single",
        false
      );
      const intVar = controller.createVariableObject(
        "v2",
        "Count",
        "int",
        "single",
        false
      );

      expect(boolVar.defaultValue).toBe(false);
      expect(intVar.defaultValue).toBe(0);
    });
  });

  // TODO: These tests require render pipeline mocking
  // Will be added as integration tests
  describe.skip("addVariable", () => {
    it("should add variable to app.variables", () => {
      mockApp.variables = [];

      controller.addVariable();

      expect(mockApp.variables.length).toBe(1);
    });

    it("should mark compiler dirty", () => {
      mockApp.variables = [];

      controller.addVariable();

      expect(mockApp.compiler.markDirty).toHaveBeenCalled();
    });
  });

  describe.skip("clearAllVariables", () => {
    it("should empty the variables array", () => {
      mockApp.variables = [{ id: "v1" }, { id: "v2" }];

      controller.clearAllVariables();

      expect(mockApp.variables.length).toBe(0);
    });
  });

  describe.skip("loadState", () => {
    it("should load variables from state", () => {
      const state = [
        { id: "v1", name: "Health", type: "float" },
        { id: "v2", name: "Speed", type: "float" },
      ];

      controller.loadState(state);

      expect(mockApp.variables.length).toBe(2);
    });
  });
});
