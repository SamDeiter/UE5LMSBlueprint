/**
 * GraphController class - Manages the graph editor, nodes, and user interactions.
 */
import { Utils } from "../utils.js";
import { generateGUID } from "../utils/guid.js";
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { DOMElements } from "../config/DOMElements.js";
import { Pin } from "./Pin.js";
import { Node } from "./Node.js";
import { GraphInteraction } from "./GraphInteraction.js";
import { GraphRenderer } from "./GraphRenderer.js";
import { GRAPH_CONSTANTS, LATENT_NODE_TYPES } from "../config/Constants.js";
import { BaseController } from "../ui/BaseController.js";

class GraphController extends BaseController {
  constructor(editor, svg, nodesContainer, app) {
    super(app); // Initialize BaseController for memory leak prevention
    this.editor = editor;
    this.svg = svg;
    this.nodesContainer = nodesContainer;
    this.nodes = new Map();
    this.zoomReadout = document.getElementById(DOMElements.ZOOM_READOUT);
    this.pan = { x: 0, y: 0 };
    this.zoom = 1;
    this.selectedNodes = new Set();

    // Initialize Renderer
    this.renderer = new GraphRenderer(this, nodesContainer, svg, app);

    // Initialize Interaction Handler
    this.interaction = new GraphInteraction(this);
  }

  initEvents() {
    this.interaction.initEvents();
  }

  // ... addNode and other methods remain ...

  updateTransform() {
    this.renderer.updateTransform();
  }

  redrawNodeWires(nodeId) {
    this.renderer.redrawNodeWires(nodeId);
  }

  drawAllWires() {
    this.renderer.drawAllWires();
  }

  renderAllNodes() {
    this.renderer.renderAllNodes();
  }

  clearActiveWires() {
    this.renderer.clearActiveWires();
  }

  /**
   * Clear all nodes from the graph
   */
  clear() {
    // Remove all nodes (which also breaks their wires)
    const nodeIds = [...this.nodes.keys()];
    nodeIds.forEach((id) => this.removeNode(id));
    this.selectedNodes.clear();
    this.app.wiring.clearAll();
  }

  /**
   * Create a node from pre-defined data (for loading scenarios)
   * @param {Object} nodeData - Node data with id, nodeKey, x, y, pins, etc.
   * @returns {Node} The created node
   */
  createNodeFromData(nodeData) {
    const node = this.addNode(
      nodeData.nodeKey,
      nodeData.x || 0,
      nodeData.y || 0
    );
    if (!node) return null;

    // Override the auto-generated ID if one is provided
    if (nodeData.id && nodeData.id !== node.id) {
      this.nodes.delete(node.id);
      node.id = nodeData.id;
      this.nodes.set(node.id, node);
    }

    // Update pin IDs to match scenario data
    if (nodeData.pins && node.pins) {
      nodeData.pins.forEach((pinData, index) => {
        if (node.pins[index]) {
          node.pins[index].id = pinData.id;
        }
      });
    }

    return node;
  }

