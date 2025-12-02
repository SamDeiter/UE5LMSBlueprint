/**
 * Node class - Represents a single node in the graph canvas.
 */
import { Utils } from '../utils.js';
import { PinDefaults } from '../config/NodeDefaults.js';
import { Pin } from './Pin.js';

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

        const pinDataArray = nodeData.pins || [];
        this.pins = pinDataArray.map(p => new Pin(this, p));
        this.refreshPinCache();

        this.pinLiterals = new Map();
        this.pins.forEach(p => {
            // Use the pin's default value or the loaded default value if present.
            // When loading, pinData.defaultValue holds the literal value saved.
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
            return Utils.getVariableHeaderColor(this.variableType);
        }
        if (this.nodeKey === 'ConstructionScript') {
            return { start: '#B54E05', end: '#8A3B04' };
        }
        if (this.type === 'event-node') {
            return { start: '#8B0000', end: '#400000' }; // Red
        }
        if (this.type === 'function-node') {
            return { start: '#005580', end: '#002a40' }; // Blue
        }
        if (this.type === 'assessment-node') {
            return { start: '#6030a0', end: '#301560' }; // Purple
        }
        // Default
        return { start: '#333', end: '#111' };
    }

    render() {

        if (!this.nodeKey) {
            console.error(`Node ${this.id} missing nodeKey.`);
            this.nodeKey = 'INVALID_NODE';
        }

        if (this.nodeKey.startsWith('Get_') || this.nodeKey.startsWith('Conv_') || this.nodeKey.startsWith('GetComponent_')) {
            return this.renderCompactNode();
        }



        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node ${this.type}`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const header = document.createElement('div');
        header.className = 'node-title';

        const gradient = this.getHeaderColor();
        header.style.background = `linear-gradient(to bottom, ${gradient.start}, ${gradient.end})`;
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
        if (this.nodeKey.startsWith('Set_') || this.nodeKey.startsWith('SetComponent_')) {
            titleSpan.textContent = "SET";
        } else {
            titleSpan.textContent = this.title;
        }
        header.appendChild(titleSpan);
        if (this.nodeKey === 'PrintString' || this.devWarning) {
            const devBadge = document.createElement('span');
            devBadge.className = 'dev-badge';
            devBadge.textContent = 'Development Only';
            devBadge.style.cssText = 'font-size: 8px; color: #aaa; margin-left: auto; padding-right: 4px; font-style: italic;';
            header.appendChild(devBadge);
        }


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
                    row.appendChild(spacer);
                }

                if (pinOut) {
                    row.appendChild(this.renderPin(pinOut));
                } else {
                    const spacer = document.createElement('div');
                    spacer.minWidth = '10px';
                    row.appendChild(spacer);
                }
                content.appendChild(row);
            }
        }

        element.appendChild(content);



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
            arrowIcon.style.marginLeft = '5px';
            arrowIcon.style.fontSize = '8px';
            arrowIcon.style.color = 'rgba(255,255,255,0.7)';
            arrowIcon.style.position = 'relative';
            arrowIcon.style.zIndex = '2';
            devBar.appendChild(arrowIcon);
            element.appendChild(devBar);
        }

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

        const pinIn = this.pinsIn[0];
        const pinOut = this.pinsOut[0];

        // 1. Left Pin (Input) - Use renderPin to support split pins
        if (pinIn) {
            const pinEl = this.renderPin(pinIn);
            // Add compact styling if not split
            if (!pinIn.isSplit && !pinIn.isConnected()) {
                const inputWidget = pinEl.querySelector('.node-literal-input, .ue5-checkbox');
                if (inputWidget) {
                    inputWidget.classList.add('compact-input-widget');
                }
            }
            container.appendChild(pinEl);
        }

        // --- INSERT LABEL ---
        const labelSpan = document.createElement('span');
        labelSpan.className = 'compact-node-label';
        // Clean up "Get_" prefix for display to match standard UI
        if (this.nodeKey.startsWith('Get_')) {
            labelSpan.textContent = this.nodeKey.substring(4);
        } else if (this.nodeKey.startsWith('GetComponent_')) {
            labelSpan.textContent = this.title.replace('Get ', '');
        } else {
            labelSpan.textContent = this.title;
        }
        container.appendChild(labelSpan);

        // 3. Right Pin (Output) - Use renderPin to support split pins
        if (pinOut) {
            const pinEl = this.renderPin(pinOut);
            container.appendChild(pinEl);
        }

        element.appendChild(container);
        this.element = element;
        return element;
    }

    createPinDot(pin, forceHollow = false) {
        const typeClass = Utils.getPinTypeClass(pin.type);
        const pinDot = document.createElement('div');
        let dotClasses = `pin-dot ${typeClass}`;
        const isConnected = pin.links.length > 0;
        if (forceHollow || !isConnected) {
            dotClasses += ' hollow';
        }
        pinDot.className = dotClasses;
        pinDot.title = `${pin.name} (${pin.type})`;

        // Handle container types with proper icons
        // Only add container styling if it's not a single value
        if (pin.containerType && pin.containerType !== 'single') {
            pinDot.classList.add('container-pin'); // Remove default circle styling

            if (pin.containerType === 'array') {
                pinDot.classList.add('array-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-th';
                icon.style.fontSize = '8px';
                icon.style.color = Utils.getPinColor(pin.type);
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'set') {
                pinDot.classList.add('set-pin');
                const icon = document.createElement('span');
                icon.textContent = '{}';
                icon.style.fontSize = '8px';
                icon.style.fontWeight = 'bold';
                icon.style.color = Utils.getPinColor(pin.type);
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'map') {
                pinDot.classList.add('map-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-list-ul';
                icon.style.fontSize = '8px';
                icon.style.color = Utils.getPinColor(pin.type);
                pinDot.appendChild(icon);
            }
        }

        return pinDot;
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
        pinContainer.className = `pin-container ${pin.dir} ${typeClass}`;
        pinContainer.dataset.pinId = pin.id;

        const pinDot = this.createPinDot(pin);
        pin.element = pinDot;

        let effectiveHideLabel = hideLabel;
        if (this.type === 'function-node' && pin.type === 'exec') {
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
            const wrapper = document.createElement('div');
            wrapper.className = 'pin-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.gap = '5px';

            if (!effectiveHideLabel) wrapper.appendChild(pinLabel);
            if (inputWidget) wrapper.appendChild(inputWidget);
            pinContainer.appendChild(wrapper);
        } else {
            if (!effectiveHideLabel) pinContainer.appendChild(pinLabel);
            pinContainer.appendChild(pinDot);
        }
        return pinContainer;
    }

    createInputWidget(pin) {
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
            inputEl.style.backgroundColor = '#111';
            inputEl.style.color = 'white';
            inputEl.style.border = '1px solid #444';
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
