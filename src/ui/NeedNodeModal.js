/**
 * NeedNodeModal - UI for creating and editing NeedNode assessment criteria
 */
import { ValidatorTypes } from "../services/GraphValidator.js";

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
    const modal = document.createElement("div");
    modal.id = "need-node-modal";
    modal.className = "modal";
    modal.classList.add("hidden");

    modal.innerHTML = `
            <div class="modal-content modal-content-medium">
                <div class="modal-header">
                    <h2>Configure Need Node</h2>
                    <button class="modal-close" id="need-node-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group form-row">
                        <label for="need-task-id" class="label-fixed">Associated Task</label>
                        <div class="d-flex align-center flex-1" style="gap: 10px;">
                            <button id="btn-show-create-task" class="btn-primary text-bold" style="padding: 8px 16px; font-size: 14px;">+ New</button>
                            <select id="need-task-id" style="flex: 1;">
                                <option value="">-- Select a Task --</option>
                            </select>
                            <button id="btn-edit-task" class="btn-secondary hidden" style="padding: 4px 8px; font-size: 12px;">Edit</button>
                        </div>
                    </div>

                    <!-- New/Edit Task Form (Hidden by default) -->
                    <div id="new-task-form" class="task-form-panel hidden">
                        <h4 id="task-form-title" class="task-form-title">Create New Task</h4>
                        <div class="form-group form-row">
                            <label for="new-task-id-input" class="label-fixed-sm">Task ID</label>
                            <input type="text" id="new-task-id-input" placeholder="e.g., custom_task_01" class="text-sm flex-1" />
                        </div>
                        <div class="form-group form-row">
                            <label for="new-task-title-input" class="label-fixed-sm">Title</label>
                            <input type="text" id="new-task-title-input" placeholder="e.g., My Custom Task" class="text-sm flex-1" />
                        </div>
                        <div class="form-group form-row-top">
                            <label for="new-task-desc-input" class="label-fixed-sm pt-1">Description</label>
                            <textarea id="new-task-desc-input" rows="2" placeholder="Task description..." class="text-sm flex-1"></textarea>
                        </div>

                        <div class="form-group form-row-top">
                            <label class="label-fixed-sm pt-1">Requirements</label>
                            <div class="flex-1">
                                <div id="task-requirements-list" class="req-list-panel">
                                    <em class="text-muted">No requirements defined.</em>
                                </div>
                                <div class="d-flex" style="gap: 5px;">
                                    <input type="text" id="new-req-input" placeholder="Add requirement..." class="text-sm flex-1" />
                                    <button id="btn-add-req" class="btn-secondary text-xs px-2 py-1">Add</button>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex justify-end mt-2" style="gap: 8px;">
                            <button id="btn-cancel-create-task" class="btn-secondary text-xs px-2 py-1">Cancel</button>
                            <button id="btn-confirm-create-task" class="btn-primary text-xs px-2 py-1">Create Task</button>
                        </div>
                    </div>

                    <div class="form-group form-row">
                        <label for="need-title" class="label-fixed">Title</label>
                        <input type="text" id="need-title" placeholder="e.g., Connect Light Component" style="flex: 1;" />
                    </div>
                    
                    <div class="form-group form-row-top">
                        <label for="need-description" class="label-fixed pt-2">Description</label>
                        <textarea id="need-description" rows="3" placeholder="Detailed explanation of what students need to accomplish..." style="flex: 1;"></textarea>
                    </div>
                    
                    <div class="form-group form-row">
                        <label class="label-fixed"></label>
                        <label style="flex: 1;">
                            <input type="checkbox" id="need-hidden" />
                            Hidden from students (assessment mode)
                        </label>
                    </div>
                    
                    <div class="form-group form-row">
                        <label for="need-threshold" class="label-fixed">Pass Threshold</label>
                        <div class="flex-1 d-flex align-center" style="gap: 10px;">
                            <input type="range" id="need-threshold" min="0" max="100" value="80" step="5" style="flex: 1;" />
                            <span id="threshold-value" class="text-center" style="min-width: 40px;">80</span>%
                        </div>
                    </div>
                    
                    <div class="form-group form-row-top mt-2">
                        <label class="label-fixed pt-1">Criteria</label>
                        <div class="flex-1">
                            <div id="criteria-list"></div>
                            <button type="button" id="add-criterion" class="btn-secondary" style="width: 100%; margin-top: 10px;">+ Add Criterion</button>
                        </div>
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
    document
      .getElementById("need-node-close")
      .addEventListener("click", handleClose);
    document
      .getElementById("need-node-cancel")
      .addEventListener("click", handleClose);

    // Save button
    document
      .getElementById("need-node-save")
      .addEventListener("click", () => this.save());

    // Threshold slider
    const thresholdSlider = document.getElementById("need-threshold");
    const thresholdValue = document.getElementById("threshold-value");
    thresholdSlider.addEventListener("input", (e) => {
      thresholdValue.textContent = e.target.value;
    });

    // Add criterion button
    document
      .getElementById("add-criterion")
      .addEventListener("click", () => this.addCriterion());

    // Task Creation/Editing Toggles
    const newTaskForm = document.getElementById("new-task-form");
    const showCreateBtn = document.getElementById("btn-show-create-task");
    const editTaskBtn = document.getElementById("btn-edit-task");
    const cancelCreateBtn = document.getElementById("btn-cancel-create-task");
    const confirmCreateBtn = document.getElementById("btn-confirm-create-task");
    const taskSelect = document.getElementById("need-task-id");

    // Show Edit button only when a task is selected
    taskSelect.addEventListener("change", () => {
      if (taskSelect.value) editTaskBtn.classList.remove("hidden");
      else editTaskBtn.classList.add("hidden");
    });

    showCreateBtn.addEventListener("click", () => {
      this.resetTaskForm("create");
      newTaskForm.classList.remove("hidden");
      showCreateBtn.classList.add("hidden");
      editTaskBtn.classList.add("hidden");
    });

    editTaskBtn.addEventListener("click", () => {
      const taskId = taskSelect.value;
      if (taskId) {
        this.populateTaskForm(taskId);
        newTaskForm.classList.remove("hidden");
        showCreateBtn.classList.add("hidden");
        editTaskBtn.classList.add("hidden");
      }
    });

    cancelCreateBtn.addEventListener("click", () => {
      this.closeTaskForm();
    });

    confirmCreateBtn.addEventListener("click", () => {
      this.createNewTask();
    });

    // Add Requirement Button
    document.getElementById("btn-add-req").addEventListener("click", () => {
      const input = document.getElementById("new-req-input");
      const text = input.value.trim();
      if (text) {
        this.tempRequirements.push({ description: text });
        this.renderRequirementsList();
        input.value = "";
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
    const taskSelect = document.getElementById("need-task-id");
    taskSelect.innerHTML = '<option value="">-- Select a Task --</option>';
    if (this.app.taskManager) {
      const tasks = this.app.taskManager.getAllTasks();
      if (tasks && tasks.length > 0) {
        tasks.forEach((task) => {
          const option = document.createElement("option");
          option.value = task.taskId;
          option.textContent = `${task.taskId}: ${task.title}`;
          taskSelect.appendChild(option);
        });
      }
    }

    // Update Edit button visibility based on initial selection
    const editTaskBtn = document.getElementById("btn-edit-task");
    if (editTaskBtn) {
      editTaskBtn.classList.add("hidden"); // Default to hidden
    }

    // Populate fields
    if (
      nodeData &&
      (nodeData.customData?.needNodeData || nodeData.needNodeData)
    ) {
      // Handle both new location (customData) and legacy/temp location
      const data = nodeData.customData?.needNodeData || nodeData.needNodeData;
      const taskId = data.taskId || "";
      document.getElementById("need-task-id").value = taskId;
      if (editTaskBtn)
        if (taskId) editTaskBtn.classList.remove("hidden");
        else editTaskBtn.classList.add("hidden");

      document.getElementById("need-title").value = data.title || "";
      document.getElementById("need-description").value =
        data.description || "";
      document.getElementById("need-hidden").checked = data.hidden || false;
      document.getElementById("need-threshold").value =
        data.passThreshold || 80;
      document.getElementById("threshold-value").textContent =
        data.passThreshold || 80;

      // Load criteria
      const criteriaList = document.getElementById("criteria-list");
      criteriaList.innerHTML = "";
      (data.criteria || []).forEach((criterion) => {
        this.addCriterion(criterion);
      });
    } else {
      // Reset for new node
      document.getElementById("need-task-id").value = "";
      document.getElementById("need-title").value = "New Need";
      document.getElementById("need-description").value = "";
      document.getElementById("need-hidden").checked = false;
      document.getElementById("need-threshold").value = 80;
      document.getElementById("threshold-value").textContent = "80";
      document.getElementById("criteria-list").innerHTML = "";
      this.addCriterion(); // Start with one empty criterion
    }

    this.modal.classList.add("full-overlay");
    this.modal.classList.remove("hidden");
  }

  /**
   * Add a criterion input row with structured validation rules
   * @param {Object} criterion - Existing criterion data (optional)
   */
  addCriterion(criterion = null) {
    const criteriaList = document.getElementById("criteria-list");

    const row = document.createElement("div");
    row.className = "criterion-row";
    row.classList.add("criterion-card");

    // Validator Type Dropdown
    const typeRow = document.createElement("div");
    typeRow.classList.add("d-flex", "align-center", "gap-2");

    const typeLabel = document.createElement("label");
    typeLabel.textContent = "Rule Type:";
    typeLabel.classList.add("label-fixed", "text-sm", "text-light");

    const typeSelect = document.createElement("select");
    typeSelect.className = "criterion-type-select";
    typeSelect.classList.add("flex-1", "text-sm");
    typeSelect.innerHTML = `
            <option value="">-- Select Validation Type --</option>
            <option value="${ValidatorTypes.NODE_EXISTS}">Check Node Exists</option>
            <option value="${ValidatorTypes.PIN_CONNECTED}">Check Pin Connected</option>
            <option value="${ValidatorTypes.VARIABLE_VALUE}">Check Variable Value</option>
            <option value="${ValidatorTypes.COMPONENT_EXISTS}">Check Component Exists</option>
            <option value="${ValidatorTypes.LINK_EXISTS}">Check Link Exists</option>
            <option value="${ValidatorTypes.NODE_PROPERTY}">Check Node Property</option>
        `;

    if (criterion && criterion.type) {
      typeSelect.value = criterion.type;
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-icon criterion-delete";
    deleteBtn.title = "Delete criterion";
    deleteBtn.textContent = "🗑️";
    deleteBtn.classList.add("btn-delete-red");

    typeRow.appendChild(typeLabel);
    typeRow.appendChild(typeSelect);
    typeRow.appendChild(deleteBtn);
    row.appendChild(typeRow);

    // Parameters Container (dynamically populated based on type)
    const paramsContainer = document.createElement("div");
    paramsContainer.className = "criterion-params";
    paramsContainer.classList.add("criterion-params-list");
    row.appendChild(paramsContainer);

    // Description Field
    const descRow = document.createElement("div");
    descRow.classList.add("d-flex", "align-center", "gap-2");

    const descLabel = document.createElement("label");
    descLabel.textContent = "Description:";
    descLabel.classList.add("label-fixed", "text-sm", "text-light");

    const descInput = document.createElement("input");
    descInput.type = "text";
    descInput.className = "criterion-description";
    descInput.placeholder = "User-friendly description of this requirement";
    descInput.value = criterion ? criterion.description || "" : "";
    descInput.classList.add("flex-1", "text-sm");

    descRow.appendChild(descLabel);
    descRow.appendChild(descInput);
    row.appendChild(descRow);

    // Event: Type change updates parameter fields
    typeSelect.addEventListener("change", () => {
      this.renderParameterFields(typeSelect.value, paramsContainer, criterion);
    });

    // Delete button
    deleteBtn.addEventListener("click", () => {
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
    container.innerHTML = ""; // Clear existing fields

    if (!validatorType) return;

    const params = criterion ? criterion.params || {} : {};

    const createField = (
      label,
      inputType,
      name,
      value,
      placeholder = "",
      options = null
    ) => {
      const fieldRow = document.createElement("div");
      fieldRow.classList.add("d-flex", "align-center", "gap-2");

      const fieldLabel = document.createElement("label");
      fieldLabel.textContent = label + ":";
      fieldLabel.classList.add("label-param");

      let input;
      if (inputType === "select" && options) {
        input = document.createElement("select");
        input.innerHTML = options
          .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
          .join("");
        if (value !== undefined) input.value = value;
      } else {
        input = document.createElement("input");
        input.type = inputType;
        input.value = value !== undefined ? value : "";
        input.placeholder = placeholder;
      }

      input.className = `criterion-param-${name}`;
      input.dataset.paramName = name;
      input.classList.add("input-param");

      fieldRow.appendChild(fieldLabel);
      fieldRow.appendChild(input);
      container.appendChild(fieldRow);
    };

    switch (validatorType) {
      case ValidatorTypes.NODE_EXISTS:
        createField(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., EventBeginPlay, PrintString"
        );
        createField("Minimum Count", "number", "count", params.count || 1, "1");
        break;

      case ValidatorTypes.PIN_CONNECTED:
        createField(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., EventBeginPlay"
        );
        createField("Pin ID", "text", "pinId", params.pinId, "e.g., exec_out");
        break;

      case ValidatorTypes.VARIABLE_VALUE: {
        // Get available variables for dropdown
        const variables = this.app.variables
          ? Array.from(this.app.variables.variables.keys())
          : [];
        const varOptions = [
          { value: "", label: "-- Select Variable --" },
          ...variables.map((v) => ({ value: v, label: v })),
        ];
        createField(
          "Variable Name",
          "select",
          "name",
          params.name,
          "",
          varOptions
        );
        createField(
          "Expected Value",
          "text",
          "value",
          params.value,
          'e.g., 10, "Hello"'
        );
        createField(
          "Operator",
          "select",
          "operator",
          params.operator || "==",
          "",
          [
            { value: "==", label: "Equals (==)" },
            { value: "!=", label: "Not Equals (!=)" },
            { value: ">", label: "Greater Than (>)" },
            { value: "<", label: "Less Than (<)" },
          ]
        );
        break;
      }

      case ValidatorTypes.COMPONENT_EXISTS:
        createField(
          "Component Type",
          "text",
          "type",
          params.type,
          "e.g., PointLight, Camera"
        );
        createField(
          "Component Name",
          "text",
          "name",
          params.name,
          "(Optional) Specific component name"
        );
        break;

      case ValidatorTypes.LINK_EXISTS:
        createField(
          "Source Node",
          "text",
          "sourceNode",
          params.sourceNode,
          "e.g., EventBeginPlay"
        );
        createField(
          "Source Pin",
          "text",
          "sourcePin",
          params.sourcePin,
          "e.g., exec_out"
        );
        createField(
          "Target Node",
          "text",
          "targetNode",
          params.targetNode,
          "e.g., PrintString"
        );
        createField(
          "Target Pin",
          "text",
          "targetPin",
          params.targetPin,
          "(Optional) e.g., exec_in"
        );
        break;

      case ValidatorTypes.NODE_PROPERTY:
        createField(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., PrintString"
        );
        createField(
          "Pin ID (Property)",
          "text",
          "pinId",
          params.pinId,
          "e.g., str_in"
        );
        createField(
          "Expected Value",
          "text",
          "value",
          params.value,
          "e.g., Hello World"
        );
        break;
    }
  }

  /**
   * Save the NeedNode configuration
   */
  save() {
    const taskId = document.getElementById("need-task-id").value;
    const title = document.getElementById("need-title").value.trim();
    const description = document
      .getElementById("need-description")
      .value.trim();
    const hidden = document.getElementById("need-hidden").checked;
    const passThreshold = parseInt(
      document.getElementById("need-threshold").value
    );

    // Collect structured criteria
    const criteriaRows = document.querySelectorAll(".criterion-row");
    const criteria = Array.from(criteriaRows)
      .map((row, index) => {
        const typeSelect = row.querySelector(".criterion-type-select");
        const descInput = row.querySelector(".criterion-description");
        const paramsContainer = row.querySelector(".criterion-params");

        const type = typeSelect ? typeSelect.value : "";
        const desc = descInput ? descInput.value.trim() : "";

        // Collect parameters based on type
        const params = {};
        if (paramsContainer && type) {
          const paramInputs =
            paramsContainer.querySelectorAll("[data-param-name]");
          paramInputs.forEach((input) => {
            const paramName = input.dataset.paramName;
            let value = input.value;

            // Convert to appropriate type
            if (input.type === "number") {
              value = parseInt(value) || 1;
            }

            if (value !== "" && value !== undefined) {
              params[paramName] = value;
            }
          });
        }

        return {
          id: `criterion-${index}`,
          type: type,
          params: params,
          description: desc,
          passed: false,
        };
      })
      .filter((c) => c.type && c.description.length > 0); // Only include criteria with type and description

    if (!title) {
      window.alert("Please enter a title for the Need Node");
      return;
    }

    if (criteria.length === 0) {
      window.alert(
        "Please add at least one criterion with a type and description"
      );
      return;
    }

    const needNodeData = {
      taskId,
      title,
      description,
      hidden,
      passThreshold,
      criteria,
    };

    // If editing existing node, update it
    if (this.currentNode) {
      if (!this.currentNode.customData) this.currentNode.customData = {};
      this.currentNode.customData.needNodeData = needNodeData;

      const nodeEl = document.getElementById(this.currentNode.id);
      if (nodeEl) {
        const titleEl = nodeEl.querySelector(".node-title");
        if (titleEl) titleEl.textContent = title;
      }
      this.app.persistence.autoSave();
    } else {
      // Create new node at the pending location
      if (this._pendingLocation) {
        const node = this.app.graph.addNode(
          "NeedNode",
          this._pendingLocation.x,
          this._pendingLocation.y
        );
        if (node) {
          if (!node.customData) node.customData = {};
          node.customData.needNodeData = needNodeData;

          // Update the node title in the DOM
          const nodeEl = document.getElementById(node.id);
          if (nodeEl) {
            // The title is inside a span within .node-title
            const titleEl = nodeEl.querySelector(".node-title span:last-child");
            if (titleEl) {
              titleEl.textContent = title;
            }
          }
        } else {
          console.error("Failed to create NeedNode - addNode returned null");
        }
        this._pendingLocation = null;
        this.app.persistence.autoSave();
      } else {
        console.error("Cannot create NeedNode: _pendingLocation is not set!");
      }
    }

    this.close();
  }

  /**
   * Close the task creation/edit form if it's open
   * @returns {boolean} True if the form was closed, false if it wasn't open
   */
  closeTaskForm() {
    const newTaskForm = document.getElementById("new-task-form");
    if (newTaskForm && !newTaskForm.classList.contains("hidden")) {
      newTaskForm.classList.add("hidden");

      const showCreateBtn = document.getElementById("btn-show-create-task");
      const editTaskBtn = document.getElementById("btn-edit-task");
      const taskSelect = document.getElementById("need-task-id");

      if (showCreateBtn) showCreateBtn.classList.remove("hidden");
      if (editTaskBtn && taskSelect)
        if (taskSelect.value) editTaskBtn.classList.remove("hidden");
        else editTaskBtn.classList.add("hidden");

      return true;
    }
    return false;
  }

  /**
   * Reset task form for creation or editing
   */
  resetTaskForm(mode) {
    const idInput = document.getElementById("new-task-id-input");
    const titleInput = document.getElementById("new-task-title-input");
    const descInput = document.getElementById("new-task-desc-input");
    const formTitle = document.getElementById("task-form-title");
    const confirmBtn = document.getElementById("btn-confirm-create-task");

    if (mode === "create") {
      formTitle.textContent = "Create New Task";
      confirmBtn.textContent = "Create Task";
      idInput.value = "";
      idInput.disabled = false;
      titleInput.value = "";
      descInput.value = "";
      this.tempRequirements = [];
      this.renderRequirementsList();
      confirmBtn.dataset.mode = "create";
    } else {
      formTitle.textContent = "Edit Task";
      confirmBtn.textContent = "Update Task";
      idInput.disabled = true; // ID cannot be changed
      confirmBtn.dataset.mode = "edit";
    }
  }

  /**
   * Populate form with existing task data
   */
  populateTaskForm(taskId) {
    const task = this.app.taskManager.getTaskById(taskId);
    if (task) {
      this.resetTaskForm("edit");
      document.getElementById("new-task-id-input").value = task.taskId;
      document.getElementById("new-task-title-input").value = task.title;
      document.getElementById("new-task-desc-input").value =
        task.description || "";

      document.getElementById("new-task-desc-input").value =
        task.description || "";

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
    const reqList = document.getElementById("task-requirements-list");
    if (!reqList) return;

    reqList.innerHTML = "";
    if (this.tempRequirements.length > 0) {
      this.tempRequirements.forEach((req, index) => {
        const div = document.createElement("div");
        div.classList.add("req-item-row");

        const textSpan = document.createElement("span");
        textSpan.textContent =
          req.description || req.text || req.id || "Unknown Requirement";

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "&times;";
        delBtn.classList.add("btn-delete-text");
        delBtn.onclick = () => {
          this.tempRequirements.splice(index, 1);
          this.renderRequirementsList();
        };

        div.appendChild(textSpan);
        div.appendChild(delBtn);
        reqList.appendChild(div);
      });
    } else {
      reqList.innerHTML =
        '<em class="text-muted">No requirements defined.</em>';
    }
  }

  /**
   * Create or Update a task from the modal inputs
   */
  createNewTask() {
    const idInput = document.getElementById("new-task-id-input");
    const titleInput = document.getElementById("new-task-title-input");
    const descInput = document.getElementById("new-task-desc-input");

    const taskId = idInput.value.trim();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!taskId || !title) {
      window.alert("Task ID and Title are required.");
      return;
    }

    const confirmBtn = document.getElementById("btn-confirm-create-task");
    const mode = confirmBtn.dataset.mode || "create";
    let success = false;

    if (mode === "create") {
      const newTask = {
        taskId: taskId,
        title: title,
        description: description,
        requirements: this.tempRequirements,
      };
      success = this.app.taskManager.addTask(newTask);
    } else {
      // Update existing
      const updatedTask = {
        taskId: taskId,
        title: title,
        description: description,
        requirements: this.tempRequirements,
      };
      success = this.app.taskManager.updateTask(updatedTask);
    }

    if (success) {
      const taskSelect = document.getElementById("need-task-id");

      if (mode === "create") {
        // Add new option
        const option = document.createElement("option");
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
      idInput.value = "";
      titleInput.value = "";
      descInput.value = "";
      document.getElementById("new-task-form").classList.add("hidden");
      document
        .getElementById("btn-show-create-task")
        .classList.remove("hidden");
      document.getElementById("btn-edit-task").classList.remove("hidden");
    } else {
      window.alert(
        mode === "create"
          ? "Failed to create task. ID might already exist."
          : "Failed to update task."
      );
    }
  }

  /**
   * Close the modal
   */
  close() {
    this.modal.classList.add("hidden");
    this.currentNode = null;
  }
}