  addNode(nodeKey, x, y) {
    let nodeData = nodeRegistry.get(nodeKey);

    // Dynamic Function Call Node Generation
    if (!nodeData && nodeKey.startsWith("Func_")) {
      const funcName = nodeKey.replace("Func_", "");
      const funcDef = this.app.functionRegistry
        .getAll()
        .find((f) => f.name === funcName);

      if (funcDef) {
        // Generate a temporary node definition for this function call
        nodeData = {
          title: `Call ${funcName}`,
          type: funcDef.isPure ? "pure-node" : "function-node",
          category: "Function",
          icon: "f",
          pins: [],
        };

        // Add Exec In/Out if not pure
        if (!funcDef.isPure) {
          nodeData.pins.push({
            id: "exec_in",
            name: "Exec",
            type: "exec",
            dir: "in",
          });
        }

        // Add Inputs
        funcDef.inputs.forEach((input) => {
          nodeData.pins.push({
            id: `in_${input.name}`,
            name: input.name,
            type: input.type,
            dir: "in",
            defaultValue: input.defaultValue,
          });
        });

        // Add Outputs (Exec Out first if not pure)
        if (!funcDef.isPure) {
          nodeData.pins.push({
            id: "exec_out",
            name: "Exec",
            type: "exec",
            dir: "out",
          });
        }

        funcDef.outputs.forEach((output) => {
          nodeData.pins.push({
            id: `out_${output.name}`,
            name: output.name,
            type: output.type,
            dir: "out",
          });
        });
      }
    }

    // Dynamic Macro Node Generation
    if (!nodeData && nodeKey.startsWith("Macro_")) {
      const macroName = nodeKey.replace("Macro_", "");
      const macroDef = this.app.macroRegistry
        .getAll()
        .find((m) => m.name === macroName);

      if (macroDef) {
        nodeData = {
          title: macroName,
          type: "macro-node",
          category: "Macro",
          icon: "m",
          pins: [],
        };

        // Add Inputs (Execs and Data)
        macroDef.inputs.forEach((input) => {
          nodeData.pins.push({
            id: `in_${input.name}`,
            name: input.name,
            type: input.type,
            dir: "in",
            defaultValue: input.defaultValue,
          });
        });

        // Add Outputs (Execs and Data)
        macroDef.outputs.forEach((output) => {
          nodeData.pins.push({
            id: `out_${output.name}`,
            name: output.name,
            type: output.type,
            dir: "out",
          });
        });
      }
    }

    if (!nodeData) {
      console.error(`NodeRegistry missing definition for ${nodeKey}`);
      return null;
    }

    // Check for Singleton
    if (nodeData.isSingleton) {
      const existingNode = [...this.nodes.values()].find(
        (n) => n.nodeKey === nodeKey
      );
      if (existingNode) {
        this.selectNode(existingNode.id, false, "new");
        console.warn(
          `Cannot add ${nodeData.title}: Only one instance allowed.`
        );
        return null;
      }
    }

    // Check for Latent Nodes in Functions
    if (
      this.app.activeGraph &&
      (this.app.activeGraph.startsWith("Func_") ||
        this.app.functionRegistry
          .getAll()
          .find((f) => f.name === this.app.activeGraph))
    ) {
      // Latent nodes typically have a 'Latent' category or specific flag.
      // For now, we'll check for specific types like Timeline or Delay (if added later)
      if (LATENT_NODE_TYPES.includes(nodeKey)) {
        console.warn(
          `Cannot add ${nodeData.title}: Latent nodes are not allowed in Functions.`
        );
        // Ideally show a UI toast/alert here
        return null;
      }
    }

    const id = generateGUID();
    const node = new Node(id, nodeData, x, y, nodeKey, this.app);
    this.nodes.set(id, node);
    const nodeEl = node.render();
    this.nodesContainer.appendChild(nodeEl);
    this.app.compiler.markDirty();

    // NeedNode modal is handled by ActionMenu/Palette drop handlers
    // Do NOT auto-open modal here to avoid double-modal issues

    // Save state for undo/redo
    if (this.app.history) {
      this.app.history.saveState("add node");
    }

    return node;
  }

  removeCustomPin(nodeId, pinId) {
    const node = this.nodes.get(nodeId);
    if (!node || node.nodeKey !== "CustomEvent") return;

    const pinToRemove = node.findPinById(pinId);
    if (!pinToRemove || !pinToRemove.isCustom) return;

    // 1. Break all links to the pin
    this.app.wiring.breakPinLinks(pinId);

    // 2. Remove pin from node's array and literals map
    node.pins = node.pins.filter((p) => p.id !== pinId);
    node.pinLiterals.delete(pinId);

    // 3. Refresh caches and visuals
    node.refreshPinCache();
    this.app.wiring.updateVisuals(node);
  }

  getGraphCoords(clientX, clientY) {
    const rect = this.editor.getBoundingClientRect();
    const x = (clientX - rect.left - this.pan.x) / this.zoom;
    const y = (clientY - rect.top - this.pan.y) / this.zoom;
    return { x, y };
  }

