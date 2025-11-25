/**
 * NeedNodeModal - UI for creating and editing NeedNode assessment criteria
 */
import { ValidatorTypes } from '../services/GraphValidator.js';

export class NeedNodeModal {
    constructor(app) {
        this.app = app;
        this.currentNode = null;
        this.tempRequirements = []; // Temporary storage for task requirements
        this.createModal();
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        const modal = document.createElement('div');
        modal.id = 'need-node-modal';
        modal.className = 'modal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Configure Need Node</h2>
                    <button class="modal-close" id="need-node-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="need-task-id">Associated Task</label>
                        <div style="display: flex; gap: 10px;">
                            <select id="need-task-id" style="flex: 1;">
                                <option value="">-- Select a Task --</option>
                            </select>
                            <button id="btn-show-create-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px;">+ New</button>
                            <button id="btn-edit-task" class="btn-secondary" style="padding: 4px 8px; font-size: 12px; display: none;">Edit</button>
                        </div>
                    </div>

                    <!-- New/Edit Task Form (Hidden by default) -->
                    <div id="new-task-form" style="display: none; background: #2a2a2a; padding: 10px; border: 1px solid #444; margin-bottom: 15px; border-radius: 4px;">
                        <h4 id="task-form-title" style="margin-top: 0; color: #ddd; font-size: 12px; text-transform: uppercase;">Create New Task</h4>
                        <div class="form-group">
                            <label for="new-task-id-input" style="font-size: 11px;">Task ID</label>
                            <input type="text" id="new-task-id-input" placeholder="e.g., custom_task_01" style="font-size: 12px;" />
                        </div>
                        <div class="form-group">
                            <label for="new-task-title-input" style="font-size: 11px;">Title</label>
                            <input type="text" id="new-task-title-input" placeholder="e.g., My Custom Task" style="font-size: 12px;" />
                        </div>
                        <div class="form-group">
                            <label for="new-task-desc-input" style="font-size: 11px;">Description</label>
                            <textarea id="new-task-desc-input" rows="2" placeholder="Task description..." style="font-size: 12px;"></textarea>
                        </div>

                        <div class="form-group">
                            <label style="font-size: 11px;">Requirements</label>
                            <div id="task-requirements-list" style="background: #222; padding: 5px; max-height: 100px; overflow-y: auto; font-size: 11px; color: #aaa; border: 1px solid #444; margin-bottom: 5px;">
                                <em style="color: #666;">No requirements defined.</em>
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <input type="text" id="new-req-input" placeholder="Add requirement..." style="font-size: 12px; flex: 1;" />
                                <button id="btn-add-req" class="btn-secondary" style="font-size: 11px; padding: 4px 8px;">Add</button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px;">
                            <button id="btn-cancel-create-task" class="btn-secondary" style="font-size: 11px; padding: 4px 8px;">Cancel</button>
                            <button id="btn-confirm-create-task" class="btn-primary" style="font-size: 11px; padding: 4px 8px;">Create Task</button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="need-title">Title</label>
                        <input type="text" id="need-title" placeholder="e.g., Connect Light Component" />
                    </div>
                    
                    <div class="form-group">
                        <label for="need-description">Description</label>
                        <textarea id="need-description" rows="3" placeholder="Detailed explanation of what students need to accomplish..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="need-hidden" />
                            Hidden from students (assessment mode)
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label for="need-threshold">Pass Threshold: <span id="threshold-value">80</span>%</label>
                        <input type="range" id="need-threshold" min="0" max="100" value="80" step="5" />
                    </div>
                    
                    <div class="form-group">
                        <label>Criteria</label>
                        <div id="criteria-list"></div>
                        <button type="button" id="add-criterion" class="btn-secondary">+ Add Criterion</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="need-node-cancel" class="btn-secondary">Cancel</button>
                    <button id="need-node-save" class="btn-primary">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;
        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Close buttons
        const handleClose = () => {
            if (!this.closeTaskForm()) {
                this.close();
            }
        };
        document.getElementById('need-node-close').addEventListener('click', handleClose);
        document.getElementById('need-node-cancel').addEventListener('click', handleClose);

        // Save button
        document.getElementById('need-node-save').addEventListener('click', () => this.save());

        // Threshold slider
        const thresholdSlider = document.getElementById('need-threshold');
        const thresholdValue = document.getElementById('threshold-value');
        thresholdSlider.addEventListener('input', (e) => {
            thresholdValue.textContent = e.target.value;
        });

        // Add criterion button
        document.getElementById('add-criterion').addEventListener('click', () => this.addCriterion());



        // Task Creation/Editing Toggles
        const newTaskForm = document.getElementById('new-task-form');
        const showCreateBtn = document.getElementById('btn-show-create-task');
        const editTaskBtn = document.getElementById('btn-edit-task');
        const cancelCreateBtn = document.getElementById('btn-cancel-create-task');
        const confirmCreateBtn = document.getElementById('btn-confirm-create-task');
        const taskSelect = document.getElementById('need-task-id');

        // Show Edit button only when a task is selected
        taskSelect.addEventListener('change', () => {
            editTaskBtn.style.display = taskSelect.value ? 'block' : 'none';
        });

        showCreateBtn.addEventListener('click', () => {
            this.resetTaskForm('create');
            newTaskForm.style.display = 'block';
            showCreateBtn.style.display = 'none';
            editTaskBtn.style.display = 'none';
        });

        editTaskBtn.addEventListener('click', () => {
            const taskId = taskSelect.value;
            if (taskId) {
                this.populateTaskForm(taskId);
                newTaskForm.style.display = 'block';
                showCreateBtn.style.display = 'none';
                editTaskBtn.style.display = 'none';
            }
        });

        cancelCreateBtn.addEventListener('click', () => {
            this.closeTaskForm();
        });

        confirmCreateBtn.addEventListener('click', () => {
            this.createNewTask();
        });

        // Add Requirement Button
        document.getElementById('btn-add-req').addEventListener('click', () => {
            const input = document.getElementById('new-req-input');
            const text = input.value.trim();
            if (text) {
                this.tempRequirements.push({ description: text });
                this.renderRequirementsList();
                input.value = '';
            }
        });
    }

