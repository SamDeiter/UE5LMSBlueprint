/**
 * GraphSerializer.js - Handles graph state loading/exporting
 * Extracted from GraphController.js for modularity
 */
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { Node } from "./Node.js";

/**
 * Loads a saved graph state into the controller
 * @param {GraphController} graph - The graph controller
 * @param {Object} state - Saved state object
 */
export function loadGraphState(graph, state) {
  const app = graph.app;
  const safeState = state || {};
  const safeNodes = safeState.nodes || [];
  const safeLinks = safeState.links || [];

  // Clear existing state
  graph.nodes.clear();
  app.wiring.clear();
  graph.clearSelection();

  // 1. Load Nodes
  safeNodes.forEach((nodeData) => {
    const node = createNodeFromData(graph, nodeData);
    if (node) {
      graph.nodes.set(node.id, node);
      restorePinLiterals(node, nodeData);
    }
  });

  // 2. Load Links
  safeLinks.forEach((linkData) => {
    const startPin = graph.findPinById(linkData.startPinId);
    const endPin = graph.findPinById(linkData.endPinId);

    if (startPin && endPin) {
      const link = { id: linkData.id, startPin, endPin };
      app.wiring.links.set(link.id, link);
      startPin.links.push(link.id);
      endPin.links.push(link.id);
    }
  });

  // 3. Render and Redraw
  graph.renderAllNodes();
  graph.drawAllWires();

  // 4. Restore Pan/Zoom
  if (safeState.pan) graph.pan = safeState.pan;
  if (safeState.zoom) graph.zoom = safeState.zoom;
  graph.updateTransform();

  // 5. Sync function context
  syncFunctionContext(graph, app);
}

/**
 * Creates a node from saved data
 */
function createNodeFromData(graph, nodeData) {
  let template = nodeRegistry.get(nodeData.nodeKey);

  // Dynamic Function/Macro handling
  if (!template && nodeData.nodeKey.startsWith("Func_")) {
    template = createDynamicFuncTemplate(graph.app, nodeData.nodeKey);
  }

  if (!template) {
    console.warn(`Skipping node: Key '${nodeData.nodeKey}' not found`);
    return null;
  }

  let pinsToLoad = template.pins || [];
  if (
    nodeData.nodeKey === "CustomEvent" &&
    nodeData.pins?.some((p) => p.isCustom)
  ) {
    pinsToLoad = nodeData.pins;
  } else if (nodeData.nodeKey.startsWith("Func_") && nodeData.pins) {
    pinsToLoad = nodeData.pins;
  }

  const fullNodeData = { ...template, ...nodeData, pins: pinsToLoad };
  return new Node(
    nodeData.id,
    fullNodeData,
    nodeData.x,
    nodeData.y,
    nodeData.nodeKey,
    graph.app
  );
}

/**
 * Creates dynamic function template
 */
function createDynamicFuncTemplate(app, nodeKey) {
  const funcName = nodeKey.replace("Func_", "");
  const funcDef = app.functionRegistry
    .getAll()
    .find((f) => f.name === funcName);

  if (!funcDef) return null;

  return {
    title: `Call ${funcName}`,
    type: funcDef.isPure ? "pure-node" : "function-node",
    category: "Function",
    icon: "f",
    pins: [],
  };
}

/**
 * Restores pin literal values from saved data
 */
function restorePinLiterals(node, nodeData) {
  if (!nodeData.pins) return;

  nodeData.pins.forEach((savedPin) => {
    const fullPinId = savedPin.id.includes(node.id)
      ? savedPin.id
      : `${node.id}-${savedPin.id}`;
    const pin = node.findPinById(fullPinId);

    if (pin && savedPin.literalValue !== undefined) {
      node.pinLiterals.set(pin.id, savedPin.literalValue);
    } else if (pin) {
      node.pinLiterals.set(pin.id, pin.defaultValue);
    }

    if (pin && savedPin.type && savedPin.type !== pin.type) {
      pin.type = savedPin.type;
    }
  });

  if (nodeData.nodeKey === "Reroute" && node.updateRerouteVisuals) {
    node.refreshPinCache();
  }
}

/**
 * Syncs function context after loading
 */
function syncFunctionContext(graph, app) {
  if (app.localVariables) {
    const func = app.functionRegistry
      .getAll()
      .find((f) => f.name === app.activeGraph);
    if (func) {
      app.localVariables.setContext(func);
    } else {
      app.localVariables.clearContext();
    }
  }

  const func = app.functionRegistry
    .getAll()
    .find((f) => f.name === app.activeGraph);
  if (func && app.functionsController) {
    app.functionsController.syncFunctionNodes(func);
  }

  const funcsToSync = new Set();
  for (const node of graph.nodes.values()) {
    if (node.nodeKey.startsWith("Func_")) {
      funcsToSync.add(node.nodeKey.replace("Func_", ""));
    }
  }

  funcsToSync.forEach((funcName) => {
    const funcDef = app.functionRegistry
      .getAll()
      .find((f) => f.name === funcName);
    if (funcDef && app.functionsController) {
      app.functionsController.syncFunctionNodes(funcDef);
    }
  });
}

/**
 * Exports graph to JSON file
 * @param {GraphController} graph - The graph controller
 */
export function exportGraph(graph) {
  const app = graph.app;
  const nodes = app.persistence.serializeNodes();
  const links = app.persistence.serializeLinks();

  const exportData = {
    graphName: app.activeGraph,
    nodes,
    links,
    timestamp: new Date().toISOString(),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `graph_export_${app.activeGraph}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
