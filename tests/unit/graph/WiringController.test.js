import { describe, it, expect, beforeEach, vi } from "vitest";

/**
 * WiringController Unit Tests
 *
 * Tests wire management and connection logic:
 * - Wire creation and deletion
 * - Link management
 * - Selection handling
 */

// Mock sub-systems
vi.mock("../../../src/graph/wiring/WireManager.js", () => ({
  WireManager: class MockWireManager {
    constructor() {
      this.links = new Map();
      this.selectedLinks = new Set();
    }
    addLinkData(startPin, endPin) {
      const id = `link-${Date.now()}`;
      const link = { id, startPin, endPin };
      this.links.set(id, link);
      startPin.links.push(id);
      endPin.links.push(id);
      return link;
    }
    findLink(linkId) {
      return this.links.get(linkId) || null;
    }
    findLinksByNodeId(nodeId) {
      return [...this.links.values()].filter(
        (l) => l.startPin.node?.id === nodeId || l.endPin.node?.id === nodeId
      );
    }
    findLinksByPinId(pinId) {
      return [...this.links.values()].filter(
        (l) => l.startPin.id === pinId || l.endPin.id === pinId
      );
    }
    deleteLink(linkId) {
      const link = this.links.get(linkId);
      if (link) {
        link.startPin.links = link.startPin.links.filter((id) => id !== linkId);
        link.endPin.links = link.endPin.links.filter((id) => id !== linkId);
        this.links.delete(linkId);
      }
    }
    toggleSelection(linkId) {
      if (this.selectedLinks.has(linkId)) {
        this.selectedLinks.delete(linkId);
      } else {
        this.selectedLinks.add(linkId);
      }
    }
    clearSelection() {
      this.selectedLinks.clear();
    }
    clearAll() {
      this.links.clear();
      this.selectedLinks.clear();
    }
  },
}));

vi.mock("../../../src/graph/wiring/WireRenderer.js", () => ({
  WireRenderer: class MockWireRenderer {
    constructor(controller, svg) {
      this.controller = controller;
      this.svg = svg;
      this.svgGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      this.ghostWire = null;
    }
    drawWire() {}
    drawGhostWire() {}
    updatePinVisualState() {}
    updateNodeVisuals() {}
    setWireActive() {}
    clearActiveWires() {}
    clearAll() {}
  },
}));

