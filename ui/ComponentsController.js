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

    deleteComponent(id) {
        if (!id) return;
        if (this.app.components.has(id)) {
            const comp = this.app.components.get(id);
            if (window.confirm(`Delete component '${comp.name}'?`)) {
                this.app.components.delete(id);
                if (this.selectedComponentId === id) {
                    this.selectedComponentId = null;
                }
                this.render();
                this.updateNodeLibrary();
                if (this.app.variables) this.app.variables.renderPanel();
                this.app.persistence.autoSave();
            }
        }
    }

    selectComponent(id) {
        this.selectedComponentId = id;
        this.render();
        // Sync with My Blueprint selection if possible, or just update details
        // this.app.details.showComponentDetails(this.app.components.get(id));
    }

    updateNodeLibrary() {
        // Register Get nodes for all components
        if (this.app.components) {
            this.app.components.forEach(comp => {
                const nodeKey = `GetComponent_${comp.id}`;
                nodeRegistry.register(nodeKey, {
                    title: `Get ${comp.name}`,
                    category: 'Components',
                    type: 'pure-node',
                    inputs: [],
                    outputs: [
                        { id: 'out', name: comp.name, type: 'object', dir: 'out' }
                    ],
                    properties: { componentId: comp.id }
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

                const iconClass = this.getIconForType(comp.type);

                item.innerHTML = `
                    <i class="fas ${iconClass}" style="margin-right: 8px; color: #ccc;"></i>
                    <span>${comp.name}</span>
                `;

                item.addEventListener('click', () => this.selectComponent(comp.id));
                this.listContainer.appendChild(item);
            });
        }
    }
}