  loadState(state) {
    // Ensure state is an object, or default to an empty object
    const safeState = state || {};
    const safeNodes = safeState.nodes || [];
    const safeLinks = safeState.links || [];

    // Clear existing state
    this.nodes.clear();
    // Use the comprehensive clear method to remove SVG elements
    this.app.wiring.clear();
    this.clearSelection();

    // 1. Load Nodes
    safeNodes.forEach((nodeData) => {
      const template = nodeRegistry.get(nodeData.nodeKey);

      // Dynamic Node Handling (Functions/Macros) if template is missing
      let dynamicTemplate = null;
      if (!template) {
        if (nodeData.nodeKey.startsWith("Func_")) {
          const funcName = nodeData.nodeKey.replace("Func_", "");
          const funcDef = this.app.functionRegistry
            .getAll()
            .find((f) => f.name === funcName);
          if (funcDef) {
            dynamicTemplate = {
              title: `Call ${funcName}`,
              type: funcDef.isPure ? "pure-node" : "function-node",
              category: "Function",
              icon: "f",
              pins: [], // Pins will be handled by sync or saved data
            };
          }
        }
      }

      const effectiveTemplate = template || dynamicTemplate;

      if (!effectiveTemplate) {
        console.warn(
          `Skipping node during load: Key '${nodeData.nodeKey}' not found in NodeRegistry.`
        );
        return;
      }

      // Determine the final pin definition to use: saved pins (for dynamic nodes) or template pins (for static nodes)
      let pinsToLoad = effectiveTemplate.pins || [];

      // If the node is a Custom Event (or other dynamic node) AND saved pins exist
      if (nodeData.nodeKey === "CustomEvent") {
        // Check if saved pins contains custom pins (more than the base exec/delegate pins)
        const hasCustomPins =
          nodeData.pins && nodeData.pins.some((p) => p.isCustom);
        if (hasCustomPins) {
          pinsToLoad = nodeData.pins;
        }
      } else if (nodeData.nodeKey.startsWith("Func_") && nodeData.pins) {
        // Function call pins may change. We should handle merging the template and saved pins if needed,
        // but for simplicity here, we assume if we have saved pins, we use them to restore literal values/structure if dynamic.
        pinsToLoad = nodeData.pins;
      }

      const fullNodeData = {
        ...effectiveTemplate,
        ...nodeData,
        pins: pinsToLoad,
      };
      const node = new Node(
        nodeData.id,
        fullNodeData,
        nodeData.x,
        nodeData.y,
        nodeData.nodeKey,
        this.app
      );
      this.nodes.set(node.id, node);

      // Restore literal values
      if (nodeData.pins) {
        nodeData.pins.forEach((savedPin) => {
          // Normalize saved pin ID to match the runtime Pin ID format
          const fullPinId = savedPin.id.includes(node.id)
            ? savedPin.id
            : `${node.id}-${savedPin.id}`;
          const pin = node.findPinById(fullPinId);

          if (pin && savedPin.literalValue !== undefined) {
            node.pinLiterals.set(pin.id, savedPin.literalValue);
          } else if (pin) {
            // Ensure a default is set if literalValue was missing or undefined
            node.pinLiterals.set(pin.id, pin.defaultValue);
          }

          // Restore saved pin type (important for reroute nodes)
          if (pin && savedPin.type && savedPin.type !== pin.type) {
            pin.type = savedPin.type;
          }
        });
      }

      // Special handling for reroute nodes: update visuals after pin types are restored
      if (nodeData.nodeKey === "Reroute" && node.updateRerouteVisuals) {
        node.refreshPinCache();
      }
    });

    // 2. Load Links
    safeLinks.forEach((linkData) => {
      const startPin = this.findPinById(linkData.startPinId);
      const endPin = this.findPinById(linkData.endPinId);

      if (startPin && endPin) {
        const link = { id: linkData.id, startPin, endPin };
        this.app.wiring.links.set(link.id, link);
        startPin.links.push(link.id);
        endPin.links.push(link.id);
      } else {
        console.warn(
          `Skipping link during load due to missing pin: ${linkData.id}`
        );
      }
    });

    // 3. Render and Redraw
    this.renderAllNodes();
    this.drawAllWires();

    // 4. Restore Pan/Zoom
    if (safeState.pan) this.pan = safeState.pan;
    if (safeState.zoom) this.zoom = safeState.zoom;
    this.updateTransform();

    // 5. Update Local Variables Context
    if (this.app.localVariables) {
      const func = this.app.functionRegistry
        .getAll()
        .find((f) => f.name === this.app.activeGraph);
      if (func) {
        this.app.localVariables.setContext(func);
      } else {
        this.app.localVariables.clearContext();
      }
    }

    // 6. Sync Function Nodes (Entry/Result) if in a function graph
    const func = this.app.functionRegistry
      .getAll()
      .find((f) => f.name === this.app.activeGraph);
    if (func && this.app.functionsController) {
      this.app.functionsController.syncFunctionNodes(func);
    }

    // 7. Sync CallFunction nodes
    const funcsToSync = new Set();
    for (const node of this.nodes.values()) {
      if (node.nodeKey.startsWith("Func_")) {
        const funcName = node.nodeKey.replace("Func_", "");
        funcsToSync.add(funcName);
      }
    }

    funcsToSync.forEach((funcName) => {
      const funcDef = this.app.functionRegistry
        .getAll()
        .find((f) => f.name === funcName);
      if (funcDef && this.app.functionsController) {
        this.app.functionsController.syncFunctionNodes(funcDef);
      }
    });
  }

