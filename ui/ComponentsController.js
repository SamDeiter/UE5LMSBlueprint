import { nodeRegistry } from '../registries/NodeRegistry.js';
import { ComponentSelector } from './ComponentSelector.js';

export class ComponentsController {
    constructor(app) {
        console.log('ComponentsController initialized (v2)');
        this.app = app;
        this.selectedComponentId = null;
        this.panel = document.getElementById('components-panel');
        this.listContainer = this.panel ? this.panel.querySelector('.panel-content') : null;
        this.addBtn = this.panel ? this.panel.querySelector('.btn-green-add') : null;

        // Initialize component selector modal
        this.componentSelector = new ComponentSelector(app);

        this.initEvents();
    }

    initEvents() {
        if (this.addBtn) {
            this.addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showComponentSelector();
            });
        }
    }

    showComponentSelector() {
        // Pass the add button as the trigger element for positioning
        this.componentSelector.show((componentDef) => {
            this.addComponent(componentDef);
        }, this.addBtn);
    }

    addComponent(componentDef) {
        const id = 'comp-' + Date.now();
        // Clean up type name for display
        const cleanType = componentDef.type.replace('Component', '');
        const name = `${cleanType}${this.app.components.size + 1}`;

        const newComponent = {
            id,
            name: name,
            type: componentDef.type,
            parentId: 'root',
            properties: {}
        };

        this.app.components.set(id, newComponent);
        this.selectComponent(id); // Auto-select new component
        this.updateNodeLibrary();

        // Render both the Components panel and the My Blueprint panel (since it mirrors components)
        this.render();
        if (this.app.variables) this.app.variables.renderPanel();

        this.app.persistence.autoSave();
    }

    selectComponent(id) {
        this.selectedComponentId = id;

        // Clear variable selection
        if (this.app.details) {
            this.app.details.currentVariable = null;
        }

        // Update selection in Components Panel (preserve focus)
        if (this.listContainer) {
            const items = this.listContainer.querySelectorAll('.tree-item');
            items.forEach(item => {
                if (item.dataset.componentId === id) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        // Update selection in My Blueprint Panel (preserve focus)
        if (this.app.variables && this.app.variables.panel) {
            const items = this.app.variables.panel.querySelectorAll('.tree-item[data-component-id]');
            items.forEach(item => {
                if (item.dataset.componentId === id) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        }

        // Sync with My Blueprint selection if possible, or just update details
        if (this.app.details) {
            this.app.details.showComponentDetails(this.app.components.get(id));
        }
    }

    deleteComponent(id) {
        console.log('[ComponentsController] Deleting component:', id);
        if (!id) return;

        if (!this.app.components.has(id)) {
            console.log('[ComponentsController] Component not found');
            return;
        }

        const comp = this.app.components.get(id);

        // Use the same confirmation modal as variable deletion
        const modal = document.getElementById('confirmation-modal');
        const msg = document.getElementById('confirmation-msg');
        const yesBtn = document.getElementById('confirm-yes-btn');
        const noBtn = document.getElementById('confirm-no-btn');

        if (!modal) {
            console.error('[ComponentsController] Confirmation modal not found, using window.confirm as fallback');
            if (window.confirm(`Delete component '${comp.name}'?`)) {
                this.executeComponentDeletion(id);
            }
            return;
        }

        msg.textContent = `Are you sure you want to delete component '${comp.name}'?`;
        modal.style.display = 'flex';

        // Clone buttons to remove old listeners
        const newYes = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYes, yesBtn);
        const newNo = noBtn.cloneNode(true);
        noBtn.parentNode.replaceChild(newNo, noBtn);

        newYes.addEventListener('click', () => {
            this.executeComponentDeletion(id);
            modal.style.display = 'none';
        });

        newNo.addEventListener('click', () => {
            console.log('[ComponentsController] Deletion cancelled by user');
            modal.style.display = 'none';
        });
    }

    executeComponentDeletion(id) {
        console.log('[ComponentsController] Executing deletion for:', id);
        this.app.components.delete(id);
        console.log('[ComponentsController] Component deleted, refreshing UI...');

        if (this.selectedComponentId === id) {
            this.selectedComponentId = null;
        }

        this.render();
        this.updateNodeLibrary();

        if (this.app.variables) {
            this.app.variables.renderPanel();
        }

        // Force immediate save to history and persistence
        this.app.history.saveState('component delete');
        this.app.persistence.save();

        console.log('[ComponentsController] Component deletion complete');
    }

    updateNodeLibrary() {
        // First, unregister all component nodes to avoid duplicates
        const allKeys = Object.keys(nodeRegistry.getAll());
        for (const key of allKeys) {
            if (key.startsWith('GetComponent_') || key.startsWith('SetComponent_')) {
                nodeRegistry.unregister(key);
            }
        }

        // Register Get and Set nodes for all components
        if (this.app.components) {
            this.app.components.forEach(comp => {
                // Register Get node
                const getKey = `GetComponent_${comp.id}`;
                nodeRegistry.register(getKey, {
                    title: `Get ${comp.name}`,
                    category: 'Components',
                    type: 'pure-node',
                    inputs: [],
                    outputs: [
                        { id: 'out', name: comp.name, type: 'object', dir: 'out' }
                    ],
                    properties: { componentId: comp.id }
                });

                // Register Set node
                const setKey = `SetComponent_${comp.id}`;
                nodeRegistry.register(setKey, {
                    title: `Set ${comp.name}`,
                    category: 'Components',
                    type: 'function-node',
                    pins: [
                        { id: 'exec_in', name: 'Exec', type: 'exec', dir: 'in' },
                        { id: 'comp_in', name: comp.name, type: 'object', dir: 'in' },
                        { id: 'exec_out', name: 'Exec', type: 'exec', dir: 'out' }
                    ],
                    customData: { componentId: comp.id }
                });
            });
        }
        this.app.palette.populateList();
    }

    getIconForType(type) {
        if (!type) return 'fa-cube';
        const t = type.toLowerCase();
        if (t.includes('mesh')) return 'fa-cube';
        if (t.includes('camera')) return 'fa-video';
        if (t.includes('light')) return 'fa-lightbulb';
        if (t.includes('collision') || t.includes('box') || t.includes('sphere') || t.includes('capsule')) return 'fa-vector-square';
        if (t.includes('audio') || t.includes('sound')) return 'fa-volume-up';
        if (t.includes('particle')) return 'fa-snowflake';
        return 'fa-puzzle-piece';
    }

    render() {
        if (!this.listContainer) return;
        this.listContainer.innerHTML = '';

        // Render Root Component (Self)
        const rootItem = document.createElement('div');
        rootItem.className = 'tree-item';
        rootItem.innerHTML = `<i class="fas fa-dot-circle" style="margin-right: 8px; color: #ccc;"></i> <span>NewBlueprint (Self)</span>`;
        this.listContainer.appendChild(rootItem);

        // Render Components
        if (this.app.components) {
            this.app.components.forEach(comp => {
                const item = document.createElement('div');
                item.className = 'tree-item';
                item.style.paddingLeft = '24px'; // Indent
                if (this.selectedComponentId === comp.id) item.classList.add('selected');

                // Enable focus for deletion logic
                item.setAttribute('tabindex', '0');
                item.dataset.componentId = comp.id;

                const iconClass = this.getIconForType(comp.type);

                item.innerHTML = `
                    <i class="fas ${iconClass}" style="margin-right: 8px; color: #ccc;"></i>
                    <span>${comp.name}</span>
                `;

                // Make draggable - from Components panel, only creates Get node
                item.draggable = true;
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', `COMPONENT_GET:${comp.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                });

                item.addEventListener('click', () => this.selectComponent(comp.id));
                this.listContainer.appendChild(item);
            });
        }
    }
}
