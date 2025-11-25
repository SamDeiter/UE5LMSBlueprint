/**
 * WiringController class - Manages wire connections, rendering, and interaction.
 */
import { Utils } from '../utils.js';
import { generateGUID } from '../utils/guid.js';

class WiringController {
    constructor(svg, app) {
        this.svgGroup = svg.getElementById('wire-group');
        this.ghostWire = svg.getElementById('ghost-wire');
        this.ghostWire.setAttribute('fill', 'none');
        this.links = new Map();
        this.selectedLinks = new Set();
        this.app = app;
    }
    findLink(linkId) { return this.links.get(linkId); }
    findLinksByNodeId(nodeId) { return [...this.links.values()].filter(l => l.startPin.node.id === nodeId || l.endPin.node.id === nodeId); }
    findLinksByPinId(pinId) { return [...this.links.values()].filter(l => l.startPin.id === pinId || l.endPin.id === pinId); }
    toggleLinkSelection(linkId) {
        const wireEl = document.getElementById(linkId);
        this.app.graph.clearSelection();
        if (!this.selectedLinks.has(linkId)) {
            this.clearLinkSelection();
            this.selectedLinks.add(linkId);
            if (wireEl) wireEl.classList.add('link-selected');
        } else {
            this.selectedLinks.delete(linkId);
            if (wireEl) wireEl.classList.remove('link-selected');
        }
    }
    clearLinkSelection() {
        this.selectedLinks.forEach(linkId => {
            const wireEl = document.getElementById(linkId);
            if (wireEl) wireEl.classList.remove('link-selected');
        });
        this.selectedLinks.clear();
    }
    createConnection(pinA, pinB) {
        if (!pinA || !pinB) return;
        if (pinA.node.id === pinB.node.id) {
            console.warn('[Wiring] Cannot connect pins on the same node.');
            return;
        }
        const startPin = pinA.dir === 'out' ? pinA : pinB;
        const endPin = pinA.dir === 'in' ? pinA : pinB;

        // Prevent connection if already exists
        const linkExists = startPin.links.some(linkId => {
            const link = this.links.get(linkId);
            return link && link.endPin.id === endPin.id;
        });
        if (linkExists) return;

        // Break existing connection if input pin is single-link
        if (endPin.getMaxLinks() === 1 && endPin.isConnected()) {
            this.breakPinLinks(endPin.id);
        }
        const isExecPin = startPin.type === 'exec' || endPin.type === 'exec';
        const typesMatch = startPin.type === endPin.type;
        if (!isExecPin && !typesMatch) {
            const convKey = Utils.getConversionNodeKey(startPin.type, endPin.type);
            if (convKey) {
                const startPos = Utils.getPinPosition(startPin.element, this.app);
                const endPos = Utils.getPinPosition(endPin.element, this.app);
                const midX = (startPos.x + endPos.x) / 2;
                const midY = (startPos.y + endPos.y) / 2;
                const convNode = this.app.graph.addNode(convKey, midX - 40, midY - 15);
                if (convNode) {
                    // Update node key to reflect variable name if applicable (e.g. for custom Get_Variable type conversion)
                    if (startPin.node.variableId || endPin.node.variableId) {
                        convNode.title = `Convert ${startPin.type.toUpperCase()} to ${endPin.type.toUpperCase()}`;
                    }

                    const convIn = convNode.findPinById(`${convNode.id}-val_in`);
                    const convOut = convNode.findPinById(`${convNode.id}-val_out`);
                    if (convIn && convOut) {
                        this._addLink(startPin, convIn);
                        this._addLink(convOut, endPin);
                        this.updateVisuals(startPin.node);
                        this.updateVisuals(convNode);
                        this.updateVisuals(endPin.node);
                        requestAnimationFrame(() => {
                            this.app.graph.redrawNodeWires(startPin.node.id);
                            this.app.graph.redrawNodeWires(convNode.id);
                            this.app.graph.redrawNodeWires(endPin.node.id);
                        });
                        this.app.persistence.autoSave();
                        this.app.compiler.markDirty();
                        return;
                    } else {
                        convNode.element.remove();
                        this.app.graph.nodes.delete(convNode.id);
                    }
                }
            }
        }
        this._addLink(startPin, endPin);
        this.updateVisuals(endPin.node);
        this.updateVisuals(startPin.node);
        requestAnimationFrame(() => {
            this.app.graph.redrawNodeWires(endPin.node.id);
            this.app.graph.redrawNodeWires(startPin.node.id);
        });
        this.app.persistence.autoSave();
        this.app.compiler.markDirty();

        // Hide ghost wire after creating connection
        this.ghostWire.style.display = 'none';
    }
    _addLink(startPin, endPin) {
        const link = {
            id: generateGUID(),
            startPin: startPin,
            endPin: endPin,
        };
        this.links.set(link.id, link);
        startPin.links.push(link.id);
        endPin.links.push(link.id);
    }
    updateVisuals(node) {
        if (!node || !node.element || !node.element.parentNode) return;
        const isSelected = node.element.classList.contains('selected');
        const oldEl = node.element;
        // Check if the old element is attached to the DOM before rendering new
        if (!oldEl.isConnected) {
            console.warn(`Attempted to update visuals for detached node ${node.id}`);
            return;
        }

        const newEl = node.render();
        oldEl.replaceWith(newEl);
        if (isSelected) {
            newEl.classList.add('selected');
        }
        node.element = newEl;
    }
    breakLinkById(linkId) {
        const link = this.links.get(linkId);
        if (!link) return;

        // CRITICAL: Always look up the pins by ID to ensure we have the LATEST pin instances
        // from the GraphController. Stale pin references in the link object can cause
        // visual state desync (e.g. pin remaining filled after disconnect).
        const startPinId = link.startPin.id;
        const endPinId = link.endPin.id;

        const startPin = this.app.graph.findPinById(startPinId) || link.startPin;
        const endPin = this.app.graph.findPinById(endPinId) || link.endPin;

        console.log(`[Wiring] Breaking link ${linkId} between ${startPin.id} and ${endPin.id}`);

        // Remove link ID from pins' link lists
        if (startPin && startPin.links) {
            startPin.links = startPin.links.filter(id => id !== linkId);
            // Immediately update pin visual state
            this.updatePinVisualState(startPin);
        }
        if (endPin && endPin.links) {
            endPin.links = endPin.links.filter(id => id !== linkId);
            // Immediately update pin visual state
            this.updatePinVisualState(endPin);
        }

        this.links.delete(linkId);
        this.selectedLinks.delete(linkId);
        const wireEl = document.getElementById(link.id);
        if (wireEl && wireEl.parentNode) {
            wireEl.remove();
        }

        // Re-render nodes to update pin dot appearance (full vs. hollow)
        if (endPin && endPin.node) {
            // Paranoid check: ensure link is gone
            if (endPin.links.includes(linkId)) {
                console.error(`[Wiring] Link ${linkId} still present in endPin ${endPin.id} after filter! Forcing removal.`);
                endPin.links = endPin.links.filter(id => id !== linkId);
            }
            this.updateVisuals(endPin.node);
            this.updatePinVisualState(endPin);
        }
        if (startPin && startPin.node) {
            // Paranoid check: ensure link is gone
            if (startPin.links.includes(linkId)) {
                console.error(`[Wiring] Link ${linkId} still present in startPin ${startPin.id} after filter! Forcing removal.`);
                startPin.links = startPin.links.filter(id => id !== linkId);
            }
            this.updateVisuals(startPin.node);
            this.updatePinVisualState(startPin);
        }

        requestAnimationFrame(() => {
            if (endPin && endPin.node) this.app.graph.redrawNodeWires(endPin.node.id);
            if (startPin && startPin.node) this.app.graph.redrawNodeWires(startPin.node.id);
            this.app.persistence.autoSave();
            this.app.compiler.markDirty();
        });
    }
    /**
     * Update the visual state of a pin (filled vs hollow) based on its connections
     */
    updatePinVisualState(pin) {
        if (!pin || !pin.element) {
            console.warn('[Wiring] updatePinVisualState called with invalid pin or element', pin);
            return;
        }

        const linkCount = pin.links ? pin.links.length : 0;
        const isConnected = linkCount > 0;

        console.log(`[Wiring] updatePinVisualState for ${pin.id}. Links: ${linkCount}. Connected: ${isConnected}`);

        if (isConnected) {
            pin.element.classList.remove('hollow');
        } else {
            pin.element.classList.add('hollow');
        }
    }

