/**
 * Runtime tests for Event Dispatchers.
 *
 * These tests confirm UE5-faithful behavior:
 *  - Multicast: Call iterates the listener list; no listeners = silent no-op.
 *  - Bind requires a target; null target fails silently.
 *  - Late binding: actors that bind after a Call do not receive past events.
 *  - UnbindAll clears every listener for the target.
 *  - Per-dispatcher Call/Bind/Unbind/UnbindAll palette nodes are registered
 *    and removed when dispatchers are added/removed/renamed.
 */

import { nodeRegistry } from "../registries/NodeRegistry.js";

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function getExecutor(app) {
  return app.sim?.eventDispatcherExecutor;
}

function freshDispatcher(app, name = "TestDispatcher") {
  const ctrl = app.eventDispatchers;
  // Wipe any leftover state from prior tests
  ctrl.dispatchers.clear();
  ctrl.updateNodeLibrary();

  ctrl.addDispatcher();
  const dispatcher = [...ctrl.dispatchers.values()].pop();
  dispatcher.name = name;
  ctrl.renamingId = null;
  ctrl.updateNodeLibrary();
  return dispatcher;
}

export function registerEventDispatcherTests(runner) {
  runner.register("Dispatcher: registers Call/Bind/Unbind/UnbindAll nodes", (app) => {
    const dispatcher = freshDispatcher(app, "OnTestEvent");

    const expected = [
      `CallDispatcher_${dispatcher.id}`,
      `BindToDispatcher_${dispatcher.id}`,
      `UnbindFromDispatcher_${dispatcher.id}`,
      `UnbindAllFromDispatcher_${dispatcher.id}`,
    ];
    for (const key of expected) {
      assert(nodeRegistry.has(key), `Expected node '${key}' to be registered`);
    }

    const callDef = nodeRegistry.get(`CallDispatcher_${dispatcher.id}`);
    assert(callDef.title === "Call OnTestEvent", "Call node title should reflect dispatcher name");
    assert(
      callDef.pins.some((p) => p.id === "target_in"),
      "Call node must expose a Target pin"
    );
  });

  runner.register("Dispatcher: parameters become input pins on Call node", (app) => {
    const dispatcher = freshDispatcher(app, "OnHealthChanged");
    app.eventDispatchers.addParameter(dispatcher);
    dispatcher.parameters[0].name = "NewHealth";
    dispatcher.parameters[0].type = "float";
    app.eventDispatchers.updateNodeLibrary();

    const callDef = nodeRegistry.get(`CallDispatcher_${dispatcher.id}`);
    const param = callDef.pins.find((p) => p.id === "param_0");
    assert(param, "Call node should have param_0 pin after parameter is added");
    assert(param.type === "float", "Parameter pin type should match dispatcher parameter type");
    assert(param.name === "NewHealth", "Parameter pin name should match dispatcher parameter name");
  });

  runner.register("Dispatcher: rename updates node titles, deletion unregisters them", (app) => {
    const dispatcher = freshDispatcher(app, "Original");
    app.eventDispatchers.finishRenaming(dispatcher, "Renamed");

    const callDef = nodeRegistry.get(`CallDispatcher_${dispatcher.id}`);
    assert(callDef && callDef.title === "Call Renamed", "Call title should follow rename");

    app.eventDispatchers.dispatchers.delete(dispatcher.id);
    app.eventDispatchers.updateNodeLibrary();
    assert(
      !nodeRegistry.has(`CallDispatcher_${dispatcher.id}`),
      "Call node should be unregistered when dispatcher is deleted"
    );
    assert(
      !nodeRegistry.has(`BindToDispatcher_${dispatcher.id}`),
      "Bind node should be unregistered when dispatcher is deleted"
    );
  });

  runner.register("Dispatcher: Call with zero listeners is a silent no-op", (app) => {
    const dispatcher = freshDispatcher(app, "OnSilent");
    const exec = getExecutor(app);
    assert(exec, "EventDispatcherExecutor must be wired into SimulationEngine");
    exec.clearBindings();

    const fakeNode = {
      nodeKey: `CallDispatcher_${dispatcher.id}`,
      pins: [
        { id: "exec_in", type: "exec", dir: "in" },
        { id: "exec_out", type: "exec", dir: "out" },
      ],
    };

    const result = exec.executeCall(fakeNode);
    assert(result === "exec_out", "Call must return exec_out even with no listeners (no-op)");
  });

  runner.register("Dispatcher: Bind requires a target; null target fails silently", (app) => {
    const dispatcher = freshDispatcher(app, "OnNullTarget");
    const exec = getExecutor(app);
    exec.clearBindings();

    const targetPin = { id: "target_in", type: "object", dir: "in", links: [{}] };

    const fakeNode = {
      nodeKey: `BindToDispatcher_${dispatcher.id}`,
      pins: [
        { id: "exec_in", type: "exec", dir: "in" },
        targetPin,
        { id: "event_in", type: "object", dir: "in", links: [] },
        { id: "exec_out", type: "exec", dir: "out" },
      ],
    };

    // Patch evaluateInput to return null for target_in (simulating None reference).
    const originalEval = exec.engine.evaluateInput;
    exec.engine.evaluateInput = function (_node, pinId) {
      if (pinId === "target_in") return null;
      return null;
    };

    try {
      const result = exec.executeBind(fakeNode);
      assert(result === "exec_out", "Bind must still flow through exec");
      assert(
        exec.bindings.size === 0,
        "Null target must not register a listener (silent failure)"
      );
    } finally {
      exec.engine.evaluateInput = originalEval;
    }
  });

  runner.register("Dispatcher: UnbindAll clears every listener for the target", (app) => {
    const dispatcher = freshDispatcher(app, "OnMass");
    const exec = getExecutor(app);
    exec.clearBindings();

    // Manually add three listeners on the same target.
    const cb1 = () => {};
    const cb2 = () => {};
    const cb3 = () => {};
    exec.addListener(dispatcher.id, "__SELF__", cb1);
    exec.addListener(dispatcher.id, "__SELF__", cb2);
    exec.addListener(dispatcher.id, "__SELF__", cb3);

    const before = exec.getListeners(dispatcher.id, "__SELF__").size;
    assert(before === 3, "Three listeners should be registered before UnbindAll");

    const fakeNode = {
      nodeKey: `UnbindAllFromDispatcher_${dispatcher.id}`,
      pins: [
        { id: "exec_in", type: "exec", dir: "in" },
        { id: "target_in", type: "object", dir: "in", links: [] },
        { id: "exec_out", type: "exec", dir: "out" },
      ],
    };
    exec.executeUnbindAll(fakeNode);

    const after = exec.bindings.get(dispatcher.id)?.get("__SELF__");
    assert(!after || after.size === 0, "All listeners must be cleared after UnbindAll");
  });

  runner.register("Dispatcher: late-binding listeners do not receive past calls", (app) => {
    const dispatcher = freshDispatcher(app, "OnLate");
    const exec = getExecutor(app);
    exec.clearBindings();

    let callCount = 0;
    const earlyCb = () => callCount++;

    // First Call happens with no listeners — no-op.
    const callNode = {
      nodeKey: `CallDispatcher_${dispatcher.id}`,
      pins: [
        { id: "exec_in", type: "exec", dir: "in" },
        { id: "target_in", type: "object", dir: "in", links: [] },
        { id: "exec_out", type: "exec", dir: "out" },
      ],
    };
    exec.executeCall(callNode);
    assert(callCount === 0, "No listener was bound; callback must not have fired");

    // Bind happens AFTER the call.
    exec.addListener(dispatcher.id, "__SELF__", earlyCb);
    assert(
      callCount === 0,
      "Late-binding must not retroactively replay missed dispatcher calls"
    );

    // A subsequent Call should now reach the listener.
    exec.executeCall(callNode);
    assert(callCount === 1, "Bound listener should receive subsequent Call");
  });
}
