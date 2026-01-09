/**
 * GraphClipboard.js - Handles copy/paste/duplicate operations
 * Extracted from GraphController.js for modularity
 */
import { generateGUID } from "../utils/guid.js";
import { Node } from "./Node.js";
import { Pin } from "./Pin.js";
import { GRAPH_CONSTANTS } from "../config/Constants.js";

/**
 * Duplicates selected nodes with offset
 * @param {GraphController} graph - The graph controller
 */
export function duplicateSelectedNodes(graph) {
  if (graph.selectedNodes.size === 0) {
    graph.app.wiring.deleteSelectedLinks();
    return;
  }

  const oldToNewPinIds = new Map();
  const newSelection = [];
  const offset = GRAPH_CONSTANTS.DUPLICATE_OFFSET;
  const originalNodes = Array.from(graph.selectedNodes)
    .map((id) => graph.nodes.get(id))
    .filter((n) => n);

  // Phase 1: Create duplicated nodes
  for (const oldNode of originalNodes) {
    const newId = generateGUID();
    const nodeData = {
      ...oldNode.getSerializable(),
      id: newId,
      title: oldNode.title,
      type: oldNode.type,
    };

    const newNode = new Node(
      newId,
      nodeData,
      oldNode.x + offset,
      oldNode.y + offset,
      oldNode.nodeKey,
      graph.app
    );

    // Map old pin IDs to new pin IDs
    oldNode.pins.forEach((oldPin, idx) => {
      if (newNode.pins[idx]) {
        oldToNewPinIds.set(oldPin.id, newNode.pins[idx].id);
      }
    });

    // Copy literal values
    oldNode.pinLiterals.forEach((value, oldPinId) => {
      const localPinId = oldPinId.split("-").pop();
      const newPinId = `${newId}-${localPinId}`;
      newNode.pinLiterals.set(newPinId, value);
    });

    // Register and render
    graph.nodes.set(newId, newNode);
    graph.nodesContainer.appendChild(newNode.render());
    newSelection.push(newId);
  }

  // Phase 2: Recreate internal links
  for (const oldNode of originalNodes) {
    oldNode.pins.forEach((oldPin) => {
      oldPin.links.forEach((linkId) => {
        const link = graph.app.wiring.links.get(linkId);
        if (!link) return;

        const newStartPinId = oldToNewPinIds.get(link.startPin.id);
        const newEndPinId = oldToNewPinIds.get(link.endPin.id);

        // Only recreate if both ends are in the duplicated set
        if (newStartPinId && newEndPinId) {
          const newStartPin = graph.findPinById(newStartPinId);
          const newEndPin = graph.findPinById(newEndPinId);

          if (newStartPin && newEndPin) {
            const existingLink = [...graph.app.wiring.links.values()].find(
              (l) =>
                l.startPin.id === newStartPinId && l.endPin.id === newEndPinId
            );
            if (!existingLink) {
              graph.app.wiring.createLink(newStartPin, newEndPin);
            }
          }
        }
      });
    });
  }

  // Phase 3: Update selection
  graph.clearSelection();
  newSelection.forEach((id) => graph.selectNode(id, true, "add"));

  graph.app.persistence.autoSave();
  graph.app.compiler.markDirty();
}
