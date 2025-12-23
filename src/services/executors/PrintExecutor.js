import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles PrintString node for console output
 * Automatically converts any input type to string (matches UE5 behavior)
 */
export class PrintExecutor extends BaseExecutor {
  /**
   * Convert any value to string representation
   * Matches UE5's automatic type conversion
   */
  convertToString(value) {
    if (value === null || value === undefined) {
      return "None";
    }

    // Boolean → "True" or "False" (UE5 style)
    if (typeof value === "boolean") {
      return value ? "True" : "False";
    }

    // Numbers → string
    if (typeof value === "number") {
      return String(value);
    }

    // Already a string
    if (typeof value === "string") {
      return value;
    }

    // Objects (Vector, Rotator, Transform, etc.)
    if (typeof value === "object") {
      // Vector: {x, y, z} → "X=1.0 Y=2.0 Z=3.0"
      if (
        value.x !== undefined &&
        value.y !== undefined &&
        value.z !== undefined
      ) {
        return `X=${value.x} Y=${value.y} Z=${value.z}`;
      }

      // Rotator: {pitch, yaw, roll} → "P=0.0 Y=90.0 R=0.0"
      if (
        value.pitch !== undefined &&
        value.yaw !== undefined &&
        value.roll !== undefined
      ) {
        return `P=${value.pitch} Y=${value.yaw} R=${value.roll}`;
      }

      // Transform or other complex objects → JSON
      return JSON.stringify(value);
    }

    // Fallback
    return String(value);
  }

  async execute(node) {
    if (node.nodeKey === "PrintString") {
      const rawValue = this.evaluateInput(node, "str_in");
      const strVal = this.convertToString(rawValue);
      this.log(`Print: ${strVal}`);
    }
    return null;
  }
}
