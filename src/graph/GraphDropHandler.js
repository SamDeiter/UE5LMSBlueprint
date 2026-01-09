/**
 * GraphDropHandler.js - Handles drop events on the graph editor
 * Extracted from GraphInteraction.js for modularity
 */
import { DRAG_DATA_PREFIXES } from "../config/Constants.js";

/**
 * Handle drop events on the graph editor
 * @param {DragEvent} e - Drop event
 * @param {GraphController} controller - Graph controller
 * @param {Object} app - App instance
 */
export function handleGraphDrop(e, controller, app) {
  e.preventDefault();
  const data = e.dataTransfer.getData("text/plain");
  const graphCoords = controller.getGraphCoords(e.clientX, e.clientY);

  // Route to appropriate handler based on data prefix
  if (
    data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_GET) ||
    data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_REPARENT)
  ) {
    handleComponentGetDrop(data, graphCoords, controller, app);
  } else if (data.startsWith(DRAG_DATA_PREFIXES.COMPONENT)) {
    handleComponentDrop(data, e, graphCoords, controller, app);
  } else if (data.startsWith("VARIABLE:")) {
    handleVariableDrop(data, e, graphCoords, controller, app);
  } else if (data.startsWith("FUNCTION:")) {
    handleFunctionDrop(data, graphCoords, controller, app);
  } else if (data.startsWith("MACRO:")) {
    handleMacroDrop(data, graphCoords, controller, app);
  } else if (data.startsWith("PALETTE_NODE:")) {
    handlePaletteNodeDrop(data, graphCoords, controller, app);
  }
}

function handleComponentGetDrop(data, graphCoords, controller, app) {
  const prefix = data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_GET)
    ? DRAG_DATA_PREFIXES.COMPONENT_GET
    : DRAG_DATA_PREFIXES.COMPONENT_REPARENT;
  const compId = data.substring(prefix.length);
  const nodeKey = `GetComponent_${compId}`;
  controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
  app.persistence.autoSave();
}

function handleComponentDrop(data, e, graphCoords, controller, app) {
  const compId = data.split(":")[1];
  const comp = app.components.get(compId);
  if (!comp) return;

  let nodeKey = null;
  if (e.altKey) nodeKey = `SetComponent_${compId}`;
  else if (e.ctrlKey) nodeKey = `GetComponent_${compId}`;

  if (nodeKey) {
    controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
    app.persistence.autoSave();
  } else {
    app.actionMenu.show(e.clientX, e.clientY, null, null, comp);
  }
}

function handleVariableDrop(data, e, graphCoords, controller, app) {
  const varName = data.split(":")[1];
  let nodeKey = null;

  if (e.altKey) nodeKey = `Set_${varName}`;
  else if (e.ctrlKey) nodeKey = `Get_${varName}`;

  if (nodeKey) {
    controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
    app.persistence.autoSave();
  } else {
    app.actionMenu.show(e.clientX, e.clientY, null, varName);
  }
}

function handleFunctionDrop(data, graphCoords, controller, app) {
  const funcName = data.split(":")[1];
  const nodeKey = `Func_${funcName}`;
  controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
  app.persistence.autoSave();
}

function handleMacroDrop(data, graphCoords, controller, app) {
  const macroName = data.split(":")[1];
  const nodeKey = `Macro_${macroName}`;
  controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
  app.persistence.autoSave();
}

function handlePaletteNodeDrop(data, graphCoords, controller, app) {
  const nodeType = data.split(":")[1];

  // Validation: Construction Script restrictions
  if (app.activeGraph === "ConstructionScript") {
    const forbiddenNodes = [
      "EventBeginPlay",
      "EventTick",
      "EventActorBeginOverlap",
    ];
    if (
      forbiddenNodes.includes(nodeType) ||
      (nodeType.startsWith("Event") &&
        nodeType !== "CustomEvent" &&
        nodeType !== "EventGraph")
    ) {
      window.alert(`Cannot place ${nodeType} in Construction Script.`);
      return;
    }
  }

  // Validation: Event Graph restrictions
  if (app.activeGraph === "EventGraph" && nodeType === "ConstructionScript") {
    window.alert("Cannot place Construction Script node in Event Graph.");
    return;
  }

  // Special handling for NeedNode
  if (nodeType === "NeedNode") {
    if (app.needNodeModal) {
      app.needNodeModal._pendingLocation = graphCoords;
      app.needNodeModal.open();
    }
    return;
  }

  controller.addNode(nodeType, graphCoords.x, graphCoords.y);
  app.persistence.autoSave();
}
