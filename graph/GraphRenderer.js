/**
 * GraphRenderer - Handles all visual rendering for the graph (nodes, wires, pan/zoom).
 */
import { Utils } from '../utils.js';

export class GraphRenderer {
    constructor(controller) {
        this.controller = controller;
        this.app = controller.app;
    }

    /** Update pan/zoom transform for both the node container and the SVG group */
    updateTransform() {
        const { pan, zoom } = this.controller;
        const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
        this.controller.nodesContainer.style.transform = transform;
        const svgTransform = `translate(${pan.x}, ${pan.y}) scale(${zoom})`;
        this.app.wiring.svgGroup.setAttribute('transform', svgTransform);
        // Redraw grid if present
        if (this.app.grid) this.app.grid.draw();
        // Ensure wires are positioned correctly after zoom/pan
        this.drawAllWires();
    }

    /** Redraw all wires – used after zoom/pan or after bulk changes */
    drawAllWires() {
        for (const link of this.app.wiring.links.values()) {
            this.app.wiring.drawWire(link);
        }
    }

    /** Redraw wires attached to a specific node */
    redrawNodeWires(nodeId) {
        this.app.wiring.findLinksByNodeId(nodeId).forEach(link => this.app.wiring.drawWire(link));
    }

    /** Render all nodes from the controller's node map */
    renderAllNodes() {
        this.controller.nodesContainer.innerHTML = '';
        for (const node of this.controller.nodes.values()) {
            this.controller.nodesContainer.appendChild(node.render());
        }
    }
}
