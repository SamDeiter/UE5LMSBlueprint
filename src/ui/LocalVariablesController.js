import { Utils } from '../utils.js';
import { generateGUID } from '../utils/guid.js';
import { createCollapsibleHeader } from './ui-helpers.js';
import { _nodeRegistry } from '../registries/NodeRegistry.js';

export class LocalVariablesController {
    constructor(app) {
        this.app = app;
        this.container = document.getElementById('local-variables-list');
        this.currentFunc = null;
    }

    setContext(func) {
        this.currentFunc = func;
        this.render();
    }

    clearContext() {
        this.currentFunc = null;
        this.render();
    }

    render() {
        if (!this.container) return;
        this.container.innerHTML = '';

        // Use current context or try to find it from active graph
        let funcDef = this.currentFunc;
        if (!funcDef) {
            const activeGraph = this.app.activeGraph;
            funcDef = this.app.functionRegistry.getAll().find(f => f.name === activeGraph);
        }

        // If not a function graph, we just leave the container empty (cleared above)
        if (!funcDef) return;

        const section = document.createElement('div');
        section.className = 'sidebar-section sidebar-section-top-border';
        
         // Reset margin since it's its own container

        const content = document.createElement('div');
        content.classList.remove('hidden');

        createCollapsibleHeader(section, 'Local Variables', content, {
            onAdd: (e) => {
                e.stopPropagation();
                this.addLocalVariable(funcDef);
            },
            isExpanded: true,
            iconClass: 'fas fa-caret-down'
        });

        section.appendChild(content);
        this.container.appendChild(section);

        // Render Items
        if (funcDef.localVariables) {
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
                iconSpan.className = 'ue5-variable-type-icon ue5-local-var-icon';
                iconSpan.style.backgroundColor = color;
                
                
                
                
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
    }

    addLocalVariable(funcDef) {
        if (!funcDef.localVariables) funcDef.localVariables = [];
        
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
