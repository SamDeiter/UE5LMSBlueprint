import { MacroDefinition } from '../macros/MacroDefinition.js';
import { createCollapsibleHeader } from './ui-helpers.js';

export class MacrosController {
    constructor(app) {
        this.app = app;
        this.listContainer = document.getElementById('macros-list');

        // Initial render
        this.render();
    }

    addNewMacro() {
        const name = this.app.macroRegistry.getUniqueName('NewMacro');
        const newMacro = new MacroDefinition(name);
        this.app.macroRegistry.register(newMacro);
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

        const header = createCollapsibleHeader(section, 'Macros', content, {
            onAdd: (e) => {
                // e.stopPropagation(); // Handled by createCollapsibleHeader
                this.addNewMacro();
            },
            isExpanded: true,
            iconClass: 'fas fa-caret-down'
        });

        // Add Import Button to Header (Custom)
        const actionGroup = header.querySelector('.action-group');
        if (actionGroup) {
            const importBtn = document.createElement('i');
            importBtn.className = 'fas fa-file-import add-btn';
            importBtn.title = 'Import Macro';
            importBtn.style.marginRight = '8px';
            importBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.importMacro();
            });
            actionGroup.insertBefore(importBtn, actionGroup.firstChild);
        }

        const macros = this.app.macroRegistry.getAll();

        macros.forEach(macro => {
            const item = document.createElement('div');
            item.className = 'tree-item';
            item.dataset.macroId = macro.id;

            const icon = document.createElement('i');
            icon.className = 'fas fa-scroll function-icon'; // Scroll icon for macros
            icon.style.marginRight = '6px';
            icon.style.color = '#ccc'; // Greyish for macros
            icon.style.fontSize = '10px';

            const label = document.createElement('span');
            label.className = 'tree-item-label';
            label.textContent = macro.name;

            item.appendChild(icon);
            item.appendChild(label);

            // Drag Logic
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', `MACRO:${macro.name}`);
                e.dataTransfer.effectAllowed = 'copy';
            });

            // Selection
            item.addEventListener('click', (e) => {
                this.selectMacro(macro.id);
                e.stopPropagation();
            });

            // Double click to open
            item.addEventListener('dblclick', () => {
                this.app.switchGraph(macro.name);
            });

            // Context Menu
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, macro);
            });

            content.appendChild(item);
        });

        // Deselect when clicking on empty space
        this.listContainer.addEventListener('click', (e) => {
            if (e.target === this.listContainer || e.target.classList.contains('sidebar-section')) {
                this.selectMacro(null);
            }
        });

        section.appendChild(content);
        this.listContainer.appendChild(section);
    }

    selectMacro(id) {
        // Deselect others
        const items = this.listContainer.querySelectorAll('.tree-item');
        items.forEach(el => el.classList.remove('selected'));

        if (id) {
            const selected = this.listContainer.querySelector(`[data-macro-id="${id}"]`);
            if (selected) selected.classList.add('selected');
        }
    }

    showContextMenu(e, macro) {
        const items = [
            { label: 'Open', callback: () => this.app.switchGraph(macro.name) },
            { label: 'Rename', callback: () => { /* TODO */ } },
            { label: 'Duplicate', callback: () => { /* TODO */ } },
            { label: 'Delete', callback: () => { /* TODO */ } },
            { label: '---', callback: () => { } },
            { label: 'Export to JSON', callback: () => this.exportMacro(macro) }
        ];
        this.app.contextMenu.show(e.clientX, e.clientY, items);
    }

    exportMacro(macro) {
        const data = JSON.stringify(macro, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${macro.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importMacro() {
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
                    const macroDef = JSON.parse(event.target.result);
                    // Basic validation
                    if (!macroDef.name || !macroDef.graph) {
                        alert('Invalid macro definition file.');
                        return;
                    }

                    // Ensure unique name
                    macroDef.name = this.app.macroRegistry.getUniqueName(macroDef.name);

                    this.app.macroRegistry.register(macroDef);
                    this.render();
                    alert(`Macro '${macroDef.name}' imported successfully.`);
                } catch (err) {
                    console.error('Import failed:', err);
                    alert('Failed to import macro: ' + err.message);
                }
            };
            reader.readAsText(file);
        });

        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
}
