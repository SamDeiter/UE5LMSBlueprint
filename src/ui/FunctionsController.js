import { FunctionDefinition } from '../functions/FunctionDefinition.js';
import { createCollapsibleHeader } from './ui-helpers.js';

export class FunctionsController {
    constructor(app) {
        this.app = app;
        this.listContainer = document.getElementById('functions-list');

        // Initial render
        this.render();
    }

    addNewFunction() {
        const name = this.app.functionRegistry.getUniqueName('NewFunction');
        const newFunc = new FunctionDefinition(name);
        this.app.functionRegistry.register(newFunc);
        this.render();
        // TODO: Select and focus rename
    }

    render() {
        if (!this.listContainer) return;

        this.listContainer.innerHTML = '';

        const section = document.createElement('div');
        section.className = 'sidebar-section';

        const content = document.createElement('div');
        content.style.display = 'block';

        const header = createCollapsibleHeader(section, 'Functions', content, {
            onAdd: (e) => {
                // e.stopPropagation(); // Handled by createCollapsibleHeader
                this.addNewFunction();
            },
            isExpanded: true,
            iconClass: 'fas fa-caret-down'
        });

        // Add Import Button to Header (Custom)
        const actionGroup = header.querySelector('.action-group');
        if (actionGroup) {
            const importBtn = document.createElement('i');
            importBtn.className = 'fas fa-file-import add-btn';
            importBtn.title = 'Import Function';
            importBtn.style.marginRight = '8px';
            importBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.importFunction();
            });
            actionGroup.insertBefore(importBtn, actionGroup.firstChild);
        }

        const functions = this.app.functionRegistry.getAll();

        functions.forEach(func => {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.dataset.functionId = func.id;

            const icon = document.createElement('i');
            icon.className = 'fas fa-cube function-icon';
            icon.style.marginRight = '6px';
            icon.style.color = '#a8b'; // Pinkish for functions
            icon.style.fontSize = '10px';

            const label = document.createElement('span');
            label.className = 'tree-item-label';
            label.textContent = func.name;

            item.appendChild(icon);
            item.appendChild(label);

            // Drag Logic
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', `FUNCTION:${func.name}`);
                e.dataTransfer.effectAllowed = 'copy';
            });

            // Selection
            item.addEventListener('click', (e) => {
                this.selectFunction(func.id);
                e.stopPropagation();
            });

            // Double click to open
            item.addEventListener('dblclick', () => {
                this.app.switchGraph(func.name);
            });

            // Context Menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, func);
            });

            content.appendChild(item);
        });

        // Deselect when clicking on empty space
        this.listContainer.addEventListener('click', (e) => {
            if (e.target === this.listContainer || e.target.classList.contains('sidebar-section')) {
                this.selectFunction(null);
            }
        });

        section.appendChild(content);
        this.listContainer.appendChild(section);
    }

    selectFunction(id) {
        // Deselect others
        const items = this.listContainer.querySelectorAll('.tree-item');
        items.forEach(el => el.classList.remove('selected'));

        if (id) {
            const selected = this.listContainer.querySelector(`[data-function-id="${id}"]`);
            if (selected) selected.classList.add('selected');
        }
    }

    showContextMenu(e, func) {
        const items = [
            { label: 'Open', callback: () => this.app.switchGraph(func.name) },
            { label: 'Rename', callback: () => { /* TODO */ } },
            { label: 'Duplicate', callback: () => { /* TODO */ } },
            { label: 'Delete', callback: () => { /* TODO */ } },
            { label: '---', callback: () => { } },
            { label: 'Export to JSON', callback: () => this.exportFunction(func) }
        ];
        this.app.contextMenu.show(e.clientX, e.clientY, items);
    }

    exportFunction(func) {
        const data = JSON.stringify(func, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${func.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFunction() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const funcDef = JSON.parse(event.target.result);
                    // Basic validation
                    if (!funcDef.name || !funcDef.graph) {
                        alert('Invalid function definition file.');
                        return;
                    }

                    // Ensure unique name
                    funcDef.name = this.app.functionRegistry.getUniqueName(funcDef.name);
                    // Generate new ID to avoid conflicts
                    // funcDef.id = generateGUID(); // Assuming we have access to this or let registry handle it
                    // Actually, FunctionDefinition constructor usually handles ID, but here we are loading raw data.
                    // We should probably let the registry handle ID collision or re-generate it.

                    // Register
                    // We might need to instantiate FunctionDefinition from data if it has methods, 
                    // but currently it's likely a POJO.
                    this.app.functionRegistry.register(funcDef);
                    this.render();
                    alert(`Function '${funcDef.name}' imported successfully.`);
                } catch (err) {
                    console.error('Import failed:', err);
                    alert('Failed to import function: ' + err.message);
                }
            };
            reader.readAsText(file);
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
}
