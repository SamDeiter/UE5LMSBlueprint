import { vi } from "vitest";

/**
 * Create a mock ApplicationController instance
 * This is used throughout tests to simulate the main app context
 */
export function createMockApp() {
  return {
    graph: {
      nodes: new Map(),
      connections: new Map(),
      clearSelection: vi.fn(),
      selectNode: vi.fn(),
      deselectNode: vi.fn(),
      getSelectedNodes: vi.fn(() => []),
      redrawNodeWires: vi.fn(),
      renderer: null,
    },
    wiring: {
      links: new Map(),
      createConnection: vi.fn(),
      breakConnection: vi.fn(),
      breakLinkById: vi.fn(),
      getConnectionsForPin: vi.fn(() => []),
      findLinksByNodeId: vi.fn(() => []),
      updateVisuals: vi.fn(),
    },
    compiler: {
      markDirty: vi.fn(),
      isDirty: false,
      compile: vi.fn(() => ({ success: true, errors: [] })),
      registerRename: vi.fn(),
      log: vi.fn(),
    },
    persistence: {
      autoSave: vi.fn(),
      save: vi.fn(),
      load: vi.fn(),
    },
    // VariableController has internal 'variables' Map
    variables: {
      variables: new Map(),
      addVariable: vi.fn(),
      removeVariable: vi.fn(),
      getVariable: vi.fn(),
      renderPanel: vi.fn(),
    },
    components: new Map(),
    details: {
      currentVariable: null,
      clear: vi.fn(),
      showVariableDetails: vi.fn(),
      showComponentDetails: vi.fn(),
    },
    palette: {
      populateList: vi.fn(),
    },
    history: {
      saveState: vi.fn(),
    },
    taskManager: {
      currentTask: null,
      validateCurrentTask: vi.fn(),
      loadTask: vi.fn(),
    },
    simulationEngine: {
      isRunning: false,
      start: vi.fn(),
      stop: vi.fn(),
      step: vi.fn(),
    },
    componentsController: null,
    variableController: null,
    macroRegistry: null,
    functionRegistry: null,
    classSettings: { interfaces: [] },
  };
}

/**
 * Create a mock Node instance
 */
export function createMockNode(overrides = {}) {
  return {
    id: "test-node-id",
    nodeKey: "Print",
    title: "Print String",
    x: 0,
    y: 0,
    pins: [],
    element: document.createElement("div"),
    render: vi.fn(),
    destroy: vi.fn(),
    setPosition: vi.fn(),
    getInputPin: vi.fn(),
    getOutputPin: vi.fn(),
    ...overrides,
  };
}

/**
 * Create a mock Pin instance
 */
export function createMockPin(overrides = {}) {
  return {
    id: "test-pin-id",
    name: "test-pin",
    type: "exec",
    direction: "input",
    node: null,
    connections: [],
    element: document.createElement("div"),
    ...overrides,
  };
}

/**
 * Create a mock SVG element for graph rendering
 */
export function createMockSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "1000");
  svg.setAttribute("height", "1000");
  return svg;
}

/**
 * Create a mock DOM container
 */
export function createMockContainer() {
  const container = document.createElement("div");
  container.style.width = "1000px";
  container.style.height = "1000px";
  return container;
}
