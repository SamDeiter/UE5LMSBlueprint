/**
 * PinFactory - Utility for generating common pin patterns
 *
 * Reduces code duplication across node definitions by providing
 * factory methods for frequently-used pin configurations.
 *
 * Usage:
 *   import { PinFactory as PF } from '../utils/PinFactory.js';
 *
 *   pins: [
 *     ...PF.execFlow(),
 *     PF.floatIn('value', 'Value', 0.5),
 *     PF.floatOut('result', 'Result')
 *   ]
 */

export class PinFactory {
  // ============================================================================
  // EXECUTION FLOW PINS
  // ============================================================================

  /**
   * Standard execution flow pins (exec in + exec out)
   * @returns {Array} [exec_in, exec_out]
   */
  static execFlow() {
    return [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ];
  }

  /**
   * Single execution input pin
   */
  static execIn(id = "exec_in", name = "Exec") {
    return { id, name, type: "exec", dir: "in" };
  }

  /**
   * Single execution output pin
   */
  static execOut(id = "exec_out", name = "Exec") {
    return { id, name, type: "exec", dir: "out" };
  }

  // ============================================================================
  // BASIC TYPE INPUTS
  // ============================================================================

  /**
   * Float input pin
   */
  static floatIn(id, name, defaultValue = 0.0) {
    return { id, name, type: "float", dir: "in", defaultValue };
  }

  /**
   * Integer input pin
   */
  static intIn(id, name, defaultValue = 0) {
    return { id, name, type: "int", dir: "in", defaultValue };
  }

  /**
   * Boolean input pin
   */
  static boolIn(id, name, defaultValue = false) {
    return { id, name, type: "bool", dir: "in", defaultValue };
  }

  /**
   * String input pin
   */
  static stringIn(id, name, defaultValue = "") {
    return { id, name, type: "string", dir: "in", defaultValue };
  }

  /**
   * Vector input pin
   */
  static vectorIn(id, name, defaultValue = "(0,0,0)") {
    return { id, name, type: "vector", dir: "in", defaultValue };
  }

  /**
   * Rotator input pin
   */
  static rotatorIn(id, name) {
    return { id, name, type: "rotator", dir: "in" };
  }

  /**
   * Object input pin
   */
  static objectIn(id, name, containerType = null) {
    const pin = { id, name, type: "object", dir: "in" };
    if (containerType) pin.containerType = containerType;
    return pin;
  }

  // ============================================================================
  // BASIC TYPE OUTPUTS
  // ============================================================================

  /**
   * Float output pin
   */
  static floatOut(id, name = "Return Value") {
    return { id, name, type: "float", dir: "out" };
  }

  /**
   * Integer output pin
   */
  static intOut(id, name = "Return Value") {
    return { id, name, type: "int", dir: "out" };
  }

  /**
   * Boolean output pin
   */
  static boolOut(id, name = "Return Value") {
    return { id, name, type: "bool", dir: "out" };
  }

  /**
   * String output pin
   */
  static stringOut(id, name = "Return Value") {
    return { id, name, type: "string", dir: "out" };
  }

  /**
   * Vector output pin
   */
  static vectorOut(id, name = "Return Value") {
    return { id, name, type: "vector", dir: "out" };
  }

  /**
   * Rotator output pin
   */
  static rotatorOut(id, name = "Return Value") {
    return { id, name, type: "rotator", dir: "out" };
  }

  /**
   * Struct output pin
   */
  static structOut(id, name = "Out Hit") {
    return { id, name, type: "struct", dir: "out" };
  }

  // ============================================================================
  // COMMON MATH PATTERNS
  // ============================================================================

  /**
   * Binary math operation pins (A, B inputs + Return Value output)
   * @param {string} type - Pin type (float, int, vector, etc.)
   * @param {*} defaultA - Default value for A
   * @param {*} defaultB - Default value for B
   */
  static binaryOp(type, defaultA, defaultB) {
    return [
      { id: "a_in", name: "A", type, dir: "in", defaultValue: defaultA },
      { id: "b_in", name: "B", type, dir: "in", defaultValue: defaultB },
      { id: "ret_out", name: "Return Value", type, dir: "out" },
    ];
  }

  /**
   * Unary math operation pins (A input + Return Value output)
   */
  static unaryOp(inputType, outputType, defaultValue) {
    return [
      { id: "a_in", name: "A", type: inputType, dir: "in", defaultValue },
      { id: "ret_out", name: "Return Value", type: outputType, dir: "out" },
    ];
  }

  /**
   * Comparison operation pins (A, B float inputs + bool output)
   */
  static comparison(defaultA = 0.0, defaultB = 0.0) {
    return [
      {
        id: "a_in",
        name: "A",
        type: "float",
        dir: "in",
        defaultValue: defaultA,
      },
      {
        id: "b_in",
        name: "B",
        type: "float",
        dir: "in",
        defaultValue: defaultB,
      },
      { id: "ret_out", name: "Return Value", type: "bool", dir: "out" },
    ];
  }

  // ============================================================================
  // TRACE/COLLISION PATTERNS
  // ============================================================================

  /**
   * Common trace input pins (Start, End vectors)
   */
  static traceStartEnd() {
    return [
      { id: "start_in", name: "Start", type: "vector", dir: "in" },
      { id: "end_in", name: "End", type: "vector", dir: "in" },
    ];
  }

  /**
   * Trace channel parameter
   */
  static traceChannel(defaultValue = "Visibility") {
    return {
      id: "channel_in",
      name: "Trace Channel",
      type: "string",
      dir: "in",
      defaultValue,
    };
  }

