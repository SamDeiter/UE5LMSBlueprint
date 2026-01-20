/**
 * PinTypeValidator - Validates pin type compatibility for wire connections
 *
 * Prevents invalid connections between incompatible pin types at connection time,
 * improving runtime safety and providing better user feedback.
 *
 * Features:
 * - Type compatibility checking (exact match, implicit conversions, wildcards)
 * - Container type validation (single, array, set, map)
 * - Execution pin validation (exec pins only connect to exec pins)
 * - User-friendly error messages
 * - Support for UE5 type system (wildcards, structs, objects)
 *
 * Usage:
 *   const validator = new PinTypeValidator();
 *   const result = validator.canConnect(sourcePin, targetPin);
 *   if (!result.valid) {
 *     console.error(result.reason);
 *   }
 */

export class PinTypeValidator {
  constructor() {
    // Define type compatibility rules
    this.compatibilityRules = this.initializeCompatibilityRules();
  }

  /**
   * Initialize type compatibility rules
   * @returns {Map} Compatibility rules map
   */
  initializeCompatibilityRules() {
    const rules = new Map();

    // Exact matches (type to itself)
    const allTypes = [
      "exec",
      "bool",
      "int",
      "float",
      "byte",
      "string",
      "name",
      "vector",
      "rotator",
      "transform",
      "object",
      "struct",
      "linearcolor",
      "hitresult",
      "enum",
      "wildcard",
      "class",
      "scenecomponent",
      "text",
      "int64",
    ];

    allTypes.forEach((type) => {
      rules.set(type, new Set([type]));
    });

    // Implicit conversions (UE5-style)
    rules.get("int").add("float"); // int → float (widening)
    rules.get("byte").add("int"); // byte → int (widening)
    rules.get("byte").add("float"); // byte → float (widening)
    rules.get("int").add("byte"); // int → byte (narrowing, with warning)
    rules.get("float").add("int"); // float → int (truncation, with warning)
    rules.get("string").add("name"); // string ↔ name
    rules.get("name").add("string");
    rules.get("string").add("text"); // string ↔ text
    rules.get("text").add("string");

    // Wildcard accepts everything (for generic collections)
    rules.set("wildcard", new Set(allTypes));

    // Object hierarchy (simplified - in real UE5 this would check inheritance)
    rules.get("scenecomponent").add("object"); // SceneComponent is an Object

    return rules;
  }

  /**
   * Check if two pins can be connected
   * @param {Object} sourcePin - Output pin
   * @param {Object} targetPin - Input pin
   * @returns {Object} { valid: boolean, reason: string, warning: string }
   */
  canConnect(sourcePin, targetPin) {
    // 1. Direction check
    if (sourcePin.dir === targetPin.dir) {
      return {
        valid: false,
        reason: `Cannot connect two ${sourcePin.dir} pins together. Connect an output pin to an input pin.`,
      };
    }

    // Ensure sourcePin is output, targetPin is input
    if (sourcePin.dir === "in") {
      [sourcePin, targetPin] = [targetPin, sourcePin];
    }

    // 2. Execution pins
    if (sourcePin.type === "exec" || targetPin.type === "exec") {
      if (sourcePin.type !== "exec" || targetPin.type !== "exec") {
        return {
          valid: false,
          reason: "Execution pins can only connect to other execution pins.",
        };
      }
      return { valid: true }; // Exec to exec is always valid
    }

    // 3. Wildcard pins (accept any type)
    if (sourcePin.type === "wildcard" || targetPin.type === "wildcard") {
      return {
        valid: true,
        warning: "Wildcard pin - type will be determined at runtime.",
      };
    }

    // 4. Container type compatibility
    const containerCheck = this.checkContainerCompatibility(
      sourcePin,
      targetPin
    );
    if (!containerCheck.valid) {
      return containerCheck;
    }

    // 5. Base type compatibility
    const typeCheck = this.checkTypeCompatibility(
      sourcePin.type,
      targetPin.type
    );
    if (!typeCheck.valid) {
      return {
        valid: false,
        reason: `Incompatible types: Cannot connect '${sourcePin.type}' to '${targetPin.type}'.`,
      };
    }

    // 6. Check for narrowing conversions (warnings)
    const warnings = [];
    if (this.isNarrowingConversion(sourcePin.type, targetPin.type)) {
      warnings.push(
        `Warning: Narrowing conversion from '${sourcePin.type}' to '${targetPin.type}' may lose data.`
      );
    }

    return {
      valid: true,
      warning: warnings.length > 0 ? warnings.join(" ") : undefined,
    };
  }