  findPinById(pinId) {
    if (!pinId) return null;
    // The format is usually 'node-id-part1-pinName'
    // We iterate keys to find the node ID that is a prefix of the pin ID.
    // CRITICAL FIX: We must check for the separator '-' to avoid partial matches
    // (e.g. 'node-1' matching 'node-10-pin').

    const nodeIds = Array.from(this.nodes.keys());
    let nodeId = null;

    for (const id of nodeIds) {
      // Check if pinId starts with "id-" to ensure we matched the full node ID
      if (pinId.startsWith(id + "-")) {
        nodeId = id;
        break;
      }
    }

    // Fallback: if no dash found (unlikely for valid pins), try exact match or loose match
    // but the strict check above solves the "node-1 vs node-10" issue.
    if (!nodeId) {
      // Try to see if the pinId IS the nodeId (edge case?)
      if (this.nodes.has(pinId)) nodeId = pinId;
    }

    const node = this.nodes.get(nodeId);
    return node ? node.findPinById(pinId) : null;
  }

  canConnect(pinA, pinB) {
    if (!pinA || !pinB || !pinA.node || !pinB.node) return false;
    if (pinA.node.id === pinB.node.id) return false;
    if (pinA.dir === pinB.dir) return false;

    const startPin = pinA.dir === "out" ? pinA : pinB;
    const endPin = pinA.dir === "in" ? pinA : pinB;

    // If the end pin already has max links, prevent connection
    if (endPin.links.length >= endPin.getMaxLinks()) return false;

    // Check container type match (single, array, set, map)
    if (startPin.containerType !== endPin.containerType) return false;

    // Check type match using Utils.isTypeCompatible
    if (Utils.isTypeCompatible(startPin.type, endPin.type)) return true;

    // Check for implicit conversion
    const conversionKey = Utils.getConversionNodeKey(
      startPin.type,
      endPin.type
    );
    if (conversionKey) return true;

    return false;
  }

  promotePinToVariable(pin) {
    const newVariable = this.app.variables.createVariableFromPin(pin);

    let nodeToSpawnKey;
    if (pin.dir === "in") {
      nodeToSpawnKey = `Get_${newVariable.name}`;
    } else {
      nodeToSpawnKey = `Set_${newVariable.name}`;
    }

    // Calculate position offset relative to the pin's center
    const pinPos = Utils.getPinPosition(pin.element, this.app);
    const x = pinPos.x - 10;
    const y = pinPos.y - 15;

    const newNode = this.app.graph.addNode(nodeToSpawnKey, x, y);

    if (newNode) {
      const targetPinName = pin.dir === "in" ? "val_out" : "val_in";
      const newPin = newNode.pins.find((p) => p.id.endsWith(targetPinName));

      // Connect the pin being promoted to the new variable node
      if (newPin) {
        // If the pin being promoted is an input pin, the Get node output connects to it (newPin is the output)
        // If the pin being promoted is an output pin, the Set node input connects to it (newPin is the input)
        if (pin.dir === "in") {
          this.app.wiring.createConnection(newPin, pin); // newPin (out) -> pin (in)
        } else {
          this.app.wiring.createConnection(pin, newPin); // pin (out) -> newPin (in)
        }
      }
    }

    this.app.persistence.autoSave();
  }

