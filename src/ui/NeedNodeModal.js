/**
 * NeedNodeModal - UI for creating and editing NeedNode assessment criteria
 */
import { ValidatorTypes } from "../services/GraphValidator.js";
import { NeedNodeFormHelper } from "./NeedNodeFormHelper.js";
import { TaskFormController } from "./TaskFormController.js";

export class NeedNodeModal {
  constructor(app) {
    this.app = app;
    this.currentNode = null;
    this.taskForm = new TaskFormController(app, this);
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

    modal.innerHTML = NeedNodeFormHelper.getModalTemplate();

    document.body.appendChild(modal);
    this.modal = modal;
    this.bindEvents();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // 1. Delegate Task Form Events to Controller
    this.taskForm.bindEvents();

    // 2. Need Node Modal Events
    const handleClose = () => {
      // Try to close sub-form first
      if (!this.taskForm.closeForm()) {
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
  }

  /**
   * Open modal for a specific node
   * @param {Object} nodeData - The node data to edit (or null for new)
   * @param {Object} pendingLocation - Location for new node (optional)
   */
  open(nodeData = null, pendingLocation = null) {
    this.currentNode = nodeData;
    this._pendingLocation = pendingLocation;

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
    NeedNodeFormHelper.renderParameterFields(
      validatorType,
      container,
      criterion,
      this.app.variables ? this.app.variables.variables : null
    );
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
   * Close the modal
   */
  close() {
    this.modal.classList.add("hidden");
    this.currentNode = null;
  }
}
