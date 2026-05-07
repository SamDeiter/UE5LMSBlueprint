/**
 * EventDispatcherExecutor - Handles Event Dispatcher nodes.
 *
 * UE5-faithful behavior:
 *  - Multicast: Call iterates the listener list; if no listeners, the call is a no-op.
 *  - Hard reference: Bind requires a target reference. A null/None target fails silently.
 *  - Late binding: actors that bind after a Call do not receive past events.
 *  - UnbindAll: clears every listener for the target dispatcher instance.
 *  - Listeners are keyed by (dispatcherId, target) so different broadcaster instances
 *    each maintain their own listener list, mirroring UE5 per-instance dispatcher state.
 */
import { BaseExecutor } from "./BaseExecutor.js";

const SELF_TARGET = "__SELF__";

export class EventDispatcherExecutor extends BaseExecutor {
  constructor(engine) {
    super(engine);
    // Map<dispatcherId, Map<targetKey, Set<callback>>>
    this.bindings = new Map();
  }

  async execute(node, _inputPin) {
    const nodeKey = node.nodeKey || "";

    if (nodeKey.startsWith("CallDispatcher_")) return this.executeCall(node);
    if (nodeKey.startsWith("BindToDispatcher_")) return this.executeBind(node);
    if (nodeKey.startsWith("UnbindFromDispatcher_"))
      return this.executeUnbind(node);
    if (nodeKey.startsWith("UnbindAllFromDispatcher_"))
      return this.executeUnbindAll(node);

    return "exec_out";
  }

  // ---- Call ---------------------------------------------------------------

  executeCall(node) {
    const dispatcherId = this.extractDispatcherId(node.nodeKey);
    if (!dispatcherId) return "exec_out";

    const targetKey = this.resolveTargetKey(node);
    const listeners = this.getListeners(dispatcherId, targetKey);

    const params = this.collectParameters(node);

    this.log(
      `[Dispatcher] Call '${dispatcherId}' target=${targetKey} listeners=${listeners.size}`
    );

    if (listeners.size === 0) return "exec_out";

    // Snapshot to allow listeners to unbind during dispatch (UE5-safe).
    const snapshot = Array.from(listeners);
    for (const cb of snapshot) {
      try {
        cb(params);
      } catch (err) {
        // Mirrors UE5's silent dangling-pointer handling.
        console.error("[Dispatcher] Listener error:", err);
      }
    }

    return "exec_out";
  }

  // ---- Bind ---------------------------------------------------------------

  executeBind(node) {
    const dispatcherId = this.extractDispatcherId(node.nodeKey);
    if (!dispatcherId) return "exec_out";

    const targetKey = this.resolveTargetKey(node);
    if (targetKey === null) {
      // UE5: binding to a null/None target fails silently.
      this.log(
        `[Dispatcher] Bind '${dispatcherId}' silently failed — target is None`
      );
      return "exec_out";
    }

    const eventPin = node.pins?.find((p) => p.id === "event_in");
    if (!eventPin || !eventPin.links || eventPin.links.length === 0) {
      this.log(
        `[Dispatcher] Bind '${dispatcherId}' has no event connected — no-op`
      );
      return "exec_out";
    }

    const linkedPin = eventPin.links[0]?.sourcePin;
    const eventNode = linkedPin?.node;
    if (!eventNode) return "exec_out";

    const callback = (params) => {
      eventNode.tempValues = eventNode.tempValues || {};
      eventNode.tempValues.dispatcherParams = params;

      const execOut = eventNode.pins?.find(
        (p) => p.type === "exec" && p.dir === "out"
      );
      if (execOut && this.engine?.flow?.executeFromPin) {
        this.engine.flow.executeFromPin(execOut);
      }
    };

    this.addListener(dispatcherId, targetKey, callback);

    node.tempValues = node.tempValues || {};
    node.tempValues.boundCallback = callback;
    node.tempValues.boundTargetKey = targetKey;

    this.log(`[Dispatcher] Bound to '${dispatcherId}' on target=${targetKey}`);
    return "exec_out";
  }

  // ---- Unbind -------------------------------------------------------------

  executeUnbind(node) {
    const dispatcherId = this.extractDispatcherId(node.nodeKey);
    if (!dispatcherId) return "exec_out";

    const targetKey =
      node.tempValues?.boundTargetKey ?? this.resolveTargetKey(node);
    if (targetKey === null) return "exec_out";

    const callback = node.tempValues?.boundCallback;
    if (!callback) return "exec_out";

    const listeners = this.bindings.get(dispatcherId)?.get(targetKey);
    if (listeners) {
      listeners.delete(callback);
      this.log(
        `[Dispatcher] Unbound from '${dispatcherId}' on target=${targetKey}`
      );
    }
    return "exec_out";
  }

  // ---- UnbindAll ----------------------------------------------------------

  executeUnbindAll(node) {
    const dispatcherId = this.extractDispatcherId(node.nodeKey);
    if (!dispatcherId) return "exec_out";

    const targetKey = this.resolveTargetKey(node);
    if (targetKey === null) return "exec_out";

    const perTarget = this.bindings.get(dispatcherId);
    if (perTarget && perTarget.has(targetKey)) {
      const count = perTarget.get(targetKey).size;
      perTarget.delete(targetKey);
      this.log(
        `[Dispatcher] UnbindAll '${dispatcherId}' on target=${targetKey} (${count} cleared)`
      );
    }
    return "exec_out";
  }

  // ---- Helpers ------------------------------------------------------------

  /**
   * Returns the per-target listener set, creating it as needed.
   */
  getListeners(dispatcherId, targetKey) {
    if (!this.bindings.has(dispatcherId))
      this.bindings.set(dispatcherId, new Map());
    const perTarget = this.bindings.get(dispatcherId);
    if (!perTarget.has(targetKey)) perTarget.set(targetKey, new Set());
    return perTarget.get(targetKey);
  }

  addListener(dispatcherId, targetKey, callback) {
    this.getListeners(dispatcherId, targetKey).add(callback);
  }

  /**
   * Resolve the target reference for this node.
   * Returns:
   *   - SELF_TARGET if no target_in pin is connected (defaults to "self", as UE5 does).
   *   - A stable string key if a target is connected and evaluated.
   *   - null when an explicit target evaluates to null/undefined (silent failure case).
   */
  resolveTargetKey(node) {
    const targetPin = node.pins?.find((p) => p.id === "target_in");
    if (!targetPin) return SELF_TARGET;
    if (!targetPin.links || targetPin.links.length === 0) return SELF_TARGET;

    const value = this.evaluateInput(node, "target_in");
    if (value === null || value === undefined) return null;

    if (typeof value === "object") {
      if (!value.__targetKey) {
        value.__targetKey = `obj_${Math.random().toString(36).slice(2)}`;
      }
      return value.__targetKey;
    }
    return String(value);
  }

  extractDispatcherId(nodeKey) {
    const match = nodeKey.match(
      /^(?:Call|BindTo|UnbindFrom|UnbindAllFrom)Dispatcher_(.+)$/
    );
    return match ? match[1] : null;
  }

  collectParameters(node) {
    const params = {};
    for (const pin of node.pins || []) {
      if (pin.dir === "in" && pin.type !== "exec" && pin.id !== "target_in") {
        params[pin.id] = this.evaluateInput(node, pin.id);
      }
    }
    return params;
  }

  /**
   * Clear all listener state (called when simulation stops).
   */
  clearBindings() {
    this.bindings.clear();
  }

  evaluateValue(_node, _pin) {
    return null;
  }
}
