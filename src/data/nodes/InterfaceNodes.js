/**
 * InterfaceNodes - Node definitions for Blueprint Interface dispatch.
 *
 * Static defs (this file's default export):
 *   - InterfaceFunctionEntry  — entry point of an interface impl graph (mirrors FunctionEntry)
 *   - InterfaceFunctionResult — return point of an interface impl graph (mirrors FunctionResult)
 *
 * Dynamic defs (built per registered interface via the helpers below):
 *   - Message_<Iface>_<Func>  — caller invokes a function on a target object
 *   - Event_<Iface>_<Func>    — handler-style entry node (alternative to Message;
 *                                some students think of interfaces in observer terms)
 *
 * Pin shapes for Entry/Result are blank in the registry; FunctionsController-style
 * pin sync wires them up per-implementation when the stub graph is created.
 */

import { interfaceRegistry } from "../../interfaces/InterfaceRegistry.js";

export const InterfaceNodes = {
  InterfaceFunctionEntry: {
    title: "Interface Function Entry",
    type: "event-node",
    category: "Interface",
    executor: "Interface",
    icon: "f",
    isSingleton: true,
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  InterfaceFunctionResult: {
    title: "Return Node",
    type: "flow-node",
    category: "Interface",
    executor: "Interface",
    icon: "fa-sign-out-alt",
    pins: [{ id: "exec_in", name: "Exec", type: "exec", dir: "in" }],
  },
  /**
   * DoesImplementInterface — pure node that checks at runtime whether an
   * object implements a named interface. The defensive guard students should
   * use before sending a Message when they don't trust that the target
   * implements the interface (since unimplemented messages silently no-op,
   * a quiet bug is worse than a branch they can see).
   */
  DoesImplementInterface: {
    title: "Does Implement Interface",
    type: "pure-node",
    category: "Interface",
    executor: "Interface",
    icon: "fa-question-circle",
    description:
      "Returns true if the object implements the named interface. Use before sending an interface message when the target type isn't guaranteed.",
    pins: [
      {
        id: "object_in",
        name: "Object",
        type: "object",
        dir: "in",
      },
      {
        // Free-text interface name input. We could make this a dropdown of
        // registered interfaces, but a string keeps the validator simple
        // (node_property check) and matches how UE5's editor displays it.
        id: "interface_name_in",
        name: "Interface",
        type: "string",
        dir: "in",
        defaultValue: "IInteractable",
      },
      {
        id: "ret_out",
        name: "Return Value",
        type: "bool",
        dir: "out",
      },
    ],
  },
};

/**
 * Build the Message_<Iface>_<Func> node definition.
 * Caller wires `target` to an object reference + provides function inputs;
 * the executor dispatches to that object's implementation graph at runtime.
 *
 * @param {InterfaceDefinition} iface
 * @param {{name, description, inputs, outputs, isPure}} fn
 * @returns {{key: string, def: object}}
 */
export function buildMessageNodeDef(iface, fn) {
  const key = `Message_${iface.name}_${fn.name}`;
  const pins = [];

  if (!fn.isPure) {
    pins.push({ id: "exec_in", name: "Exec", type: "exec", dir: "in" });
  }
  // Target: any object whose Blueprint declares it implements `iface`.
  // TypeSystem accepts object/component → interface at wire-connect time;
  // the runtime check happens inside InterfaceExecutor.
  pins.push({
    id: "target_in",
    name: "Target",
    type: "interface",
    dir: "in",
    interfaceName: iface.name,
  });

  for (const input of fn.inputs || []) {
    pins.push({
      id: `in_${input.name}`,
      name: input.name,
      type: input.type,
      dir: "in",
      defaultValue: input.defaultValue,
    });
  }

  if (!fn.isPure) {
    pins.push({ id: "exec_out", name: "Exec", type: "exec", dir: "out" });
  }
  for (const output of fn.outputs || []) {
    pins.push({
      id: `out_${output.name}`,
      name: output.name,
      type: output.type,
      dir: "out",
    });
  }

  return {
    key,
    def: {
      title: `${fn.name} (Message)`,
      type: fn.isPure ? "pure-node" : "function-node",
      category: `Interfaces|${iface.name}`,
      executor: "Interface",
      icon: "fa-comment-dots",
      description:
        fn.description || `Send ${fn.name} message to objects implementing ${iface.name}`,
      pins,
      // customData lets the executor look up the interface signature without
      // re-parsing the nodeKey on every call.
      customData: { interfaceName: iface.name, functionName: fn.name },
    },
  };
}

/**
 * Build the Event_<Iface>_<Func> node definition.
 * Acts as an entry point inside an implementation graph — the alternative
 * to the auto-seeded InterfaceFunctionEntry for students who prefer the
 * "event reacts to message" mental model.
 *
 * @param {InterfaceDefinition} iface
 * @param {{name, description, inputs, outputs, isPure}} fn
 */
export function buildEventNodeDef(iface, fn) {
  const key = `Event_${iface.name}_${fn.name}`;
  const pins = [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }];

  for (const input of fn.inputs || []) {
    pins.push({
      id: `out_${input.name}`,
      name: input.name,
      type: input.type,
      dir: "out",
    });
  }

  return {
    key,
    def: {
      title: `Event ${iface.name}.${fn.name}`,
      type: "event-node",
      category: `Interfaces|${iface.name}`,
      executor: "Interface",
      icon: "fa-bolt",
      isSingleton: true,
      description: `Triggered when ${iface.name}.${fn.name} is called on this object`,
      pins,
      customData: { interfaceName: iface.name, functionName: fn.name },
    },
  };
}

/**
 * Register Message/Event node defs for every function on every registered
 * interface. Idempotent: NodeRegistry.register overwrites with a warning,
 * so calling this twice is safe but noisy.
 *
 * Call once after NodeRegistry.registerBatch(NodeDefinitions).
 *
 * @param {NodeRegistry} nodeRegistry - The node registry singleton
 */
export function registerAllInterfaceNodes(nodeRegistry) {
  for (const iface of interfaceRegistry.getAll()) {
    registerNodesForInterface(nodeRegistry, iface);
  }
}

/**
 * Register Message/Event node defs for a single interface.
 * Use when a custom interface is created at runtime.
 */
export function registerNodesForInterface(nodeRegistry, iface) {
  for (const fn of iface.functions) {
    const msg = buildMessageNodeDef(iface, fn);
    nodeRegistry.register(msg.key, msg.def);
    const evt = buildEventNodeDef(iface, fn);
    nodeRegistry.register(evt.key, evt.def);
  }
}

/**
 * Unregister all Message/Event node defs for an interface.
 * Use when a custom interface is deleted.
 */
export function unregisterNodesForInterface(nodeRegistry, iface) {
  for (const fn of iface.functions) {
    nodeRegistry.unregister(`Message_${iface.name}_${fn.name}`);
    nodeRegistry.unregister(`Event_${iface.name}_${fn.name}`);
  }
}
