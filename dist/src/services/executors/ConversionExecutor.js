import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles type conversion nodes (Conv_*)
 * Uses UE5-accurate conversion logic
 */
export class ConversionExecutor extends BaseExecutor {
  /**
   * Conversion nodes are pure (data-only)
   */
  async execute(_node) {
    return null;
  }

  /**
   * Handle Conv_* type conversions
   */
  evaluateValue(node, _pin) {
    if (node.nodeKey.startsWith("Conv_")) {
      const val = this.evaluateInput(node, "val_in");

      // Use UE5-accurate conversion
      return this.convertToString(val);
    }

    return null;
  }
}
