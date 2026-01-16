import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockApp, createMockNode } from "../../helpers/mocks.js";

/**
 * SimulationEngine Unit Tests
 *
 * Tests the core simulation functionality including:
 * - State management (run/stop/pause/resume)
 * - Executor registration
 * - Pin evaluation
 * - Node value resolution
 */

// Mock the imports to avoid loading all executor files
vi.mock("../../../src/services/executors/ExecutorRegistry.js", () => ({
  ExecutorRegistry: class {
    constructor() {
      this.executors = new Map();
      this.patternExecutors = [];
    }
    register(key, executor) {
      this.executors.set(key, executor);
    }
    registerPattern(pattern, executor) {
      this.patternExecutors.push({ pattern, executor });
    }
    getExecutor(nodeKey) {
      if (this.executors.has(nodeKey)) {
        return this.executors.get(nodeKey);
      }
      for (const { pattern, executor } of this.patternExecutors) {
        if (pattern.test(nodeKey)) {
          return executor;
        }
      }
      return null;
    }
    hasExecutor(nodeKey) {
      return this.getExecutor(nodeKey) !== null;
    }
  },
}));

// Mock all executor imports
const mockExecutorClasses = [
  "EventExecutor",
  "FlowControlExecutor",
  "PrintExecutor",
  "MathExecutor",
  "VariableExecutor",
  "CastExecutor",
  "ConversionExecutor",
  "TimelineExecutor",
  "FunctionExecutor",
  "MacroExecutor",
  "NeedNodeExecutor",
  "StringExecutor",
  "ActorExecutor",
  "VectorExecutor",
  "TimerExecutor",
  "TraceExecutor",
  "InputExecutor",
  "AudioExecutor",
  "VFXExecutor",
  "CollectionExecutor",
];

mockExecutorClasses.forEach((name) => {
  vi.mock(`../../../src/services/executors/${name}.js`, () => ({
    [name]: class {
      constructor() {}
      evaluateValue() {
        return null;
      }
    },
  }));
});

vi.mock("../../../src/engine/EngineUI.js", () => ({
  EngineUI: class {
    constructor() {}
    log() {}
    update() {}
  },
}));

vi.mock("../../../src/engine/EngineLoop.js", () => ({
  EngineLoop: class {
    constructor() {}
    start() {}
    stop() {}
  },
}));

vi.mock("../../../src/engine/EngineFlow.js", () => ({
  EngineFlow: class {
    constructor() {
      this.callStack = [];
    }
    executeFlow() {}
    resume() {}
  },
}));

vi.mock("../../../src/services/GraphValidator.js", () => ({
  GraphValidator: class {
    constructor() {}
    validate() {
      return { valid: true, errors: [] };
    }
  },
}));

vi.mock("../../../src/services/ScormClient.js", () => ({
  scormClient: {
    isInitialized: false,
    initialize: vi.fn(),
    setScore: vi.fn(),
    setPassed: vi.fn(),
  },
}));

vi.mock("../../../src/services/TimerManager.js", () => ({
  timerManager: {
    clear: vi.fn(),
  },
}));

vi.mock("../../../src/data/nodes/index.js", () => ({
  NodeDefinitions: {
    TestNode: { executor: "Math", title: "Test", type: "pure-node", pins: [] },
    PrintString: {
      executor: "Print",
      title: "Print",
      type: "function-node",
      pins: [],
    },
  },
}));

