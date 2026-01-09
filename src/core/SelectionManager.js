/**
 * SelectionManager.js - Centralized selection state management
 * Handles node, link, and asset selections across the editor
 */
import { EventBus } from "./EventBus.js";

/**
 * Selection mode constants
 */
export const SelectionMode = {
  REPLACE: "replace", // Clear and select
  ADD: "add", // Add to selection
  TOGGLE: "toggle", // Toggle selection state
  REMOVE: "remove", // Remove from selection
};

/**
 * SelectionManager - Manages all selections in the editor
 */
export class SelectionManager {
  constructor() {
    this.selectedNodes = new Set();
    this.selectedLinks = new Set();
    this.selectedPins = new Set();
    this.lastSelectedNode = null;
    this.lastSelectedLink = null;
  }

  // --- NODE SELECTION ---

  /**
   * Select a node
   * @param {string} nodeId - Node ID
   * @param {string} mode - Selection mode
   */
  selectNode(nodeId, mode = SelectionMode.REPLACE) {
    switch (mode) {
      case SelectionMode.REPLACE:
        this.selectedNodes.clear();
        this.selectedNodes.add(nodeId);
        break;
      case SelectionMode.ADD:
        this.selectedNodes.add(nodeId);
        break;
      case SelectionMode.TOGGLE:
        if (this.selectedNodes.has(nodeId)) {
          this.selectedNodes.delete(nodeId);
        } else {
          this.selectedNodes.add(nodeId);
        }
        break;
      case SelectionMode.REMOVE:
        this.selectedNodes.delete(nodeId);
        break;
    }

    this.lastSelectedNode = nodeId;
    EventBus.emit("selection:nodesChanged", {
      selectedNodes: [...this.selectedNodes],
      lastSelected: nodeId,
    });
  }

  /**
   * Select multiple nodes
   * @param {string[]} nodeIds - Array of node IDs
   * @param {string} mode - Selection mode
   */
  selectNodes(nodeIds, mode = SelectionMode.REPLACE) {
    if (mode === SelectionMode.REPLACE) {
      this.selectedNodes.clear();
    }

    nodeIds.forEach((id) => {
      if (mode === SelectionMode.REMOVE) {
        this.selectedNodes.delete(id);
      } else {
        this.selectedNodes.add(id);
      }
    });

    if (nodeIds.length > 0) {
      this.lastSelectedNode = nodeIds[nodeIds.length - 1];
    }

    EventBus.emit("selection:nodesChanged", {
      selectedNodes: [...this.selectedNodes],
      lastSelected: this.lastSelectedNode,
    });
  }

  /**
   * Clear node selection
   */
  clearNodeSelection() {
    this.selectedNodes.clear();
    this.lastSelectedNode = null;
    EventBus.emit("selection:nodesChanged", {
      selectedNodes: [],
      lastSelected: null,
    });
  }

  /**
   * Check if a node is selected
   * @param {string} nodeId - Node ID
   * @returns {boolean}
   */
  isNodeSelected(nodeId) {
    return this.selectedNodes.has(nodeId);
  }

  /**
   * Get selected node count
   * @returns {number}
   */
  getSelectedNodeCount() {
    return this.selectedNodes.size;
  }

  /**
   * Get all selected node IDs
   * @returns {string[]}
   */
  getSelectedNodes() {
    return [...this.selectedNodes];
  }

  // --- LINK SELECTION ---

  /**
   * Select a link
   * @param {string} linkId - Link ID
   * @param {string} mode - Selection mode
   */
  selectLink(linkId, mode = SelectionMode.TOGGLE) {
    switch (mode) {
      case SelectionMode.REPLACE:
        this.selectedLinks.clear();
        this.selectedLinks.add(linkId);
        break;
      case SelectionMode.ADD:
        this.selectedLinks.add(linkId);
        break;
      case SelectionMode.TOGGLE:
        if (this.selectedLinks.has(linkId)) {
          this.selectedLinks.delete(linkId);
        } else {
          this.selectedLinks.add(linkId);
        }
        break;
      case SelectionMode.REMOVE:
        this.selectedLinks.delete(linkId);
        break;
    }

    this.lastSelectedLink = linkId;
    EventBus.emit("selection:linksChanged", {
      selectedLinks: [...this.selectedLinks],
    });
  }

  /**
   * Clear link selection
   */
  clearLinkSelection() {
    this.selectedLinks.clear();
    this.lastSelectedLink = null;
    EventBus.emit("selection:linksChanged", { selectedLinks: [] });
  }

  /**
   * Get selected link IDs
   * @returns {string[]}
   */
  getSelectedLinks() {
    return [...this.selectedLinks];
  }

  // --- GENERAL ---

  /**
   * Clear all selections
   */
  clearAll() {
    this.clearNodeSelection();
    this.clearLinkSelection();
    this.selectedPins.clear();
  }

  /**
   * Check if anything is selected
   * @returns {boolean}
   */
  hasSelection() {
    return (
      this.selectedNodes.size > 0 ||
      this.selectedLinks.size > 0 ||
      this.selectedPins.size > 0
    );
  }

  /**
   * Get selection summary
   * @returns {Object}
   */
  getSelectionSummary() {
    return {
      nodes: this.selectedNodes.size,
      links: this.selectedLinks.size,
      pins: this.selectedPins.size,
      total:
        this.selectedNodes.size +
        this.selectedLinks.size +
        this.selectedPins.size,
    };
  }
}

// Singleton instance
export const selectionManager = new SelectionManager();
