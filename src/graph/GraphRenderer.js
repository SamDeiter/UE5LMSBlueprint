/**
 * GraphRenderer class - Manages the rendering of nodes and wires in the graph.
 */
export class GraphRenderer {
  constructor(controller, nodesContainer, svg, app) {
    this.controller = controller;
    this.nodesContainer = nodesContainer;
    this.svg = svg;
    this.app = app;

    // Wire redraw batching for performance
    this._wireRedrawScheduled = false;
    this._nodesToRedraw = new Set();
  }

  renderAllNodes() {
    this.nodesContainer.innerHTML = "";

    // Use DocumentFragment to batch DOM updates (single reflow instead of N)
    const fragment = document.createDocumentFragment();
    for (const node of this.controller.nodes.values()) {
      fragment.appendChild(node.render());
    }
    this.nodesContainer.appendChild(fragment);
  }

  updateTransform() {
    const transform = `translate(${this.controller.pan.x}px, ${this.controller.pan.y}px) scale(${this.controller.zoom})`;
    this.nodesContainer.style.transform = transform;
    const svgTransform = `translate(${this.controller.pan.x}, ${this.controller.pan.y}) scale(${this.controller.zoom})`;
    this.app.wiring.svgGroup.setAttribute("transform", svgTransform);
    this.app.grid.draw();
    // Redraw wires on transform update to ensure ghost wire is correctly positioned during pan/zoom
    this.drawAllWires();
  }

  redrawNodeWires(nodeId) {
    // Batch wire redraws using requestAnimationFrame to reduce draw calls
    this._nodesToRedraw.add(nodeId);

    if (!this._wireRedrawScheduled) {
      this._wireRedrawScheduled = true;
      requestAnimationFrame(() => {
        this._batchRedrawWires();
        this._wireRedrawScheduled = false;
      });
    }
  }

  _batchRedrawWires() {
    // Redraw wires for all queued nodes
    for (const nodeId of this._nodesToRedraw) {
      this.app.wiring
        .findLinksByNodeId(nodeId)
        .forEach((link) => this.app.wiring.drawWire(link));
    }
    this._nodesToRedraw.clear();
  }

  drawAllWires() {
    // Find all wires and ensure they are redrawn
    for (const link of this.app.wiring.links.values()) {
      this.app.wiring.drawWire(link);
    }
  }

  clearActiveWires() {
    // Remove 'active-wire' class from all wires
    const activeWires = this.svg.querySelectorAll(".active-wire");
    activeWires.forEach((wire) => wire.classList.remove("active-wire"));
  }
}
