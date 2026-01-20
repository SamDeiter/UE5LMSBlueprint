/**
 * NeedNodeFormHelper - HTML generation helpers for NeedNodeModal
 */
import { ValidatorTypes } from "../services/GraphValidator.js";

export const NeedNodeFormHelper = {
  /**
   * Returns the main modal HTML template
   */
  getModalTemplate() {
    return `
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
            </div>`;
  },

  /**
   * Helper to append a single parameter field to a container
   */
  createField(
    container,
    label,
    inputType,
    name,
    value,
    placeholder = "",
    options = null
  ) {
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
  },

  /**
   * Renders the parameter fields for a specific validator type
   */
  renderParameterFields(
    validatorType,
    container,
    criterion = null,
    appVars = null
  ) {
    container.innerHTML = ""; // Clear existing fields

    if (!validatorType) return;

    const params = criterion ? criterion.params || {} : {};

    // Wrapper for CreateField to save repetitive args
    const add = (label, type, name, val, ph, opts) =>
      this.createField(container, label, type, name, val, ph, opts);

    switch (validatorType) {
      case ValidatorTypes.NODE_EXISTS:
        add(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., EventBeginPlay, PrintString"
        );
        add("Minimum Count", "number", "count", params.count || 1, "1");
        break;

      case ValidatorTypes.PIN_CONNECTED:
        add(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., EventBeginPlay"
        );
        add("Pin ID", "text", "pinId", params.pinId, "e.g., exec_out");
        break;

      case ValidatorTypes.VARIABLE_VALUE: {
        // Get available variables for dropdown
        const variables = appVars ? Array.from(appVars.keys()) : [];
        const varOptions = [
          { value: "", label: "-- Select Variable --" },
          ...variables.map((v) => ({ value: v, label: v })),
        ];
        add("Variable Name", "select", "name", params.name, "", varOptions);
        add(
          "Expected Value",
          "text",
          "value",
          params.value,
          'e.g., 10, "Hello"'
        );
        add("Operator", "select", "operator", params.operator || "==", "", [
          { value: "==", label: "Equals (==)" },
          { value: "!=", label: "Not Equals (!=)" },
          { value: ">", label: "Greater Than (>)" },
          { value: "<", label: "Less Than (<)" },
        ]);
        break;
      }

      case ValidatorTypes.COMPONENT_EXISTS:
        add(
          "Component Type",
          "text",
          "type",
          params.type,
          "e.g., PointLight, Camera"
        );
        add(
          "Component Name",
          "text",
          "name",
          params.name,
          "(Optional) Specific component name"
        );
        break;

      case ValidatorTypes.LINK_EXISTS:
        add(
          "Source Node",
          "text",
          "sourceNode",
          params.sourceNode,
          "e.g., EventBeginPlay"
        );
        add(
          "Source Pin",
          "text",
          "sourcePin",
          params.sourcePin,
          "e.g., exec_out"
        );
        add(
          "Target Node",
          "text",
          "targetNode",
          params.targetNode,
          "e.g., PrintString"
        );
        add(
          "Target Pin",
          "text",
          "targetPin",
          params.targetPin,
          "(Optional) e.g., exec_in"
        );
        break;

      case ValidatorTypes.NODE_PROPERTY:
        add(
          "Node Type",
          "text",
          "nodeKey",
          params.nodeKey,
          "e.g., PrintString"
        );
        add("Pin ID (Property)", "text", "pinId", params.pinId, "e.g., str_in");
        add(
          "Expected Value",
          "text",
          "value",
          params.value,
          "e.g., Hello World"
        );
        break;
    }
  },
};
