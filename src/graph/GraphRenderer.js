/**
 * GraphRenderer class - Manages the rendering of nodes and wires in the graph.
 */
export class GraphRenderer {
    constructor(controller, nodesContainer, svg, app) {
        this.controller = controller;
        this.nodesContainer = nodesContainer;
        this.svg = svg;
        this.app = app;
    }

    renderAllNodes() {
        this.nodesContainer.innerHTML = '';
        for (const node of this.controller.nodes.values()) {
            this.nodesContainer.appendChild(node.render());
        }
    }

    updateTransform() {
        const transform = `translate(${this.controller.pan.x}px, ${this.controller.pan.y}px) scale(${this.controller.zoom})`;
        this.nodesContainer.style.transform = transform;
        const svgTransform = `translate(${this.controller.pan.x}, ${this.controller.pan.y}) scale(${this.controller.zoom})`;
        this.app.wiring.svgGroup.setAttribute('transform', svgTransform);
        this.app.grid.draw();
        // Redraw wires on transform update to ensure ghost wire is correctly positioned during pan/zoom
        this.drawAllWires();
    }

    redrawNodeWires(nodeId) {
        this.app.wiring.findLinksByNodeId(nodeId).forEach(link => this.app.wiring.drawWire(link));
    }

    drawAllWires() {
        // Find all wires and ensure they are redrawn
        for (const link of this.app.wiring.links.values()) {
            this.app.wiring.drawWire(link);
        }
    }

    clearActiveWires() {
        // Remove 'active-wire' class from all wires
        const activeWires = this.svg.querySelectorAll('.active-wire');
        activeWires.forEach(wire => wire.classList.remove('active-wire'));
    }
}
