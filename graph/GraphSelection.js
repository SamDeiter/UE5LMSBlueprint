/**
 * GraphSelection - Handles node selection, marquee selection, and grid snapping.
 */
export class GraphSelection {
    constructor(controller) {
        this.controller = controller;
        this.app = controller.app;
    }

    /** Select a node, optionally adding to the current selection */
    selectNode(nodeId, addToSelection = false, mode = 'toggle') {
        const node = this.controller.nodes.get(nodeId);
        if (!node) return;

        // If not adding to selection, clear existing selection first
        if (!addToSelection) {
            this.clearSelection();
        }

        let shouldSelect = false;
        if (mode === 'add') {
            shouldSelect = true;
        } else if (mode === 'remove') {
            shouldSelect = false;
        } else if (mode === 'toggle') {
            shouldSelect = !this.controller.selectedNodes.has(nodeId);
        } else if (mode === 'new') {
            shouldSelect = true;
        }

        if (shouldSelect) {
            this.controller.selectedNodes.add(nodeId);
            node.element.classList.add('selected');
        } else {
            this.controller.selectedNodes.delete(nodeId);
            node.element.classList.remove('selected');
        }

        // Update details panel based on selection count
        if (this.controller.selectedNodes.size === 1) {
            const selectedNode = this.controller.nodes.get([...this.controller.selectedNodes][0]);
            this.app.details.showNodeDetails(selectedNode);
        } else {
            this.app.details.clear();
        }
    }

    /** Clear all node selections */
    clearSelection() {
        this.controller.selectedNodes.forEach(nodeId => {
            const node = this.controller.nodes.get(nodeId);
            if (node) node.element.classList.remove('selected');
        });
        this.controller.selectedNodes.clear();
        this.app.details.clear();
    }

    /** Marquee selection – select nodes intersecting a rectangle */
    selectNodesInRect(rect, mode) {
        for (const node of this.controller.nodes.values()) {
            const nodeRect = node.element.getBoundingClientRect();
            const intersects = (
                nodeRect.left < rect.right &&
                nodeRect.right > rect.left &&
                nodeRect.top < rect.bottom &&
                nodeRect.bottom > rect.top
            );
            if (intersects) {
                this.selectNode(node.id, true, mode);
            } else if (mode === 'new') {
                // Ensure nodes outside the marquee are deselected in 'new' mode
                this.controller.selectedNodes.delete(node.id);
                node.element.classList.remove('selected');
            }
        }
        // Refresh details panel after marquee operation
        if (this.controller.selectedNodes.size === 1) {
            this.app.details.showNodeDetails(this.controller.nodes.get([...this.controller.selectedNodes][0]));
        } else {
            this.app.details.clear();
        }
    }

    /** Snap selected nodes to the grid (10px) */
    snapSelectedNodesToGrid() {
        const gridSize = 10;
        for (const nodeId of this.controller.selectedNodes) {
            const node = this.controller.nodes.get(nodeId);
            if (node) {
                node.x = Math.round(node.x / gridSize) * gridSize;
                node.y = Math.round(node.y / gridSize) * gridSize;
                node.element.style.left = `${node.x}px`;
                node.element.style.top = `${node.y}px`;
                this.controller.redrawNodeWires(node.id);
            }
        }
    }
}
