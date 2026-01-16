import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * GraphController Unit Tests
 *
 * Tests core graph operations:
 * - Node creation and deletion
 * - Selection management
 * - Pin lookup and connection validation
 * - State management
 */

// Mock dependencies
vi.mock("../../../src/registries/NodeRegistry.js", () => ({
  nodeRegistry: {
    get: vi.fn((key) => {
      const nodes = {
        PrintString: {
          title: "Print String",
          type: "function-node",
          category: "Debug",
          icon: "p",
          pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "string", name: "String", type: "string", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
          ],
        },
        EventBeginPlay: {
          title: "Event Begin Play",
          type: "event-node",
          category: "Event",
          isSingleton: true,
          pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
        },
      };
      return nodes[key] || null;
    }),
    getAll: vi.fn(() => ({})),
  },
}));

vi.mock("../../../src/utils/guid.js", () => ({
  generateGUID: vi.fn(() => `node-${Math.random().toString(36).substr(2, 9)}`),
}));

vi.mock("../../../src/graph/Node.js", () => ({
  Node: class MockNode {
    constructor(id, data, x, y, nodeKey, app) {
      this.id = id;
      this.nodeKey = nodeKey;
      this.title = data.title;
      this.x = x;
      this.y = y;
      this.pins = [];
      this.pinLiterals = new Map();
      this.element = {
        classList: { add: vi.fn(), remove: vi.fn() },
        remove: vi.fn(),
      };
    }
    render() {
      return this.element;
    }
    findPinById(pinId) {
      return this.pins.find((p) => p.id === pinId) || null;
    }
  },
}));

vi.mock("../../../src/graph/GraphInteraction.js", () => ({
  GraphInteraction: class {
    constructor() {}
    initEvents() {}
  },
}));

vi.mock("../../../src/graph/GraphRenderer.js", () => ({
  GraphRenderer: class {
    constructor() {}
    updateTransform() {}
    redrawNodeWires() {}
    drawAllWires() {}
    renderAllNodes() {}
    clearActiveWires() {}
  },
}));

vi.mock("../../../src/ui/BaseController.js", () => ({
  BaseController: class {
    constructor(app) {
      this.app = app;
      this.listeners = [];
    }
    addListener() {}
    cleanup() {}
  },
}));

