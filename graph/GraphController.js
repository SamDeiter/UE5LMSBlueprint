/**
 * GraphController class - Manages the graph editor, nodes, and user interactions.
 */
import { Utils } from '../utils.js';
import { nodeRegistry } from '../registries/NodeRegistry.js';
import { Pin } from './Pin.js';
import { Node } from './Node.js';

class GraphController {
    constructor(editor, svg, nodesContainer, app) {
        this.editor = editor;
        this.svg = svg;
        this.nodesContainer = nodesContainer;
        this.app = app;
        this.nodes = new Map();
        this.zoomReadout = document.getElementById('zoom-readout');
        this.pan = { x: 0, y: 0 };
        this.zoom = 1;
        this.isPanning = false;
        this.isDraggingNode = false;
        this.isWiring = false;
        this.isRmbDown = false;
        this.isMarqueeing = false;
        this.isEditingLiteral = false; // New flag to prevent graph interaction
        this.hasDragged = false;
        this.activePin = null;
        this.selectedNodes = new Set();
        this.dragStart = { x: 0, y: 0 };
        this.nodeDragOffsets = new Map();
        this.marqueeStart = { x: 0, y: 0 };
        this.marqueeEl = document.getElementById('selection-marquee');
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
        // Add delete listener
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (this.selectedNodes.size > 0) {
                e.preventDefault();
                this.deleteSelectedNodes();
            } else if (this.app.wiring.selectedLinks.size > 0) {
                e.preventDefault();
                this.app.wiring.deleteSelectedLinks();
            }
        }
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
            if (this.selectedNodes.size > 0) {
                e.preventDefault();
                this.duplicateSelectedNodes();
            }
        }
    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }
    handleDrop(e) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const graphCoords = this.getGraphCoords(e.clientX, e.clientY);
        if (data.startsWith('VARIABLE:')) {
            const varName = data.split(':')[1];
            let nodeKey = null;
            if (e.altKey) nodeKey = `Set_${varName}`;
            else if (e.ctrlKey) nodeKey = `Get_${varName}`;
            if (nodeKey) {
                this.addNode(nodeKey, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
            } else {
                this.app.actionMenu.show(e.clientX, e.clientY, null, varName);
            }
        }
        else if (data.startsWith('PALETTE_NODE:')) {
            const nodeType = data.split(':')[1];
            this.addNode(nodeType, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
        }
    }
    handleEditorMouseDown(e) {
        // If user is editing a text input, ignore mousedown on the graph background
        if (this.isEditingLiteral) {
            return;
        }

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
            this.activePin = this.findPinById(pinId);

            if (e.altKey && this.activePin && this.activePin.isConnected()) {
                this.app.wiring.breakPinLinks(this.activePin.id);
            }

            // If the pin is connected and we are starting to drag *from* it, break the link automatically if it's an input pin (to avoid creating a loop/invalid state)
            if (this.activePin && this.activePin.dir === 'in' && this.activePin.isConnected()) {
                this.app.wiring.breakPinLinks(this.activePin.id);
                // After breaking, the activePin is now free to start a new connection, but we flip it to act as an output for the drag.
                // This is a common UE-style behavior, but for simplicity we treat it as an output pin starting a drag.
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

            if (mode === 'new' && !this.selectedNodes.has(nodeElement.id)) {
                this.selectNode(nodeElement.id, false, 'new');
            } else if (mode !== 'new') {
                this.selectNode(nodeElement.id, true, mode);
            }

            const mouseGraphCoords = this.getGraphCoords(e.clientX, e.clientY);
            this.nodeDragOffsets.clear();
            for (const nodeId of this.selectedNodes) {
                const node = this.nodes.get(nodeId);
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
            e.preventDefault(); // Prevents context menu popup on initial mousedown
            this.isRmbDown = true;
            this.dragStart.x = e.clientX;
            this.dragStart.y = e.clientY;
            this.editor.classList.add('dragging');
            document.addEventListener('mousemove', this.handleGlobalMouseMove);
            document.addEventListener('mouseup', this.handleGlobalMouseUp);
            return;
        }

        // 4. Marqueeing (Click on background)
        if (e.button === 0) {
            this.isMarqueeing = true;
            this.marqueeStart.x = e.clientX;
            this.marqueeStart.y = e.clientY;
            // Position marquee relative to the editor container
            const rect = this.editor.getBoundingClientRect();
            this.marqueeEl.style.display = 'block';
            this.marqueeEl.style.left = `${e.clientX - rect.left}px`;
            this.marqueeEl.style.top = `${e.clientY - rect.top}px`;
            this.marqueeEl.style.width = '0px';
            this.marqueeEl.style.height = '0px';

            if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
                this.clearSelection();
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
            this.pan.x += dx;
            this.pan.y += dy;
            this.dragStart.x = e.clientX;
            this.dragStart.y = e.clientY;
            this.updateTransform();
            return;
        }

        if (this.isDraggingNode) {
            const mouseGraphCoords = this.getGraphCoords(e.clientX, e.clientY);
            for (const nodeId of this.selectedNodes) {
                const node = this.nodes.get(nodeId);
                const offset = this.nodeDragOffsets.get(nodeId);
                if (node && offset) {
                    node.x = mouseGraphCoords.x - offset.x;
                    node.y = mouseGraphCoords.y - offset.y;
                    node.element.style.left = `${node.x}px`;
                    node.element.style.top = `${node.y}px`;
                    this.redrawNodeWires(node.id);
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

            // Calculate selection rect in graph coordinates
            const graphStart = this.getGraphCoords(Math.min(startX, currentX), Math.min(startY, currentY));
            const graphEnd = this.getGraphCoords(Math.max(startX, currentX), Math.max(startY, currentY));
            const selectionRect = {
                left: graphStart.x,
                top: graphStart.y,
                right: graphEnd.x,
                bottom: graphEnd.y
            };

            const mode = e.ctrlKey ? 'toggle' : (e.shiftKey ? 'add' : 'new');
            this.selectNodesInRect(selectionRect, mode);
        }
    }

    handleGlobalMouseUp(e) {
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);

        if (this.isRmbDown) {
            this.isRmbDown = false;
            this.editor.classList.remove('dragging');
            // If we dragged significantly, don't trigger context menu
            if (this.hasDragged) {
                // Prevent context menu from showing immediately after drag
                // This is handled by the contextmenu event listener checking for drag
            }
        }

        if (this.isDraggingNode) {
            this.isDraggingNode = false;
            this.snapSelectedNodesToGrid();
            this.app.persistence.autoSave();
        }

        if (this.isWiring) {
            this.isWiring = false;
            this.app.wiring.ghostWire.style.display = 'none';

            const pinElement = e.target.closest('.pin-container');
            if (pinElement) {
                const pinId = pinElement.dataset.pinId;
                const targetPin = this.findPinById(pinId);
                if (targetPin && this.activePin) {
                    this.app.wiring.createConnection(this.activePin, targetPin);
                }
            } else {
                // Wiring ended on empty space - show action menu
                if (this.hasDragged && this.activePin) {
                    // Pass the pin type and direction to filter the action menu
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
        const oldZoom = this.zoom;
        this.zoom += delta;
        this.zoom = Math.min(Math.max(0.1, this.zoom), 5);

        // Zoom towards mouse pointer
        const rect = this.editor.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate graph coordinates before zoom
        const graphX = (mouseX - this.pan.x) / oldZoom;
        const graphY = (mouseY - this.pan.y) / oldZoom;

        // Adjust pan to keep graph coordinates under mouse constant
        this.pan.x = mouseX - graphX * this.zoom;
        this.pan.y = mouseY - graphY * this.zoom;

        this.updateTransform();
        this.zoomReadout.textContent = `${Math.round(this.zoom * 100)}%`;
    }

    updateTransform() {
        const transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
        this.nodesContainer.style.transform = transform;
        const svgTransform = `translate(${this.pan.x}, ${this.pan.y}) scale(${this.zoom})`;
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

    renderAllNodes() {
        this.nodesContainer.innerHTML = '';
        for (const node of this.nodes.values()) {
            this.nodesContainer.appendChild(node.render());
        }
    }

    getGraphCoords(clientX, clientY) {
        const rect = this.editor.getBoundingClientRect();
        const x = (clientX - rect.left - this.pan.x) / this.zoom;
        const y = (clientY - rect.top - this.pan.y) / this.zoom;
        return { x, y };
    }

    loadState(state) {
        // Ensure state is an object, or default to an empty object
        const safeState = state || {};
        const safeNodes = safeState.nodes || [];
        const safeLinks = safeState.links || [];

        // Clear existing state
        this.nodes.clear();
        this.app.wiring.links.clear();
        this.clearSelection();
        this.app.wiring.clearLinkSelection();

        // 1. Load Nodes
        safeNodes.forEach((nodeData) => {
            const template = nodeRegistry.get(nodeData.nodeKey);
            if (!template) {
                console.warn(`Skipping node during load: Key '${nodeData.nodeKey}' not found in NodeRegistry.`);
                return;
            }

            // Determine the final pin definition to use: saved pins (for dynamic nodes) or template pins (for static nodes)
            let pinsToLoad = template.pins;

            // If the node is a Custom Event (or other dynamic node) AND saved pins exist
            if (nodeData.nodeKey === 'CustomEvent') {
                // Check if saved pins contains custom pins (more than the base exec/delegate pins)
                const hasCustomPins = nodeData.pins && nodeData.pins.some(p => p.isCustom);
                if (hasCustomPins) {
                    pinsToLoad = nodeData.pins;
                }
            } else if (nodeData.nodeKey.startsWith('Func_') && nodeData.pins) {
                // Function call pins may change. We should handle merging the template and saved pins if needed, 
                // but for simplicity here, we assume if we have saved pins, we use them to restore literal values/structure if dynamic.
            }

            const fullNodeData = { ...template, ...nodeData, pins: pinsToLoad };
            const node = new Node(nodeData.id, fullNodeData, nodeData.x, nodeData.y, nodeData.nodeKey, this.app);
            this.nodes.set(node.id, node);

            // Restore literal values
            if (nodeData.pins) {
                nodeData.pins.forEach(savedPin => {
                    // Normalize saved pin ID to match the runtime Pin ID format
                    const fullPinId = savedPin.id.includes(node.id) ? savedPin.id : `${node.id}-${savedPin.id}`;
                    const pin = node.findPinById(fullPinId);

                    if (pin && savedPin.literalValue !== undefined) {
                        node.pinLiterals.set(pin.id, savedPin.literalValue);
                    } else if (pin) {
                        // Ensure a default is set if literalValue was missing or undefined
                        node.pinLiterals.set(pin.id, pin.defaultValue);
                    }
                });
            }
        });

        // 2. Load Links
        safeLinks.forEach(linkData => {
            const startPin = this.findPinById(linkData.startPinId);
            const endPin = this.findPinById(linkData.endPinId);

            if (startPin && endPin) {
                const link = { id: linkData.id, startPin, endPin };
                this.app.wiring.links.set(link.id, link);
                startPin.links.push(link.id);
                endPin.links.push(link.id);
            } else {
                console.warn(`Skipping link during load due to missing pin: ${linkData.id}`);
            }
        });

        // 3. Render and Redraw
        // The second CRITICAL APP INITIALIZATION ERROR trace points to a failure related to 'renderAllNodes'.
        // This is where the graph should be re-rendered after loading data.
        this.renderAllNodes();
        this.drawAllWires();

        // 4. Restore Pan/Zoom
        if (safeState.pan) this.pan = safeState.pan;
        if (safeState.zoom) this.zoom = safeState.zoom;
        this.updateTransform();
    }

    findPinById(pinId) {
        if (!pinId) return null;
        // The format is usually 'node-id-part1-pinName'
        const parts = pinId.split('-');
        if (parts.length < 2) return null;

        // Find the node ID part, which could be 'node-XXXX' or similar
        // We try to reconstruct the Node ID by iterating from the end
        let nodeId = parts[0];
        let pinName = parts.slice(1).join('-');

        // Assuming node IDs are 'node-UUID' where UUID is 8 characters (or just UUID if the 'node-' prefix is removed)
        // More robust: search for a node ID that is a prefix of pinId
        const nodeIds = Array.from(this.nodes.keys());

        for (const id of nodeIds) {
            if (pinId.startsWith(id)) {
                nodeId = id;
                break;
            }
        }

        const node = this.nodes.get(nodeId);
        return node ? node.findPinById(pinId) : null;
    }

    canConnect(pinA, pinB) {
        if (!pinA || !pinB || !pinA.node || !pinB.node) return false;
        if (pinA.node.id === pinB.node.id) return false;
        if (pinA.dir === pinB.dir) return false;

        const startPin = pinA.dir === 'out' ? pinA : pinB;
        const endPin = pinA.dir === 'in' ? pinA : pinB;

        // If the end pin already has max links, prevent connection
        if (endPin.links.length >= endPin.getMaxLinks()) return false;

        // Check container type match (single, array, set, map)
        if (startPin.containerType !== endPin.containerType) return false;

        // Check type match or executable type
        if (startPin.type === endPin.type) return true;
        if (startPin.type === 'exec' && endPin.type === 'exec') return true;

        // Check for implicit conversion
        const conversionKey = Utils.getConversionNodeKey(startPin.type, endPin.type);
        if (conversionKey) return true;

        return false;
    }

    promotePinToVariable(pin) {
        const newVariable = this.app.variables.createVariableFromPin(pin);

        let nodeToSpawnKey;
        if (pin.dir === 'in') {
            nodeToSpawnKey = `Get_${newVariable.name}`;
        } else {
            nodeToSpawnKey = `Set_${newVariable.name}`;
        }

        // Calculate position offset relative to the pin's center
        const pinPos = Utils.getPinPosition(pin.element, this.app);
        const x = pinPos.x - 10;
        const y = pinPos.y - 15;

        const newNode = this.app.graph.addNode(nodeToSpawnKey, x, y);

        if (newNode) {
            const targetPinName = (pin.dir === 'in') ? 'val_out' : 'val_in';
            const newPin = newNode.pins.find(p => p.id.endsWith(targetPinName));

            // Connect the pin being promoted to the new variable node
            if (newPin) {
                // If the pin being promoted is an input pin, the Get node output connects to it (newPin is the output)
                // If the pin being promoted is an output pin, the Set node input connects to it (newPin is the input)
                if (pin.dir === 'in') {
                    this.app.wiring.createConnection(newPin, pin); // newPin (out) -> pin (in)
                } else {
                    this.app.wiring.createConnection(pin, newPin); // pin (out) -> newPin (in)
                }
            }
        }

        this.app.persistence.autoSave();
    }

    updateVariableNodes(oldName, newName) {
        const getKey = `Get_${oldName}`;
        const setKey = `Set_${oldName}`;

        for (const node of this.nodes.values()) {
            if (node.nodeKey === getKey || node.nodeKey === setKey) {
                const newKey = node.nodeKey === getKey ? `Get_${newName}` : `Set_${newName}`;
                node.nodeKey = newKey;
                this.synchronizeNodeWithTemplate(node);
            }
        }
    }

    /**
     * Synchronizes a node instance with its template definition from the NodeRegistry.
     * Updates the node's title, pins, and preserves existing connections and literal values.
     * @param {Node} node - The node instance to synchronize.
     */
    synchronizeNodeWithTemplate(node) {
        const template = nodeRegistry.get(node.nodeKey);
        if (!template) return;

        node.title = template.title;
        node.type = template.type || 'pure-node';
        node.icon = template.icon;
        node.devWarning = template.devWarning;
        node.variableType = template.variableType;
        node.variableId = template.variableId;
        node.customData = template.customData || {};

        const oldPinsMap = new Map(node.pins.map(p => [p.id, p]));
        const oldLiterals = new Map(node.pinLiterals);

        const newPins = [];
        const newLiterals = new Map();

        // 1. Create new pins based on template, transferring links and literals if the pin ID matches
        template.pins.forEach(pData => {
            const newPin = new Pin(node, pData);
            const fullPinId = newPin.id;
            const oldPin = oldPinsMap.get(fullPinId);

            if (oldPin) {
                // Transfer links, default value, and literal value
                newPin.links = oldPin.links;
                // Preserve the runtime literal value
                newLiterals.set(fullPinId, oldLiterals.get(fullPinId));

                // Update links to point to the new Pin instance
                newPin.links.forEach(linkId => {
                    const link = this.app.wiring.links.get(linkId);
                    if (link) {
                        if (link.startPin.id === fullPinId) link.startPin = newPin;
                        if (link.endPin.id === fullPinId) link.endPin = newPin;
                    }
                });
            } else {
                // Use default literal value for new pins
                newLiterals.set(fullPinId, newPin.defaultValue);
            }
            newPins.push(newPin);
        });

        // 2. Cleanup pins/literals/links for pins that no longer exist (e.g., when changing variable type and pins change)
        oldPinsMap.forEach((oldPin, oldId) => {
            if (!newPins.some(p => p.id === oldId)) {
                // Pin was removed: break its links
                this.app.wiring.breakPinLinks(oldId);
            }
        });


        node.pins = newPins;
        node.pinLiterals = newLiterals;

        node.refreshPinCache();
        this.app.wiring.updateVisuals(node);
        this.redrawNodeWires(node.id);
    }

    selectNode(nodeId, addToSelection = false, mode = 'toggle') {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        // If not adding to selection, clear existing selection once
        if (!addToSelection) {
            this.clearSelection();
        }

        let shouldSelect = false;
        if (mode === 'add') {
            shouldSelect = true;
        } else if (mode === 'remove') {
            shouldSelect = false;
        } else if (mode === 'toggle') {
            shouldSelect = !this.selectedNodes.has(nodeId);
        } else if (mode === 'new') {
            shouldSelect = true;
        }

        if (shouldSelect) {
            this.selectedNodes.add(nodeId);
            node.element.classList.add('selected');
        } else {
            this.selectedNodes.delete(nodeId);
            node.element.classList.remove('selected');
        }

        // Handle details panel display
        if (this.selectedNodes.size === 1) {
            const selectedNode = this.nodes.get([...this.selectedNodes][0]);
            this.app.details.showNodeDetails(selectedNode);
        } else {
            this.app.details.clear();
        }
    }

    clearSelection() {
        this.selectedNodes.forEach(nodeId => {
            const node = this.nodes.get(nodeId);
            if (node) node.element.classList.remove('selected');
        });
        this.selectedNodes.clear();
        this.app.details.clear();
    }

    selectNodesInRect(rect, mode) {
        for (const node of this.nodes.values()) {
            const nodeRect = node.element.getBoundingClientRect();
            // Check if node rect intersects with selection rect
            const intersects = (
                nodeRect.left < rect.right &&
                nodeRect.right > rect.left &&
                nodeRect.top < rect.bottom &&
                nodeRect.bottom > rect.top
            );

            if (intersects) {
                // Marquee selects the node
                this.selectNode(node.id, true, mode);
            } else if (mode === 'new') {
                // In 'new' mode, if it doesn't intersect, ensure it's unselected
                this.selectedNodes.delete(node.id);
                node.element.classList.remove('selected');
            }
        }

        // Re-run selectNode logic for the final set to ensure details panel is updated correctly
        if (this.selectedNodes.size === 1) {
            this.app.details.showNodeDetails(this.nodes.get([...this.selectedNodes][0]));
        } else {
            this.app.details.clear();
        }
    }

    deleteSelectedNodes() {
        if (this.selectedNodes.size === 0) return;

        // Convert to array to allow deletion while iterating
        const nodesToDelete = Array.from(this.selectedNodes);

        for (const nodeId of nodesToDelete) {
            const node = this.nodes.get(nodeId);
            if (!node) continue;

            // 1. Break all associated wires
            node.pins.forEach(pin => {
                this.app.wiring.breakPinLinks(pin.id);
            });

            // 2. Remove node element from DOM
            node.element.remove();

            // 3. Remove node from graph map
            this.nodes.delete(nodeId);
        }

        this.selectedNodes.clear();
        this.app.details.clear();
        this.app.persistence.autoSave();
        this.app.compiler.markDirty();
    }

    snapSelectedNodesToGrid() {
        const gridSize = 10;
        for (const nodeId of this.selectedNodes) {
            const node = this.nodes.get(nodeId);
            if (node) {
                node.x = Math.round(node.x / gridSize) * gridSize;
                node.y = Math.round(node.y / gridSize) * gridSize;
                node.element.style.left = `${node.x}px`;
                node.element.style.top = `${node.y}px`;
                this.redrawNodeWires(node.id);
            }
        }
    }

    updateTransform() {
        const transform = `translate(${this.pan.x}px, ${this.pan.y}px) scale(${this.zoom})`;
        this.nodesContainer.style.transform = transform;
        const svgTransform = `translate(${this.pan.x}, ${this.pan.y}) scale(${this.zoom})`;
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

    renderAllNodes() {
        this.nodesContainer.innerHTML = '';
        for (const node of this.nodes.values()) {
            this.nodesContainer.appendChild(node.render());
        }
    }

    getGraphCoords(clientX, clientY) {
        const rect = this.editor.getBoundingClientRect();
        const x = (clientX - rect.left - this.pan.x) / this.zoom;
        const y = (clientY - rect.top - this.pan.y) / this.zoom;
        return { x, y };
    }

    loadState(state) {
        // Ensure state is an object, or default to an empty object
        const safeState = state || {};
        const safeNodes = safeState.nodes || [];
        const safeLinks = safeState.links || [];

        // Clear existing state
        this.nodes.clear();
        this.app.wiring.links.clear();
        this.clearSelection();
        this.app.wiring.clearLinkSelection();

        // 1. Load Nodes
        safeNodes.forEach((nodeData) => {
            const template = nodeRegistry.get(nodeData.nodeKey);
            if (!template) {
                console.warn(`Skipping node during load: Key '${nodeData.nodeKey}' not found in NodeRegistry.`);
                return;
            }

            // Determine the final pin definition to use: saved pins (for dynamic nodes) or template pins (for static nodes)
            let pinsToLoad = template.pins;

            // If the node is a Custom Event (or other dynamic node) AND saved pins exist
            if (nodeData.nodeKey === 'CustomEvent') {
                // Check if saved pins contains custom pins (more than the base exec/delegate pins)
                const hasCustomPins = nodeData.pins && nodeData.pins.some(p => p.isCustom);
                if (hasCustomPins) {
                    pinsToLoad = nodeData.pins;
                }
            } else if (nodeData.nodeKey.startsWith('Func_') && nodeData.pins) {
                // Function call pins may change. We should handle merging the template and saved pins if needed, 
                // but for simplicity here, we assume if we have saved pins, we use them to restore literal values/structure if dynamic.
            }

            const fullNodeData = { ...template, ...nodeData, pins: pinsToLoad };
            const node = new Node(nodeData.id, fullNodeData, nodeData.x, nodeData.y, nodeData.nodeKey, this.app);
            this.nodes.set(node.id, node);

            // Restore literal values
            if (nodeData.pins) {
                nodeData.pins.forEach(savedPin => {
                    // Normalize saved pin ID to match the runtime Pin ID format
                    const fullPinId = savedPin.id.includes(node.id) ? savedPin.id : `${node.id}-${savedPin.id}`;
                    const pin = node.findPinById(fullPinId);

                    if (pin && savedPin.literalValue !== undefined) {
                        node.pinLiterals.set(pin.id, savedPin.literalValue);
                    } else if (pin) {
                        // Ensure a default is set if literalValue was missing or undefined
                        node.pinLiterals.set(pin.id, pin.defaultValue);
                    }
                });
            }
        });

        // 2. Load Links
        safeLinks.forEach(linkData => {
            const startPin = this.findPinById(linkData.startPinId);
            const endPin = this.findPinById(linkData.endPinId);

            if (startPin && endPin) {
                const link = { id: linkData.id, startPin, endPin };
                this.app.wiring.links.set(link.id, link);
                startPin.links.push(link.id);
                endPin.links.push(link.id);
            } else {
                console.warn(`Skipping link during load due to missing pin: ${linkData.id}`);
            }
        });

        // 3. Render and Redraw
        // The second CRITICAL APP INITIALIZATION ERROR trace points to a failure related to 'renderAllNodes'.
        // This is where the graph should be re-rendered after loading data.
        this.renderAllNodes();
        this.drawAllWires();

        // 4. Restore Pan/Zoom
        if (safeState.pan) this.pan = safeState.pan;
        if (safeState.zoom) this.zoom = safeState.zoom;
        this.updateTransform();
    }
}

export { GraphController };
