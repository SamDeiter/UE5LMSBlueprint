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

    // Set node (variable-node with exec pins)
    nodeRegistry.register(`Set_${variable.name}`, {
      title: `Set ${variable.name}`,
      category: "Variables",
      type: "variable-node",
      variableType: variable.type,
      variableId: variable.id,
      icon: "fa-arrow-up",
      pins: [
        { id: "exec_in", name: "", type: "exec", dir: "in" },
        {
          id: "val_in",
          name: variable.name,
          type: variable.type,
          dir: "in",
          containerType: variable.containerType,
          ...pinDefault,
        },
        { id: "exec_out", name: "", type: "exec", dir: "out" },
        {
          id: "val_out",
          name: "", // UE5 style: output pin has no label
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
    // Use component.id for keys (matching original implementation)
    // Get component node (compact)
    nodeRegistry.register(`GetComponent_${component.id}`, {
      title: `Get ${component.name}`,
      category: "Components",
      type: "pure-node",
      variableType: "object",
      componentType: component.type,
      customData: { componentId: component.id },
      icon: "fa-cube",
      pins: [
        {
          id: "out",
          name: component.name,
          type: component.type,
          dir: "out",
        },
      ],
    });

    // Set component node
    nodeRegistry.register(`SetComponent_${component.id}`, {
      title: "SET",
      category: "Components",
      type: "function-node",
      variableType: "object",
      componentType: component.type,
      customData: { componentId: component.id, componentName: component.name },
      icon: "fa-cube",
      pins: [
        { id: "exec_in", name: "", type: "exec", dir: "in" },
        {
          id: "comp_in",
          name: component.name,
          type: component.type,
          dir: "in",
          noDefaultValue: true,
        },
        { id: "exec_out", name: "", type: "exec", dir: "out" },
        { id: "comp_out", name: "", type: component.type, dir: "out" },
      ],
    });
  }

  /**
   * Unregister Get and Set nodes for a component
   * @param {Object} component - Component object with id
   */
  static unregisterComponentNodes(component) {
    nodeRegistry.unregister(`GetComponent_${component.id}`);
    nodeRegistry.unregister(`SetComponent_${component.id}`);
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
      this.unregisterComponentNodes(component);
    }
  }
}

export default NodeLibraryHelper;