  updateVariableNodes(oldName, newName) {
    const getKey = `Get_${oldName}`;
    const setKey = `Set_${oldName}`;

    for (const node of this.nodes.values()) {
      if (node.nodeKey === getKey || node.nodeKey === setKey) {
        const newKey =
          node.nodeKey === getKey ? `Get_${newName}` : `Set_${newName}`;
        node.nodeKey = newKey;
        this.synchronizeNodeWithTemplate(node);
      }
    }
  }

  /**
   * Synchronizes a node instance with its template definition from the NodeRegistry.
   * Updates the node's title, pins, and preserves existing connections and literal values.
   * @param {Node} node - The node instance to synchronize.
   */
  synchronizeNodeWithTemplate(node) {
    const template = nodeRegistry.get(node.nodeKey);
    if (!template) return;

    node.title = template.title;
    node.type = template.type || "pure-node";
    node.icon = template.icon;
    node.devWarning = template.devWarning;
    node.variableType = template.variableType;
    node.variableId = template.variableId;
    node.customData = template.customData || {};

    const oldPinsMap = new Map(node.pins.map((p) => [p.id, p]));
    const oldLiterals = new Map(node.pinLiterals);

    const newPins = [];
    const newLiterals = new Map();

    // 1. Create new pins based on template, transferring links and literals if the pin ID matches
    template.pins.forEach((pData) => {
      const newPin = new Pin(node, pData);
      const fullPinId = newPin.id;
      const oldPin = oldPinsMap.get(fullPinId);

      if (oldPin) {
        // Transfer links, default value, and literal value
        newPin.links = oldPin.links;
        // Preserve the runtime literal value
        newLiterals.set(fullPinId, oldLiterals.get(fullPinId));

        // Update links to point to the new Pin instance
        newPin.links.forEach((linkId) => {
          const link = this.app.wiring.links.get(linkId);
          if (link) {
            if (link.startPin.id === fullPinId) link.startPin = newPin;
            if (link.endPin.id === fullPinId) link.endPin = newPin;
          }
        });
      } else {
        // Use default literal value for new pins
        newLiterals.set(fullPinId, newPin.defaultValue);
      }
      newPins.push(newPin);
    });

    // 2. Cleanup pins/literals/links for pins that no longer exist
    oldPinsMap.forEach((oldPin, oldId) => {
      if (!newPins.some((p) => p.id === oldId)) {
        // Pin was removed: break its links
        this.app.wiring.breakPinLinks(oldId);
      }
    });

    node.pins = newPins;
    node.pinLiterals = newLiterals;

    node.refreshPinCache();
    this.app.wiring.updateVisuals(node);
    this.redrawNodeWires(node.id);
  }

  selectNode(nodeId, addToSelection = false, mode = "toggle") {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // If not adding to selection, clear existing selection once
    if (!addToSelection) {
      this.clearSelection();
    }

    let shouldSelect = false;
    if (mode === "add") {
      shouldSelect = true;
    } else if (mode === "remove") {
      shouldSelect = false;
    } else if (mode === "toggle") {
      shouldSelect = !this.selectedNodes.has(nodeId);
    } else if (mode === "new") {
      shouldSelect = true;
    }

    if (shouldSelect) {
      this.selectedNodes.add(nodeId);
      node.element.classList.add("selected");
    } else {
      this.selectedNodes.delete(nodeId);
      node.element.classList.remove("selected");
    }

    // Handle details panel display
    if (this.selectedNodes.size === 1) {
      const selectedNode = this.nodes.get([...this.selectedNodes][0]);
      this.app.details.showNodeDetails(selectedNode);
    } else {
      this.app.details.clear();
    }
  }

