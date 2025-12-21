import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles event nodes that trigger execution flows.
 * These are typically pass-through nodes that start execution chains.
 */
export class EventExecutor extends BaseExecutor {
  /**
   * Event nodes are pass-through - they don't execute logic, just start flows
   */
  async execute(node) {
    // EventBeginPlay, EventTick, FunctionEntry, MacroEntry
    // These nodes just pass through to their connected output
    return null;
  }

  /**
   * EventTick provides delta_seconds output
   */
  evaluateValue(node, pin) {
    if (node.nodeKey === "EventTick" && node.tempValues) {
      return node.tempValues.delta_seconds_out;
    }
    return null;
  }
}