    breakPinLinks(pinId) {
        const linksToBreak = this.findLinksByPinId(pinId);
        console.log(`[Wiring] breakPinLinks for ${pinId}. Found ${linksToBreak.length} links.`);
        // Important: use link IDs to break, as breaking modifies the list
        linksToBreak.map(l => l.id).forEach(linkId => this.breakLinkById(linkId));
        this.cleanupOrphanWires();
    }

    cleanupOrphanWires() {
        const wires = this.svgGroup.querySelectorAll('path.wire');
        wires.forEach(wire => {
            if (wire.id === 'ghost-wire') return;
            if (!this.links.has(wire.id)) {
                console.warn(`[Wiring] Removing orphan wire: ${wire.id}`);
                wire.remove();
            }
        });
    }

    drawWire(link) {
        const { startPin, endPin } = link;

        // Guard against pins or nodes that might have been deleted but still linked
        if (!startPin.element || !endPin.element || !startPin.element.isConnected || !endPin.element.isConnected) {
            if (this.links.has(link.id)) {
                this.breakLinkById(link.id);
            }
            return;
        }

        let wireEl = document.getElementById(link.id);
        if (!wireEl) {
            wireEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            wireEl.id = link.id;
            this.svgGroup.appendChild(wireEl);
            wireEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLinkSelection(link.id);
            });
        } else {
            wireEl.style.display = '';
        }

        // Always update wire color based on current pin type
        const pinColor = Utils.getPinColor(startPin.type);
        wireEl.setAttribute('stroke', pinColor);

        const typeClass = Utils.getPinTypeClass(startPin.type);
        wireEl.setAttribute('class', `wire ${typeClass} ${this.selectedLinks.has(link.id) ? 'link-selected' : ''}`);
        const p1 = Utils.getPinPosition(startPin.element, this.app);
        const p2 = Utils.getPinPosition(endPin.element, this.app);
        wireEl.setAttribute('d', Utils.getWirePath(p1.x, p1.y, p2.x, p2.y));
    }

    // FIXED: Bulletproof ghost wire visibility
    updateGhostWire(e, startPin) {
        if (!startPin || !startPin.element) {
            // Don't hide the ghost wire if the action menu is open with a sourcePin
            if (this.app.actionMenu.sourcePin) {
                console.log('[WiringController] Prevented hiding - action menu is open with sourcePin');
                return;
            }
            console.log('[WiringController] Hiding ghost wire - no startPin or element');
            this.ghostWire.style.display = 'none';
            return;
        }

        // Force display block
        this.ghostWire.style.display = 'block';

        // Ensure it's in the DOM
        if (this.ghostWire.parentNode !== this.svgGroup) {
            this.svgGroup.appendChild(this.ghostWire);
        }

        // 1. Set Geometry
        const p1 = Utils.getPinPosition(startPin.element, this.app);
        const p2 = this.app.graph.getGraphCoords(e.clientX, e.clientY);
        const startX = startPin.dir === 'out' ? p1.x : p2.x;
        const startY = startPin.dir === 'out' ? p1.y : p2.y;
        const endX = startPin.dir === 'out' ? p2.x : p1.x;
        const endY = startPin.dir === 'out' ? p2.y : p1.y;

        const pathData = Utils.getWirePath(startX, startY, endX, endY);
        this.ghostWire.setAttribute('d', pathData);

        // 2. Set Visuals (Use BOTH style and attributes to be safe)
        const pinColor = Utils.getPinColor(startPin.type);

        // Attribute approach
        this.ghostWire.setAttribute('stroke', pinColor);
        this.ghostWire.setAttribute('stroke-width', '3');
        this.ghostWire.setAttribute('fill', 'none'); // Critical!

        // Style approach (backup for CSS variables)
        this.ghostWire.style.stroke = pinColor;
        this.ghostWire.style.strokeWidth = '3px';
        this.ghostWire.style.fill = 'none';
        this.ghostWire.style.opacity = '1';

        // Classes
        const typeClass = Utils.getPinTypeClass(startPin.type);
        this.ghostWire.setAttribute('class', `wire ${typeClass}`);
    }

    deleteSelectedLinks() {
        if (this.selectedLinks.size === 0) return;
        const linksToDelete = Array.from(this.selectedLinks);
        linksToDelete.forEach(linkId => {
            this.breakLinkById(linkId);
        });
        this.clearLinkSelection();
        this.cleanupOrphanWires();
        this.app.persistence.autoSave();
    }
}

export { WiringController };