  clearSelection() {
    this.selectedNodes.forEach((nodeId) => {
      const node = this.nodes.get(nodeId);
      if (node) node.element.classList.remove("selected");
    });
    this.selectedNodes.clear();
    this.app.details.clear();
  }

  selectNodesInRect(rect, mode) {
    for (const node of this.nodes.values()) {
      if (!node.element) continue;

      // Use Graph Space coordinates for intersection test
      // rect is passed in Graph Space from GraphInteraction
      const nodeLeft = node.x;
      const nodeTop = node.y;
      const nodeWidth = node.width || node.element.offsetWidth;
      const nodeHeight = node.height || node.element.offsetHeight;
      const nodeRight = nodeLeft + nodeWidth;
      const nodeBottom = nodeTop + nodeHeight;

      // Check for intersection
      const intersects =
        nodeLeft < rect.right &&
        nodeRight > rect.left &&
        nodeTop < rect.bottom &&
        nodeBottom > rect.top;

      if (intersects) {
        // Marquee selects the node
        this.selectNode(node.id, true, mode);
      } else if (mode === "new") {
        // In 'new' mode, if it doesn't intersect, ensure it's unselected
        this.selectedNodes.delete(node.id);
        node.element.classList.remove("selected");
      }
    }

    // Re-run selectNode logic for the final set to ensure details panel is updated correctly
    if (this.selectedNodes.size === 1) {
      this.app.details.showNodeDetails(
        this.nodes.get([...this.selectedNodes][0])
      );
    } else {
      this.app.details.clear();
    }
  }

  removeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // 1. Break all associated wires
    node.pins.forEach((pin) => {
      this.app.wiring.breakPinLinks(pin.id);
    });

    // 2. Remove node element from DOM
    if (node.element) {
      node.element.remove();
    }

    // 3. Remove node from graph map
    this.nodes.delete(nodeId);

    // 4. Update selection if needed
    if (this.selectedNodes.has(nodeId)) {
      this.selectedNodes.delete(nodeId);
    }

