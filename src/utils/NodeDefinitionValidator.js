/**
 * NodeDefinitionValidator - Validates node definitions at startup
 *
 * Catches common errors before they cause runtime issues:
 * - Missing required fields
 * - Invalid pin configurations
 * - Duplicate pin IDs
 * - Invalid enum values
 *
 * Usage:
 *   import { NodeDefinitionValidator } from './utils/NodeDefinitionValidator.js';
 *   NodeDefinitionValidator.validateAll(NodeDefinitions);
 */

export class NodeDefinitionValidator {
  static get validNodeTypes() {
    return ["event-node", "function-node", "pure-node", "macro-node"];
  }

  static get validPinTypes() {
    return [
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
    ];
  }

  static get validPinDirections() {
    return ["in", "out"];
  }

  /**
   * Validate all node definitions
   * @param {Object} definitions - NodeDefinitions object
   * @throws {Error} if validation fails
   */
  static validateAll(definitions) {
    const errors = [];
    const warnings = [];

    Object.entries(definitions).forEach(([nodeKey, nodeDef]) => {
      try {
        this.validateNode(nodeKey, nodeDef, errors, warnings);
      } catch (err) {
        errors.push(`${nodeKey}: Unexpected error - ${err.message}`);
      }
    });

    // Report warnings
    if (warnings.length > 0) {
      console.warn(`⚠️ Node Definition Warnings (${warnings.length}):`);
      warnings.forEach((w) => console.warn(`  - ${w}`));
    }

    // Throw on errors
    if (errors.length > 0) {
      console.error(`❌ Node Definition Validation Errors (${errors.length}):`);
      errors.forEach((e) => console.error(`  - ${e}`));
      throw new Error(
        `Node definition validation failed with ${errors.length} errors`
      );
    }

    console.log(
      `✅ Node definitions validated: ${Object.keys(definitions).length} nodes`
    );
  }

  /**
   * Validate a single node definition
   */
  static validateNode(nodeKey, nodeDef, errors, warnings) {
    // Required fields
    if (!nodeDef.title) {
      errors.push(`${nodeKey}: Missing required field 'title'`);
    }

    if (!nodeDef.type) {
      errors.push(`${nodeKey}: Missing required field 'type'`);
    } else if (!this.validNodeTypes.includes(nodeDef.type)) {
      errors.push(
        `${nodeKey}: Invalid type '${
          nodeDef.type
        }'. Must be one of: ${this.validNodeTypes.join(", ")}`
      );
    }

    if (!nodeDef.category) {
      warnings.push(`${nodeKey}: Missing 'category' field`);
    }

    // Pins validation
    if (!nodeDef.pins) {
      errors.push(`${nodeKey}: Missing required field 'pins'`);
      return; // Can't validate pins if they don't exist
    }

    if (!Array.isArray(nodeDef.pins)) {
      errors.push(`${nodeKey}: 'pins' must be an array`);
      return;
    }

    // Validate each pin
    const pinIds = new Set();
    nodeDef.pins.forEach((pin, idx) => {
      this.validatePin(nodeKey, pin, idx, pinIds, errors, warnings);
    });

    // Check for exec flow consistency
    const hasExecIn = nodeDef.pins.some(
      (p) => p.type === "exec" && p.dir === "in"
    );
    const hasExecOut = nodeDef.pins.some(
      (p) => p.type === "exec" && p.dir === "out"
    );

    if (nodeDef.type === "function-node" || nodeDef.type === "event-node") {
      if (!hasExecIn && !hasExecOut) {
        warnings.push(`${nodeKey}: ${nodeDef.type} should have execution pins`);
      }
    }

    if (nodeDef.type === "pure-node") {
      if (hasExecIn || hasExecOut) {
        warnings.push(`${nodeKey}: pure-node should not have execution pins`);
      }
    }
  }

  /**
   * Validate a single pin
   */
  static validatePin(nodeKey, pin, idx, pinIds, errors, warnings) {
    const pinLabel = `${nodeKey}.pins[${idx}]`;

    // Required fields
    if (!pin.id) {
      errors.push(`${pinLabel}: Missing required field 'id'`);
    } else {
      // Check for duplicate pin IDs
      if (pinIds.has(pin.id)) {
        errors.push(`${pinLabel}: Duplicate pin ID '${pin.id}'`);
      }
      pinIds.add(pin.id);
    }

    if (!pin.type) {
      errors.push(`${pinLabel}: Missing required field 'type'`);
    } else if (!this.validPinTypes.includes(pin.type)) {
      errors.push(
        `${pinLabel}: Invalid type '${
          pin.type
        }'. Must be one of: ${this.validPinTypes.join(", ")}`
      );
    }

    if (!pin.dir) {
      errors.push(`${pinLabel}: Missing required field 'dir'`);
    } else if (!this.validPinDirections.includes(pin.dir)) {
      errors.push(
        `${pinLabel}: Invalid direction '${pin.dir}'. Must be 'in' or 'out'`
      );
    }

    // Enum validation
    if (pin.type === "enum") {
      if (!pin.enumValues || !Array.isArray(pin.enumValues)) {
        errors.push(`${pinLabel}: Enum pins must have 'enumValues' array`);
      } else if (pin.enumValues.length === 0) {
        warnings.push(`${pinLabel}: Enum has no values`);
      }
    }

    // Container type validation
    if (pin.containerType) {
      const validContainers = ["array", "set", "map"];
      if (!validContainers.includes(pin.containerType)) {
        errors.push(
          `${pinLabel}: Invalid containerType '${
            pin.containerType
          }'. Must be one of: ${validContainers.join(", ")}`
        );
      }
    }

    // Name validation
    if (pin.name === undefined) {
      warnings.push(
        `${pinLabel}: Missing 'name' field (can be empty string for unnamed pins)`
      );
    }
  }

  /**
   * Validate executor registry matches node definitions
   * @param {Object} definitions - NodeDefinitions
   * @param {ExecutorRegistry} registry - Executor registry instance
   */
  static validateExecutorCoverage(definitions, _registry) {
    const warnings = [];
    const errors = [];

    Object.entries(definitions).forEach(([nodeKey, nodeDef]) => {
      // Skip pure nodes and nodes without executor field
      if (nodeDef.type === "pure-node" && !nodeDef.executor) {
        return;
      }

      if (nodeDef.executor) {
        // Check if executor exists
        // const _executorName = nodeDef.executor;
        // This would need access to the actual executor instances
        // For now, just warn if executor field is missing
      } else if (nodeDef.type !== "pure-node") {
        warnings.push(
          `${nodeKey}: No 'executor' field specified for ${nodeDef.type}`
        );
      }
    });

    if (warnings.length > 0) {
      console.warn(`⚠️ Executor Coverage Warnings (${warnings.length}):`);
      warnings.forEach((w) => console.warn(`  - ${w}`));
    }

    if (errors.length > 0) {
      console.error(`❌ Executor Coverage Errors (${errors.length}):`);
      errors.forEach((e) => console.error(`  - ${e}`));
      throw new Error(
        `Executor coverage validation failed with ${errors.length} errors`
      );
    }
  }
}
