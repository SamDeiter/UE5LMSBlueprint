/**
 * PinPatterns.js - Common pin patterns for node definitions
 *
 * Provides reusable pin templates to reduce duplication and ensure
 * consistency across node definitions.
 *
 * Usage:
 *   import { EXEC_IN, EXEC_OUT } from './PinPatterns.js';
 *   pins: [EXEC_IN, someDataPin, EXEC_OUT]
 */

// ============ Exec Pins ============

/** Standard execution input pin */
export const EXEC_IN = { id: "exec_in", name: "", type: "exec", dir: "in" };

/** Standard execution output pin */
export const EXEC_OUT = { id: "exec_out", name: "", type: "exec", dir: "out" };

/** Reset execution input (for DoOnce, etc.) */
export const EXEC_RESET = {
  id: "reset_in",
  name: "Reset",
  type: "exec",
  dir: "in",
};

/** Completed execution output (for loops) */
export const EXEC_COMPLETED = {
  id: "exec_completed",
  name: "Completed",
  type: "exec",
  dir: "out",
};

/** Loop body execution output */
export const EXEC_LOOP_BODY = {
  id: "exec_loop_body",
  name: "Loop Body",
  type: "exec",
  dir: "out",
};

// ============ Common Data Pins ============

/** Boolean condition input */
export const BOOL_CONDITION = {
  id: "condition_in",
  name: "Condition",
  type: "bool",
  dir: "in",
  defaultValue: true,
};

/** Integer index output (for loops) */
export const INT_INDEX_OUT = {
  id: "index_out",
  name: "Index",
  type: "int",
  dir: "out",
};

/** First index input (for ForLoop) */
export const INT_FIRST_INDEX = {
  id: "first_index_in",
  name: "First Index",
  type: "int",
  dir: "in",
  defaultValue: 0,
};

/** Last index input (for ForLoop) */
export const INT_LAST_INDEX = {
  id: "last_index_in",
  name: "Last Index",
  type: "int",
  dir: "in",
  defaultValue: 0,
};

/** Array input (for ForEach) */
export const ARRAY_IN = {
  id: "array_in",
  name: "Array",
  type: "wildcard",
  dir: "in",
  containerType: "array",
};

// ============ Helper Factory Functions ============

/**
 * Create a custom exec output pin
 * @param {string} id - Pin ID
 * @param {string} name - Display name
 * @returns {Object} Pin definition
 */
export function execOut(id, name) {
  return { id, name, type: "exec", dir: "out" };
}

/**
 * Create a custom exec input pin
 * @param {string} id - Pin ID
 * @param {string} name - Display name
 * @returns {Object} Pin definition
 */
export function execIn(id, name) {
  return { id, name, type: "exec", dir: "in" };
}

/**
 * Create a data input pin with default value
 * @param {string} id - Pin ID
 * @param {string} name - Display name
 * @param {string} type - Data type
 * @param {*} [defaultValue] - Default value
 * @returns {Object} Pin definition
 */
export function dataIn(id, name, type, defaultValue) {
  const pin = { id, name, type, dir: "in" };
  if (defaultValue !== undefined) {
    pin.defaultValue = defaultValue;
  }
  return pin;
}

/**
 * Create a data output pin
 * @param {string} id - Pin ID
 * @param {string} name - Display name
 * @param {string} type - Data type
 * @returns {Object} Pin definition
 */
export function dataOut(id, name, type) {
  return { id, name, type, dir: "out" };
}
