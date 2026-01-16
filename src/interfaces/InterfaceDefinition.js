import { generateGUID } from "../utils/guid.js";

/**
 * InterfaceDefinition - Represents a Blueprint Interface with function signatures.
 * Interfaces define contracts that Blueprints can implement.
 */
export class InterfaceDefinition {
  constructor(name, description = "") {
    this.id = generateGUID();
    this.name = name;
    this.description = description;

    // Array of interface functions
    // Each function: { name, description, inputs[], outputs[], isPure }
    this.functions = [];
  }

  /**
   * Add a function to this interface
   * @param {string} name - Function name
   * @param {string} description - Function description
   * @param {Array} inputs - Array of { name, type, defaultValue }
   * @param {Array} outputs - Array of { name, type }
   * @param {boolean} isPure - True if function has no side effects
   */
  addFunction(
    name,
    description = "",
    inputs = [],
    outputs = [],
    isPure = false
  ) {
    this.functions.push({
      name,
      description,
      inputs,
      outputs,
      isPure,
    });
    return this;
  }

  /**
   * Get a function by name
   */
  getFunction(name) {
    return this.functions.find((f) => f.name === name);
  }

  /**
   * Check if this interface has a specific function
   */
  hasFunction(name) {
    return this.functions.some((f) => f.name === name);
  }

  /**
   * Generate event node key for a function
   */
  getEventNodeKey(functionName) {
    return `Event_${this.name}_${functionName}`;
  }

  /**
   * Generate message/call node key for a function
   */
  getMessageNodeKey(functionName) {
    return `Message_${this.name}_${functionName}`;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      functions: this.functions,
    };
  }

  static fromJSON(data) {
    const iface = new InterfaceDefinition(data.name, data.description);
    iface.id = data.id;
    iface.functions = data.functions || [];
    return iface;
  }
}