  /**
   * Check container type compatibility
   * @param {Object} sourcePin - Output pin
   * @param {Object} targetPin - Input pin
   * @returns {Object} Validation result
   */
  checkContainerCompatibility(sourcePin, targetPin) {
    const sourceContainer = sourcePin.containerType || "single";
    const targetContainer = targetPin.containerType || "single";

    // Exact container match is always valid
    if (sourceContainer === targetContainer) {
      return { valid: true };
    }

    // Single can connect to array (creates single-element array)
    if (sourceContainer === "single" && targetContainer === "array") {
      return {
        valid: true,
        warning: "Single value will be wrapped in an array.",
      };
    }

    // Array cannot connect to single (would lose data)
    if (sourceContainer === "array" && targetContainer === "single") {
      return {
        valid: false,
        reason:
          "Cannot connect an array to a single value pin. Use an array element accessor.",
      };
    }

    // Set/Map compatibility
    if (sourceContainer === "set" && targetContainer !== "set") {
      return {
        valid: false,
        reason: `Cannot connect a set to a ${targetContainer} pin.`,
      };
    }

    if (sourceContainer === "map" && targetContainer !== "map") {
      return {
        valid: false,
        reason: `Cannot connect a map to a ${targetContainer} pin.`,
      };
    }

    return { valid: true };
  }

  /**
   * Check if two types are compatible
   * @param {string} sourceType - Output pin type
   * @param {string} targetType - Input pin type
   * @returns {Object} { valid: boolean }
   */
  checkTypeCompatibility(sourceType, targetType) {
    // Exact match
    if (sourceType === targetType) {
      return { valid: true };
    }

    // Check compatibility rules
    const compatibleTypes = this.compatibilityRules.get(sourceType);
    if (compatibleTypes && compatibleTypes.has(targetType)) {
      return { valid: true };
    }

    // Struct pins (simplified - in real UE5 would check struct type)
    if (sourceType === "struct" && targetType === "struct") {
      return {
        valid: true,
        warning: "Struct types not fully validated - ensure they match.",
      };
    }

    return { valid: false };
  }

  /**
   * Check if conversion is narrowing (may lose data)
   * @param {string} sourceType - Output pin type
   * @param {string} targetType - Input pin type
   * @returns {boolean} True if narrowing
   */
  isNarrowingConversion(sourceType, targetType) {
    const narrowingPairs = [
      ["float", "int"],
      ["int", "byte"],
      ["float", "byte"],
      ["int64", "int"],
      ["int64", "byte"],
    ];

    return narrowingPairs.some(
      ([from, to]) => sourceType === from && targetType === to
    );
  }

  /**
   * Get user-friendly error message for connection attempt
   * @param {Object} sourcePin - Output pin
   * @param {Object} targetPin - Input pin
   * @returns {string} Error message
   */
  getConnectionError(sourcePin, targetPin) {
    const result = this.canConnect(sourcePin, targetPin);
    if (result.valid) {
      return result.warning || "Connection is valid.";
    }
    return result.reason || "Connection is invalid.";
  }

  /**
   * Validate all connections in a graph
   * @param {Array} links - Array of link objects with sourcePin and targetPin
   * @returns {Array} Array of validation errors
   */
  validateGraph(links) {
    const errors = [];

    links.forEach((link, index) => {
      const result = this.canConnect(link.sourcePin, link.targetPin);
      if (!result.valid) {
        errors.push({
          linkIndex: index,
          linkId: link.id,
          sourceNode: link.sourcePin.node.title,
          targetNode: link.targetPin.node.title,
          sourcePin: link.sourcePin.name,
          targetPin: link.targetPin.name,
          error: result.reason,
        });
      }
    });

    return errors;
  }
}
