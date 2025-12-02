
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DetailsController.js'

# Read the existing file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to ensure renderFunctionParameters is correctly defined and showFunctionDetails calls it.
# Based on the previous view_file, the methods seem to be there but we want to be 100% sure about the structure.

# Let's replace the showFunctionDetails and renderFunctionParameters methods with clean versions.

# Locate showFunctionDetails
start_marker = "    showFunctionDetails(func) {"
end_marker = "    addCustomParameter(node) {"

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    new_method_content = """    showFunctionDetails(func) {
        this.currentVariable = null;
        this.app.wiring.clearLinkSelection();
        this.app.graph.clearSelection();

        this.panel.innerHTML = `
            <div class="details-group">
                <h4>Function Details</h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="func-name-input" class="details-input" value="${func.name}">
                </div>
                <div class="detail-row">
                    <label>Description</label>
                    <input type="text" id="func-desc-input" class="details-input" value="${func.description || ''}">
                </div>
                <div class="detail-row">
                    <label>Category</label>
                    <input type="text" id="func-cat-input" class="details-input" value="${func.category || 'Default'}">
                </div>
                <div class="detail-row">
                    <label>Access Specifier</label>
                    <select id="func-access-select" class="details-select">
                        <option value="Public" ${func.accessSpecifier === 'Public' ? 'selected' : ''}>Public</option>
                        <option value="Private" ${func.accessSpecifier === 'Private' ? 'selected' : ''}>Private</option>
                        <option value="Protected" ${func.accessSpecifier === 'Protected' ? 'selected' : ''}>Protected</option>
                    </select>
                </div>
                <div class="detail-row">
                    <label>Pure</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="func-pure-checkbox" class="ue5-checkbox" ${func.isPure ? 'checked' : ''}>
                    </div>
                </div>
            </div>

            <div class="details-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4>Inputs</h4>
                    <i class="fas fa-plus-circle" id="add-func-input-btn" style="cursor: pointer; color: #ccc;"></i>
                </div>
                <div id="func-inputs-list"></div>
            </div>

            <div class="details-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4>Outputs</h4>
                    <i class="fas fa-plus-circle" id="add-func-output-btn" style="cursor: pointer; color: #ccc;"></i>
                </div>
                <div id="func-outputs-list"></div>
            </div>
        `;

        // Bind Events
        const bindInput = (id, prop) => {
            const el = this.panel.querySelector(id);
            if (el) {
                el.addEventListener('change', (e) => {
                    func[prop] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                    this.app.functionsController.render(); // Refresh list
                    this.app.persistence.autoSave();
                    
                    // Sync nodes if properties affect them (e.g. Pure)
                    if (prop === 'isPure') {
                        this.app.functionsController.syncFunctionNodes(func);
                    }
                });
            }
        };

        bindInput('#func-name-input', 'name');
        bindInput('#func-desc-input', 'description');
        bindInput('#func-cat-input', 'category');
        bindInput('#func-access-select', 'accessSpecifier');
        bindInput('#func-pure-checkbox', 'isPure');

        // Inputs/Outputs Management
        this.renderFunctionParameters(func);

        this.panel.querySelector('#add-func-input-btn').addEventListener('click', () => {
            func.inputs.push({ name: 'NewInput', type: 'bool', defaultValue: false });
            this.renderFunctionParameters(func);
            this.app.functionsController.syncFunctionNodes(func);
            this.app.persistence.autoSave();
        });

        this.panel.querySelector('#add-func-output-btn').addEventListener('click', () => {
            func.outputs.push({ name: 'NewOutput', type: 'bool' });
            this.renderFunctionParameters(func);
            this.app.functionsController.syncFunctionNodes(func);
            this.app.persistence.autoSave();
        });
    }

    renderFunctionParameters(func) {
        const inputList = this.panel.querySelector('#func-inputs-list');
        const outputList = this.panel.querySelector('#func-outputs-list');

        if (!inputList || !outputList) return;

        inputList.innerHTML = '';
        outputList.innerHTML = '';

        const renderParam = (param, index, isInput) => {
            const row = document.createElement('div');
            row.className = 'param-row';
            row.style.cssText = 'display: flex; align-items: center; margin-bottom: 4px;';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'details-input';
            nameInput.value = param.name;
            nameInput.style.flex = '1';
            nameInput.style.marginRight = '4px';
            nameInput.addEventListener('change', (e) => {
                param.name = e.target.value;
                this.app.functionsController.syncFunctionNodes(func);
                this.app.persistence.autoSave();
            });

            // Type Selector Trigger
            const typeTrigger = document.createElement('div');
            typeTrigger.className = 'variable-type-pill';
            typeTrigger.style.backgroundColor = Utils.getPinColor(param.type);
            typeTrigger.style.width = '24px'; // Fixed width for pill
            typeTrigger.style.height = '12px';
            typeTrigger.style.borderRadius = '6px';
            typeTrigger.style.cursor = 'pointer';
            typeTrigger.style.marginRight = '4px';
            typeTrigger.title = param.type;

            typeTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = typeTrigger.getBoundingClientRect();
                this.typeSelector.showTypeMenu(rect.left, rect.bottom + 5, (newType) => {
                    param.type = newType;
                    typeTrigger.style.backgroundColor = Utils.getPinColor(newType);
                    typeTrigger.title = newType;
                    this.app.functionsController.syncFunctionNodes(func);
                    this.app.persistence.autoSave();
                });
            });

            const delBtn = document.createElement('i');
            delBtn.className = 'fas fa-times param-delete-btn';
            delBtn.style.cursor = 'pointer';
            delBtn.style.color = '#666';
            delBtn.addEventListener('click', () => {
                if (isInput) {
                    func.inputs.splice(index, 1);
                } else {
                    func.outputs.splice(index, 1);
                }
                this.renderFunctionParameters(func);
                this.app.functionsController.syncFunctionNodes(func);
                this.app.persistence.autoSave();
            });

            row.appendChild(typeTrigger);
            row.appendChild(nameInput);
            row.appendChild(delBtn);

            return row;
        };

        func.inputs.forEach((p, i) => inputList.appendChild(renderParam(p, i, true)));
        func.outputs.forEach((p, i) => outputList.appendChild(renderParam(p, i, false)));
    }

"""
    new_content = content[:start_index] + new_method_content + content[end_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated {file_path}")
else:
    print("Could not find markers to replace content.")

