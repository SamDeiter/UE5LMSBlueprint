/**
 * MenuContentProvider.js
 *
 * Handles the retrieval, filtering, and organization of items for the ActionMenu.
 * Separates data logic from the UI rendering in ActionMenu.js.
 */
import { nodeRegistry } from "../../registries/NodeRegistry.js";
import { Utils } from "../../utils.js";
import { Pin } from "../../graph/index.js";

export class MenuContentProvider {
  constructor(app) {
    this.app = app;
  }

  /**
   * Returns a flat list of all actionable menu items sorted by relevance/category.
   * @param {string} filter - Search text
   * @param {Pin|null} sourcePin - The pin being dragged (if any)
   * @param {boolean} isContextSensitive - Whether to filter by compatibility
   * @param {string|null} droppedVarName - Variable name if dropped
   * @param {string|null} droppedComponent - Component name if dropped
   */
  getActions(
    filter,
    sourcePin,
    isContextSensitive,
    droppedVarName,
    droppedComponent
  ) {
    let items = [];
    filter = filter.toLowerCase();

    // 1. Handle Drop Scenarios (Highest Priority)
    if (droppedVarName) {
      return this._getVariableDropActions(droppedVarName);
    }
    if (droppedComponent) {
      return this._getComponentDropActions(droppedComponent);
    }

    // 2. Context Header Actions (Suggestions)
    if (sourcePin) {
      items.push(...this._getSuggestions(sourcePin));
    }

    // 3. Variable Actions (Get/Set)
    items.push(
      ...this._getVariableActions(filter, sourcePin, isContextSensitive)
    );

    // 4. Custom Event Calls
    items.push(...this._getCustomEventActions(filter));

    // 5. Standard Node Registry Items
    items.push(...this._getNodeActions(filter, sourcePin, isContextSensitive));

    // 6. Debug Items (only if no context)
    if (!sourcePin && filter === "") {
      items.push(...this._getDebugActions());
    }

    return items;
  }

  // --- Private Providers ---

  _getVariableDropActions(varName) {
    const variable = [...this.app.variables.variables.values()].find(
      (v) => v.name === varName
    );
    if (!variable) return [];

    const color = Utils.getPinColor(variable.type);
    // No category - display directly at top level without nesting
    return [
      {
        name: `Get ${varName}`,
        category: "", // Empty category = flat display
        nodeKey: `Get_${varName}`,
        color: color,
        isVariableOp: true,
      },
      {
        name: `Set ${varName}`,
        category: "", // Empty category = flat display
        nodeKey: `Set_${varName}`,
        color: color,
        isVariableOp: true,
      },
    ];
  }

  _getComponentDropActions(droppedComponent) {
    // droppedComponent is the component object from app.components
    const compName = droppedComponent.name || droppedComponent;
    const compId = droppedComponent.id || droppedComponent;

    // Match structure of variable drop actions - empty category for flat display
    return [
      {
        name: `Get ${compName}`,
        category: "", // Empty category = flat display at top level
        nodeKey: `GetComponent_${compId}`,
        isComponentOp: true,
      },
      {
        name: `Set ${compName}`,
        category: "", // Empty category = flat display at top level
        nodeKey: `SetComponent_${compId}`,
        isComponentOp: true,
      },
    ];
  }

  _getSuggestions(sourcePin) {
    const items = [];
    if (["vector", "rotator", "transform"].includes(sourcePin.type)) {
      const map = {
        vector: "BreakVector",
        rotator: "BreakRotator",
        transform: "BreakTransform",
      };
      const key = map[sourcePin.type];
      const data = nodeRegistry.get(key);
      if (data) {
        items.push({
          name: data.title || key,
          category: "Suggested",
          nodeKey: key,
          isSuggested: true,
        });
      }
    }
    return items;
  }