    /**
     * Open modal for a specific node
     * @param {Object} nodeData - The node data to edit (or null for new)
     */
    open(nodeData = null) {
        this.currentNode = nodeData;

        // Populate Task Dropdown
        const taskSelect = document.getElementById('need-task-id');
        taskSelect.innerHTML = '<option value="">-- Select a Task --</option>';
        if (this.app.taskManager) {
            const tasks = this.app.taskManager.getAllTasks();
            if (tasks && tasks.length > 0) {
                tasks.forEach(task => {
                    const option = document.createElement('option');
                    option.value = task.taskId;
                    option.textContent = `${task.taskId}: ${task.title}`;
                    taskSelect.appendChild(option);
                });
            }
        }

        // Update Edit button visibility based on initial selection
        const editTaskBtn = document.getElementById('btn-edit-task');
        if (editTaskBtn) {
            editTaskBtn.style.display = 'none'; // Default to hidden
        }

        // Populate fields
        if (nodeData && (nodeData.customData?.needNodeData || nodeData.needNodeData)) {
            // Handle both new location (customData) and legacy/temp location
            const data = nodeData.customData?.needNodeData || nodeData.needNodeData;
            const taskId = data.taskId || '';
            document.getElementById('need-task-id').value = taskId;
            if (editTaskBtn) editTaskBtn.style.display = taskId ? 'block' : 'none';

            document.getElementById('need-title').value = data.title || '';
            document.getElementById('need-description').value = data.description || '';
            document.getElementById('need-hidden').checked = data.hidden || false;
            document.getElementById('need-threshold').value = data.passThreshold || 80;
            document.getElementById('threshold-value').textContent = data.passThreshold || 80;

            // Load criteria
            const criteriaList = document.getElementById('criteria-list');
            criteriaList.innerHTML = '';
            (data.criteria || []).forEach(criterion => {
                this.addCriterion(criterion);
            });
        } else {
            // Reset for new node
            document.getElementById('need-task-id').value = '';
            document.getElementById('need-title').value = 'New Need';
            document.getElementById('need-description').value = '';
            document.getElementById('need-hidden').checked = false;
            document.getElementById('need-threshold').value = 80;
            document.getElementById('threshold-value').textContent = '80';
            document.getElementById('criteria-list').innerHTML = '';
            this.addCriterion(); // Start with one empty criterion
        }

        this.modal.style.display = 'flex';
    }