vi.mock("../../../src/graph/wiring/WireInteraction.js", () => ({
  WireInteraction: class MockWireInteraction {
    constructor() {}
    connect(pinA, pinB) {}
    handleDoubleClick() {}
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

// Helper to create mock pins
function createMockPin(id, dir, type = "exec") {
  return {
    id,
    name: id,
    type,
    dir,
    links: [],
    node: { id: `node-${id.split("-")[0]}` },
    element: { isConnected: true },
  };
}

describe("WiringController", () => {
  let wiringController;
  let mockApp;
  let mockSvg;

  beforeEach(async () => {
    mockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Mock querySelectorAll to prevent DOM interaction in cleanupOrphanWires
    mockSvg.querySelectorAll = vi.fn(() => []);

    mockApp = {
      graph: {
        nodes: new Map(),
        findPinById: vi.fn(),
        redrawNodeWires: vi.fn(),
      },
      wiring: null,
      compiler: {
        markDirty: vi.fn(),
      },
      persistence: {
        autoSave: vi.fn(),
      },
    };

    const { WiringController } = await import(
      "../../../src/graph/WiringController.js"
    );
    wiringController = new WiringController(mockSvg, mockApp);
    mockApp.wiring = wiringController;
  });

  describe("constructor", () => {
    it("should initialize with empty links", () => {
      expect(wiringController.links).toBeInstanceOf(Map);
      expect(wiringController.links.size).toBe(0);
    });

    it("should initialize renderer", () => {
      expect(wiringController.renderer).toBeDefined();
    });

    it("should initialize manager", () => {
      expect(wiringController.manager).toBeDefined();
    });

    it("should initialize interaction handler", () => {
      expect(wiringController.interaction).toBeDefined();
    });
  });

  describe("links property", () => {
    it("should delegate to manager.links", () => {
      expect(wiringController.links).toBe(wiringController.manager.links);
    });
  });

  describe("selectedLinks property", () => {
    it("should delegate to manager.selectedLinks", () => {
      expect(wiringController.selectedLinks).toBe(
        wiringController.manager.selectedLinks
      );
    });
  });

  describe("findLink", () => {
    it("should find link by ID", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);
      const found = wiringController.findLink(link.id);

      expect(found).toBe(link);
    });

    it("should return null for non-existent link", () => {
      const found = wiringController.findLink("non-existent");

      expect(found).toBeNull();
    });
  });

  describe("findLinksByPinId", () => {
    it("should find links connected to a pin", () => {
      const startPin = createMockPin("out1", "out");
      const endPin = createMockPin("in1", "in");

      wiringController.manager.addLinkData(startPin, endPin);

      const links = wiringController.findLinksByPinId("in1");

      expect(links.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("createLink", () => {
    it("should create a link between two pins", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      wiringController.createLink(startPin, endPin);

      expect(wiringController.links.size).toBe(1);
    });

    it("should mark compiler dirty", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      wiringController.createLink(startPin, endPin);

      expect(mockApp.compiler.markDirty).toHaveBeenCalled();
    });

    it("should auto-save", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      wiringController.createLink(startPin, endPin);

      expect(mockApp.persistence.autoSave).toHaveBeenCalled();
    });
  });

  describe("breakLink", () => {
    it("should remove a link by ID", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);
      wiringController.breakLink(link.id);

      expect(wiringController.links.size).toBe(0);
    });

    it("should update pin links arrays", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);
      expect(startPin.links).toContain(link.id);
      expect(endPin.links).toContain(link.id);

      wiringController.breakLink(link.id);

      expect(startPin.links).not.toContain(link.id);
      expect(endPin.links).not.toContain(link.id);
    });
  });

  describe("breakPinLinks", () => {
    it("should break all links connected to a pin", () => {
      const startPin1 = createMockPin("out1", "out");
      const startPin2 = createMockPin("out2", "out");
      const endPin = createMockPin("in", "in");

      wiringController.manager.addLinkData(startPin1, endPin);
      wiringController.manager.addLinkData(startPin2, endPin);

      wiringController.breakPinLinks("in");

      expect(wiringController.links.size).toBe(0);
    });
  });

  describe("clearAll", () => {
    it("should remove all links", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      wiringController.manager.addLinkData(startPin, endPin);
      wiringController.clearAll();

      expect(wiringController.links.size).toBe(0);
    });
  });

  describe("handleLinkClick", () => {
    it("should toggle link selection", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);

      wiringController.handleLinkClick(link.id);
      expect(wiringController.selectedLinks.has(link.id)).toBe(true);

      wiringController.handleLinkClick(link.id);
      expect(wiringController.selectedLinks.has(link.id)).toBe(false);
    });
  });

  describe("clearLinkSelection", () => {
    it("should clear all selected links", () => {
      const startPin = createMockPin("out", "out");
      const endPin = createMockPin("in", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);
      wiringController.handleLinkClick(link.id);

      wiringController.clearLinkSelection();

      expect(wiringController.selectedLinks.size).toBe(0);
    });
  });

  describe("deleteSelectedLinks", () => {
    it("should delete selected links and clear selection", () => {
      // Use unique pins for each link to avoid shared state issues
      const startPin = createMockPin("out1", "out");
      const endPin = createMockPin("in1", "in");

      const link = wiringController.manager.addLinkData(startPin, endPin);
      wiringController.handleLinkClick(link.id);
      expect(wiringController.selectedLinks.size).toBe(1);

      wiringController.deleteSelectedLinks();

      expect(wiringController.selectedLinks.size).toBe(0);
    });
  });
});
