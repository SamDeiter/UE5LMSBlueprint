/**
 * Base class for all node executors.
 * Executors handle the runtime logic for specific node types.
 */
export class BaseExecutor {
  /**
   * @param {SimulationEngine} engine - Reference to the simulation engine
   */
  constructor(engine) {
    this.engine = engine;
    this.app = engine.app;
  }

  /**
   * Executes the node's logic during flow execution.
   * @param {Node} node - The node to execute
   * @returns {Promise<string|null>} The ID of the next execution pin to follow, or null
   */
  async execute(_node) {
    throw new Error(
      `execute() must be implemented by ${this.constructor.name}`
    );
  }

  /**
   * Evaluates the output value of a pure node (data flow).
   * @param {Node} node - The node to evaluate
   * @param {Pin} pin - The output pin being evaluated
   * @returns {*} The computed value
   */
  evaluateValue(_node, _pin) {
    // Default: return null (not all executors need this)
    return null;
  }

  /**
   * Helper: Evaluate an input pin value
   * @param {Node} node - The node
   * @param {string} pinLocalId - Local pin ID (e.g., 'a_in')
   * @returns {*} The evaluated value
   */
  evaluateInput(node, pinLocalId) {
    return this.engine.evaluateInput(node, pinLocalId);
  }

  /**
   * Helper: Log a message
   * @param {string} msg - Message to log
   * @param {string} type - Log type ('log', 'error', 'success')
   */
  log(msg, type = "log") {
    this.engine.log(msg, type);
  }

  /**
   * Convert any value to string representation
   * EXACTLY matches UE5's automatic type conversion (no JSON - not available in UE5)
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
}
