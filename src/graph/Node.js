/**
 * Node class - Represents a single node in the graph canvas.
 */
import { Utils } from '../utils.js';
import { PinDefaults } from '../config/NodeDefaults.js';
import { Pin } from './Pin.js';
import { NodeDefinitions } from '../data/NodeDefinitions.js';

class Node {
    constructor(id, nodeData, x, y, nodeKey, app) {
        this.id = id;
        this.title = nodeData.title || "Unknown Node";
        this.type = nodeData.type || "pure-node";
        this.icon = nodeData.icon;
        this.devWarning = nodeData.devWarning;
        this.variableType = nodeData.variableType;
        this.variableId = nodeData.variableId;
        this.app = app;
        this.nodeKey = nodeKey;
        this.x = x;
        this.y = y;
        this.isBreakpoint = false;
        this.element = null;

        this.customData = nodeData.customData || {};

        let pinDataArray = nodeData.pins || [];

        // RECOVERY: Robustly sync pins with definition
        // This handles cases where saved data is partial (e.g. missing Exec pins) or corrupted.

        // 1. Get the authoritative definition
        let def = NodeDefinitions[this.nodeKey];
        if (!def && this.app && this.app.nodeRegistry) {
            def = this.app.nodeRegistry.get(this.nodeKey);
        }

        // FALLBACK: Hardcoded definitions for critical nodes if missing from registry/imports
        // Ensure Set nodes always have a valid definition, even if registry is stale
        if (this.nodeKey.startsWith('Set_')) {
            // Always regenerate definition for dynamic Set nodes to ensure correctness
            const varName = this.nodeKey.replace('Set_', '');
            let variable = this.app && this.app.variables ? this.app.variables.variables.get(varName) : null;

            const varType = variable ? variable.type : 'bool';
            const varContainer = variable ? variable.containerType : 'single';
            const pinDefault = variable ? { defaultValue: variable.defaultValue } : {};

            def = {
                title: `Set ${varName}`,
                type: "variable-node",
                icon: "fa-arrow-up",
                pins: [
                    { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
                    { id: "val_in", name: varName, type: varType, dir: "in", containerType: varContainer, ...pinDefault },
                    { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
                    { id: "val_out", name: varName, type: varType, dir: "out", containerType: varContainer }
                ]
            };
        } else if (!def) {
            // Fallbacks for other missing nodes
            if (this.nodeKey === 'EventBeginPlay') {
                def = {
                    title: "Event BeginPlay",
                    type: "event-node",
                    icon: "fa-play",
                    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }]
                };
            } else if (this.nodeKey === 'EventTick') {
                def = {
                    title: "Event Tick",
                    type: "event-node",
                    icon: "fa-clock",
                    pins: [
                        { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
                        { id: "delta_out", name: "Delta Seconds", type: "float", dir: "out" }
                    ]
                };
            } else if (this.nodeKey === 'EventActorBeginOverlap') {
                def = {
                    title: "Event ActorBeginOverlap",
                    type: "event-node",
                    icon: "fa-box-open",
                    pins: [
                        { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
                        { id: "other_actor", name: "Other Actor", type: "object", dir: "out" }
                    ]
                };
            }
        }

        // 2. If we have a definition, validate and repair the saved pins
        if (def && def.pins) {
            if (pinDataArray.length === 0) {
                pinDataArray = def.pins.map(p => ({ ...p }));
            } else {
                def.pins.forEach(defPin => {
                    const exists = pinDataArray.some(p => p.id === defPin.id || (p.name === defPin.name && p.dir === defPin.dir));
                    const shouldRestore = !exists && (defPin.type === 'exec' || this.type === 'event-node');
                    if (shouldRestore) {
                        pinDataArray.push({ ...defPin });
                    }
                });
            }
            if (!this.title || this.title === "Unknown Node") this.title = def.title;
            if (!this.icon) this.icon = def.icon;
            if (!this.type) this.type = def.type;
        }

        // --- NUCLEAR OPTION: Force Restore Critical Pins if still missing ---
        if (this.nodeKey === 'EventBeginPlay') {
            // Ensure no input execution pins exist
            pinDataArray = pinDataArray.filter(p => !(p.type === 'exec' && p.dir === 'in'));

            const hasExecOut = pinDataArray.some(p => p.type === 'exec' && p.dir === 'out');
            if (!hasExecOut) {
                pinDataArray.push({ id: "exec_out", name: "Exec", type: "exec", dir: "out" });
            }
            this.type = "event-node";
            this.title = "Event BeginPlay";
            // Icon handled by definition now
        }

        if (this.nodeKey.startsWith('Set_')) {
            const hasExecIn = pinDataArray.some(p => p.type === 'exec' && p.dir === 'in');
            const hasExecOut = pinDataArray.some(p => p.type === 'exec' && p.dir === 'out');

            // If missing exec pins, force a full reset from definition
            if (!hasExecIn || !hasExecOut) {
                if (def && def.pins) {
                    console.log(`[NodeDebug] Force Resetting Set Node Pins for ${this.nodeKey}`);
                    // Keep literal values if possible
                    const oldLiterals = new Map();
                    pinDataArray.forEach(p => {
                        if (p.literalValue !== undefined) oldLiterals.set(p.name, p.literalValue);
                    });

                    pinDataArray = def.pins.map(p => ({
                        ...p,
                        literalValue: oldLiterals.get(p.name)
                    }));
                }
            }
            this.type = "variable-node";
        }

        this.pins = pinDataArray.map(p => new Pin(this, p));

        // FORCE UPDATE: Ensure EventBeginPlay has the correct icon, overriding any stale saved data
        if (this.nodeKey === 'EventBeginPlay') {
            this.icon = "fa-location-arrow";
        }



        // --- FINAL SANITY CHECK ---
        // Ensure critical pins exist in the final object, regardless of what happened above
        if (this.nodeKey === 'EventBeginPlay') {
            if (!this.pins.some(p => p.type === 'exec' && p.dir === 'out')) {
                console.warn(`[Node] Force-injecting missing Exec Out for ${this.nodeKey}`);
                this.pins.push(new Pin(this, { id: "exec_out", name: "Exec", type: "exec", dir: "out" }));
            }
        } else if (this.nodeKey.startsWith('Set_')) {
            if (!this.pins.some(p => p.type === 'exec' && p.dir === 'in')) {
                console.warn(`[Node] Force-injecting missing Exec In for ${this.nodeKey}`);
                this.pins.unshift(new Pin(this, { id: "exec_in", name: "Exec", type: "exec", dir: "in" }));
            }
            if (!this.pins.some(p => p.type === 'exec' && p.dir === 'out')) {
                console.warn(`[Node] Force-injecting missing Exec Out for ${this.nodeKey}`);
                this.pins.push(new Pin(this, { id: "exec_out", name: "Exec", type: "exec", dir: "out" }));
            }
        }

        this.refreshPinCache();

        this.pinLiterals = new Map();
        this.pins.forEach(p => {
            const literalValue = pinDataArray.find(pd => pd.id === p.id.replace(`${this.id}-`, ''))?.literalValue;
            this.pinLiterals.set(p.id, literalValue !== undefined ? literalValue : p.defaultValue);
        });
    }

    refreshPinCache() {
        if (!this.pins) this.pins = [];
        this.pinsIn = this.pins.filter(p => p.dir === 'in');
        this.pinsOut = this.pins.filter(p => p.dir === 'out');
    }

    findPinById(pinId) {
        // Try exact match first
        let pin = this.pins.find(p => p.id === pinId);
        if (pin) return pin;

        // Check sub-pins
        for (const p of this.pins) {
            if (p.isSplit && p.subPins) {
                const subPin = p.subPins.find(sp => sp.id === pinId);
                if (subPin) return subPin;
            }
        }

        // Try matching by local ID (suffix)
        return this.pins.find(p => p.id === `${this.id}-${pinId}`);
    }

    getHeaderColor() {
        if (this.variableType) {
            const c = Utils.getVariableHeaderColor(this.variableType);
            return {
                background: `linear-gradient(to bottom, ${c.start}, ${c.end})`,
                accent: c.start
            };
        }
        if (this.nodeKey === 'ConstructionScript') {
            return { background: 'linear-gradient(to bottom, #503010, #281808)', accent: '#FF8800' };
        }
        if (this.type === 'event-node') {
            return { background: 'linear-gradient(to bottom, var(--header-event-start), var(--header-event-end))', accent: '#FF2222' };
        }
        if (this.type === 'function-node') {
            return { background: 'linear-gradient(to bottom, var(--header-function-start), var(--header-function-end))', accent: '#44AAFF' };
        }
        if (this.type === 'pure-node') {
            return { background: 'linear-gradient(to bottom, #305030, #152815)', accent: '#66FF66' };
        }
        if (this.type === 'flow-node') {
            return { background: 'linear-gradient(to bottom, var(--header-flow-start), var(--header-flow-end))', accent: '#AAAAAA' };
        }
        if (this.type === 'assessment-node') {
            return { background: 'linear-gradient(to bottom, #402060, #201030)', accent: '#AA55FF' };
        }
        // Default
        return { background: 'linear-gradient(to bottom, #333, #111)', accent: '#888' };
    }

    render() {
        if (!this.nodeKey) {
            console.error(`Node ${this.id} missing nodeKey.`);
            this.nodeKey = 'INVALID_NODE';
        }

        if (this.nodeKey === 'EventBeginPlay') {
            console.log('Rendering EventBeginPlay', this.id, 'Type:', this.type);
            console.log('PinsIn:', this.pinsIn ? this.pinsIn.length : 'undefined');
            console.log('PinsOut:', this.pinsOut ? this.pinsOut.length : 'undefined');
            const inLen = this.pinsIn ? this.pinsIn.length : 0;
            const outLen = this.pinsOut ? this.pinsOut.length : 0;
            console.log('MaxRows:', Math.max(inLen, outLen));
        }

        // Check for Compact Nodes (Getters, Converters, Math Operators)
        const isMathOperator = /^(Add|Subtract|Multiply|Divide|Greater|Less|Equal|NotEqual|AND|OR|NOT)/.test(this.nodeKey);
        if (this.nodeKey.startsWith('Get_') || this.nodeKey.startsWith('Conv_') || this.nodeKey.startsWith('GetComponent_') || isMathOperator) {
            return this.renderCompactNode();
        }
        if (this.nodeKey.startsWith('Set_') || this.nodeKey.startsWith('SetComponent_')) {
            return this.renderSetNode();
        }

        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node ${this.type}`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const header = document.createElement('div');
        header.className = 'node-title';

        const style = this.getHeaderColor();
        header.style.background = style.background;
        header.style.setProperty('--node-accent-color', style.accent);
        header.style.borderBottomColor = 'rgba(0,0,0,0.5)';

        if (this.icon) {
            const iconEl = document.createElement('span');
            if (this.icon.startsWith('fa-')) {
                iconEl.className = `fas ${this.icon}`;
            } else if (this.type === 'function-node' && this.icon === 'f') {
                iconEl.style.fontWeight = 'bold';
                iconEl.style.fontStyle = 'italic';
                iconEl.style.color = 'white';
                iconEl.textContent = 'f';
            } else {
                iconEl.textContent = this.icon;
            }
            header.appendChild(iconEl);
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = this.title;
        header.appendChild(titleSpan);

        if (this.type === 'event-node') {
            const delegateIcon = document.createElement('div');
            delegateIcon.className = 'event-delegate-icon';
            delegateIcon.title = "Output Delegate";
            header.appendChild(delegateIcon);
        }

        if (this.type === 'comment-node' || this.nodeKey === 'CustomEvent') {
            header.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                header.contentEditable = true;
                header.focus();
                document.execCommand('selectAll', false, null);
                header.classList.add('editing-title');
            });

            const finishEditing = () => {
                header.contentEditable = false;
                this.title = header.textContent;
                header.classList.remove('editing-title');
                if (this.app.details && this.app.graph.selectedNodes.has(this.id)) {
                    if (this.nodeKey === 'CustomEvent') {
                        this.app.details.showNodeDetails(this);
                    }
                }
                this.app.persistence.autoSave();
            };

            header.addEventListener('blur', finishEditing);
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    header.blur();
                }
            });
            header.addEventListener('mousedown', (e) => {
                if (header.isContentEditable) {
                    e.stopPropagation();
                }
            });
        }

        // NeedNode double-click to open configuration modal
        if (this.nodeKey === 'NeedNode') {
            header.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                if (this.app.needNodeModal) {
                    this.app.needNodeModal.open(this);
                }
            });
        }

        element.appendChild(header);

        const content = document.createElement('div');
        content.className = 'node-content';

        if (this.type === 'pure-node') {
            content.classList.add('pure-node-content');
            const inCol = document.createElement('div');
            inCol.className = 'pin-column in';
            this.pinsIn.forEach(pinIn => inCol.appendChild(this.renderPin(pinIn)));
            content.appendChild(inCol);

            const outCol = document.createElement('div');
            outCol.className = 'pin-column out';
            this.pinsOut.forEach(pinOut => outCol.appendChild(this.renderPin(pinOut)));
            content.appendChild(outCol);
        } else {
            // SAFEGUARD: Ensure pins arrays exist and have length before checking
            const inLen = this.pinsIn ? this.pinsIn.length : 0;
            const outLen = this.pinsOut ? this.pinsOut.length : 0;
            const maxRows = Math.max(inLen, outLen);

            for (let i = 0; i < maxRows; i++) {
                const row = document.createElement('div');
                row.className = 'pin-row';

                const pinIn = this.pinsIn[i];
                const pinOut = this.pinsOut[i];

                if (pinIn) {
                    row.appendChild(this.renderPin(pinIn));
                } else {
                    const spacer = document.createElement('div');
                    spacer.style.minWidth = '10px';
                    spacer.style.flexGrow = '1'; // Force push to right
                    row.appendChild(spacer);
                }

                if (pinOut) {
                    row.appendChild(this.renderPin(pinOut));
                }
                content.appendChild(row);
            }
        }

        // NeedNode Visualization: Show criteria checklist
        if (this.nodeKey === 'NeedNode' && this.customData && this.customData.needNodeData) {
            const needData = this.customData.needNodeData;
            if (!needData.hidden && needData.criteria && needData.criteria.length > 0) {
                const criteriaContainer = document.createElement('div');
                criteriaContainer.className = 'need-node-criteria';
                criteriaContainer.style.cssText = 'padding: 8px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px;';

                needData.criteria.forEach(c => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display: flex; gap: 6px; margin-bottom: 4px; align-items: center; color: #ccc;';

                    // Status icon (updated by simulation)
                    const icon = document.createElement('span');
                    icon.textContent = c.passed ? '✅' : '⬜'; // Checkmark or empty box

                    const text = document.createElement('span');
                    text.textContent = c.description;

                    row.appendChild(icon);
                    row.appendChild(text);
                    criteriaContainer.appendChild(row);
                });

                content.appendChild(criteriaContainer);
            }
        }

        element.appendChild(content);
        this.element = element;
        return element;
    }

    renderSetNode() {

        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node ${this.type} set-node`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const header = document.createElement('div');
        header.className = 'node-title';
        if (this.variableType) {
            const gradient = Utils.getVariableHeaderColor(this.variableType);
            header.style.background = `linear-gradient(to bottom, ${gradient.start}, ${gradient.end})`;
            header.style.setProperty('--node-accent-color', gradient.start);
            header.style.borderBottomColor = 'rgba(0,0,0,0.5)';
        }

        const titleSpan = document.createElement('span');
        titleSpan.textContent = "SET";
        header.appendChild(titleSpan);
        element.appendChild(header);

        const content = document.createElement('div');
        content.className = 'node-content';

        // Defensive check: ensure pin arrays exist
        if (!this.pinsIn || !this.pinsOut) {
            this.refreshPinCache();
        }

        const execIn = this.pinsIn ? this.pinsIn.find(p => p.type === 'exec') : null;
        const execOut = this.pinsOut ? this.pinsOut.find(p => p.type === 'exec') : null;
        const execRow = document.createElement('div');
        execRow.className = 'pin-row';
        execRow.style.justifyContent = 'space-between';
        execRow.style.padding = '0 4px';

        if (execIn) execRow.appendChild(this.renderPin(execIn, true));
        else {
            const s = document.createElement('div');
            s.style.flexGrow = '1';
            execRow.appendChild(s);
        }

        if (execOut) execRow.appendChild(this.renderPin(execOut, true));
        else {
            const s = document.createElement('div');
            s.style.flexGrow = '1';
            execRow.appendChild(s);
        }
        content.appendChild(execRow);

        // 3. Variable Pins Row (Input on Left with Label, Output on Right)
        const pinIn = this.pinsIn ? this.pinsIn.find(p => p.type !== 'exec') : null;
        const pinOut = this.pinsOut ? this.pinsOut.find(p => p.type !== 'exec') : null;

        if (pinIn || pinOut) {
            const pinRow = document.createElement('div');
            pinRow.className = 'pin-wrapper';
            pinRow.style.display = 'flex';
            pinRow.style.justifyContent = 'space-between';
            pinRow.style.alignItems = 'center';
            pinRow.style.width = '100%';

            // Left side: Input pin + Label + Input widget
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';
            leftContainer.style.gap = '4px';
            leftContainer.style.flex = '1';

            if (pinIn) {
                leftContainer.appendChild(this.renderPin(pinIn, false)); // Show label and input
            }
            pinRow.appendChild(leftContainer);

            // Right side: Output pin only (no label)
            const rightContainer = document.createElement('div');
            rightContainer.style.display = 'flex';
            rightContainer.style.alignItems = 'center';

            if (pinOut) {
                rightContainer.appendChild(this.renderPin(pinOut, true)); // Hide label
            }
            pinRow.appendChild(rightContainer);

            content.appendChild(pinRow);
        }

        element.appendChild(content);
        this.element = element;
        return element;
    }

    renderCompactNode() {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node compact-node ${this.type}`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const container = document.createElement('div');
        container.className = 'compact-node-container';

        // Ensure pins are correctly cached before accessing
        if (!this.pinsIn || !this.pinsOut) {
            this.refreshPinCache();
        }

        // 1. Inputs Column
        if (this.pinsIn.length > 0) {
            const inputCol = document.createElement('div');
            inputCol.style.display = 'flex';
            inputCol.style.flexDirection = 'column';
            inputCol.style.gap = '2px';
            inputCol.style.marginRight = '6px';

            this.pinsIn.forEach(pinIn => {
                const pinEl = this.renderPin(pinIn);
                // Add compact styling if not split
                if (!pinIn.isSplit && !pinIn.isConnected()) {
                    const inputWidget = pinEl.querySelector('.node-literal-input, .ue5-checkbox');
                    if (inputWidget) {
                        inputWidget.classList.add('compact-input-widget');
                    }
                }
                const label = pinEl.querySelector('.pin-label-in');
                if (label) label.style.display = 'none';

                inputCol.appendChild(pinEl);
            });
            container.appendChild(inputCol);
        }

        // 2. Label
        const labelSpan = document.createElement('span');
        labelSpan.className = 'compact-node-label';

        // Map common math names to symbols
        const symbolMap = {
            'Add (Float)': '+', 'Add (Integer)': '+',
            'Subtract (Float)': '-', 'Subtract (Integer)': '-',
            'Multiply (Float)': '×', 'Multiply (Integer)': '×',
            'Divide (Float)': '÷', 'Divide (Integer)': '÷',
            'Greater': '>', 'Less': '<',
            'GreaterEqual': '>=', 'LessEqual': '<=',
            'EqualEqual': '==', 'NotEqual': '!=',
            'AND': 'AND', 'OR': 'OR', 'NOT': 'NOT'
        };

        if (symbolMap[this.title]) {
            labelSpan.textContent = symbolMap[this.title];
            labelSpan.style.fontSize = '16px';
            labelSpan.style.fontWeight = '800';
        } else if (this.nodeKey.startsWith('Get_')) {
            labelSpan.textContent = this.nodeKey.substring(4);
        } else if (this.nodeKey.startsWith('GetComponent_')) {
            labelSpan.textContent = this.title.replace('Get ', '');
        } else {
            labelSpan.textContent = this.title;
        }
        container.appendChild(labelSpan);

        // 3. Outputs Column
        if (this.pinsOut.length > 0) {
            const outputCol = document.createElement('div');
            outputCol.style.display = 'flex';
            outputCol.style.flexDirection = 'column';
            outputCol.style.gap = '2px';
            outputCol.style.marginLeft = '6px';

            this.pinsOut.forEach(pinOut => {
                const pinEl = this.renderPin(pinOut);
                const label = pinEl.querySelector('.pin-label-out');
                if (label) label.style.display = 'none';
                outputCol.appendChild(pinEl);
            });
            container.appendChild(outputCol);
        }

        element.appendChild(container);
        this.element = element;
        return element;
    }

        createPinDot(pin, forceHollow = false) {
        const typeClass = Utils.getPinTypeClass(pin.type);
        const pinColor = Utils.getPinColor(pin.type);
        const isConnected = pin.links.length > 0 && !forceHollow;

        // 1. EXECUTION PINS
        if (pin.type === 'exec') {
            const wrapper = document.createElement('div');
            wrapper.className = `pin-icon exec-pin ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
            wrapper.style.color = 'white';
            wrapper.title = `${pin.name} (${pin.type})`;
            wrapper.style.cursor = 'pointer';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 14 14');
            
            const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            wedge.setAttribute('d', 'M 1 1 L 10 1 L 13 7 L 10 13 L 1 13 Z');
            wedge.setAttribute('stroke-linejoin', 'round');
            
            svg.appendChild(wedge);
            wrapper.appendChild(svg);
            return wrapper;
        }

        // 2. CONTAINER PINS (Keep existing div-based icons)
        if (pin.containerType && pin.containerType !== 'single') {
            const pinDot = document.createElement('div');
            let dotClasses = `pin-dot ${typeClass}`;
            pinDot.className = dotClasses + (isConnected ? ' connected' : ' hollow');
            pinDot.title = `${pin.name} (${pin.type})`;
            pinDot.classList.add('container-pin');

            if (pin.containerType === 'array') {
                pinDot.classList.add('array-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-th';
                icon.style.fontSize = '8px';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'set') {
                pinDot.classList.add('set-pin');
                const icon = document.createElement('span');
                icon.textContent = '{}';
                icon.style.fontSize = '8px';
                icon.style.fontWeight = 'bold';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'map') {
                pinDot.classList.add('map-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-list-ul';
                icon.style.fontSize = '8px';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            }
            
            return pinDot;
        }

        // 3. DATA OUTPUT PINS (Circle + Arrow)
        if (pin.dir === 'out') {
            const wrapper = document.createElement('div');
            wrapper.className = `pin-icon data-pin-compound ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
            wrapper.style.color = pinColor;
            wrapper.title = `${pin.name} (${pin.type})`;
            wrapper.style.cursor = 'pointer';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 18 12');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'pin-circle');
            circle.setAttribute('cx', '6');
            circle.setAttribute('cy', '6');
            circle.setAttribute('r', '4.5');
            svg.appendChild(circle);

            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrow.setAttribute('class', 'pin-arrow');
            arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
            svg.appendChild(arrow);

            wrapper.appendChild(svg);
            return wrapper;
        }

                        // 4. DATA INPUT PINS (Circle + Arrow)
        const wrapper = document.createElement('div');
        wrapper.className = `pin-icon data-pin-compound ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
        wrapper.style.color = pinColor;
        wrapper.title = `${pin.name} (${pin.type})`;
        wrapper.style.cursor = 'pointer';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 18 12');

        // Circle (Left side)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'pin-circle');
        circle.setAttribute('cx', '6');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        svg.appendChild(circle);

        // Arrow (Right side, pointing right)
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('class', 'pin-arrow');
        arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
        svg.appendChild(arrow);

        wrapper.appendChild(svg);
        return wrapper;
    }

    renderPin(pin, hideLabel = false) {
        // Handle Split Pins
        if (pin.isSplit) {
            const splitGroup = document.createElement('div');
            splitGroup.className = 'pin-split-group';
            splitGroup.style.display = 'flex';
            splitGroup.style.flexDirection = 'column';
            splitGroup.style.alignItems = pin.dir === 'in' ? 'flex-start' : 'flex-end';

            if (pin.subPins) {
                pin.subPins.forEach(subPin => {
                    // Temporarily rename sub-pin for display to include parent name context
                    const originalName = subPin.name;
                    subPin.name = `${pin.name} ${subPin.name}`;

                    const subPinEl = this.renderPin(subPin, false);
                    subPin.name = originalName; // Restore name

                    subPinEl.classList.add('sub-pin');
                    // Add data attribute pointing to PARENT pin ID for context menu handling
                    subPinEl.dataset.parentPinId = pin.id;

                    splitGroup.appendChild(subPinEl);
                });
            }

            return splitGroup;
        }

        const pinContainer = document.createElement('div');
        const typeClass = Utils.getPinTypeClass(pin.type);
        const execClass = (pin.type === 'exec' && pin.dir === 'out') ? 'exec-pin-container' : '';
        pinContainer.className = `pin-container ${pin.dir} ${typeClass} ${execClass}`.trim();
        pinContainer.dataset.pinId = pin.id;

        const pinDot = this.createPinDot(pin);
        pin.element = pinDot;

        let effectiveHideLabel = hideLabel;
        // UE5 Style: Hide "Exec" labels, but keep descriptive exec labels like "Cast Failed"
        if (pin.type === 'exec' && (pin.name === 'Exec' || pin.name === 'Then')) {
            effectiveHideLabel = true;
        }

        const pinLabel = document.createElement('span');
        pinLabel.className = `pin-label-${pin.dir}`;
        pinLabel.textContent = pin.name;
        if (effectiveHideLabel) {
            pinLabel.style.display = 'none';
        }

        let inputWidget = null;
        const isDataPin = pin.type !== 'exec';
        const isConnected = pin.links.length > 0;

        if (pin.dir === 'in' && isDataPin && !isConnected) {
            inputWidget = this.createInputWidget(pin);
        }

        if (pin.dir === 'in') {
            pinContainer.appendChild(pinDot);
            if (inputWidget && inputWidget.classList.contains('ue-vector-widget')) {
                // Complex Layout: Label on top, Widget below
                pinContainer.classList.add('has-widget');
                
                const contentCol = document.createElement('div');
                contentCol.className = 'pin-content';
                
                if (!effectiveHideLabel) {
                    pinLabel.style.marginBottom = '2px';
                    contentCol.appendChild(pinLabel);
                }
                contentCol.appendChild(inputWidget);
                
                // Pin icon is already appended to pinContainer
                // We append contentCol after it
                pinContainer.appendChild(contentCol);
                
            } else {
                // Standard Layout: Horizontal
                const wrapper = document.createElement('div');
                wrapper.className = 'pin-wrapper';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '5px';

                if (!effectiveHideLabel) wrapper.appendChild(pinLabel);
                if (inputWidget) wrapper.appendChild(inputWidget);
                pinContainer.appendChild(wrapper);
            }
        } else {
            if (!effectiveHideLabel) {
                pinContainer.appendChild(pinLabel);
            }
            pinContainer.appendChild(pinDot);
        }
        return pinContainer;
    }

    createInputWidget(pin) {
        // COMPLEX WIDGETS (Vector, Rotator, Transform)
        if (['vector', 'rotator', 'transform'].includes(pin.type)) {
            const container = document.createElement('div');
            container.className = 'ue-vector-widget';
            
            const axes = ['X', 'Y', 'Z'];
            
            axes.forEach(axis => {
                const group = document.createElement('div');
                group.className = 'val-group';
                
                const label = document.createElement('span');
                label.className = 'val-label';
                label.textContent = axis;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'small-input';
                input.value = '0.0'; // Default
                
                input.addEventListener('mousedown', (e) => e.stopPropagation());
                input.addEventListener('focus', () => this.app.graph.isEditingLiteral = true);
                input.addEventListener('blur', () => this.app.graph.isEditingLiteral = false);
                
                group.appendChild(label);
                group.appendChild(input);
                container.appendChild(group);
            });
            
            return container;
        }

        // STANDARD WIDGETS
        let inputEl;
        const pinValue = this.pinLiterals.get(pin.id);
        const updateLiteral = (e) => {
            let newValue = e.target.value;
            if (['int', 'int64', 'byte'].includes(pin.type)) {
                newValue = parseInt(newValue) || PinDefaults.INT;
            } else if (pin.type === 'float') {
                newValue = parseFloat(newValue) || PinDefaults.FLOAT;
            } else if (pin.type === 'bool') {
                newValue = e.target.checked;
            }
            this.pinLiterals.set(pin.id, newValue);
            this.app.persistence.autoSave();
        };

        if (pin.type === 'bool') {
            inputEl = document.createElement('input');
            inputEl.type = 'checkbox';
            inputEl.className = 'ue5-checkbox';
            inputEl.checked = pinValue;
            inputEl.addEventListener('change', updateLiteral);
            inputEl.addEventListener('mousedown', (e) => e.stopPropagation());
        } else {
            inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.value = pinValue;
            inputEl.className = 'node-literal-input';
            const wideTypes = ['string', 'text', 'name'];
            inputEl.style.width = wideTypes.includes(pin.type) ? '80px' : '40px';
            inputEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
            inputEl.style.color = '#eee';
            inputEl.style.border = '1px solid transparent';
            inputEl.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
            inputEl.style.borderRadius = '2px';
            inputEl.style.marginLeft = '5px';
            inputEl.addEventListener('change', updateLiteral);
            inputEl.addEventListener('mousedown', (e) => e.stopPropagation());

            inputEl.addEventListener('focus', () => this.app.graph.isEditingLiteral = true);
            inputEl.addEventListener('blur', () => this.app.graph.isEditingLiteral = false);
        }
        return inputEl;
    }

    getPinsData() {
        return this.pins.map(p => this.serializePin(p));
    }

    serializePin(pin) {
        const data = {
            id: pin.id ? pin.id.replace(`${this.id}-`, '') : 'CORRUPTED',
            name: pin.name,
            type: pin.type,
            dir: pin.dir,
            containerType: pin.containerType,
            literalValue: this.pinLiterals.get(pin.id),
            isCustom: pin.isCustom,
            isSplit: pin.isSplit
        };

        // Recursively serialize sub-pins (for nested splits)
        if (pin.subPins && pin.subPins.length > 0) {
            data.subPins = pin.subPins.map(sp => this.serializePin(sp));
        } else {
            data.subPins = [];
        }

        return data;
    }
}

export { Node };
