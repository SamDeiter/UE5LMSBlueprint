/**
 * ClipboardManager.js - Cross-Blueprint clipboard for copy/paste
 * Handles copying nodes/links between different Blueprints
 */
import { generateGUID } from "../utils/guid.js";

/**
 * Clipboard data format
 */
class ClipboardData {
  constructor() {
    this.nodes = [];
    this.links = [];
    this.sourceBlueprintId = null;
    this.sourceGraphName = null;
    this.timestamp = null;
  }
}

/**
 * ClipboardManager - Global clipboard for cross-Blueprint operations
 */
export class ClipboardManager {
  constructor() {
    this.data = null;
    this.systemClipboardEnabled = true;
  }

  /**
   * Copy nodes and their internal links to clipboard
   * @param {Node[]} nodes - Array of nodes to copy
   * @param {Link[]} links - Array of links (will filter to internal ones)
   * @param {string} blueprintId - Source Blueprint ID
   * @param {string} graphName - Source graph name
   */
  copy(nodes, links, blueprintId = null, graphName = null) {
    if (!nodes || nodes.length === 0) return;

    const clipboard = new ClipboardData();
    clipboard.sourceBlueprintId = blueprintId;
    clipboard.sourceGraphName = graphName;
    clipboard.timestamp = Date.now();

    // Collect node IDs for link filtering
    const nodeIdSet = new Set(nodes.map((n) => n.id));

    // Serialize nodes
    clipboard.nodes = nodes.map((node) => this._serializeNode(node));

    // Filter and serialize internal links only
    clipboard.links = links
      .filter((link) => {
        const startNodeId = this._extractNodeId(
          link.startPin?.id || link.startPinId
        );
        const endNodeId = this._extractNodeId(link.endPin?.id || link.endPinId);
        return nodeIdSet.has(startNodeId) && nodeIdSet.has(endNodeId);
      })
      .map((link) => this._serializeLink(link));

    this.data = clipboard;

    // Also copy to system clipboard if enabled
    if (this.systemClipboardEnabled && navigator.clipboard) {
      try {
        navigator.clipboard.writeText(JSON.stringify(clipboard));
      } catch (e) {
        console.warn("ClipboardManager: Could not write to system clipboard");
      }
    }

    return clipboard;
  }

  /**
   * Cut nodes (copy then mark for deletion)
   * @param {Node[]} nodes - Nodes to cut
   * @param {Link[]} links - Links
   * @param {string} blueprintId - Source Blueprint ID
   * @param {string} graphName - Source graph name
   * @returns {ClipboardData}
   */
  cut(nodes, links, blueprintId = null, graphName = null) {
    const clipboard = this.copy(nodes, links, blueprintId, graphName);
    if (clipboard) {
      clipboard.isCut = true;
    }
    return clipboard;
  }

  /**
   * Paste nodes at position
   * @param {number} offsetX - X offset for pasted nodes
   * @param {number} offsetY - Y offset for pasted nodes
   * @returns {Object} Paste result with new node/link data
   */
  paste(offsetX = 50, offsetY = 50) {
    if (!this.data || !this.data.nodes || this.data.nodes.length === 0) {
      return null;
    }

    const idMap = new Map(); // oldId -> newId
    const result = {
      nodes: [],
      links: [],
      oldToNewIds: idMap,
    };

    // Create new IDs for all nodes
    this.data.nodes.forEach((nodeData) => {
      const newId = generateGUID();
      idMap.set(nodeData.id, newId);
    });

    // Clone nodes with new IDs and offset positions
    result.nodes = this.data.nodes.map((nodeData) => {
      const newId = idMap.get(nodeData.id);
      return {
        ...nodeData,
        id: newId,
        x: nodeData.x + offsetX,
        y: nodeData.y + offsetY,
        pins: nodeData.pins?.map((pin) => ({
          ...pin,
          id: pin.id.replace(nodeData.id, newId),
        })),
      };
    });

    // Clone links with new pin IDs
    result.links = this.data.links
      .map((linkData) => {
        const oldStartNodeId = this._extractNodeId(linkData.startPinId);
        const oldEndNodeId = this._extractNodeId(linkData.endPinId);

        const newStartNodeId = idMap.get(oldStartNodeId);
        const newEndNodeId = idMap.get(oldEndNodeId);

        if (!newStartNodeId || !newEndNodeId) return null;

        return {
          id: generateGUID(),
          startPinId: linkData.startPinId.replace(
            oldStartNodeId,
            newStartNodeId
          ),
          endPinId: linkData.endPinId.replace(oldEndNodeId, newEndNodeId),
        };
      })
      .filter(Boolean);

    return result;
  }

  /**
   * Check if clipboard has content
   * @returns {boolean}
   */
  hasContent() {
    return this.data !== null && this.data.nodes?.length > 0;
  }

  /**
   * Get clipboard content info
   * @returns {Object|null}
   */
  getInfo() {
    if (!this.data) return null;

    return {
      nodeCount: this.data.nodes?.length || 0,
      linkCount: this.data.links?.length || 0,
      sourceBlueprintId: this.data.sourceBlueprintId,
      sourceGraphName: this.data.sourceGraphName,
      timestamp: this.data.timestamp,
      isCut: this.data.isCut || false,
    };
  }

  /**
   * Clear clipboard
   */
  clear() {
    this.data = null;
  }

  /**
   * Serialize a node for clipboard
   */
  _serializeNode(node) {
    return {
      id: node.id,
      nodeKey: node.nodeKey,
      title: node.title,
      type: node.type,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      pins: node.getPinsData?.() || node.pins,
      customData: node.customData,
      isBreakpoint: node.isBreakpoint,
    };
  }

  /**
   * Serialize a link for clipboard
   */
  _serializeLink(link) {
    return {
      id: link.id,
      startPinId: link.startPin?.id || link.startPinId,
      endPinId: link.endPin?.id || link.endPinId,
    };
  }

  /**
   * Extract node ID from pin ID
   */
  _extractNodeId(pinId) {
    if (!pinId) return null;
    const parts = pinId.split("-");
    if (parts.length >= 5) {
      return parts.slice(0, 5).join("-");
    }
    return null;
  }
}

// Singleton instance
export const clipboardManager = new ClipboardManager();
