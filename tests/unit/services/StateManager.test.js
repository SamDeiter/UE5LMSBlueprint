import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { StateManager } from "../../../src/services/StateManager.js";

describe("StateManager", () => {
  let stateManager;
  let mockApp;

  beforeEach(() => {
    mockApp = {
      variables: {
        variables: new Map([
          ["v1", { id: "v1", name: "Health", type: "float" }],
        ]),
        selectedVariable: null,
      },
      components: new Map([
        ["c1", { id: "c1", name: "Mesh", type: "StaticMeshComponent" }],
      ]),
      functionRegistry: { getAll: vi.fn().mockReturnValue([]) },
      macroRegistry: { getAll: vi.fn().mockReturnValue([]) },
      graph: { nodes: new Map(), selectedNodes: [] },
      wiring: { links: new Map() },
      componentsController: { selectedComponent: null },
      activeGraph: "EventGraph",
      classDefaults: { parentClass: "Actor" },
    };
    stateManager = new StateManager(mockApp);
  });

  afterEach(() => {
    stateManager.clearAll();
  });

  describe("constructor", () => {
    it("should store app reference", () => {
      expect(stateManager.app).toBe(mockApp);
    });

    it("should initialize empty subscribers map", () => {
      expect(stateManager.subscribers).toBeInstanceOf(Map);
      expect(stateManager.subscribers.size).toBe(0);
    });
  });

  describe("subscribe", () => {
    it("should register callback for path", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      expect(stateManager.subscribers.get("variables").size).toBe(1);
    });

    it("should return unsubscribe function", () => {
      const callback = vi.fn();
      const unsubscribe = stateManager.subscribe("variables", callback);

      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
      expect(stateManager.subscribers.has("variables")).toBe(false);
    });

    it("should allow multiple subscribers for same path", () => {
      stateManager.subscribe("variables", vi.fn());
      stateManager.subscribe("variables", vi.fn());

      expect(stateManager.subscribers.get("variables").size).toBe(2);
    });
  });

  describe("unsubscribe", () => {
    it("should remove callback from path", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);
      stateManager.unsubscribe("variables", callback);

      expect(stateManager.subscribers.has("variables")).toBe(false);
    });
  });

  describe("notify", () => {
    it("should call subscribed callbacks with state", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      stateManager.notify("variables");

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("should pass current state to callback", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      stateManager.notify("variables");

      const [receivedValue] = callback.mock.calls[0];
      expect(receivedValue).toHaveLength(1);
      expect(receivedValue[0].name).toBe("Health");
    });

    it("should not throw if no subscribers", () => {
      expect(() => stateManager.notify("unknown")).not.toThrow();
    });
  });

  describe("getState", () => {
    it("should return variables array", () => {
      const state = stateManager.getState("variables");
      expect(state).toHaveLength(1);
      expect(state[0].name).toBe("Health");
    });

    it("should return components array", () => {
      const state = stateManager.getState("components");
      expect(state).toHaveLength(1);
      expect(state[0].name).toBe("Mesh");
    });

    it("should return activeGraph", () => {
      const state = stateManager.getState("activeGraph");
      expect(state).toBe("EventGraph");
    });

    it("should return null for unknown path", () => {
      const state = stateManager.getState("unknown");
      expect(state).toBeNull();
    });
  });

  describe("convenience methods", () => {
    it("addVariable should add and notify", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      stateManager.addVariable({ id: "v2", name: "Mana", type: "int" });

      expect(mockApp.variables.variables.has("v2")).toBe(true);
      expect(callback).toHaveBeenCalled();
    });

    it("updateVariable should update and notify", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      stateManager.updateVariable("v1", { name: "MaxHealth" });

      expect(mockApp.variables.variables.get("v1").name).toBe("MaxHealth");
      expect(callback).toHaveBeenCalled();
    });

    it("removeVariable should remove and notify", () => {
      const callback = vi.fn();
      stateManager.subscribe("variables", callback);

      stateManager.removeVariable("v1");

      expect(mockApp.variables.variables.has("v1")).toBe(false);
      expect(callback).toHaveBeenCalled();
    });

    it("addComponent should add and notify", () => {
      const callback = vi.fn();
      stateManager.subscribe("components", callback);

      stateManager.addComponent({
        id: "c2",
        name: "Light",
        type: "PointLight",
      });

      expect(mockApp.components.has("c2")).toBe(true);
      expect(callback).toHaveBeenCalled();
    });

    it("removeComponent should remove and notify", () => {
      const callback = vi.fn();
      stateManager.subscribe("components", callback);

      stateManager.removeComponent("c1");

      expect(mockApp.components.has("c1")).toBe(false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("notifyAll", () => {
    it("should notify all state paths", () => {
      const callbacks = {
        variables: vi.fn(),
        components: vi.fn(),
        functions: vi.fn(),
      };

      Object.entries(callbacks).forEach(([path, cb]) => {
        stateManager.subscribe(path, cb);
      });

      stateManager.notifyAll();

      expect(callbacks.variables).toHaveBeenCalled();
      expect(callbacks.components).toHaveBeenCalled();
      expect(callbacks.functions).toHaveBeenCalled();
    });
  });

  describe("getStats", () => {
    it("should return subscriber counts", () => {
      stateManager.subscribe("variables", vi.fn());
      stateManager.subscribe("variables", vi.fn());
      stateManager.subscribe("components", vi.fn());

      const stats = stateManager.getStats();

      expect(stats.variables).toBe(2);
      expect(stats.components).toBe(1);
    });
  });

  describe("clearAll", () => {
    it("should remove all subscribers", () => {
      stateManager.subscribe("variables", vi.fn());
      stateManager.subscribe("components", vi.fn());

      stateManager.clearAll();

      expect(stateManager.subscribers.size).toBe(0);
    });
  });
});
