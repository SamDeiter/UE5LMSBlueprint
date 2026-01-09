/**
 * NodeLibraryHelper - Consolidates node registration patterns
 *
 * Previously duplicated in:
 * - VariableController.updateNodeLibrary()
 * - ComponentsController.updateNodeLibrary()
 *
 * Now provides a single, reusable API for registering Get/Set nodes.
 */

import { nodeRegistry } from "../registries/NodeRegistry.js";

export class NodeLibraryHelper {
  /**
   * Register Get and Set nodes for a variable
   * @param {Object} variable - Variable object with id, name, type, containerType, defaultValue
   */
  static registerVariableNodes(variable) {
    const pinDefault = { defaultValue: variable.defaultValue };

    // Get node (pure/compact node)
    nodeRegistry.register(`Get_${variable.name}`, {
      title: `Get ${variable.name}`,
      category: "Variables",
      type: "pure-node",
      variableType: variable.type,
      variableId: variable.id,
      icon: "fa-arrow-down",
      pins: [
        {
          id: "val_out",
          name: variable.name,
          type: variable.type,
          dir: "out",
          containerType: variable.containerType,
          ...pinDefault,
        },
      ],
    });

    // Set node (function node with exec pins)
    nodeRegistry.register(`Set_${variable.name}`, {
      title: "SET",
      category: "Variables",
      type: "function-node",
      variableType: variable.type,
      variableId: variable.id,
      icon: "fa-arrow-up",
      pins: [
        { id: "exec_in", name: "", type: "exec", dir: "in" },
        { id: "exec_out", name: "", type: "exec", dir: "out" },
        {
          id: "val_in",
          name: variable.name,
          type: variable.type,
          dir: "in",
          containerType: variable.containerType,
          ...pinDefault,
        },
        {
          id: "val_out",
          name: "",
          type: variable.type,
          dir: "out",
          containerType: variable.containerType,
        },
      ],
    });
  }

  /**
   * Unregister Get and Set nodes for a variable
   * @param {string} variableName - Name of the variable
   */
  static unregisterVariableNodes(variableName) {
    nodeRegistry.unregister(`Get_${variableName}`);
    nodeRegistry.unregister(`Set_${variableName}`);
  }

  /**
   * Register Get and Set nodes for a component
   * @param {Object} component - Component object with id, name, type
   */
  static registerComponentNodes(component) {
    // Get component node (compact)
    nodeRegistry.register(`GetComponent_${component.name}`, {
      title: `Get ${component.name}`,
      category: "Components",
      type: "pure-node",
      variableType: "object",
      componentType: component.type,
      icon: "fa-cube",
      pins: [
        {
          id: "comp_out",
          name: component.name,
          type: "object",
          dir: "out",
          subType: component.type,
        },
      ],
    });

    // Set component node
    nodeRegistry.register(`SetComponent_${component.name}`, {
      title: "SET",
      category: "Components",
      type: "function-node",
      variableType: "object",
      componentType: component.type,
      icon: "fa-cube",
      pins: [
        { id: "exec_in", name: "", type: "exec", dir: "in" },
        { id: "exec_out", name: "", type: "exec", dir: "out" },
        {
          id: "comp_in",
          name: component.name,
          type: "object",
          dir: "in",
          subType: component.type,
          noDefaultValue: true,
        },
        {
          id: "comp_out",
          name: "",
          type: "object",
          dir: "out",
          subType: component.type,
        },
      ],
    });
  }

  /**
   * Unregister Get and Set nodes for a component
   * @param {string} componentName - Name of the component
   */
  static unregisterComponentNodes(componentName) {
    nodeRegistry.unregister(`GetComponent_${componentName}`);
    nodeRegistry.unregister(`SetComponent_${componentName}`);
  }

  /**
   * Bulk register nodes for all variables
   * @param {Map|Array} variables - Collection of variables
   */
  static registerAllVariables(variables) {
    const items = variables instanceof Map ? variables.values() : variables;
    for (const variable of items) {
      this.registerVariableNodes(variable);
    }
  }

  /**
   * Bulk register nodes for all components
   * @param {Map|Array} components - Collection of components
   */
  static registerAllComponents(components) {
    const items = components instanceof Map ? components.values() : components;
    for (const component of items) {
      this.registerComponentNodes(component);
    }
  }

  /**
   * Clear all variable nodes from registry
   * @param {Map|Array} variables - Collection of variables to unregister
   */
  static unregisterAllVariables(variables) {
    const items = variables instanceof Map ? variables.values() : variables;
    for (const variable of items) {
      this.unregisterVariableNodes(variable.name);
    }
  }

  /**
   * Clear all component nodes from registry
   * @param {Map|Array} components - Collection of components to unregister
   */
  static unregisterAllComponents(components) {
    const items = components instanceof Map ? components.values() : components;
    for (const component of items) {
      this.unregisterComponentNodes(component.name);
    }
  }
}

export default NodeLibraryHelper;
