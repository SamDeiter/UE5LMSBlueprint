/**
 * ActionMenu - Handles the right-click action menu
 */
import { Utils } from '../utils.js';
import { nodeRegistry } from '../registries/NodeRegistry.js';
import { Pin } from '../graph/index.js';
import { buildCategoryTree, renderCategoryTree } from './ui-helpers.js';

export class ActionMenu {
    constructor(app) {
        this.app = app;
        this.element = document.getElementById('action-menu');
        this.searchInput = document.getElementById('action-menu-search');
        this.list = document.getElementById('action-menu-list');
        this.graphPos = { x: 0, y: 0 };
        this.sourcePin = null;
        this.droppedVarName = null;
        this.isContextSensitive = true;
        this.isHideDelayActive = false;
        this.element.addEventListener('click', e => e.stopPropagation());
        this.searchInput.addEventListener('input', this.filter.bind(this));

        // Handle Enter key to select first item
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.selectFirstItem();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.isHideDelayActive) {
                if (!this.element.classList.contains('hidden') && !this.element.contains(e.target)) {
                    this.hide();
                }
            }
        });
    }

    selectFirstItem() {
        // Find the first executable menu item (not a header)
        // We look for .menu-item that doesn't have header classes
        const items = this.list.querySelectorAll('.menu-item');
        for (const item of items) {
            if (item.classList.contains('menu-header') || item.classList.contains('menu-header-toggle')) {
                continue;
            }
            // Check if it's visible (part of an expanded category or top level)
            // For now, we assume if it's in the DOM and not a header, it's a valid target
            // But we should check if it's effectively visible if inside a collapsed section?
            // renderCategoryTree hides content divs.
            // checking offsetParent is a common way to check visibility
            if (item.offsetParent !== null) {
                item.click();
                return;
            }
        }
    }
    show(clientX, clientY, sourcePin = null, droppedVarName = null, droppedComponent = null) {
        this.element.classList.add('hidden');
        this.element.classList.remove('visible');
        this.graphPos = this.app.graph.getGraphCoords(clientX, clientY);
        this.sourcePin = sourcePin;
        this.droppedVarName = droppedVarName;
        this.droppedComponent = droppedComponent;
        this.app.contextMenu.hide();
        this.isHideDelayActive = true;
        setTimeout(() => {
            this.isHideDelayActive = false;
        }, 100);
        this.element.classList.remove('hidden');
        this.element.classList.add('visible');
        this.element.style.left = `${clientX}px`; // Dynamic position
        this.element.style.top = `${clientY}px`; // Dynamic position
        this.searchInput.value = '';
        if (droppedVarName || droppedComponent) {
            this.searchInput.classList.add('hidden');
        } else {
            this.searchInput.classList.remove('hidden');
        }
        this.populateList();
        this.searchInput.focus();

        // Keep ghost wire visible when showing menu with a sourcePin
        if (sourcePin) {
            const fakeEvent = { clientX, clientY };
            this.app.wiring.updateGhostWire(fakeEvent, sourcePin);
        }
    }
    showVariableAccess(filter = '') {
        if (filter.length > 0) { return false; }
        const varAccessContainer = document.createElement('div');
        varAccessContainer.className = 'variable-access-group';
        const rootHeader = document.createElement('div');
        rootHeader.className = 'menu-item menu-header-toggle';
        rootHeader.classList.add("text-bold"); // Replaced inline style
        rootHeader.classList.add("d-flex"); // Replaced inline style
        rootHeader.classList.add("align-center"); // Replaced inline style
        rootHeader.classList.add("pl-2"); // Replaced inline style (8px)
        const rootIcon = document.createElement('i');
        rootIcon.className = 'fas fa-caret-right';
        rootIcon.style.marginRight = '5px';
        rootHeader.appendChild(rootIcon);
        rootHeader.appendChild(document.createTextNode('Variables'));
        varAccessContainer.appendChild(rootHeader);
        const variableGroupsContainer = document.createElement('div');
        variableGroupsContainer.style.display = 'none';
        varAccessContainer.appendChild(variableGroupsContainer);
        const subHeader = document.createElement('div');
        subHeader.className = 'menu-item menu-header-toggle';
        subHeader.style.fontWeight = 'bold';
        subHeader.style.color = '#ccc';
        subHeader.style.display = 'flex';
        subHeader.style.alignItems = 'center';
        subHeader.style.paddingLeft = '20px';
        const subIcon = document.createElement('i');
        subIcon.className = 'fas fa-caret-right';
        subIcon.classList.add("mr-1"); // Replaced inline style (4px≈5px)
        subHeader.appendChild(subIcon);
        subHeader.appendChild(document.createTextNode('Default'));
        variableGroupsContainer.appendChild(subHeader);
        const itemsListContainer = document.createElement('div');
        itemsListContainer.style.display = 'none';
        variableGroupsContainer.appendChild(itemsListContainer);

        let hasRelevantVariables = false;
        if (this.app.variables && this.app.variables.variables) {
            for (const variable of this.app.variables.variables.values()) {
                const varName = variable.name;
                hasRelevantVariables = true;
                const color = Utils.getPinColor(variable.type);
                const pillStyle = `display:inline-block; width:8px; height:4px; background-color:${color}; border-radius:2px; margin-right:6px; vertical-align:middle;`;
                const paddingLeft = '35px';
                const varItemContainer = document.createElement('div');
                varItemContainer.style.marginBottom = '2px';

                const getItem = document.createElement('div');
                getItem.className = 'menu-item';
                getItem.innerHTML = `<span style="${pillStyle}"></span>Get ${varName}`;
                getItem.style.paddingLeft = paddingLeft;
                getItem.addEventListener('click', () => {
                    const nodeKey = `Get_${varName}`;
                    this.app.graph.addNode(nodeKey, this.graphPos.x, this.graphPos.y);
                    this.app.persistence.autoSave();
                    this.hide();
                });
                varItemContainer.appendChild(getItem);

                const setItem = document.createElement('div');
                setItem.className = 'menu-item';
                setItem.innerHTML = `<span style="${pillStyle}"></span>Set ${varName}`;
                setItem.style.paddingLeft = paddingLeft;
                setItem.addEventListener('click', () => {
                    const nodeKey = `Set_${varName}`;
                    this.app.graph.addNode(nodeKey, this.graphPos.x, this.graphPos.y);
                    this.app.persistence.autoSave();
                    this.hide();
                });
                varItemContainer.appendChild(setItem);
                itemsListContainer.appendChild(varItemContainer);
            }
        }

        rootHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = variableGroupsContainer.style.display === 'none';
            variableGroupsContainer.style.display = isCollapsed ? 'block' : 'none';
            rootIcon.className = isCollapsed ? 'fas fa-caret-down' : 'fas fa-caret-right';
            if (isCollapsed) subHeader.dispatchEvent(new Event('click'));
        });

        subHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = itemsListContainer.style.display === 'none';
            itemsListContainer.style.display = isCollapsed ? 'block' : 'none';
            subIcon.className = isCollapsed ? 'fas fa-caret-down' : 'fas fa-caret-right';
        });

        if (hasRelevantVariables) {
            this.list.appendChild(varAccessContainer);
            return true;
        }
        return false;
    }
    showPromoteOption(pin) {
        if (pin.node.nodeKey.startsWith('Get_') || pin.node.nodeKey.startsWith('Set_')) return;
        if (pin.isConnected()) return;
        const pinContextItem = document.createElement('div');
        pinContextItem.className = 'pin-context-item';
        const promoteItem = document.createElement('div');
        promoteItem.className = 'menu-item';
        promoteItem.textContent = `Promote to variable`;
        promoteItem.addEventListener('click', () => {
            this.app.graph.promotePinToVariable(pin);
            this.hide();
        });
        pinContextItem.appendChild(promoteItem);
        const separator = document.createElement('div');
        separator.className = 'menu-separator';
        pinContextItem.appendChild(separator);
        this.list.appendChild(pinContextItem);
    }
    hide() {
        this.element.classList.add('hidden');
        this.element.classList.remove('visible');

        // Clear sourcePin FIRST to avoid race condition in updateGhostWire
        const hadSourcePin = this.sourcePin !== null;
        this.sourcePin = null;
        this.droppedVarName = null;
        this.droppedComponent = null;

        // Clear activePin and hide ghost wire
        if (this.app.graph.activePin) {
            this.app.graph.activePin = null;
        }

        // Explicitly hide ghost wire if we had a sourcePin (wiring mode)
        if (hadSourcePin || this.app.wiring.ghostWire.style.display !== 'none') {
            this.app.wiring.ghostWire.style.display = 'none';
        }
    }
    filter() {
        this.populateList(this.searchInput.value.toLowerCase());
    }
    populateList(filter = '') {
        this.list.innerHTML = '';
        let contextHeader = false;
        if (this.sourcePin) {
            const header = document.createElement('div');
            header.className = 'action-header';
            const titleRow = document.createElement('div');
            titleRow.className = 'action-header-row';
            const pinColor = this.sourcePin.type === 'exec' ? 'var(--color-exec)' : Utils.getPinColor(this.sourcePin.type);
            const redDot = document.createElement('span');
            redDot.style.cssText = `display:inline-block; width:8px; height:8px; background-color:${pinColor}; border-radius:50%; margin-right:8px; border:1px solid black;`; // Dynamic: pin color styling
            const typeName = this.sourcePin.type.charAt(0).toUpperCase() + this.sourcePin.type.slice(1);
            const titleText = document.createElement('span');
            const titleTextContent = this.sourcePin.type === 'exec' ? 'Executable actions' : `Actions taking a(n) ${typeName}`;
            titleText.textContent = titleTextContent;
            titleText.classList.add("text-bold"); // Replaced inline style
            titleText.classList.add("text-light"); // Replaced inline style
            titleRow.appendChild(redDot);
            titleRow.appendChild(titleText);
            header.appendChild(titleRow);
            const contextRow = document.createElement('div');
            contextRow.className = 'action-header-row';
            contextRow.classList.add("justify-end"); // Replaced inline style
            contextRow.classList.add("text-sm"); // Replaced inline style (10px)
            contextRow.classList.add("text-light"); // Replaced inline style
            contextRow.style.marginTop = '4px';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'context-sensitive-check';
            checkbox.checked = this.isContextSensitive;
            checkbox.style.marginRight = '4px';
            const checkboxLabel = document.createTextNode('Context Sensitive');
            checkbox.addEventListener('change', (e) => {
                this.isContextSensitive = e.target.checked;
                this.populateList(this.searchInput.value.toLowerCase());
            });
            contextRow.appendChild(checkbox);
            contextRow.appendChild(checkboxLabel);
            header.appendChild(contextRow);
            this.list.appendChild(header);
            const sep = document.createElement('div');
            sep.className = 'menu-separator';
            this.list.appendChild(sep);
            const placeholder = document.createElement('div');
            placeholder.textContent = "Select a Component to see available Events & Functions";
            placeholder.style.padding = "4px 8px";
            placeholder.style.color = "#666";
            placeholder.style.fontStyle = "italic";
            placeholder.style.fontSize = "10px";
            this.list.appendChild(placeholder);
            const sep2 = document.createElement('div');
            sep2.className = 'menu-separator';
            this.list.appendChild(sep2);
            if (this.sourcePin.type !== 'exec') {
                this.showPromoteOption(this.sourcePin);
                const sep3 = document.createElement('div');
                sep3.className = 'menu-separator';
                this.list.appendChild(sep3);
            }
            contextHeader = true;
        }

        // --- DEBUG: Export Graph Option ---
        if (!this.sourcePin && !this.droppedVarName && !this.droppedComponent && filter === '') {
            const debugHeader = document.createElement('div');
            debugHeader.className = 'menu-item menu-header';
            debugHeader.style.fontWeight = 'bold';
            debugHeader.style.color = '#888';
            debugHeader.style.fontSize = '10px';
            debugHeader.textContent = 'Debug';
            this.list.appendChild(debugHeader);

            const exportItem = document.createElement('div');
            exportItem.className = 'menu-item';
            exportItem.style.paddingLeft = '20px';
            exportItem.textContent = 'Export Graph (JSON)';
            exportItem.addEventListener('click', () => {
                this.app.graph.exportGraph();
                this.hide();
            });
            this.list.appendChild(exportItem);

            const sep = document.createElement('div');
            sep.className = 'menu-separator';
            this.list.appendChild(sep);
        }
        // ----------------------------------

        // Add Break [Struct] suggestion for Vector/Rotator/Transform pins
        if (this.sourcePin && ['vector', 'rotator', 'transform'].includes(this.sourcePin.type)) {
            const breakNodeKey = this.sourcePin.type === 'vector' ? 'BreakVector' :
                this.sourcePin.type === 'rotator' ? 'BreakRotator' : 'BreakTransform';

            const breakNodeData = nodeRegistry.get(breakNodeKey);
            if (breakNodeData) {
                const suggestionHeader = document.createElement('div');
                suggestionHeader.className = 'menu-item menu-header';
                suggestionHeader.style.fontWeight = 'bold';
                suggestionHeader.style.color = '#4CAF50';
                suggestionHeader.style.fontSize = '10px';
                suggestionHeader.textContent = 'Suggested';
                this.list.appendChild(suggestionHeader);

                const breakItem = document.createElement('div');
                breakItem.className = 'menu-item';
                breakItem.style.paddingLeft = '20px';
                breakItem.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                breakItem.textContent = breakNodeData.title || breakNodeKey;
                breakItem.addEventListener('click', () => {
                    const newNode = this.app.graph.addNode(breakNodeKey, this.graphPos.x, this.graphPos.y);
                    if (newNode) {
                        const targetPin = newNode.pins.find(p => this.app.graph.canConnect(this.sourcePin, p));
                        if (targetPin) {
                            this.app.wiring.createConnection(this.sourcePin, targetPin);
                        }
                    }
                    this.app.persistence.autoSave();
                    this.hide();
                });
                this.list.appendChild(breakItem);

                const sep = document.createElement('div');
                sep.className = 'menu-separator';
                this.list.appendChild(sep);
            }
        }
        const isGeneralClick = !this.sourcePin && !this.droppedVarName && !this.droppedComponent;

        // Removed special top-level variable access to let them sort naturally in the list
        // const hasVariableAccess = isGeneralClick && filter.length === 0 ? this.showVariableAccess(filter) : false;
        const hasVariableAccess = false;

        if (this.droppedVarName) {
            this.showVariableDropOptions(this.droppedVarName);
            return;
        }
        if (this.droppedComponent) {
            this.showComponentDropOptions(this.droppedComponent);
            return;
        }

        // --- DYNAMIC: Add Custom Events from the Graph ---
        // We want to allow calling any Custom Event that exists in the graph.
        const customEventItems = [];
        if (this.app.graph && this.app.graph.nodes) {
            for (const node of this.app.graph.nodes.values()) {
                if (node.nodeKey === 'CustomEvent') {
                    const eventName = node.title;
                    // Filter check
                    if (filter && !`call ${eventName}`.toLowerCase().includes(filter.toLowerCase())) {
                        continue;
                    }

                    // Create a virtual menu item for calling this event
                    customEventItems.push({
                        name: `Call ${eventName}`,
                        category: 'Custom Events',
                        isCustomEventCall: true,
                        eventName: eventName
                    });
                }
            }
        }
        // ------------------------------------------------

        let needsSeparatorBeforeNodes = hasVariableAccess || contextHeader;
        const nodeNames = Object.keys(nodeRegistry.getAll());
        let filtered = nodeNames.filter(name => {
            // Allow variable nodes to appear in the main list
            // const isVariableNode = name.startsWith('Get_');
            const nodeData = nodeRegistry.get(name);
            const title = nodeData.title || name;
            const matchesFilter = title.toLowerCase().includes(filter) || name.toLowerCase().includes(filter);
            // if (isVariableNode) return false;
            if (this.sourcePin) {
                if (!matchesFilter) return false;
                if (this.isContextSensitive) {
                    if (nodeData.pins && nodeData.pins.length > 0) {
                        const tempNode = { id: 'temp-action-menu-node', app: this.app };
                        const isConnectable = nodeData.pins.some(p => {
                            if (!p.type || !p.dir) return false;
                            const actualTempPin = new Pin(tempNode, p);
                            return this.app.graph.canConnect(this.sourcePin, actualTempPin);
                        });
                        return isConnectable;
                    }
                    return false;
                }
                return true;
            }
            return matchesFilter;
        });

        // Merge Custom Events into the filtered list (we'll handle them in createMenuItem)
        // We can't just push strings to 'filtered' because our custom items are objects.
        // So we'll need to handle them separately or adapt the tree builder.
        // Easier approach: Add them to the tree builder as objects.

        // 2. Build Tree using shared helper
        // We combine standard node names (strings) and our custom event objects
        const allItems = [...customEventItems, ...filtered];

        const root = buildCategoryTree(allItems, (item) => {
            if (typeof item === 'string') {
                return nodeRegistry.get(item).category || '';
            } else {
                return item.category;
            }
        });

        if (filtered.length > 0 && needsSeparatorBeforeNodes) {
            const sep = document.createElement('div');
            sep.className = 'menu-separator';
            this.list.appendChild(sep);
        }

        const createMenuItem = (item) => {
            // Handle Custom Event Call Items
            if (typeof item === 'object' && item.isCustomEventCall) {
                const li = document.createElement('div');
                li.className = 'menu-item';
                li.textContent = item.name; // "Call MyEvent"
                li.style.paddingLeft = '20px';
                li.addEventListener('click', () => {
                    // Add a CallFunction node
                    // We use a special nodeKey or just 'CallFunction' and configure it
                    // Since we don't have a generic 'CallFunction' node in registry yet that takes a name dynamically
                    // (CallFunction usually expects Func_Name), we might need to use a dynamic key or add a generic one.
                    // Let's assume we can add a 'CallFunction' node and set its function name.
                    // OR, we construct a dynamic key like 'Func_MyEvent' if we want to reuse that logic, 
                    // but CustomEvents aren't in FunctionRegistry.

                    // Better approach: Add a specific 'CallCustomEvent' node type?
                    // Or reuse 'CallFunction' but handle the lookup differently.
                    // For now, let's try adding a node with a special key format that GraphController recognizes.
                    // But GraphController.addNode expects a registry entry.

                    // Let's register a temporary definition or use a generic 'CallCustomEvent' node.
                    // If 'CallCustomEvent' doesn't exist, we can create it on the fly or use 'CallFunction'.

                    // Let's use a trick: Add a node with key 'CallCustomEvent' and pass custom data.
                    // But addNode signature is (key, x, y).

                    // Workaround: We'll add a 'CallCustomEvent' node (assuming it exists or we make it)
                    // and then immediately configure it.
                    // If 'CallCustomEvent' isn't in registry, we need to add it or use a known one.
                    // 'FunctionEntry' is known. 'CallFunction' is known?

                    // Let's assume we can add a node 'CallCustomEvent' and we'll ensure it's in registry or handled.
                    // Actually, let's use the same pattern as Functions: 'Func_EventName'
                    // But the event isn't in function registry.

                    // Let's try adding a generic 'CallCustomEvent' node.
                    // I'll need to ensure this node type exists in NodeDefinitions or is handled dynamically.
                    // For now, I'll add the node and set its title/customData.

                    const newNode = this.app.graph.addNode('CallCustomEvent', this.graphPos.x, this.graphPos.y);
                    if (newNode) {
                        newNode.title = item.name;
                        newNode.customData = { eventName: item.eventName };

                        // Force visual update of the title
                        if (newNode.element) {
                            const titleEl = newNode.element.querySelector('.node-title span:last-child');
                            if (titleEl) {
                                titleEl.textContent = newNode.title;
                            }
                            // Also update compact label if applicable
                            const compactLabel = newNode.element.querySelector('.compact-node-label');
                            if (compactLabel) {
                                compactLabel.textContent = newNode.title.replace('Call ', '');
                            }
                        }
                        // We might need to manually add pins since the registry entry is generic
                        // Exec In, Exec Out
                        // If the custom event has inputs, we should mirror them as inputs here.

                        // Find the source CustomEvent node to get its pins
                        const sourceNode = [...this.app.graph.nodes.values()].find(n => n.title === item.eventName && n.nodeKey === 'CustomEvent');
                        if (sourceNode) {
                            // Mirror pins: Output data pins of Event become Input data pins of Call
                            sourceNode.pins.forEach(p => {
                                if (p.type !== 'exec' && p.type !== 'delegate') {
                                    // Event outputs become Call inputs
                                    if (p.dir === 'out') {
                                        newNode.addPin({
                                            id: `in_${p.name}`,
                                            name: p.name,
                                            type: p.type,
                                            dir: 'in'
                                        });
                                    }
                                }
                            });
                        }

                        if (this.sourcePin) {
                            const targetPin = newNode.pins.find(p => this.app.graph.canConnect(this.sourcePin, p));
                            if (targetPin) {
                                this.app.wiring.createConnection(this.sourcePin, targetPin);
                            }
                        }
                    }
                    this.app.persistence.autoSave();
                    this.hide();
                });
                return li;
            }

            const name = item; // It's a string key
            const nodeData = nodeRegistry.get(name);
            const li = document.createElement('div');
            li.className = 'menu-item';

            const title = nodeData.title || name;

            // Highlight matching text if there's a filter
            if (filter && filter.length > 0) {
                const lowerTitle = title.toLowerCase();
                const lowerFilter = filter.toLowerCase();
                const index = lowerTitle.indexOf(lowerFilter);

                if (index !== -1) {
                    // Split the title into parts: before match, match, after match
                    const before = title.substring(0, index);
                    const match = title.substring(index, index + filter.length);
                    const after = title.substring(index + filter.length);

                    li.innerHTML = `${before}<span style="background-color: #4CAF50; color: #000; font-weight: bold; padding: 0 2px;">${match}</span>${after}`;
                } else {
                    li.textContent = title;
                }
            } else {
                li.textContent = title;
            }

            li.style.paddingLeft = '20px'; // Base indent, will be overridden
            li.addEventListener('click', () => {
                // Special handling for NeedNode - open modal for configuration
                if (name === 'NeedNode') {
                    if (this.app.needNodeModal) {
                        this.app.needNodeModal._pendingLocation = this.graphPos;
                        this.app.needNodeModal.open();
                        this.hide();
                    } else {
                        console.warn('needNodeModal not found, creating node directly');
                        this.app.graph.addNode(name, this.graphPos.x, this.graphPos.y);
                        this.app.persistence.autoSave();
                        this.hide();
                    }
                    return;
                }

                const newNode = this.app.graph.addNode(name, this.graphPos.x, this.graphPos.y);
                if (this.sourcePin && newNode) {
                    const targetPin = newNode.pins.find(p => this.app.graph.canConnect(this.sourcePin, p));
                    if (targetPin) {
                        this.app.wiring.createConnection(this.sourcePin, targetPin);
                    }
                }
                this.app.persistence.autoSave();
                this.hide();
            });
            return li;
        };

        // 3. Render tree using shared helper
        // Auto-expand all categories when filtering
        const shouldAutoExpand = filter && filter.length > 0;
        renderCategoryTree(root, this.list, createMenuItem, {
            menuStyle: true, // Use menu styling
            sortCategories: true,
            autoExpand: shouldAutoExpand // Auto-expand when searching
        });

        if (this.list.children.length === 0) {
            if (isGeneralClick && filter.length === 0) {
                const placeholder = document.createElement('div');
                placeholder.textContent = "No actions available.";
                placeholder.style.padding = "4px 8px";
                placeholder.style.color = "#666";
                placeholder.style.fontStyle = "italic";
                placeholder.style.fontSize = "10px";
                this.list.appendChild(placeholder);
            } else if (filter.length > 0) {
                const placeholder = document.createElement('div');
                placeholder.textContent = "No matching actions found.";
                placeholder.style.padding = "4px 8px";
                placeholder.style.color = "#666";
                placeholder.style.fontStyle = "italic";
                placeholder.style.fontSize = "10px";
                this.list.appendChild(placeholder);
            }
        }
    }
    showVariableDropOptions(specificVarName) {
        const itemsListContainer = document.createElement('div');
        itemsListContainer.style.paddingTop = '4px';
        const variable = this.app.variables.variables.get(specificVarName);
        if (!variable) return;
        ['Get', 'Set'].forEach(action => {
            const nodeKey = `${action}_${variable.name}`;
            const item = document.createElement('div');
            item.className = 'menu-item';
            const color = Utils.getPinColor(variable.type);
            const pillStyle = `display:inline-block; width:8px; height:4px; background-color:${color}; border-radius:2px; margin-right:6px; vertical-align:middle;`;
            item.innerHTML = `<span style="${pillStyle}"></span>${action} ${variable.name}`;
            item.addEventListener('click', () => {
                this.app.graph.addNode(nodeKey, this.graphPos.x, this.graphPos.y);
                this.app.persistence.autoSave();
                this.hide();
            });
            itemsListContainer.appendChild(item);
        });
        this.list.appendChild(itemsListContainer);
    }
    showComponentDropOptions(component) {
        const itemsListContainer = document.createElement('div');
        itemsListContainer.style.paddingTop = '4px';
        if (!component) return;

        const color = Utils.getPinColor('object'); // Components are object type
        const pillStyle = `display:inline-block; width:8px; height:4px; background-color:${color}; border-radius:2px; margin-right:6px; vertical-align:middle;`;

        ['Get', 'Set'].forEach(action => {
            const nodeKey = `${action}Component_${component.id}`;
            const item = document.createElement('div');
            item.className = 'menu-item';
            item.innerHTML = `<span style="${pillStyle}"></span>${action} ${component.name}`;
            item.addEventListener('click', () => {
                this.app.graph.addNode(nodeKey, this.graphPos.x, this.graphPos.y);
                this.app.persistence.autoSave();
                this.hide();
            });
            itemsListContainer.appendChild(item);
        });
        this.list.appendChild(itemsListContainer);
    }
}
