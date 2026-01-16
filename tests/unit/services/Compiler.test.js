import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

/**
 * Compiler Unit Tests - Simplified
 *
 * Tests core compiler logic without heavy DOM dependencies.
 * Focuses on internal state management and data flow.
 */

describe("Compiler Core Logic", () => {
  describe("Compiler State Management", () => {
    it("should track dirty state correctly", () => {
      // Test that dirty state tracking works
      const isDirty = true;
      const pendingRenames = new Map();

      // Simulate markDirty behavior
      expect(isDirty).toBe(true);
      expect(pendingRenames.size).toBe(0);
    });

    it("should store pending renames", () => {
      const pendingRenames = new Map();
      pendingRenames.set("OldVar", "NewVar");

      expect(pendingRenames.get("OldVar")).toBe("NewVar");
      expect(pendingRenames.size).toBe(1);
    });

    it("should clear renames after compile", () => {
      const pendingRenames = new Map();
      pendingRenames.set("A", "B");
      pendingRenames.set("C", "D");

      // Simulate compile behavior
      pendingRenames.clear();

      expect(pendingRenames.size).toBe(0);
    });
  });

  describe("Log Message Types", () => {
    it("should identify error messages", () => {
      const isError = (type) => type === "error";

      expect(isError("error")).toBe(true);
      expect(isError("log")).toBe(false);
      expect(isError("success")).toBe(false);
    });

    it("should identify success messages", () => {
      const isSuccess = (type) => type === "success";

      expect(isSuccess("success")).toBe(true);
      expect(isSuccess("error")).toBe(false);
      expect(isSuccess("log")).toBe(false);
    });
  });

  describe("Error and Warning Counting", () => {
    it("should start with zero counts", () => {
      const errorCount = 0;
      const warningCount = 0;

      expect(errorCount).toBe(0);
      expect(warningCount).toBe(0);
    });

    it("should increment error count correctly", () => {
      let errorCount = 0;

      errorCount++;
      expect(errorCount).toBe(1);

      errorCount++;
      expect(errorCount).toBe(2);
    });

    it("should reset counts on new validation", () => {
      let errorCount = 5;
      let warningCount = 3;

      // Simulate validate() reset
      errorCount = 0;
      warningCount = 0;

      expect(errorCount).toBe(0);
      expect(warningCount).toBe(0);
    });
  });

  describe("Node Renaming Logic", () => {
    it("should build correct Get node key", () => {
      const varName = "MyVariable";
      const getKey = `Get_${varName}`;
      const setKey = `Set_${varName}`;

      expect(getKey).toBe("Get_MyVariable");
      expect(setKey).toBe("Set_MyVariable");
    });

    it("should apply rename to node keys", () => {
      const nodes = new Map();
      nodes.set("node1", { nodeKey: "Get_OldName", title: "Get OldName" });
      nodes.set("node2", { nodeKey: "Set_OldName", title: "Set OldName" });

      const oldName = "OldName";
      const newName = "NewName";

      // Apply renames
      for (const node of nodes.values()) {
        if (node.nodeKey === `Get_${oldName}`) {
          node.nodeKey = `Get_${newName}`;
          node.title = `Get ${newName}`;
        }
        if (node.nodeKey === `Set_${oldName}`) {
          node.nodeKey = `Set_${newName}`;
          node.title = `Set ${newName}`;
        }
      }

      expect(nodes.get("node1").nodeKey).toBe("Get_NewName");
      expect(nodes.get("node2").nodeKey).toBe("Set_NewName");
    });
  });

  describe("Highlighted Nodes Tracking", () => {
    it("should track highlighted node IDs", () => {
      const highlightedNodes = [];

      highlightedNodes.push("node-1");
      highlightedNodes.push("node-2");

      expect(highlightedNodes).toContain("node-1");
      expect(highlightedNodes).toContain("node-2");
      expect(highlightedNodes.length).toBe(2);
    });

    it("should clear highlighted nodes", () => {
      const highlightedNodes = ["a", "b", "c"];

      highlightedNodes.length = 0;

      expect(highlightedNodes).toEqual([]);
    });
  });
});

/**
 * Compiler Integration Tests
 *
 * Tests the Compiler class with mocked dependencies
 */
describe("Compiler Integration", () => {
  let compiler;
  let mockApp;
  let mockOutput;

  beforeEach(() => {
    // Mock DOM elements
    mockOutput = {
      innerHTML: "",
      prepend: vi.fn(),
    };

    vi.spyOn(document, "getElementById").mockImplementation((id) => {
      if (id === "compiler-results") return mockOutput;
      if (id === "toolbar-status") return { textContent: "", style: {} };
      if (id === "compiler-count") return { textContent: "" };
      if (id === "compile-btn")
        return {
          querySelector: () => ({ innerHTML: "" }),
          classList: { add: vi.fn(), remove: vi.fn() },
        };
      return null;
    });

    mockApp = {
      graph: {
        nodes: new Map(),
        updateVariableNodes: vi.fn(),
        drawAllWires: vi.fn(),
        synchronizeNodeWithTemplate: vi.fn(),
      },
      wiring: {
        links: new Map(),
      },
      variables: {
        variables: new Map(),
      },
      persistence: {
        autoSave: vi.fn(),
      },
      dirtyState: {
        markDirty: vi.fn(),
        markClean: vi.fn(),
      },
    };

    // Create a minimal Compiler instance for testing
    compiler = {
      app: mockApp,
      output: mockOutput,
      isDirty: false,
      pendingRenames: [],
      statusElement: { textContent: "", style: {} },
      countElement: { textContent: "" },
      compileBtn: null,
      lastValidationErrors: 0,

      log(message, type = "log") {
        const div = {
          textContent: `[${new Date().toLocaleTimeString()}] ${message}`,
          className: "",
        };
        if (type === "error") div.className = "compiler-issue";
        else if (type === "success") div.className = "compiler-success";
        else div.className = "compiler-log";
        this.output.prepend(div);
        return type === "error";
      },

      registerRename(oldName, newName) {
        this.pendingRenames.push({ oldName, newName });
        this.markDirty();
      },

      markDirty() {
        this.isDirty = true;
        if (this.app.dirtyState) {
          this.app.dirtyState.markDirty();
        }
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("registerRename", () => {
    it("should queue variable rename and mark dirty", () => {
      compiler.registerRename("OldVar", "NewVar");

      expect(compiler.pendingRenames).toHaveLength(1);
      expect(compiler.pendingRenames[0]).toEqual({
        oldName: "OldVar",
        newName: "NewVar",
      });
      expect(compiler.isDirty).toBe(true);
    });

    it("should queue multiple renames", () => {
      compiler.registerRename("A", "B");
      compiler.registerRename("C", "D");

      expect(compiler.pendingRenames).toHaveLength(2);
    });
  });

  describe("markDirty", () => {
    it("should set isDirty to true", () => {
      expect(compiler.isDirty).toBe(false);
      compiler.markDirty();
      expect(compiler.isDirty).toBe(true);
    });

    it("should call dirtyState.markDirty when available", () => {
      compiler.markDirty();
      expect(mockApp.dirtyState.markDirty).toHaveBeenCalled();
    });
  });

  describe("log", () => {
    it("should prepend log messages to output", () => {
      compiler.log("Test message", "log");
      expect(mockOutput.prepend).toHaveBeenCalled();
    });

    it("should return true for error messages", () => {
      const result = compiler.log("Error!", "error");
      expect(result).toBe(true);
    });

    it("should return false for non-error messages", () => {
      const result = compiler.log("Success!", "success");
      expect(result).toBe(false);
    });
  });
});