    /**
     * Add a criterion input row with structured validation rules
     * @param {Object} criterion - Existing criterion data (optional)
     */
    addCriterion(criterion = null) {
        const criteriaList = document.getElementById('criteria-list');

        const row = document.createElement('div');
        row.className = 'criterion-row';
        row.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; padding: 10px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px;';

        // Validator Type Dropdown
        const typeRow = document.createElement('div');
        typeRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';

        const typeLabel = document.createElement('label');
        typeLabel.textContent = 'Rule Type:';
        typeLabel.style.cssText = 'min-width: 80px; font-size: 12px; color: #ccc;';

        const typeSelect = document.createElement('select');
        typeSelect.className = 'criterion-type-select';
        typeSelect.style.cssText = 'flex: 1; font-size: 12px; background: #1a1a1a; color: white; border: 1px solid #555; padding: 4px; border-radius: 2px;';
        typeSelect.innerHTML = `
            <option value="">-- Select Validation Type --</option>
            <option value="${ValidatorTypes.NODE_EXISTS}">Check Node Exists</option>
            <option value="${ValidatorTypes.PIN_CONNECTED}">Check Pin Connected</option>
            <option value="${ValidatorTypes.VARIABLE_VALUE}">Check Variable Value</option>
            <option value="${ValidatorTypes.COMPONENT_EXISTS}">Check Component Exists</option>
        `;

        if (criterion && criterion.type) {
            typeSelect.value = criterion.type;
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-icon criterion-delete';
        deleteBtn.title = 'Delete criterion';
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.cssText = 'padding: 4px 8px; background: #d32f2f; color: white; border: none; border-radius: 2px; cursor: pointer;';

        typeRow.appendChild(typeLabel);
        typeRow.appendChild(typeSelect);
        typeRow.appendChild(deleteBtn);
        row.appendChild(typeRow);

        // Parameters Container (dynamically populated based on type)
        const paramsContainer = document.createElement('div');
        paramsContainer.className = 'criterion-params';
        paramsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 6px; padding-left: 10px;';
        row.appendChild(paramsContainer);

        // Description Field
        const descRow = document.createElement('div');
        descRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';

        const descLabel = document.createElement('label');
        descLabel.textContent = 'Description:';
        descLabel.style.cssText = 'min-width: 80px; font-size: 12px; color: #ccc;';

        const descInput = document.createElement('input');
        descInput.type = 'text';
        descInput.className = 'criterion-description';
        descInput.placeholder = 'User-friendly description of this requirement';
        descInput.value = criterion ? (criterion.description || '') : '';
        descInput.style.cssText = 'flex: 1; font-size: 12px; background: #1a1a1a; color: white; border: 1px solid #555; padding: 4px; border-radius: 2px;';

        descRow.appendChild(descLabel);
        descRow.appendChild(descInput);
        row.appendChild(descRow);

        // Event: Type change updates parameter fields
        typeSelect.addEventListener('change', () => {
            this.renderParameterFields(typeSelect.value, paramsContainer, criterion);
        });

        // Delete button
        deleteBtn.addEventListener('click', () => {
            row.remove();
        });

        criteriaList.appendChild(row);

        // Initialize parameter fields if criterion has a type
        if (criterion && criterion.type) {
            this.renderParameterFields(criterion.type, paramsContainer, criterion);
        }
    }

    /**
     * Render dynamic parameter fields based on validator type
     * @param {string} validatorType - The selected validator type
     * @param {HTMLElement} container - The container to render fields into
     * @param {Object} criterion - Existing criterion data for pre-filling
     */
    renderParameterFields(validatorType, container, criterion = null) {
        container.innerHTML = ''; // Clear existing fields

        if (!validatorType) return;

        const params = criterion ? criterion.params || {} : {};

        const createField = (label, inputType, name, value, placeholder = '', options = null) => {
            const fieldRow = document.createElement('div');
            fieldRow.style.cssText = 'display: flex; gap: 8px; align-items: center;';

            const fieldLabel = document.createElement('label');
            fieldLabel.textContent = label + ':';
            fieldLabel.style.cssText = 'min-width: 100px; font-size: 11px; color: #aaa;';

            let input;
            if (inputType === 'select' && options) {
                input = document.createElement('select');
                input.innerHTML = options.map(opt =>
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
                if (value !== undefined) input.value = value;
            } else {
                input = document.createElement('input');
                input.type = inputType;
                input.value = value !== undefined ? value : '';
                input.placeholder = placeholder;
            }

            input.className = `criterion-param-${name}`;
            input.dataset.paramName = name;
            input.style.cssText = 'flex: 1; font-size: 11px; background: #111; color: white; border: 1px solid #444; padding: 3px 6px; border-radius: 2px;';

            fieldRow.appendChild(fieldLabel);
            fieldRow.appendChild(input);
            container.appendChild(fieldRow);
        };

        switch (validatorType) {
            case ValidatorTypes.NODE_EXISTS:
                createField('Node Type', 'text', 'nodeKey', params.nodeKey, 'e.g., EventBeginPlay, PrintString');
                createField('Minimum Count', 'number', 'count', params.count || 1, '1');
                break;

            case ValidatorTypes.PIN_CONNECTED:
                createField('Node Type', 'text', 'nodeKey', params.nodeKey, 'e.g., EventBeginPlay');
                createField('Pin ID', 'text', 'pinId', params.pinId, 'e.g., exec_out');
                break;

            case ValidatorTypes.VARIABLE_VALUE: {
                // Get available variables for dropdown
                const variables = this.app.variables ? Array.from(this.app.variables.variables.keys()) : [];
                const varOptions = [
                    { value: '', label: '-- Select Variable --' },
                    ...variables.map(v => ({ value: v, label: v }))
                ];
                createField('Variable Name', 'select', 'name', params.name, '', varOptions);
                createField('Expected Value', 'text', 'value', params.value, 'e.g., 10, "Hello"');
                createField('Operator', 'select', 'operator', params.operator || '==', '', [
                    { value: '==', label: 'Equals (==)' },
                    { value: '!=', label: 'Not Equals (!=)' },
                    { value: '>', label: 'Greater Than (>)' },
                    { value: '<', label: 'Less Than (<)' }
                ]);
                break;
            }

            case ValidatorTypes.COMPONENT_EXISTS:
                createField('Component Type', 'text', 'type', params.type, 'e.g., PointLight, Camera');
                createField('Component Name', 'text', 'name', params.name, '(Optional) Specific component name');
                break;
        }
    }

    /**
     * Save the NeedNode configuration
     */
    save() {
        const taskId = document.getElementById('need-task-id').value;
        const title = document.getElementById('need-title').value.trim();
        const description = document.getElementById('need-description').value.trim();
        const hidden = document.getElementById('need-hidden').checked;
        const passThreshold = parseInt(document.getElementById('need-threshold').value);

        // Collect structured criteria
        const criteriaRows = document.querySelectorAll('.criterion-row');
        const criteria = Array.from(criteriaRows).map((row, index) => {
            const typeSelect = row.querySelector('.criterion-type-select');
            const descInput = row.querySelector('.criterion-description');
            const paramsContainer = row.querySelector('.criterion-params');

            const type = typeSelect ? typeSelect.value : '';
            const desc = descInput ? descInput.value.trim() : '';

            // Collect parameters based on type
            const params = {};
            if (paramsContainer && type) {
                const paramInputs = paramsContainer.querySelectorAll('[data-param-name]');
                paramInputs.forEach(input => {
                    const paramName = input.dataset.paramName;
                    let value = input.value;

                    // Convert to appropriate type
                    if (input.type === 'number') {
                        value = parseInt(value) || 1;
                    }

                    if (value !== '' && value !== undefined) {
                        params[paramName] = value;
                    }
                });
            }

            return {
                id: `criterion-${index}`,
                type: type,
                params: params,
                description: desc,
                passed: false
            };
        }).filter(c => c.type && c.description.length > 0); // Only include criteria with type and description

        if (!title) {
            window.alert('Please enter a title for the Need Node');
            return;
        }

        if (criteria.length === 0) {
            window.alert('Please add at least one criterion with a type and description');
            return;
        }

        const needNodeData = {
            taskId,
            title,
            description,
            hidden,
            passThreshold,
            criteria
        };

        // If editing existing node, update it
        if (this.currentNode) {
            if (!this.currentNode.customData) this.currentNode.customData = {};
            this.currentNode.customData.needNodeData = needNodeData;

            const nodeEl = document.getElementById(this.currentNode.id);
            if (nodeEl) {
                const titleEl = nodeEl.querySelector('.node-title');
                if (titleEl) titleEl.textContent = title;
            }
            this.app.persistence.autoSave();
        } else {
            // Create new node at the pending location
            if (this._pendingLocation) {
                const node = this.app.graph.addNode('NeedNode', this._pendingLocation.x, this._pendingLocation.y);
                if (node) {
                    if (!node.customData) node.customData = {};
                    node.customData.needNodeData = needNodeData;

                    // Update the node title in the DOM
                    const nodeEl = document.getElementById(node.id);
                    if (nodeEl) {
                        const titleEl = nodeEl.querySelector('.node-title');
                        if (titleEl) titleEl.textContent = title;
                    }
                } else {
                    console.error('Failed to create NeedNode - addNode returned null');
                }
                this._pendingLocation = null;
                this.app.persistence.autoSave();
            } else {
                console.error('Cannot create NeedNode: _pendingLocation is not set!');
            }
        }

        this.close();
    }

    /**
     * Close the task creation/edit form if it's open
     * @returns {boolean} True if the form was closed, false if it wasn't open
     */
    closeTaskForm() {
        const newTaskForm = document.getElementById('new-task-form');
        if (newTaskForm && newTaskForm.style.display !== 'none') {
            newTaskForm.style.display = 'none';

            const showCreateBtn = document.getElementById('btn-show-create-task');
            const editTaskBtn = document.getElementById('btn-edit-task');
            const taskSelect = document.getElementById('need-task-id');

            if (showCreateBtn) showCreateBtn.style.display = 'block';
            if (editTaskBtn && taskSelect) editTaskBtn.style.display = taskSelect.value ? 'block' : 'none';

            return true;
        }
        return false;
    }

    /**
     * Reset task form for creation or editing
     */
    resetTaskForm(mode) {
        const idInput = document.getElementById('new-task-id-input');
        const titleInput = document.getElementById('new-task-title-input');
        const descInput = document.getElementById('new-task-desc-input');
        const formTitle = document.getElementById('task-form-title');
        const confirmBtn = document.getElementById('btn-confirm-create-task');

        if (mode === 'create') {
            formTitle.textContent = 'Create New Task';
            confirmBtn.textContent = 'Create Task';
            idInput.value = '';
            idInput.disabled = false;
            titleInput.value = '';
            descInput.value = '';
            this.tempRequirements = [];
            this.renderRequirementsList();
            confirmBtn.dataset.mode = 'create';
        } else {
            formTitle.textContent = 'Edit Task';
            confirmBtn.textContent = 'Update Task';
            idInput.disabled = true; // ID cannot be changed
            confirmBtn.dataset.mode = 'edit';
        }
    }

    /**
     * Populate form with existing task data
     */
    populateTaskForm(taskId) {
        const task = this.app.taskManager.getTaskById(taskId);
        if (task) {
            this.resetTaskForm('edit');
            document.getElementById('new-task-id-input').value = task.taskId;
            document.getElementById('new-task-title-input').value = task.title;
            document.getElementById('new-task-desc-input').value = task.description || '';

            document.getElementById('new-task-desc-input').value = task.description || '';

            // Load requirements into temp array
            this.tempRequirements = [];
            if (task.requirements && task.requirements.length > 0) {
                // Deep copy to avoid modifying original task directly until save
                this.tempRequirements = JSON.parse(JSON.stringify(task.requirements));
            }
            this.renderRequirementsList();
        }
    }

    /**
     * Render the requirements list in the task form
     */
    renderRequirementsList() {
        const reqList = document.getElementById('task-requirements-list');
        if (!reqList) return;

        reqList.innerHTML = '';
        if (this.tempRequirements.length > 0) {
            this.tempRequirements.forEach((req, index) => {
                const div = document.createElement('div');
                div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; padding-bottom: 4px; border-bottom: 1px solid #333;';

                const textSpan = document.createElement('span');
                textSpan.textContent = req.description || req.text || req.id || 'Unknown Requirement';

                const delBtn = document.createElement('button');
                delBtn.innerHTML = '&times;';
                delBtn.style.cssText = 'background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 14px; padding: 0 4px;';
                delBtn.onclick = () => {
                    this.tempRequirements.splice(index, 1);
                    this.renderRequirementsList();
                };

                div.appendChild(textSpan);
                div.appendChild(delBtn);
                reqList.appendChild(div);
            });
        } else {
            reqList.innerHTML = '<em style="color: #666;">No requirements defined.</em>';
        }
    }

    /**
     * Create or Update a task from the modal inputs
     */
    createNewTask() {
        const idInput = document.getElementById('new-task-id-input');
        const titleInput = document.getElementById('new-task-title-input');
        const descInput = document.getElementById('new-task-desc-input');

        const taskId = idInput.value.trim();
        const title = titleInput.value.trim();
        const description = descInput.value.trim();

        if (!taskId || !title) {
            window.alert('Task ID and Title are required.');
            return;
        }

        const confirmBtn = document.getElementById('btn-confirm-create-task');
        const mode = confirmBtn.dataset.mode || 'create';
        let success = false;

        if (mode === 'create') {
            const newTask = {
                taskId: taskId,
                title: title,
                description: description,
                requirements: this.tempRequirements
            };
            success = this.app.taskManager.addTask(newTask);
        } else {
            // Update existing
            const updatedTask = {
                taskId: taskId,
                title: title,
                description: description,
                requirements: this.tempRequirements
            };
            success = this.app.taskManager.updateTask(updatedTask);
        }

        if (success) {
            const taskSelect = document.getElementById('need-task-id');

            if (mode === 'create') {
                // Add new option
                const option = document.createElement('option');
                option.value = taskId;
                option.textContent = `${taskId}: ${title}`;
                taskSelect.appendChild(option);
            } else {
                // Update existing option text
                const option = taskSelect.querySelector(`option[value="${taskId}"]`);
                if (option) {
                    option.textContent = `${taskId}: ${title}`;
                }
            }

            // Select the task
            taskSelect.value = taskId;

            // Refresh the main toolbar task selector
            if (this.app.taskUI) {
                this.app.taskUI.populateTaskSelector();
            }

            // Reset and hide form
            idInput.value = '';
            titleInput.value = '';
            descInput.value = '';
            document.getElementById('new-task-form').style.display = 'none';

            document.getElementById('btn-show-create-task').style.display = 'block';
            document.getElementById('btn-edit-task').style.display = 'block';
        } else {
            window.alert(mode === 'create' ? 'Failed to create task. ID might already exist.' : 'Failed to update task.');
        }
    }

    /**
     * Close the modal
     */
    close() {
        this.modal.style.display = 'none';
        this.currentNode = null;
    }
}