describe("GraphController", () => {
  let graphController;
  let mockApp;
  let mockEditor;
  let mockSvg;
  let mockNodesContainer;

  beforeEach(async () => {
    mockEditor = {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
      }),
    };
    mockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    mockNodesContainer = document.createElement("div");

    mockApp = {
      graph: null,
      wiring: {
        links: new Map(),
        breakPinLinks: vi.fn(),
        clearAll: vi.fn(),
      },
      compiler: {
        markDirty: vi.fn(),
      },
      persistence: {
        autoSave: vi.fn(),
      },
      history: {
        saveState: vi.fn(),
      },
      details: {
        showNodeDetails: vi.fn(),
        clear: vi.fn(),
      },
      functionRegistry: {
        getAll: () => [],
      },
      macroRegistry: {
        getAll: () => [],
      },
    };

    // Import after mocks are set up
    const { GraphController } = await import(
      "../../../src/graph/GraphController.js"
    );
    graphController = new GraphController(
      mockEditor,
      mockSvg,
      mockNodesContainer,
      mockApp
    );
    mockApp.graph = graphController;
  });

  describe("constructor", () => {
    it("should initialize with empty nodes map", () => {
      expect(graphController.nodes).toBeInstanceOf(Map);
      expect(graphController.nodes.size).toBe(0);
    });

    it("should initialize with empty selection", () => {
      expect(graphController.selectedNodes).toBeInstanceOf(Set);
      expect(graphController.selectedNodes.size).toBe(0);
    });

    it("should set pan to origin", () => {
      expect(graphController.pan).toEqual({ x: 0, y: 0 });
    });

    it("should set zoom to 1", () => {
      expect(graphController.zoom).toBe(1);
    });
  });

  describe("addNode", () => {
    it("should create a node and add to nodes map", () => {
      const node = graphController.addNode("PrintString", 100, 200);

      expect(node).toBeDefined();
      expect(node.nodeKey).toBe("PrintString");
      expect(graphController.nodes.size).toBe(1);
    });

    it("should set node position", () => {
      const node = graphController.addNode("PrintString", 150, 250);

      expect(node.x).toBe(150);
      expect(node.y).toBe(250);
    });

    it("should mark compiler dirty", () => {
      graphController.addNode("PrintString", 0, 0);

      expect(mockApp.compiler.markDirty).toHaveBeenCalled();
    });

    it("should save history state", () => {
      graphController.addNode("PrintString", 0, 0);

      expect(mockApp.history.saveState).toHaveBeenCalledWith("add node");
    });

    it("should return null for unknown node key", () => {
      const node = graphController.addNode("UnknownNode", 0, 0);

      expect(node).toBeNull();
    });

    it("should prevent duplicate singleton nodes", () => {
      const first = graphController.addNode("EventBeginPlay", 0, 0);
      const second = graphController.addNode("EventBeginPlay", 100, 100);

      expect(first).toBeDefined();
      expect(second).toBeNull();
      expect(graphController.nodes.size).toBe(1);
    });
  });

  describe("removeNode", () => {
    it("should remove node from nodes map", () => {
      const node = graphController.addNode("PrintString", 0, 0);
      const nodeId = node.id;

      graphController.removeNode(nodeId);

      expect(graphController.nodes.has(nodeId)).toBe(false);
    });

    it("should do nothing for non-existent node", () => {
      graphController.removeNode("non-existent-id");

      expect(graphController.nodes.size).toBe(0);
    });

    it("should mark compiler dirty", () => {
      const node = graphController.addNode("PrintString", 0, 0);
      mockApp.compiler.markDirty.mockClear();

      graphController.removeNode(node.id);

      expect(mockApp.compiler.markDirty).toHaveBeenCalled();
    });
  });

  describe("selectNode", () => {
    it("should add node to selection", () => {
      const node = graphController.addNode("PrintString", 0, 0);

      graphController.selectNode(node.id, false, "add");

      expect(graphController.selectedNodes.has(node.id)).toBe(true);
    });

    it("should clear previous selection when not adding", () => {
      const node1 = graphController.addNode("PrintString", 0, 0);
      const node2 = graphController.addNode("PrintString", 100, 0);

      graphController.selectNode(node1.id, false, "add");
      graphController.selectNode(node2.id, false, "add"); // Should clear node1

      expect(graphController.selectedNodes.has(node1.id)).toBe(false);
      expect(graphController.selectedNodes.has(node2.id)).toBe(true);
    });

    it("should add to selection when addToSelection is true", () => {
      const node1 = graphController.addNode("PrintString", 0, 0);
      const node2 = graphController.addNode("PrintString", 100, 0);

      graphController.selectNode(node1.id, true, "add");
      graphController.selectNode(node2.id, true, "add");

      expect(graphController.selectedNodes.has(node1.id)).toBe(true);
      expect(graphController.selectedNodes.has(node2.id)).toBe(true);
    });

    it("should show node details when single node selected", () => {
      const node = graphController.addNode("PrintString", 0, 0);

      graphController.selectNode(node.id, false, "add");

      expect(mockApp.details.showNodeDetails).toHaveBeenCalled();
    });
  });

  describe("clearSelection", () => {
    it("should clear all selected nodes", () => {
      const node1 = graphController.addNode("PrintString", 0, 0);
      const node2 = graphController.addNode("PrintString", 100, 0);

      graphController.selectNode(node1.id, true, "add");
      graphController.selectNode(node2.id, true, "add");
      graphController.clearSelection();

      expect(graphController.selectedNodes.size).toBe(0);
    });

    it("should clear details panel", () => {
      const node = graphController.addNode("PrintString", 0, 0);
      graphController.selectNode(node.id);

      graphController.clearSelection();

      expect(mockApp.details.clear).toHaveBeenCalled();
    });
  });

  describe("deleteSelectedNodes", () => {
    it("should delete all selected nodes", () => {
      const node1 = graphController.addNode("PrintString", 0, 0);
      const node2 = graphController.addNode("PrintString", 100, 0);

      graphController.selectNode(node1.id, true, "add");
      graphController.selectNode(node2.id, true, "add");
      graphController.deleteSelectedNodes();

      expect(graphController.nodes.size).toBe(0);
      expect(graphController.selectedNodes.size).toBe(0);
    });

    it("should do nothing when no nodes selected", () => {
      const node = graphController.addNode("PrintString", 0, 0);

      graphController.deleteSelectedNodes();

      expect(graphController.nodes.size).toBe(1);
    });
  });

  describe("getGraphCoords", () => {
    it("should convert client coordinates to graph coordinates", () => {
      const coords = graphController.getGraphCoords(100, 100);

      expect(coords).toEqual({ x: 100, y: 100 });
    });

    it("should account for pan offset", () => {
      graphController.pan = { x: 50, y: 50 };

      const coords = graphController.getGraphCoords(100, 100);

      expect(coords).toEqual({ x: 50, y: 50 });
    });

    it("should account for zoom", () => {
      graphController.zoom = 2;

      const coords = graphController.getGraphCoords(100, 100);

      expect(coords).toEqual({ x: 50, y: 50 });
    });
  });

  describe("clear", () => {
    it("should remove all nodes", () => {
      graphController.addNode("PrintString", 0, 0);
      graphController.addNode("PrintString", 100, 0);

      graphController.clear();

      expect(graphController.nodes.size).toBe(0);
    });

    it("should clear selection", () => {
      const node = graphController.addNode("PrintString", 0, 0);
      graphController.selectNode(node.id, false, "add");

      graphController.clear();

      expect(graphController.selectedNodes.size).toBe(0);
    });
  });

  describe("findPinById", () => {
    it("should return null for invalid pin ID", () => {
      const pin = graphController.findPinById("invalid");

      expect(pin).toBeNull();
    });

    it("should return null for null input", () => {
      const pin = graphController.findPinById(null);

      expect(pin).toBeNull();
    });
  });
});