describe("SimulationEngine", () => {
  let engine;
  let mockApp;

  beforeEach(async () => {
    mockApp = createMockApp();
    mockApp.graph.nodes = new Map();
    mockApp.graph.clearActiveWires = vi.fn();
    mockApp.debugger = null;

    // Dynamic import to use mocked dependencies
    const { SimulationEngine } = await import(
      "../../../src/services/SimulationEngine.js"
    );
    engine = new SimulationEngine(mockApp);
  });

  describe("constructor", () => {
    it("should initialize with app reference", () => {
      expect(engine.app).toBe(mockApp);
    });

    it("should start with isRunning = false", () => {
      expect(engine.isRunning).toBe(false);
    });

    it("should start with isPaused = false", () => {
      expect(engine.isPaused).toBe(false);
    });

    it("should initialize executorRegistry", () => {
      expect(engine.executorRegistry).toBeDefined();
      expect(engine.executorRegistry.executors).toBeDefined();
    });

    it("should initialize sub-systems (ui, loop, flow)", () => {
      expect(engine.ui).toBeDefined();
      expect(engine.loop).toBeDefined();
      expect(engine.flow).toBeDefined();
    });

    it("should initialize state containers", () => {
      expect(engine.contextVariables).toBeInstanceOf(Map);
      expect(engine.actors).toBeInstanceOf(Map);
    });
  });

  describe("initializeExecutors", () => {
    it("should register executors from NodeDefinitions", () => {
      // Executors are auto-registered in constructor
      // Verify pattern executors were registered
      expect(engine.executorRegistry.patternExecutors.length).toBeGreaterThan(
        0
      );
    });

    it("should register pattern for Get_ nodes", () => {
      const hasGetPattern = engine.executorRegistry.patternExecutors.some((p) =>
        p.pattern.test("Get_MyVariable")
      );
      expect(hasGetPattern).toBe(true);
    });

    it("should register pattern for Set_ nodes", () => {
      const hasSetPattern = engine.executorRegistry.patternExecutors.some((p) =>
        p.pattern.test("Set_MyVariable")
      );
      expect(hasSetPattern).toBe(true);
    });

    it("should register pattern for CastTo_ nodes", () => {
      const hasCastPattern = engine.executorRegistry.patternExecutors.some(
        (p) => p.pattern.test("CastTo_Actor")
      );
      expect(hasCastPattern).toBe(true);
    });
  });

  describe("run", () => {
    it("should set isRunning to true", () => {
      engine.run();
      expect(engine.isRunning).toBe(true);
    });

    it("should not start again if already running", () => {
      engine.run();
      const initialState = engine.isRunning;
      engine.run();
      expect(engine.isRunning).toBe(initialState);
    });

    it("should auto-compile if graph is dirty", () => {
      mockApp.compiler.isDirty = true;
      engine.run();
      expect(mockApp.compiler.compile).toHaveBeenCalled();
    });
  });

  describe("stop", () => {
    it("should set isRunning to false", () => {
      engine.run();
      engine.stop();
      expect(engine.isRunning).toBe(false);
    });

    it("should set isPaused to false", () => {
      engine.isPaused = true;
      engine.stop();
      expect(engine.isPaused).toBe(false);
    });

    it("should clear pausedNode", () => {
      engine.pausedNode = createMockNode();
      engine.stop();
      expect(engine.pausedNode).toBeNull();
    });
  });

  describe("pause", () => {
    it("should set isPaused to true", () => {
      const mockNode = createMockNode();
      engine.pause(mockNode);
      expect(engine.isPaused).toBe(true);
    });

    it("should store the paused node", () => {
      const mockNode = createMockNode();
      engine.pause(mockNode);
      expect(engine.pausedNode).toBe(mockNode);
    });

    it("should set isStepping to false", () => {
      engine.isStepping = true;
      engine.pause(createMockNode());
      expect(engine.isStepping).toBe(false);
    });
  });

  describe("resume", () => {
    it("should set isPaused to false", () => {
      engine.isPaused = true;
      engine.resume();
      expect(engine.isPaused).toBe(false);
    });

    it("should clear pausedNode", () => {
      engine.isPaused = true;
      engine.pausedNode = createMockNode();
      engine.resume();
      expect(engine.pausedNode).toBeNull();
    });

    it("should not resume if not paused", () => {
      engine.isPaused = false;
      const initialState = engine.pausedNode;
      engine.resume();
      expect(engine.pausedNode).toBe(initialState);
    });
  });

  describe("stepping", () => {
    it("stepOver should set stepMode to 'over'", () => {
      engine.isPaused = true;
      engine.stepOver();
      expect(engine.stepMode).toBe("over");
    });

    it("stepInto should set stepMode to 'into'", () => {
      engine.isPaused = true;
      engine.stepInto();
      expect(engine.stepMode).toBe("into");
    });

    it("stepOut should set stepMode to 'out'", () => {
      engine.isPaused = true;
      engine.stepOut();
      expect(engine.stepMode).toBe("out");
    });

    it("should not step if not paused", () => {
      engine.isPaused = false;
      engine.stepOver();
      expect(engine.stepMode).toBeNull();
    });
  });

  describe("log", () => {
    it("should delegate to ui.log", () => {
      const logSpy = vi.spyOn(engine.ui, "log");
      engine.log("test message", "success");
      expect(logSpy).toHaveBeenCalledWith("test message", "success");
    });
  });

  describe("reportToSCORM", () => {
    it("should report score and pass status", async () => {
      const { scormClient } = await import(
        "../../../src/services/ScormClient.js"
      );
      engine.reportToSCORM(85, true);
      expect(scormClient.setScore).toHaveBeenCalledWith(85);
      expect(scormClient.setPassed).toHaveBeenCalledWith(true);
    });
  });

  describe("evaluateInput", () => {
    it("should return null if pin not found", () => {
      const mockNode = createMockNode();
      mockNode.findPinById = vi.fn(() => null);

      const result = engine.evaluateInput(mockNode, "nonexistent-pin");
      expect(result).toBeNull();
    });

    it("should call evaluatePin when pin is found", () => {
      const mockNode = createMockNode();
      const mockPin = {
        id: "test-node-id-input",
        name: "Input",
        defaultValue: 42,
      };
      mockNode.findPinById = vi.fn(() => mockPin);
      mockNode.pinLiterals = new Map();

      // Mock the evaluatePin to return a value
      const evaluatePinSpy = vi
        .spyOn(engine, "evaluatePin")
        .mockReturnValue(42);

      const result = engine.evaluateInput(mockNode, "input");
      expect(mockNode.findPinById).toHaveBeenCalledWith("test-node-id-input");
      expect(evaluatePinSpy).toHaveBeenCalledWith(mockPin);
      expect(result).toBe(42);
    });
  });

  describe("evaluatePin", () => {
    it("should return default value when pin is not connected", () => {
      const mockPin = {
        id: "pin-1",
        name: "Value",
        defaultValue: 100,
        isConnected: () => false,
        links: [],
        node: { pinLiterals: new Map() },
      };

      const result = engine.evaluatePin(mockPin);
      expect(result).toBe(100);
    });

    it("should return literal value when set", () => {
      const pinLiterals = new Map();
      pinLiterals.set("pin-1", 999);

      const mockPin = {
        id: "pin-1",
        name: "Value",
        defaultValue: 100,
        isConnected: () => false,
        links: [],
        node: { pinLiterals },
      };

      const result = engine.evaluatePin(mockPin);
      expect(result).toBe(999);
    });

    it("should handle split pins for vectors", () => {
      const mockSubPins = [
        {
          id: "x",
          defaultValue: 1,
          isConnected: () => false,
          links: [],
          node: { pinLiterals: new Map() },
        },
        {
          id: "y",
          defaultValue: 2,
          isConnected: () => false,
          links: [],
          node: { pinLiterals: new Map() },
        },
        {
          id: "z",
          defaultValue: 3,
          isConnected: () => false,
          links: [],
          node: { pinLiterals: new Map() },
        },
      ];

      const mockPin = {
        id: "vector-pin",
        type: "vector",
        isSplit: true,
        subPins: mockSubPins,
        isConnected: () => false,
        links: [],
        node: { pinLiterals: new Map() },
      };

      const result = engine.evaluatePin(mockPin);
      expect(result).toBe("(1, 2, 3)");
    });
  });

  describe("evaluateNeedNodes", () => {
    it("should log message when no NeedNodes exist", () => {
      mockApp.graph.nodes = new Map();
      const logSpy = vi.spyOn(engine.ui, "log");

      engine.evaluateNeedNodes();

      expect(logSpy).toHaveBeenCalledWith("No NeedNodes found.");
    });

    it("should call taskController.runValidation after assessment", () => {
      const mockNeedNode = createMockNode({ nodeKey: "NeedNode" });
      mockApp.graph.nodes = new Map([["need-1", mockNeedNode]]);
      mockApp.taskController = {
        runValidation: vi.fn(),
        switchToStatusTab: vi.fn(),
      };

      engine.evaluateNeedNodes();

      expect(mockApp.taskController.runValidation).toHaveBeenCalled();
      expect(mockApp.taskController.switchToStatusTab).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should resume instead of run when paused", () => {
      engine.isRunning = true;
      engine.isPaused = true;
      const resumeSpy = vi.spyOn(engine, "resume");

      engine.run();

      expect(resumeSpy).toHaveBeenCalled();
    });

    it("should halt simulation if compile fails", () => {
      mockApp.compiler.isDirty = true;
      // Mock compile to leave isDirty true (compile failed)
      mockApp.compiler.compile = vi.fn(() => {
        // isDirty stays true = failure
      });

      const logSpy = vi.spyOn(engine.ui, "log");
      engine.run();

      expect(logSpy).toHaveBeenCalledWith(
        "Simulation halted: Compile failed.",
        "error"
      );
      expect(engine.isRunning).toBe(false);
    });

    it("should add paused-node class when pausing", () => {
      const mockElement = { classList: { add: vi.fn(), remove: vi.fn() } };
      const mockNode = createMockNode({ element: mockElement });

      engine.pause(mockNode);

      expect(mockElement.classList.add).toHaveBeenCalledWith("paused-node");
    });
  });
});
