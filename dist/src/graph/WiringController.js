/**
 * WiringController class - Manages wire connections, rendering, and interaction.
 */

/**
 * WiringController
 *
 * Facade Pattern for the Wiring Subsystem.
 * Delegates responsibilities to:
 * - WireManager (Data)
 * - WireRenderer (Presentation)
 * - WireInteraction (Input Logic)
 */
import { WireManager } from "./wiring/WireManager.js";
import { WireRenderer } from "./wiring/WireRenderer.js";
import { WireInteraction } from "./wiring/WireInteraction.js";
import { BaseController } from "../ui/BaseController.js";

export class WiringController extends BaseController {
  constructor(svg, app) {
    super(app); // Initialize BaseController for memory leak prevention
    this.svg = svg;

    // Sub-Systems
    this.renderer = new WireRenderer(this, svg);
    this.manager = new WireManager(this);
    this.interaction = new WireInteraction(this);
  }

  // --- COMPATIBILITY API (For existing app code) ---

  get links() {
    return this.manager.links;
  }
  get selectedLinks() {
    return this.manager.selectedLinks;
  }

  findLink(linkId) {
    return this.manager.findLink(linkId);
  }
  findLinksByNodeId(id) {
    return this.manager.findLinksByNodeId(id);
  }
  findLinksByPinId(id) {
    return this.manager.findLinksByPinId(id);
  }

  findPinById(id) {
    // Wiring needs access to live pins for visual updates
    return this.app.graph.findPinById(id);
  }

  get svgGroup() {
    return this.renderer.svgGroup;
  }

  clearLinkSelection() {
    this.manager.clearSelection();
  }

  createConnection(pinA, pinB) {
    this.interaction.connect(pinA, pinB);
  }

  get ghostWire() {
    return this.renderer.ghostWire;
  }

  updateGhostWire(e, sourcePin) {
    this.renderer.drawGhostWire(e, sourcePin);
  }

  handleWireDoubleClick(link, e) {
    this.interaction.handleDoubleClick(link, e);
  }

  handleLinkClick(linkId) {
    this.manager.toggleSelection(linkId);
  }

  handleLinkDoubleClick(link, e) {
    this.interaction.handleDoubleClick(link, e);
  }

  // --- INTERNAL WIRING LOGIC (Called by Interaction) ---

  createLink(startPin, endPin) {
    console.log("[WiringController] createLink called:", {
      start: startPin?.id,
      end: endPin?.id,
      startElConnected: startPin?.element?.isConnected,
      endElConnected: endPin?.element?.isConnected,
    });

    // Data Update
    const link = this.manager.addLinkData(startPin, endPin);
    console.log("[WiringController] Link created:", link.id);

    // Visual Update
    this.renderer.drawWire(link);
    this.renderer.updatePinVisualState(startPin);
    this.renderer.updatePinVisualState(endPin);

    // Redraw Request for smoothness
    requestAnimationFrame(() => {
      this.app.graph.redrawNodeWires(startPin.node.id);
      this.app.graph.redrawNodeWires(endPin.node.id);
    });

    // State Persistence
    this.app.persistence.autoSave();
    this.app.compiler.markDirty();
  }

  breakLink(linkId) {
    this.manager.deleteLink(linkId);
    this.app.persistence.autoSave();
    this.app.compiler.markDirty();
  }

  // Alias for compatibility
  breakLinkById(linkId) {
    this.breakLink(linkId);
  }

  breakPinLinks(pinId) {
    const links = this.manager.findLinksByPinId(pinId);
    links.forEach((l) => this.breakLink(l.id));
    this.cleanupOrphanWires();
  }

  /**
   * Clear all links from the graph
   */
  clearAll() {
    const linkIds = [...this.links.keys()];
    linkIds.forEach((id) => this.breakLink(id));
    this.cleanupOrphanWires();
  }

  // --- RENDERING / UPDATES ---

  drawWire(link) {
    this.renderer.drawWire(link);
  }

  updateConnectedLinks(nodeIds) {
    nodeIds.forEach((nodeId) => {
      const links = this.manager.findLinksByNodeId(nodeId);
      links.forEach((link) => this.renderer.drawWire(link));
    });
  }

  updateVisuals(node) {
    this.renderer.updateNodeVisuals(node);
  }

  updatePinVisualState(pin) {
    this.renderer.updatePinVisualState(pin);
  }

  setWireActive(linkId) {
    this.renderer.setWireActive(linkId);
  }

  clearActiveWires() {
    this.renderer.clearActiveWires();
  }

  deleteSelectedLinks() {
    const ids = [...this.manager.selectedLinks];
    ids.forEach((id) => this.breakLink(id));
    this.manager.clearSelection();
    this.cleanupOrphanWires();
  }

  cleanupOrphanWires() {
    // DOM-based cleanup for safety
    const wires = this.svg.querySelectorAll("path.wire");
    wires.forEach((wire) => {
      if (wire.id === "ghost-wire") return;
      if (!this.manager.links.has(wire.id)) {
        wire.remove();
      }
    });
  }

  clear() {
    this.manager.clearAll();
    this.renderer.clearAll();
  }
}

// End of WiringController.js
