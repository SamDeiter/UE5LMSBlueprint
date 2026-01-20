/**
 * WireManager.js
 *
 * Manages the data structure and lifecycle of wires (links).
 * Handles creation, storage, retrieval, and destruction of connections.
 */
import { generateGUID } from "../../utils/guid.js";

export class WireManager {
  /**
   * @param {WiringController} controller - Facade reference
   */
  constructor(controller) {
    this.controller = controller;
    this.links = new Map();
    this.selectedLinks = new Set();
  }

  get app() {
    return this.controller.app;
  }

  // --- QUERIES ---

  findLink(linkId) {
    return this.links.get(linkId);
  }

  findLinksByNodeId(nodeId) {
    return [...this.links.values()].filter(
      (l) => l.startPin.node.id === nodeId || l.endPin.node.id === nodeId
    );
  }

  findLinksByPinId(pinId) {
    return [...this.links.values()].filter(
      (l) => l.startPin.id === pinId || l.endPin.id === pinId
    );
  }

  // --- LIFECYCLE ---

  /**
   * Internal method to register a link in the data structures.
   * Does NOT handle validation or visuals.
   */
  addLinkData(startPin, endPin) {
    const link = {
      id: generateGUID(),
      startPin: startPin,
      endPin: endPin,
    };
    this.links.set(link.id, link);

    // Bi-directional references
    if (!startPin.links.includes(link.id)) startPin.links.push(link.id);
    if (!endPin.links.includes(link.id)) endPin.links.push(link.id);

    return link;
  }

  /**
   * Completely removes a link from data and DOM.
   */
  deleteLink(linkId) {
    const link = this.links.get(linkId);
    if (!link) return;

    this._detachFromPins(link);

    // Data Cleanup
    this.links.delete(linkId);
    this.selectedLinks.delete(linkId);

    // DOM Cleanup
    this.controller.renderer.removeWireElement(linkId);
  }

  _detachFromPins(link) {
    // Lookup pins by ID to ensure freshness
    const startPinId = link.startPin.id;
    const endPinId = link.endPin.id;

    // We try to find the "live" pin in the graph, otherwise fallback to the link's reference
    const startPin = this.app.graph.findPinById(startPinId) || link.startPin;
    const endPin = this.app.graph.findPinById(endPinId) || link.endPin;

    /* Semantic: "Detachment" */

    // Remove ID from Start Pin
    if (startPin && startPin.links) {
      startPin.links = startPin.links.filter((id) => id !== link.id);
      this.controller.renderer.updatePinVisualState(startPin);
    }

    // Remove ID from End Pin
    if (endPin && endPin.links) {
      endPin.links = endPin.links.filter((id) => id !== link.id);
      this.controller.renderer.updatePinVisualState(endPin);
    }

    // Force Redraw of affected nodes logic?
    // Usually handled by caller or Renderer
  }

  clearAll() {
    this.links.clear();
    this.selectedLinks.clear();
  }

  // --- SELECTION ---

  toggleSelection(linkId) {
    if (this.selectedLinks.has(linkId)) {
      this.selectedLinks.delete(linkId);
      this.controller.renderer.setLinkSelected(linkId, false);
    } else {
      this.clearSelection(); // Clear other selections first (single select)
      this.selectedLinks.add(linkId);
      this.controller.renderer.setLinkSelected(linkId, true);
    }
  }

  clearSelection() {
    this.selectedLinks.forEach((id) => {
      this.controller.renderer.setLinkSelected(id, false);
    });
    this.selectedLinks.clear();
  }
}
