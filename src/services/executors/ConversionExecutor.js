import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles type conversion nodes (Conv_*)
 * Uses UE5-accurate conversion logic
 */
export class ConversionExecutor extends BaseExecutor {
  /**
   * Convert any value to string representation
   * EXACTLY matches UE5's automatic type conversion (no JSON - not available in UE5)
   * Shared logic with PrintExecutor
   */
  convertToString(value) {
    if (value === null || value === undefined) {
      return "None";
    }

    // Boolean → "true" or "false" (lowercase in UE5)
    if (typeof value === "boolean") {
      return value ? "true" : "false";
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
      // Vector: {x, y, z} → "X=1.000000 Y=2.000000 Z=3.000000"
      // Check for pitch to distinguish from Rotator
      if (
        value.x !== undefined &&
        value.y !== undefined &&
        value.z !== undefined &&
        value.pitch === undefined
      ) {
        return `X=${value.x} Y=${value.y} Z=${value.z}`;
      }

      // Rotator: {pitch, yaw, roll} → "P=0.000000 Y=90.000000 R=0.000000"
      if (
        value.pitch !== undefined &&
        value.yaw !== undefined &&
        value.roll !== undefined
      ) {
        return `P=${value.pitch} Y=${value.yaw} R=${value.roll}`;
      }

      // Transform: {translation, rotation, scale} → Multi-line format
      if (value.translation && value.rotation && value.scale) {
        return (
          `Translation: X=${value.translation.x} Y=${value.translation.y} Z=${value.translation.z}\n` +
          `Rotation: P=${value.rotation.pitch} Y=${value.rotation.yaw} R=${value.rotation.roll}\n` +
          `Scale: X=${value.scale.x} Y=${value.scale.y} Z=${value.scale.z}`
        );
      }

      // LinearColor: {r, g, b, a} → "(R=1.000000,G=0.500000,B=0.250000,A=1.000000)"
      if (
        value.r !== undefined &&
        value.g !== undefined &&
        value.b !== undefined &&
        value.a !== undefined
      ) {
        return `(R=${value.r},G=${value.g},B=${value.b},A=${value.a})`;
      }

      // Arrays → "[Element0, Element1, Element2]"
      if (Array.isArray(value)) {
        return `[${value.map((v) => this.convertToString(v)).join(", ")}]`;
      }

      // Unknown object type → describe it (no JSON in UE5!)
      return "[Object]";
    }

    // Fallback
    return String(value);
  }

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
