/**
 * GraphInteraction - Handles user input events (mouse, keyboard, drag-drop) for the Graph Editor.
 */
import { Utils } from '../utils.js';

export class GraphInteraction {
    constructor(controller) {
        this.controller = controller;
        this.app = controller.app;
        this.editor = controller.editor;
        this.nodesContainer = controller.nodesContainer;

        // Interaction State
        this.isPanning = false;
        this.isDraggingNode = false;
        this.isWiring = false;
        this.isRmbDown = false;
        this.isMarqueeing = false;
        this.isEditingLiteral = false;
        this.hasDragged = false;
        this.activePin = null;

        this.dragStart = { x: 0, y: 0 };
        this.nodeDragOffsets = new Map();
        this.marqueeStart = { x: 0, y: 0 };
        this.marqueeEl = document.getElementById('selection-marquee');

        // Bind methods
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
    }

    initEvents() {
        this.editor.addEventListener('mousedown', this.handleEditorMouseDown.bind(this));
        this.editor.addEventListener('wheel', this.handleZoom.bind(this));
        this.editor.addEventListener('contextmenu', this.handleContextMenu.bind(this));
        this.nodesContainer.addEventListener('contextmenu', this.handlePinContextMenu.bind(this));
        this.editor.addEventListener('dragover', this.handleDragOver.bind(this));
        this.editor.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.controller.selectedNodes.size > 0) {
                e.preventDefault();
                this.controller.deleteSelectedNodes();
            } else if (this.app.wiring.selectedLinks.size > 0) {
                e.preventDefault();
                this.app.wiring.deleteSelectedLinks();
            }
        }
    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }

    handleDrop(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const graphCoords = this.controller.getGraphCoords(e.clientX, e.clientY);

        // COMPONENT_GET - From Components panel (top), only creates Get node
        if (data.startsWith('COMPONENT_GET:')) {
            const compId = data.substring('COMPONENT_GET:'.length);
            const nodeKey = `GetComponent_${compId}`;
            this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
            return;
        }

        // COMPONENT - From Variables panel, shows Get/Set menu
        if (data.startsWith('COMPONENT:')) {
            const compId = data.split(':')[1];
            const comp = this.app.components.get(compId);
            if (!comp) return;

            // Check for modifier keys (like variables)
            let nodeKey = null;
            if (e.altKey) nodeKey = `SetComponent_${compId}`;
            else if (e.ctrlKey) nodeKey = `GetComponent_${compId}`;

            if (nodeKey) {
                this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
            } else {
                // Show action menu with Get/Set options
                this.app.actionMenu.show(e.clientX, e.clientY, null, null, comp);
            }
        } else if (data.startsWith('VARIABLE:')) {
            const varName = data.split(':')[1];
            let nodeKey = null;
            if (e.altKey) nodeKey = `Set_${varName}`;
            else if (e.ctrlKey) nodeKey = `Get_${varName}`;
            if (nodeKey) {
                this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
            } else {
                this.app.actionMenu.show(e.clientX, e.clientY, null, varName);
            }
        }
        else if (data.startsWith('PALETTE_NODE:')) {
            const nodeType = data.split(':')[1];
            this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
        }
    }

    handleEditorMouseDown(e) {
        if (this.isEditingLiteral) return;

        this.hasDragged = false;
        this.app.wiring.clearLinkSelection();
        if (this.isMarqueeing) {
            this.isMarqueeing = false;
            this.marqueeEl.style.display = 'none';
        }

        const pinElement = e.target.closest('.pin-container');
        const nodeElement = e.target.closest('.node');

        // 1. Wiring Start
        if (pinElement && e.button === 0) {
            e.stopPropagation();
            e.preventDefault();
            this.isWiring = true;
            const pinId = pinElement.dataset.pinId;
            this.activePin = this.controller.findPinById(pinId);

            if (e.altKey && this.activePin) {
                if (this.activePin.isConnected()) {
                    this.app.wiring.breakPinLinks(this.activePin.id);
                }
            }

            if (this.activePin && this.activePin.dir === 'in' && this.activePin.isConnected()) {
                this.app.wiring.breakPinLinks(this.activePin.id);
            }

            if (this.activePin) {
                this.app.wiring.updateGhostWire(e, this.activePin);
            }

            document.addEventListener('mousemove', this.handleGlobalMouseMove);
            document.addEventListener('mouseup', this.handleGlobalMouseUp);
            return;
        }

        // 2. Node Dragging/Selection
        if (nodeElement && e.button === 0) {
            e.stopPropagation();
            this.isDraggingNode = true;
            const mode = e.ctrlKey ? 'toggle' : (e.shiftKey ? 'add' : 'new');

            if (mode === 'new' && !this.controller.selectedNodes.has(nodeElement.id)) {
                this.controller.selectNode(nodeElement.id, false, 'new');
            } else if (mode !== 'new') {
                this.controller.selectNode(nodeElement.id, true, mode);
            }

            const mouseGraphCoords = this.controller.getGraphCoords(e.clientX, e.clientY);
            this.nodeDragOffsets.clear();
            for (const nodeId of this.controller.selectedNodes) {
                const node = this.controller.nodes.get(nodeId);
                if (node) {
                    this.nodeDragOffsets.set(nodeId, {
                        x: mouseGraphCoords.x - node.x,
                        y: mouseGraphCoords.y - node.y
                    });
                }
            }

            document.addEventListener('mousemove', this.handleGlobalMouseMove);
            document.addEventListener('mouseup', this.handleGlobalMouseUp);
            return;
        }

        // 3. Panning
        if (e.button === 2) { // Right mouse button
            e.preventDefault();
            this.isRmbDown = true;
            this.dragStart.x = e.clientX;
            this.dragStart.y = e.clientY;
            this.editor.classList.add('dragging');
            document.addEventListener('mousemove', this.handleGlobalMouseMove);
            document.addEventListener('mouseup', this.handleGlobalMouseUp);
            return;
        }

        // 4. Marqueeing
        if (e.button === 0) {
            this.isMarqueeing = true;
            this.marqueeStart.x = e.clientX;
            this.marqueeStart.y = e.clientY;
            const rect = this.editor.getBoundingClientRect();
            this.marqueeEl.style.display = 'block';
            this.marqueeEl.style.left = `${e.clientX - rect.left}px`;
            this.marqueeEl.style.top = `${e.clientY - rect.top}px`;
            this.marqueeEl.style.width = '0px';
            this.marqueeEl.style.height = '0px';

            if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
                this.controller.clearSelection();
                // Deselect component if one is selected
                if (this.app.componentsController && this.app.componentsController.selectedComponentId) {
                    this.app.componentsController.selectComponent(null);
                }
            }

            document.addEventListener('mousemove', this.handleGlobalMouseMove);
            document.addEventListener('mouseup', this.handleGlobalMouseUp);
        }
    }

    handleGlobalMouseMove(e) {
        if (e.movementX !== 0 || e.movementY !== 0) { this.hasDragged = true; }
        e.preventDefault();

        if (this.isRmbDown) { // Panning
            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            this.controller.pan.x += dx;
            this.controller.pan.y += dy;
            this.dragStart.x = e.clientX;
            this.dragStart.y = e.clientY;
            this.controller.updateTransform();
            return;
        }

        if (this.isDraggingNode) {
            const mouseGraphCoords = this.controller.getGraphCoords(e.clientX, e.clientY);
            for (const nodeId of this.controller.selectedNodes) {
                const node = this.controller.nodes.get(nodeId);
                const offset = this.nodeDragOffsets.get(nodeId);
                if (node && offset) {
                    node.x = mouseGraphCoords.x - offset.x;
                    node.y = mouseGraphCoords.y - offset.y;
                    node.element.style.left = `${node.x}px`;
                    node.element.style.top = `${node.y}px`;
                    this.controller.redrawNodeWires(node.id);
                }
            }
            return;
        }

        if (this.isWiring && this.activePin) {
            this.app.wiring.updateGhostWire(e, this.activePin);
            return;
        }

        if (this.isMarqueeing) {
            const rect = this.editor.getBoundingClientRect();
            const currentX = e.clientX;
            const currentY = e.clientY;
            const startX = this.marqueeStart.x;
            const startY = this.marqueeStart.y;

            const left = Math.min(startX, currentX) - rect.left;
            const top = Math.min(startY, currentY) - rect.top;
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            this.marqueeEl.style.left = `${left}px`;
            this.marqueeEl.style.top = `${top}px`;
            this.marqueeEl.style.width = `${width}px`;
            this.marqueeEl.style.height = `${height}px`;

            const graphStart = this.controller.getGraphCoords(Math.min(startX, currentX), Math.min(startY, currentY));
            const graphEnd = this.controller.getGraphCoords(Math.max(startX, currentX), Math.max(startY, currentY));
            const selectionRect = {
                left: graphStart.x,
                top: graphStart.y,
                right: graphEnd.x,
                bottom: graphEnd.y
            };

            const mode = e.ctrlKey ? 'toggle' : (e.shiftKey ? 'add' : 'new');
            this.controller.selectNodesInRect(selectionRect, mode);
        }
    }

    handleGlobalMouseUp(e) {
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);

        if (this.isRmbDown) {
            this.isRmbDown = false;
            this.editor.classList.remove('dragging');
        }

        if (this.isDraggingNode) {
            this.isDraggingNode = false;
            this.controller.snapSelectedNodesToGrid();
            this.app.persistence.autoSave();
        }

        if (this.isWiring) {
            this.isWiring = false;
            this.app.wiring.ghostWire.style.display = 'none';

            const pinElement = e.target.closest('.pin-container');
            if (pinElement) {
                const pinId = pinElement.dataset.pinId;
                const targetPin = this.controller.findPinById(pinId);
                if (targetPin && this.activePin && targetPin.id !== this.activePin.id) {
                    this.app.wiring.createConnection(this.activePin, targetPin);
                }
            } else {
                if (this.hasDragged && this.activePin) {
                    this.app.actionMenu.show(e.clientX, e.clientY, this.activePin);
                }
            }
            this.activePin = null;
        }

        if (this.isMarqueeing) {
            this.isMarqueeing = false;
            this.marqueeEl.style.display = 'none';
        }
    }

    handleZoom(e) {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const oldZoom = this.controller.zoom;
        this.controller.zoom += delta;
        this.controller.zoom = Math.min(Math.max(0.1, this.controller.zoom), 5);

        const rect = this.editor.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const graphX = (mouseX - this.controller.pan.x) / oldZoom;
        const graphY = (mouseY - this.controller.pan.y) / oldZoom;

        this.controller.pan.x = mouseX - graphX * this.controller.zoom;
        this.controller.pan.y = mouseY - graphY * this.controller.zoom;

        this.controller.updateTransform();
        this.controller.zoomReadout.textContent = `${Math.round(this.controller.zoom * 100)}%`;
    }

    handleContextMenu(e) {
        e.preventDefault();
        if (e.target.closest('.node')) { return; }
        this.app.actionMenu.show(e.clientX, e.clientY, null);
    }

    handlePinContextMenu(e) {
        const pinContainerEl = e.target.closest('.pin-container');
        if (pinContainerEl) {
            e.preventDefault();
            e.stopPropagation();
            const pinId = pinContainerEl.dataset.pinId;
            const pin = this.controller.findPinById(pinId);

            if (!pin || pin.type === 'exec') return;

            const items = [
                { label: `Promote to Variable`, callback: () => this.controller.promotePinToVariable(pin) }
            ];

            const node = pin.node;
            if (node.nodeKey === 'CustomEvent' && pin.isCustom) {
                items.push({ label: '---', callback: () => { } });
                items.push({ label: `Remove Pin: ${pin.name}`, callback: () => this.controller.removeCustomPin(node.id, pin.id) });
            }

            this.app.contextMenu.show(e.clientX, e.clientY, items);
        }
    }
}
