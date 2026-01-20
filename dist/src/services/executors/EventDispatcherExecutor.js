/**
 * EventDispatcherExecutor - Handles Event Dispatcher nodes
 * (CallDispatcher, BindToDispatcher, UnbindFromDispatcher)
 */
import { BaseExecutor } from "./BaseExecutor.js";

export class EventDispatcherExecutor extends BaseExecutor {
  constructor(app) {
    super(app);
    // Map of dispatcherId -> Set of bound callback functions
    this.bindings = new Map();
  }

  /**
   * Execute a dispatcher-related node
   */
  async execute(node, _inputPin) {
    const nodeKey = node.nodeKey;

    // CallDispatcher_<id>
    if (nodeKey.startsWith("CallDispatcher_")) {
      return this.executeCall(node);
    }

    // BindToDispatcher_<id>
    if (nodeKey.startsWith("BindToDispatcher_")) {
      return this.executeBind(node);
    }

    // UnbindFromDispatcher_<id>
    if (nodeKey.startsWith("UnbindFromDispatcher_")) {
      return this.executeUnbind(node);
    }

    // Handle example nodes (no-op)
    if (
      nodeKey === "CallDispatcher_Example" ||
      nodeKey === "BindToDispatcher_Example" ||
      nodeKey === "UnbindFromDispatcher_Example"
    ) {
      console.log("[EventDispatcher] Example node executed (no-op)");
      return "exec_out";
    }

    return null;
  }

  /**
   * Execute CallDispatcher - triggers all bound events
   */
  executeCall(node) {
    const dispatcherId =
      node.customData?.dispatcherId || this.extractDispatcherId(node.nodeKey);

    if (!dispatcherId) {
      console.warn("[EventDispatcher] No dispatcherId found for Call node");
      return "exec_out";
    }

    const bindings = this.bindings.get(dispatcherId);
    if (bindings && bindings.size > 0) {
      console.log(
        `[EventDispatcher] Calling dispatcher ${dispatcherId} with ${bindings.size} bindings`
      );

      // Collect parameter values from input pins
      const params = this.collectParameters(node);

      // Execute all bound callbacks
      for (const callback of bindings) {
        try {
          callback(params);
        } catch (err) {
          console.error("[EventDispatcher] Callback error:", err);
        }
      }
    } else {
      console.log(
        `[EventDispatcher] Dispatcher ${dispatcherId} called (no bindings)`
      );
    }

    return "exec_out";
  }

  /**
   * Execute BindToDispatcher - registers a callback
   */
  executeBind(node) {
    const dispatcherId =
      node.customData?.dispatcherId || this.extractDispatcherId(node.nodeKey);

    if (!dispatcherId) {
      console.warn("[EventDispatcher] No dispatcherId found for Bind node");
      return "exec_out";
    }

    // Get the connected event node (if any)
    const eventPin = node.pins.find((p) => p.id === "event_in");
    if (eventPin && eventPin.links.length > 0) {
      // Create a callback that triggers execution from the bound event
      const callback = (params) => {
        console.log(`[EventDispatcher] Bound event fired for ${dispatcherId}`);

        // Store params in node temp values for parameter access
        node.tempValues = node.tempValues || {};
        node.tempValues.dispatcherParams = params;

        // If there's a simulation engine, trigger the bound event's exec output
        if (node.app?.sim) {
          // Find connected event node and trigger its output
          const linkedPin = eventPin.links[0]?.sourcePin;
          if (linkedPin?.node) {
            const eventNode = linkedPin.node;
            const execOut = eventNode.pins.find(
              (p) => p.type === "exec" && p.dir === "out"
            );
            if (execOut) {
              node.app.sim.flow.executeFromPin(execOut);
            }
          }
        }
      };

      // Register the binding
      if (!this.bindings.has(dispatcherId)) {
        this.bindings.set(dispatcherId, new Set());
      }
      this.bindings.get(dispatcherId).add(callback);

      // Store reference for potential unbind
      node.tempValues = node.tempValues || {};
      node.tempValues.boundCallback = callback;

      console.log(`[EventDispatcher] Bound event to ${dispatcherId}`);
    }

    return "exec_out";
  }

  /**
   * Execute UnbindFromDispatcher - removes a callback
   */
  executeUnbind(node) {
    const dispatcherId =
      node.customData?.dispatcherId || this.extractDispatcherId(node.nodeKey);

    if (!dispatcherId) {
      console.warn("[EventDispatcher] No dispatcherId found for Unbind node");
      return "exec_out";
    }

    // Get the stored callback reference
    const callback = node.tempValues?.boundCallback;
    if (callback && this.bindings.has(dispatcherId)) {
      this.bindings.get(dispatcherId).delete(callback);
      console.log(`[EventDispatcher] Unbound event from ${dispatcherId}`);
    }

    return "exec_out";
  }

  /**
   * Extract dispatcher ID from node key (e.g., "CallDispatcher_abc123" -> "abc123")
   */
  extractDispatcherId(nodeKey) {
    const match = nodeKey.match(/^(?:Call|BindTo|UnbindFrom)Dispatcher_(.+)$/);
    return match ? match[1] : null;
  }

  /**
   * Collect parameter values from node inputs
   */
  collectParameters(node) {
    const params = {};
    for (const pin of node.pins) {
      if (pin.dir === "in" && pin.type !== "exec") {
        params[pin.id] = this.evaluateInput(node, pin.id);
      }
    }
    return params;
  }

  /**
   * Clear all bindings (called when simulation stops)
   */
  clearBindings() {
    this.bindings.clear();
  }

  /**
   * Evaluate a pure node (for getting dispatcher state)
   */
  evaluateValue(node, pinId) {
    // For now, dispatchers don't return values
    return null;
  }
}
