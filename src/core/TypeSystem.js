/**
 * TypeSystem.js - Centralized type management for Blueprint pins and variables
 * Consolidates type colors, compatibility, and parsing logic
 */

/**
 * UE5-style pin type colors
 */
export const TYPE_COLORS = {
  exec: "#ffffff",
  bool: "#990000",
  byte: "#006666",
  int: "#00ffff",
  int64: "#00ccff",
  float: "#00ff00",
  name: "#ff00ff",
  string: "#ff00ff",
  text: "#ff99ff",
  vector: "#ffcc00",
  rotator: "#66ccff",
  transform: "#ff6600",
  object: "#0066ff",
  class: "#9966ff",
  struct: "#0000ff",
  interface: "#b0e0e6",
  wildcard: "#888888",
  delegate: "#ff4444",
  array: "#666666",
  set: "#666666",
  map: "#666666",
  DEFAULT: "#cccccc",
};

/**
 * Variable header gradients by type
 */
export const TYPE_HEADER_COLORS = {
  bool: { start: "#880000", end: "#660000" },
  byte: { start: "#004444", end: "#003333" },
  int: { start: "#00aaaa", end: "#008888" },
  int64: { start: "#0099cc", end: "#007799" },
  float: { start: "#00aa00", end: "#008800" },
  name: { start: "#aa00aa", end: "#880088" },
  string: { start: "#aa00aa", end: "#880088" },
  text: { start: "#aa6699", end: "#884477" },
  vector: { start: "#ccaa00", end: "#aa8800" },
  rotator: { start: "#5599cc", end: "#4488aa" },
  transform: { start: "#cc5500", end: "#aa4400" },
  object: { start: "#0055aa", end: "#004488" },
  DEFAULT: { start: "#444444", end: "#333333" },
};

/**
 * Get color for a pin/variable type
 * @param {string} type - Type name
 * @returns {string} CSS color
 */
export function getTypeColor(type) {
  if (!type) return TYPE_COLORS.DEFAULT;
  return TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS.DEFAULT;
}

/**
 * Get header gradient for variable type
 * @param {string} type - Type name
 * @returns {{start: string, end: string}} Gradient colors
 */
export function getTypeHeaderColors(type) {
  if (!type) return TYPE_HEADER_COLORS.DEFAULT;
  return TYPE_HEADER_COLORS[type.toLowerCase()] || TYPE_HEADER_COLORS.DEFAULT;
}

/**
 * Check if two types are compatible for connection
 * @param {string} sourceType - Output pin type
 * @param {string} targetType - Input pin type
 * @returns {boolean} True if compatible
 */
export function isTypeCompatible(sourceType, targetType) {
  if (!sourceType || !targetType) return false;

  const s = sourceType.toLowerCase();
  const t = targetType.toLowerCase();

  // Exact match
  if (s === t) return true;

  // Exec to Exec
  if (s === "exec" && t === "exec") return true;

  // Wildcard support
  if (s === "wildcard" || t === "wildcard") return true;

  // Object hierarchy
  if (t === "object" && s.includes("component")) return true;

  // Component type hierarchy
  return checkComponentHierarchy(s, t);
}

/**
 * Component type hierarchy for inheritance checking
 */
const COMPONENT_HIERARCHY = {
  pointlightcomponent: "lightcomponent",
  spotlightcomponent: "pointlightcomponent",
  directionallightcomponent: "lightcomponent",
  lightcomponent: "scenecomponent",
  staticmeshcomponent: "meshcomponent",
  skeletalmeshcomponent: "meshcomponent",
  meshcomponent: "primitivecomponent",
  boxcomponent: "shapecomponent",
  spherecomponent: "shapecomponent",
  capsulecomponent: "shapecomponent",
  shapecomponent: "primitivecomponent",
  primitivecomponent: "scenecomponent",
  cameracomponent: "scenecomponent",
  springarmcomponent: "scenecomponent",
  audiocomponent: "scenecomponent",
  scenecomponent: "actorcomponent",
  actorcomponent: "object",
};

/**
 * Check if source type can be assigned to target type via hierarchy
 */
function checkComponentHierarchy(source, target) {
  let current = source;
  while (COMPONENT_HIERARCHY[current]) {
    current = COMPONENT_HIERARCHY[current];
    if (current === target) return true;
  }
  return false;
}

/**
 * Get all primitive types
 */
export const PRIMITIVE_TYPES = [
  "bool",
  "byte",
  "int",
  "int64",
  "float",
  "name",
  "string",
  "text",
];

/**
 * Get all struct types
 */
export const STRUCT_TYPES = ["vector", "rotator", "transform"];

/**
 * Check if type supports inline widget
 * @param {string} type - Type name
 * @returns {boolean}
 */
export function supportsInlineWidget(type) {
  if (!type) return false;
  const t = type.toLowerCase();
  return PRIMITIVE_TYPES.includes(t) || STRUCT_TYPES.includes(t);
}

/**
 * Get conversion node key between two types
 * @param {string} source - Source type
 * @param {string} target - Target type
 * @returns {string|null} Conversion node key or null
 */
export function getConversionNodeKey(source, target) {
  const CONVERSIONS = {
    "float->string": "Conv_FloatToString",
    "int->string": "Conv_IntToString",
    "bool->string": "Conv_BoolToString",
    "byte->string": "Conv_ByteToString",
    "name->string": "Conv_NameToString",
    "text->string": "Conv_TextToString",
    "int->float": "Conv_IntToFloat",
    "byte->int": "Conv_ByteToInt",
    "vector->string": "Conv_VectorToString",
    "rotator->string": "Conv_RotatorToString",
    "transform->string": "Conv_TransformToString",
  };
  return CONVERSIONS[`${source}->${target}`] || null;
}
