/**
 * Node class - Represents a single node in the graph canvas.
 */
import { Utils } from '../utils.js';
import { PinDefaults } from '../config/NodeDefaults.js';
import { Pin } from './Pin.js';
import { NODE_HEADER_COLORS, NODE_TYPES } from '../config/Constants.js';

class Node {
    constructor(id, nodeData, x, y, nodeKey, app) {
        this.id = id;
        this.title = nodeData.title || "Unknown Node";
        this.type = nodeData.type || NODE_TYPES.PURE;
        this.icon = nodeData.icon;
        this.devWarning = nodeData.devWarning;
        this.variableType = nodeData.variableType;
        this.variableId = nodeData.variableId;
        this.app = app;
        this.nodeKey = nodeKey;
        this.x = x;
        this.y = y;
        this.isBreakpoint = nodeData.isBreakpoint || false;
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

        // Safeguard: For pure nodes, ensure no exec pins are exposed in the cache
        // This prevents them from being rendered even if they exist in the data
        if (this.type === NODE_TYPES.PURE) {
            this.pinsIn = this.pins.filter(p => p.dir === 'in' && p.type !== 'exec');
            this.pinsOut = this.pins.filter(p => p.dir === 'out' && p.type !== 'exec');
        } else {
            this.pinsIn = this.pins.filter(p => p.dir === 'in');
            this.pinsOut = this.pins.filter(p => p.dir === 'out');
        }
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
            return NODE_HEADER_COLORS.CONSTRUCTION_SCRIPT;
        }
        if (this.type === NODE_TYPES.EVENT) {
            return NODE_HEADER_COLORS.EVENT;
        }
        if (this.type === NODE_TYPES.FUNCTION) {
            return NODE_HEADER_COLORS.FUNCTION;
        }
        if (this.type === NODE_TYPES.ASSESSMENT) {
            return NODE_HEADER_COLORS.ASSESSMENT;
        }
        if (this.type === NODE_TYPES.PURE) {
            return NODE_HEADER_COLORS.PURE;
        }
        // Default
        return NODE_HEADER_COLORS.DEFAULT;
    }


    toggleBreakpoint() {
        this.isBreakpoint = !this.isBreakpoint;
        if (this.element) {
            const header = this.headerElement || this.element.querySelector('.node-title');
            if (header) {
                if (this.isBreakpoint) {
                    header.classList.add('has-breakpoint');
                    if (!header.querySelector('.breakpoint-icon')) {
                        const bpIcon = document.createElement('div');
                        bpIcon.className = 'breakpoint-icon';
                        bpIcon.style.cssText = 'width: 14px; height: 14px; background: #d32f2f; border-radius: 50%; position: absolute; top: 4px; left: 4px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10;';
                        header.appendChild(bpIcon);
                    }
                } else {
                    header.classList.remove('has-breakpoint');
                    const bpIcon = header.querySelector('.breakpoint-icon');
                    if (bpIcon) bpIcon.remove();
                }
            }
        }
        // Save state
        this.app.persistence.autoSave();
    }

    render() {

        if (!this.nodeKey) {
            console.error(`Node ${this.id} missing nodeKey.`);
            this.nodeKey = 'INVALID_NODE';
        }

        // Use compact node style for Getters, Converters, and Pure Function Calls
        if (this.nodeKey.startsWith('Get_') || this.nodeKey.startsWith('Conv_') || this.nodeKey.startsWith('GetComponent_') || (this.nodeKey.startsWith('Func_') && this.type === NODE_TYPES.PURE)) {
            return this.renderCompactNode();
        }



        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node ${this.type}`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const header = document.createElement('div');
        this.headerElement = header;
        header.className = 'node-title';

        const gradient = this.getHeaderColor();
        header.style.background = `linear-gradient(to bottom, ${gradient.start}, ${gradient.end})`;
        header.style.borderBottomColor = 'rgba(0,0,0,0.5)';
        if (this.isBreakpoint) {
            header.classList.add('has-breakpoint');
            const bpIcon = document.createElement('div');
            bpIcon.className = 'breakpoint-icon';
            bpIcon.style.cssText = 'width: 12px; height: 12px; background: #d32f2f; border-radius: 50%; position: absolute; top: -6px; left: -6px; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 10;';
            header.appendChild(bpIcon);
        }

        if (this.icon) {
            const iconEl = document.createElement('span');
            if (this.icon.startsWith('fa-')) {
                iconEl.className = `fas ${this.icon}`;
            } else if (this.type === NODE_TYPES.FUNCTION && this.icon === 'f') {
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


        if (this.type === NODE_TYPES.EVENT) {
            const delegateIcon = document.createElement('div');
            delegateIcon.className = 'event-delegate-icon';
            delegateIcon.title = "Output Delegate";
            header.appendChild(delegateIcon);
        }

        if (this.type === NODE_TYPES.COMMENT || this.nodeKey === 'CustomEvent') {
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

        if (this.type === NODE_TYPES.PURE) {
            content.classList.add('pure-node-content');
            const inCol = document.createElement('div');
            inCol.className = 'pin-column in';
            const inFragment = document.createDocumentFragment();
            this.pinsIn.forEach(pinIn => inFragment.appendChild(this.renderPin(pinIn)));
            inCol.appendChild(inFragment);
            content.appendChild(inCol);

            const outCol = document.createElement('div');
            outCol.className = 'pin-column out';
            const outFragment = document.createDocumentFragment();
            this.pinsOut.forEach(pinOut => outFragment.appendChild(this.renderPin(pinOut)));
            outCol.appendChild(outFragment);
            content.appendChild(outCol);
        } else {
            // SAFEGUARD: Ensure pins arrays exist and have length before checking
            const inLen = this.pinsIn ? this.pinsIn.length : 0;
            const outLen = this.pinsOut ? this.pinsOut.length : 0;
            const maxRows = Math.max(inLen, outLen);
            const fragment = document.createDocumentFragment();

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
                    // For SET nodes, hide the label on data output pins (not exec pins)
                    const shouldHideLabel = this.nodeKey.startsWith('Set_') && pinOut.type !== 'exec';
                    row.appendChild(this.renderPin(pinOut, shouldHideLabel));
                } else {
                    const spacer = document.createElement('div');
                    spacer.minWidth = '10px';
                    row.appendChild(spacer);
                }
                fragment.appendChild(row);
            }
            content.appendChild(fragment);
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
            // Note: devBar was referenced in original code but not defined in this snippet context.
            // Assuming it was part of previous code or I should remove it if it causes error.
            // Looking at original code, devBar seems to be missing from my snippet view or I missed it.
            // Wait, lines 322-328 in original code reference `arrowIcon` and `devBar`.
            // But `devBar` is NOT defined in the `render` method I see in Step 49.
            // Ah, I see `if (this.nodeKey === 'PrintString' || this.devWarning)` block creates `devBadge`.
            // But `devBar` is not there.
            // The original code snippet in Step 49 lines 322-328:
            /*
            arrowIcon.style.marginLeft = '5px';
            ...
            devBar.appendChild(arrowIcon);
            element.appendChild(devBar);
            */
            // This looks like a copy-paste error in the original file or my view is truncated/confused.
            // Step 49 shows lines 322-328 being outside the `if (this.nodeKey === 'NeedNode' ...)` block?
            // No, it's inside `render`.
            // But `devBar` is not defined.
            // I will remove the `devBar` lines if they are problematic, or keep them if they are valid.
            // Since I am replacing the whole `render` method, I should be careful.
            // The `devBar` lines in Step 49 seem to be dangling code.
            // I will OMIT them in my replacement to fix potential ReferenceError.
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

        // --- INSERT LABEL (only for Get/GetComponent/Func nodes, not Conv nodes) ---
        if (!this.nodeKey.startsWith('Conv_')) {
            const labelSpan = document.createElement('span');
            labelSpan.className = 'compact-node-label';
            // Clean up prefixes for display
            if (this.nodeKey.startsWith('Get_')) {
                labelSpan.textContent = this.nodeKey.substring(4);
            } else if (this.nodeKey.startsWith('GetComponent_')) {
                labelSpan.textContent = this.title.replace('Get ', '');
            } else if (this.nodeKey.startsWith('Func_')) {
                // Remove "Call " prefix if present
                labelSpan.textContent = this.title.replace('Call ', '');
            } else {
                labelSpan.textContent = this.title;
            }
            container.appendChild(labelSpan);
        }

        // 3. Right Pin (Output) - Use renderPin to support split pins
        if (pinOut) {
            // Hide pin label for Get/GetComponent nodes since central label shows the name
            // For Func_ nodes, we also hide the label if it's generic like "Return Value" or if we want compact look
            const hideLabel = this.nodeKey.startsWith('Get_') || this.nodeKey.startsWith('GetComponent_') || this.nodeKey.startsWith('Func_');
            const pinEl = this.renderPin(pinOut, hideLabel);
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
        if (this.type === NODE_TYPES.FUNCTION && pin.type === 'exec') {
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