    this.app.details.clear();
    this.app.persistence.autoSave();
    this.app.compiler.markDirty();
  }

  deleteSelectedNodes() {
    if (this.selectedNodes.size === 0) return;

    // Convert to array to allow deletion while iterating
    const nodesToDelete = Array.from(this.selectedNodes);

    for (const nodeId of nodesToDelete) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      // 1. Break all associated wires
      node.pins.forEach((pin) => {
        this.app.wiring.breakPinLinks(pin.id);
      });

      // 2. Remove node element from DOM
      node.element.remove();

      // 3. Remove node from graph map
      this.nodes.delete(nodeId);
    }

    this.selectedNodes.clear();
    this.app.details.clear();
    this.app.persistence.autoSave();
    this.app.compiler.markDirty();
  }

  snapSelectedNodesToGrid() {
    const gridSize = GRAPH_CONSTANTS.GRID_SIZE;
    for (const nodeId of this.selectedNodes) {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.x = Math.round(node.x / gridSize) * gridSize;
        node.y = Math.round(node.y / gridSize) * gridSize;
        node.element.style.left = `${node.x}px`;
        node.element.style.top = `${node.y}px`;
        this.redrawNodeWires(node.id);
      }
    }
  }

  createCommentAroundSelection() {
    if (this.selectedNodes.size === 0) return;

    let minX = Infinity,
      minY = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity;

    this.selectedNodes.forEach((nodeId) => {
      const node = this.nodes.get(nodeId);
      if (node) {
        const width = node.width || node.element.offsetWidth || 150;
        const height = node.height || node.element.offsetHeight || 100;

        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + width);
        maxY = Math.max(maxY, node.y + height);
      }
    });

    const padding = 30;
    const headerHeight = 30;

    // Bounds for the comment box
    const x = minX - padding;
    const y = minY - headerHeight - padding;
    const w = maxX - minX + padding * 2;
    const h = maxY - minY + headerHeight + padding * 2;

    const commentNode = this.addNode("Comment", x, y);
    if (commentNode) {
      commentNode.width = w;
      commentNode.height = h;
      commentNode.title = "Comment";

      // Update its visual element size immediately
      if (commentNode.element) {
        commentNode.element.style.width = `${w}px`;
        commentNode.element.style.height = `${h}px`;
      }

      this.clearSelection();
      this.selectNode(commentNode.id, true);
    }
  }

  duplicateSelectedNodes() {
    if (this.selectedNodes.size === 0) {
      this.app.wiring.deleteSelectedLinks();
      return;
    }

    const oldToNewPinIds = new Map();
    const newSelection = [];
    const offset = GRAPH_CONSTANTS.DUPLICATE_OFFSET;
    const originalNodes = Array.from(this.selectedNodes)
      .map((id) => this.nodes.get(id))
      .filter((n) => n);

    for (const oldNode of originalNodes) {
      // Re-create nodeData structure to ensure all properties (like title/type) are included
      const nodeData = nodeRegistry.get(oldNode.nodeKey);
      if (!nodeData) continue;

      // Handle custom pin data for dynamic nodes (like CustomEvent)
      const pinsToUse =
        oldNode.nodeKey === "CustomEvent"
          ? oldNode.getPinsData().map((p) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              dir: p.dir,
              containerType: p.containerType,
              isCustom: p.isCustom,
            }))
          : nodeData.pins;

      const newNodeData = {
        ...nodeData,
        title: oldNode.title,
        variableType: oldNode.variableType,
        variableId: oldNode.variableId,
        customData: { ...oldNode.customData },
        pins: pinsToUse, // Use the determined pin structure
      };

      const id = generateGUID();
      const newNode = new Node(
        id,
        newNodeData,
        oldNode.x + offset,
        oldNode.y + offset,
        oldNode.nodeKey,
        this.app
      );

      // Transfer pin literal values
      oldNode.pinLiterals.forEach((value, pinId) => {
        const oldPinIdRelative = pinId.replace(`${oldNode.id}-`, "");
        const newPin = newNode.pins.find((p) =>
          p.id.endsWith(oldPinIdRelative)
        );
        if (newPin) {
          newNode.pinLiterals.set(newPin.id, value);
        }
      });

      this.nodes.set(id, newNode);
      this.nodesContainer.appendChild(newNode.render());
      newSelection.push(newNode.id);

      oldNode.pins.forEach((oldPin) => {
        const newPin = newNode.pins.find(
          (p) => p.name === oldPin.name && p.dir === oldPin.dir
        ); // Find by name/dir in case pin order changed
        if (newPin) {
          oldToNewPinIds.set(oldPin.id, newPin.id);
        }
      });
    }

    // Duplicate internal connections
    for (const link of this.app.wiring.links.values()) {
      const startNodeIsSelected = this.selectedNodes.has(link.startPin.node.id);
      const endNodeIsSelected = this.selectedNodes.has(link.endPin.node.id);

      if (startNodeIsSelected && endNodeIsSelected) {
        const newStartPinId = oldToNewPinIds.get(link.startPin.id);
        const newEndPinId = oldToNewPinIds.get(link.endPin.id);

        if (newStartPinId && newEndPinId) {
          const newStartPin = this.findPinById(newStartPinId);
          const newEndPin = this.findPinById(newEndPinId);

          if (
            newStartPin &&
            newEndPin &&
            this.canConnect(newStartPin, newEndPin)
          ) {
            this.app.wiring.createConnection(newStartPin, newEndPin);
          }
        }
      }
    }

    this.app.wiring.clearLinkSelection();
    this.clearSelection();
    newSelection.forEach((nodeId) => this.selectNode(nodeId, true, "add"));
    this.app.persistence.autoSave();
    this.app.compiler.markDirty();
  }

  exportGraph() {
    const nodes = this.app.persistence.serializeNodes();
    const links = this.app.persistence.serializeLinks();
    const exportData = {
      graphName: this.app.activeGraph,
      nodes: nodes,
      links: links,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `graph_export_${this.app.activeGraph}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export { GraphController };