  /**
   * Trace complex boolean
   */
  static traceComplex() {
    return {
      id: "trace_complex_in",
      name: "Trace Complex",
      type: "bool",
      dir: "in",
      defaultValue: false,
    };
  }

  /**
   * Ignore self boolean
   */
  static ignoreSelf() {
    return {
      id: "ignore_self_in",
      name: "Ignore Self",
      type: "bool",
      dir: "in",
      defaultValue: true,
    };
  }

  /**
   * Trace result outputs (Return Value bool + Out Hit struct)
   */
  static traceResults() {
    return [
      { id: "hit_out", name: "Return Value", type: "bool", dir: "out" },
      { id: "hit_result_out", name: "Out Hit", type: "struct", dir: "out" },
    ];
  }

  /**
   * Complete trace node pins (exec flow + trace params + debug + results)
   * Matches UE5 trace node specification with full debug visualization support
   */
  static traceNode(shapeParams = []) {
    return [
      ...this.execFlow(),
      ...this.traceStartEnd(),
      ...shapeParams,
      {
        id: "trace_channel",
        name: "Trace Channel",
        type: "enum",
        dir: "in",
        defaultValue: "Visibility",
        enumValues: ["Visibility", "Camera"],
      },
      this.traceComplex(),
      this.objectIn("actors_to_ignore", "Actors To Ignore", "array"),
      {
        id: "draw_debug_type",
        name: "Draw Debug Type",
        type: "enum",
        dir: "in",
        defaultValue: "None",
        enumValues: ["None", "For One Frame", "For Duration", "Persistent"],
      },
      this.ignoreSelf(),
      {
        id: "trace_color",
        name: "Trace Color",
        type: "linearcolor",
        dir: "in",
        advanced: true,
        defaultValue: "#FF0000",
      },
      {
        id: "trace_hit_color",
        name: "Trace Hit Color",
        type: "linearcolor",
        dir: "in",
        advanced: true,
        defaultValue: "#00FF00",
      },
      this.floatIn("draw_time", "Draw Time", 5.0),
      { id: "out_hit", name: "Out Hit", type: "hitresult", dir: "out" },
      this.boolOut("return_value", "Return Value"),
    ];
  }

  // ============================================================================
  // VECTOR/ROTATOR PATTERNS
  // ============================================================================

  /**
   * Make Vector pins (X, Y, Z inputs + Vector output)
   */
  static makeVector() {
    return [
      { id: "x_in", name: "X", type: "float", dir: "in", defaultValue: 0 },
      { id: "y_in", name: "Y", type: "float", dir: "in", defaultValue: 0 },
      { id: "z_in", name: "Z", type: "float", dir: "in", defaultValue: 0 },
      { id: "vec_out", name: "Return Value", type: "vector", dir: "out" },
    ];
  }

  /**
   * Break Vector pins (Vector input + X, Y, Z outputs)
   */
  static breakVector() {
    return [
      { id: "vec_in", name: "Vector", type: "vector", dir: "in" },
      { id: "x_out", name: "X", type: "float", dir: "out" },
      { id: "y_out", name: "Y", type: "float", dir: "out" },
      { id: "z_out", name: "Z", type: "float", dir: "out" },
    ];
  }

  /**
   * Make Rotator pins (Roll, Pitch, Yaw inputs + Rotator output)
   */
  static makeRotator() {
    return [
      {
        id: "roll_in",
        name: "Roll (X)",
        type: "float",
        dir: "in",
        defaultValue: 0,
      },
      {
        id: "pitch_in",
        name: "Pitch (Y)",
        type: "float",
        dir: "in",
        defaultValue: 0,
      },
      {
        id: "yaw_in",
        name: "Yaw (Z)",
        type: "float",
        dir: "in",
        defaultValue: 0,
      },
      { id: "rot_out", name: "Return Value", type: "rotator", dir: "out" },
    ];
  }

  /**
   * Break Rotator pins (Rotator input + Roll, Pitch, Yaw outputs)
   */
  static breakRotator() {
    return [
      { id: "rot_in", name: "Rotator", type: "rotator", dir: "in" },
      { id: "roll_out", name: "Roll", type: "float", dir: "out" },
      { id: "pitch_out", name: "Pitch", type: "float", dir: "out" },
      { id: "yaw_out", name: "Yaw", type: "float", dir: "out" },
    ];
  }

  // ============================================================================
  // CONVERSION PATTERNS
  // ============================================================================

  /**
   * Type conversion pins (single input, single output, different types)
   */
  static conversion(inputType, outputType) {
    return [
      { id: "val_in", name: "", type: inputType, dir: "in" },
      { id: "val_out", name: "", type: outputType, dir: "out" },
    ];
  }

  // ============================================================================
  // CLAMP/MIN/MAX PATTERNS
  // ============================================================================

  /**
   * Clamp operation pins (Value, Min, Max inputs + output)
   */
  static clamp(type, valueDefault, minDefault, maxDefault) {
    return [
      {
        id: "val_in",
        name: "Value",
        type,
        dir: "in",
        defaultValue: valueDefault,
      },
      { id: "min_in", name: "Min", type, dir: "in", defaultValue: minDefault },
      { id: "max_in", name: "Max", type, dir: "in", defaultValue: maxDefault },
      { id: "ret_out", name: "Return Value", type, dir: "out" },
    ];
  }
}

// Export singleton instance for convenience
export const PF = PinFactory;