  _getVariableActions(filter, sourcePin, isContextSensitive) {
    const items = [];
    if (!this.app.variables || !this.app.variables.variables) return items;

    for (const variable of this.app.variables.variables.values()) {
      const varName = variable.name;
      const fullGet = `get ${varName}`.toLowerCase();
      const fullSet = `set ${varName}`.toLowerCase();

      // Filter Check
      if (filter) {
        if (
          !varName.toLowerCase().includes(filter) &&
          !fullGet.includes(filter) &&
          !fullSet.includes(filter)
        ) {
          continue;
        }
      }

      const color = Utils.getPinColor(variable.type);
      const ops = [
        {
          key: `Get_${varName}`,
          label: `Get ${varName}`,
          type: "Get",
          pinType: variable.type,
          dir: "out",
        },
        {
          key: `Set_${varName}`,
          label: `Set ${varName}`,
          type: "Set",
          pinType: variable.type,
          dir: "in",
        },
      ];

      ops.forEach((op) => {
        if (sourcePin && isContextSensitive) {
          if (!this._isVariableOpCompatible(op, sourcePin)) return;
        }
        items.push({
          name: op.label,
          category: "Variables",
          nodeKey: op.key, // GraphController interprets this prefix
          color: color,
          isVariableOp: true,
        });
      });
    }
    return items;
  }

  _isVariableOpCompatible(op, sourcePin) {
    // Mock compatibility check
    if (op.type === "Get") {
      // Get Node has Output of varType. Source must be Input of same type?
      // Or Source is Input, connecting to Get Output.
      // We use graph.canConnect logic by mocking a pin.
      const tempPin = new Pin(
        { id: "temp", app: this.app },
        { id: "temp_pin", dir: "out", type: op.pinType }
      );
      return this.app.graph.canConnect(sourcePin, tempPin);
    } else {
      // Set Node has Exec In/Out and Data In (same type) and Data Out (same type)
      if (sourcePin.type === "exec") return true; // Execs always connect to Set

      // Check Data Input (Value)
      const valIn = new Pin(
        { id: "temp", app: this.app },
        { id: "temp_val_in", dir: "in", type: op.pinType }
      );
      if (this.app.graph.canConnect(sourcePin, valIn)) return true;

      // Check Data Output (Result)
      const valOut = new Pin(
        { id: "temp", app: this.app },
        { id: "temp_val_out", dir: "out", type: op.pinType }
      );
      if (this.app.graph.canConnect(sourcePin, valOut)) return true;

      return false;
    }
  }

  _getCustomEventActions(filter) {
    const items = [];
    if (!this.app.graph || !this.app.graph.nodes) return items;

    for (const node of this.app.graph.nodes.values()) {
      if (node.nodeKey === "CustomEvent") {
        const eventName = node.title;
        const callLabel = `Call ${eventName}`;
        if (filter && !callLabel.toLowerCase().includes(filter)) continue;

        items.push({
          name: callLabel,
          category: "Custom Events",
          isCustomEventCall: true,
          eventName: eventName,
        });
      }
    }
    return items;
  }

  _getNodeActions(filter, sourcePin, isContextSensitive) {
    const items = [];
    const allKeys = Object.keys(nodeRegistry.getAll());

    for (const key of allKeys) {
      // Skip internal/helper keys if any (maybe start with _?)
      const nodeData = nodeRegistry.get(key);
      const title = nodeData.title || key;

      // Filter
      if (filter) {
        if (
          !title.toLowerCase().includes(filter) &&
          !key.toLowerCase().includes(filter)
        ) {
          continue;
        }
      }

      // Context Sensitive Check
      if (sourcePin && isContextSensitive) {
        if (!this._isNodeCompatible(nodeData, sourcePin)) continue;
      }

      items.push({
        name: title,
        nodeKey: key,
        category: nodeData.category || "Common",
        isStandardNode: true,
        // Highlight info could be computed here or in renderer
        displayName: title,
      });
    }
    return items;
  }

  _isNodeCompatible(nodeData, sourcePin) {
    if (!nodeData.pins || nodeData.pins.length === 0) return false;

    const tempNode = { id: "temp-compat-node", app: this.app };
    // Check if ANY pin on this node type can connect to sourcePin
    return nodeData.pins.some((pDef) => {
      const p = new Pin(tempNode, pDef);
      return this.app.graph.canConnect(sourcePin, p);
    });
  }

  _getDebugActions() {
    return [
      {
        name: "Export Graph (JSON)",
        category: "Debug",
        isDebug: true,
        action: () => this.app.graph.exportGraph(),
      },
    ];
  }
}
