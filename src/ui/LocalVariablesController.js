import { Utils } from '../utils.js';
import { generateGUID } from '../utils/guid.js';
import { createCollapsibleHeader } from './ui-helpers.js';
import { nodeRegistry } from '../registries/NodeRegistry.js';

export class LocalVariablesController {
    constructor(app) {
        this.app = app;
        this.listContainer = document.getElementById('variables-list'); // Reusing the variables container for now, or we can make a new one
        // Ideally, we should have a separate container or inject into the variables list
        // For now, let's assume we inject a "Local Variables" section into the variables list when active
    }

    render() {
        // Only render if we are in a function graph
        const activeGraph = this.app.activeGraph;
        if (!activeGraph.startsWith('Func_') && !this.app.functionRegistry.getAll().find(f => f.name === activeGraph)) {
            // Not a function graph, remove any existing local vars section
            const existing = document.getElementById('section-local-variables');
            if (existing) existing.remove();
            return;
        }

        const funcName = activeGraph;
        const funcDef = this.app.functionRegistry.getAll().find(f => f.name === funcName);
        if (!funcDef) return;

        // Find or create the section
        let section = document.getElementById('section-local-variables');
        let content;

        if (!section) {
            section = document.createElement('div');
            section.id = 'section-local-variables';
            section.className = 'sidebar-section';
            section.style.borderTop = '1px solid #333';
            section.style.marginTop = '10px';

            content = document.createElement('div');
            content.style.display = 'block';

            createCollapsibleHeader(section, 'Local Variables', content, {
                onAdd: (e) => {
                    e.stopPropagation();
                    this.addLocalVariable(funcDef);
                },
                isExpanded: true,
                iconClass: 'fas fa-caret-down'
            });

            section.appendChild(content);

            // Insert before the global variables section if possible, or append
            // Let's append to the variables list container
            // We need to be careful not to wipe the global variables
            // The VariableController manages the listContainer. 
            // We should probably ask VariableController to render this, or append it ourselves safely.
            // Safe approach: Append to the end of variables-list
            this.listContainer.appendChild(section);
        } else {
            content = section.querySelector('div:not(.sidebar-section-header)');
            content.innerHTML = ''; // Clear items
        }

        // Render Items
        funcDef.localVariables.forEach(v => {
            const item = document.createElement('div');
            item.className = 'ue5-variable-item';
            item.dataset.localId = v.id;

            // Name
            const nameSpan = document.createElement('span');
            nameSpan.className = 'ue5-variable-name-text';
            nameSpan.textContent = v.name;
            item.appendChild(nameSpan);

            // Type Icon
            const color = Utils.getPinColor(v.type);
            const iconSpan = document.createElement('span');
            iconSpan.className = 'ue5-variable-type-icon';
            iconSpan.style.backgroundColor = color;
            iconSpan.style.width = '8px';
            iconSpan.style.height = '4px';
            iconSpan.style.borderRadius = '2px';
            iconSpan.style.marginLeft = 'auto';
            item.appendChild(iconSpan);

            // Drag Logic
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', `LOCALVAR:${v.name}:${v.type}`);
                e.dataTransfer.effectAllowed = 'copy';
            });

            content.appendChild(item);
        });
    }

    addLocalVariable(funcDef) {
        const name = `LocalVar_${funcDef.localVariables.length}`;
        const newVar = {
            id: generateGUID(),
            name: name,
            type: 'bool', // Default
            defaultValue: false
        };
        funcDef.localVariables.push(newVar);
        this.render();
    }
}
