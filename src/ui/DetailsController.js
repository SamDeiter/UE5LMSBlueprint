/**
 * DetailsController - Manages the details panel for nodes and variables
 */
import { Utils } from "../utils.js";
import { generateGUID } from "../utils/guid.js";
import { Pin } from "../graph/index.js";
import { setupToggle } from "./ui-helpers.js";
import { DetailsRenderer } from "./DetailsRenderer.js";
import { DetailsTypeSelector } from "./DetailsTypeSelector.js";

export class DetailsController {
  constructor(app) {
    this.app = app;
    this.panel = document.getElementById("details-panel");
    this.currentVariable = null;
    this.typeSelector = new DetailsTypeSelector(this);
    this.clear();
  }

  clear() {
    this.panel.innerHTML =
      '<p style="color: #aaa; padding: 15px;">Select a node or variable to see details.</p>';
    this.currentVariable = null;
  }

  // UPDATED: Variable and Default Value sections are now collapsible (default: Expanded)
  showVariableDetails(variable, isPrimarySelection = false) {
    if (isPrimarySelection) {
      this.app.graph.clearSelection();
      this.currentVariable = variable;
    }

    this.app.wiring.clearLinkSelection();

    // --- NEW: UE5-Style Panel Layout ---
    this.panel.innerHTML = ""; // Force DOM clear for refresh
    const fragment = document.createDocumentFragment();

    // Generate property flags HTML before template
    const propertyFlagsHTML = `
            ${DetailsRenderer.renderPropertyFlag("CPF_Edit", variable.cpfEdit)}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_BlueprintVisible",
              variable.cpfBlueprintVisible
            )}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_ZeroConstructor",
              variable.cpfZeroConstructor
            )}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_DisableEditOnInstance",
              variable.cpfDisableEditOnInstance
            )}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_IsPlainOldData",
              variable.cpfIsPlainOldData
            )}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_NoDestructor",
              variable.cpfNoDestructor
            )}
            ${DetailsRenderer.renderPropertyFlag(
              "CPF_HasGetValueTypeHash",
              variable.cpfHasGetValueTypeHash
            )}
        `;

    // Compose the full panel using helper methods
    const defaultValueHTML = DetailsRenderer.renderDefaultValueInput(variable);

    const contentWrapper = document.createElement("div");
    contentWrapper.innerHTML = `
            ${DetailsRenderer.renderVariableSection(variable)}
            ${DetailsRenderer.renderAdvancedSection(
              variable,
              propertyFlagsHTML
            )}
            ${DetailsRenderer.renderDefaultValueSection(
              variable,
              defaultValueHTML
            )}
        `;
    fragment.appendChild(contentWrapper);
    this.panel.appendChild(fragment);

    // Setup Toggles using shared helper
    setupToggle(
      "variable-toggle",
      "variable-content",
      "variable-icon",
      true,
      this.panel
    ); // Variable: Expanded
    setupToggle(
      "advanced-toggle",
      "advanced-content",
      "advanced-icon",
      false,
      this.panel
    ); // Advanced: Collapsed
    setupToggle(
      "default-toggle",
      "default-content",
      "default-icon",
      true,
      this.panel
    ); // Default Value: Expanded

    // Bind Custom Dropdown Triggers
    const typeTrigger = this.panel.querySelector("#var-type-trigger");
    if (typeTrigger) {
      typeTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = typeTrigger.getBoundingClientRect();
        this.typeSelector.showTypeMenu(
          rect.left,
          rect.bottom + 5,
          (newType) => {
            this.app.variables.updateVariableProperty(
              variable,
              "type",
              newType
            );
          }
        );
      });
    }

    const containerTrigger = this.panel.querySelector("#var-container-trigger");
    if (containerTrigger) {
      containerTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = containerTrigger.getBoundingClientRect();
        this.typeSelector.showContainerTypeMenu(
          rect.left,
          rect.bottom + 5,
          variable.type,
          (newContainerType) => {
            this.app.variables.updateVariableProperty(
              variable,
              "containerType",
              newContainerType
            );
          }
        );
      });
    }

    // Bind generic handlers (for inputs and standard selects)
    this.panel.querySelectorAll("[data-prop]").forEach((input) => {
      input.addEventListener("change", (e) => {
        const prop = e.target.dataset.prop;
        const arrayIndex = e.target.dataset.arrayIndex;
        const mapIndex = e.target.dataset.mapIndex;
        const mapField = e.target.dataset.mapField;

        let value;
        if (e.target.type === "checkbox") {
          value = e.target.checked;
          // If deprecated flag changes, enable/disable the message input
          if (prop === "deprecated") {
            const msgInput = this.panel.querySelector(
              '[data-prop="deprecationMessage"]'
            );
            if (msgInput) {
              msgInput.disabled = !value;
              msgInput.classList.toggle("opacity-100", value);
              msgInput.classList.toggle("opacity-30", !value);
            }
          }
        } else if (e.target.type === "number") {
          value = parseFloat(e.target.value);
        } else {
          value = e.target.value;
        }

        const vectorComponent = e.target.dataset.vectorComponent;
        const transformComponent = e.target.dataset.transformComponent;

        if (vectorComponent) {
          // Handle Vector/Rotator component update
          const parsed = DetailsRenderer.parseVectorValue(
            variable.defaultValue
          );
          parsed[vectorComponent] = parseFloat(e.target.value) || 0;
          const newValue = `(${parsed.x},${parsed.y},${parsed.z})`;
          this.app.variables.updateVariableProperty(
            variable,
            "defaultValue",
            newValue
          );
        } else if (transformComponent) {
          // Handle Transform component update (e.g., "location-x", "rotation-y", "scale-z")
          const [section, axis] = transformComponent.split("-");
          const parsed = DetailsRenderer.parseTransformValue(
            variable.defaultValue
          );
          parsed[section][axis] = parseFloat(e.target.value) || 0;
          const newValue = `(${parsed.location.x},${parsed.location.y},${parsed.location.z}|${parsed.rotation.x},${parsed.rotation.y},${parsed.rotation.z}|${parsed.scale.x},${parsed.scale.y},${parsed.scale.z})`;
          this.app.variables.updateVariableProperty(
            variable,
            "defaultValue",
            newValue
          );
        } else if (mapIndex !== undefined && mapField !== undefined) {
          // Handle Map Update
          const index = parseInt(mapIndex);
          const newMap = [...variable.defaultValue];
          if (!newMap[index]) newMap[index] = {};
          newMap[index][mapField] = value;
          this.app.variables.updateVariableProperty(
            variable,
            "defaultValue",
            newMap
          );
        } else if (arrayIndex !== undefined) {
          // Handle Array Update
          const index = parseInt(arrayIndex);
          const newArray = [...variable.defaultValue];
          newArray[index] = value;
          this.app.variables.updateVariableProperty(
            variable,
            "defaultValue",
            newArray
          );
        } else {
          this.app.variables.updateVariableProperty(variable, prop, value);
        }
      });

      if (input.tagName === "INPUT" || input.tagName === "TEXTAREA") {
        input.addEventListener("input", (e) => {
          const prop = e.target.dataset.prop;

          // Skip live updates for Variable Name to prevent focus loss (update on blur/enter instead)
          if (prop === "name") return;

          const arrayIndex = e.target.dataset.arrayIndex;
          const mapIndex = e.target.dataset.mapIndex;
          const mapField = e.target.dataset.mapField;

          let value = e.target.value;
          if (e.target.type === "number") {
            value = parseFloat(e.target.value);
          }

          const vectorComponent = e.target.dataset.vectorComponent;
          const transformComponent = e.target.dataset.transformComponent;

          if (vectorComponent) {
            // Handle Vector/Rotator component update
            const parsed = DetailsRenderer.parseVectorValue(
              variable.defaultValue
            );
            parsed[vectorComponent] = parseFloat(e.target.value) || 0;
            const newValue = `(${parsed.x},${parsed.y},${parsed.z})`;
            this.app.variables.updateVariableProperty(
              variable,
              "defaultValue",
              newValue,
              true
            );
          } else if (transformComponent) {
            // Handle Transform component update
            const [section, axis] = transformComponent.split("-");
            const parsed = DetailsRenderer.parseTransformValue(
              variable.defaultValue
            );
            parsed[section][axis] = parseFloat(e.target.value) || 0;
            const newValue = `(${parsed.location.x},${parsed.location.y},${parsed.location.z}|${parsed.rotation.x},${parsed.rotation.y},${parsed.rotation.z}|${parsed.scale.x},${parsed.scale.y},${parsed.scale.z})`;
            this.app.variables.updateVariableProperty(
              variable,
              "defaultValue",
              newValue,
              true
            );
          } else if (mapIndex !== undefined && mapField !== undefined) {
            // Handle Map Update
            const index = parseInt(mapIndex);
            const newMap = [...variable.defaultValue];
            if (!newMap[index]) newMap[index] = {};
            newMap[index][mapField] = value;
            this.app.variables.updateVariableProperty(
              variable,
              "defaultValue",
              newMap,
              true
            );
          } else if (arrayIndex !== undefined) {
            // Handle Array Update (Debounced or immediate? Immediate for now)
            const index = parseInt(arrayIndex);
            const newArray = [...variable.defaultValue];
            newArray[index] = value;
            this.app.variables.updateVariableProperty(
              variable,
              "defaultValue",
              newArray,
              true
            );
          } else {
            this.app.variables.updateVariableProperty(
              variable,
              prop,
              value,
              true
            );
          }
        });
      }
    });

    if (isPrimarySelection) {
      setTimeout(() => {
        const varEl = document.querySelector(
          `.tree-item[data-var-id="${variable.id}"]`
        );
        if (varEl) {
          varEl.focus();
        }
      }, 0);
    }
  }

  addArrayElement(varId) {
    // Try currentVariable first, then search by ID
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;

    // If not found, search through all variables by ID
    if (!variable) {
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    }

    if (!variable) return;

    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    // Add default value based on type
    const type = variable.type;
    let newVal = "";
    if (type === "bool") newVal = false;
    else if (
      type === "int" ||
      type === "int64" ||
      type === "byte" ||
      type === "float"
    )
      newVal = 0;
    else if (type === "vector") newVal = "(0,0,0)";
    else if (type === "rotator") newVal = "(0,0,0)";
    else if (type === "transform") newVal = "(0,0,0|0,0,0|1,1,1)";

    const newArray = [...variable.defaultValue, newVal];
    this.app.variables.updateVariableProperty(
      variable,
      "defaultValue",
      newArray
    );
  }

  removeArrayElement(varId, index) {
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;
    if (!variable)
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    if (!variable) return;

    if (Array.isArray(variable.defaultValue)) {
      const newArray = [...variable.defaultValue];
      newArray.splice(index, 1);
      this.app.variables.updateVariableProperty(
        variable,
        "defaultValue",
        newArray
      );
    }
  }

  clearArrayElements(varId) {
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;
    if (!variable)
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    if (!variable) return;

    this.app.variables.updateVariableProperty(variable, "defaultValue", []);
  }

  addMapElement(varId) {
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;
    if (!variable)
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    if (!variable) return;

    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    // Add default key-value pair based on type
    const type = variable.type;
    let newVal = "";
    if (type === "bool") newVal = false;
    else if (
      type === "int" ||
      type === "int64" ||
      type === "byte" ||
      type === "float"
    )
      newVal = 0;
    else if (type === "vector") newVal = "(0,0,0)";
    else if (type === "rotator") newVal = "(0,0,0)";
    else if (type === "transform") newVal = "(0,0,0|0,0,0|1,1,1)";

    const newEntry = { key: "", value: newVal };
    const newMap = [...variable.defaultValue, newEntry];
    this.app.variables.updateVariableProperty(variable, "defaultValue", newMap);
  }

  removeMapElement(varId, index) {
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;
    if (!variable)
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    if (!variable) return;

    if (Array.isArray(variable.defaultValue)) {
      const newMap = [...variable.defaultValue];
      newMap.splice(index, 1);
      this.app.variables.updateVariableProperty(
        variable,
        "defaultValue",
        newMap
      );
    }
  }

  clearMapElements(varId) {
    let variable =
      this.currentVariable && this.currentVariable.id === varId
        ? this.currentVariable
        : null;
    if (!variable)
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    if (!variable) return;

    this.app.variables.updateVariableProperty(variable, "defaultValue", []);
  }

  showNodeDetails(node) {
    this.currentVariable = null;
    this.app.wiring.clearLinkSelection();

    if (node.nodeKey.startsWith("Get_") || node.nodeKey.startsWith("Set_")) {
      const key = node.nodeKey;
      const underscoreIndex = key.indexOf("_");
      if (underscoreIndex !== -1) {
        let varName = key.substring(underscoreIndex + 1);
        // Attempt exact match first
        let variable = this.app.variables.variables.get(varName);

        if (!variable) {
          // Fallback: Iterate values to check for ID match if name match fails
          // This catches cases where nodeKey is stale but variableId is correct
          variable = [...this.app.variables.variables.values()].find(
            (v) => v.id === node.variableId
          );
        }

        if (variable) {
          this.showVariableDetails(variable, false);
          return;
        }
      }
    }

    if (node.nodeKey === "CustomEvent") {
      this.showCustomEventDetails(node);
      return;
    }

    // Special handling for NeedNode
    if (node.nodeKey === "NeedNode") {
      const needData = node.customData?.needNodeData || {};
      const criteriaCount = needData.criteria?.length || 0;

      this.panel.innerHTML = `
                <div class="details-group">
                    <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                        <i class="fas fa-caret-down"></i> Need Node
                    </h4>
                    <div class="detail-row">
                        <label>Title</label>
                        <span class="detail-value-static">${
                          needData.title || "Not configured"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Task ID</label>
                        <span class="detail-value-static">${
                          needData.taskId || "None"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Description</label>
                        <span class="detail-value-static" style="font-size: 10px; color: #999;">${
                          needData.description || "None"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Criteria</label>
                        <span class="detail-value-static">${criteriaCount} requirement(s)</span>
                    </div>
                    <div class="detail-row">
                        <label>Pass Threshold</label>
                        <span class="detail-value-static">${
                          needData.passThreshold || 80
                        }%</span>
                    </div>
                    <div class="detail-row">
                        <label>Hidden</label>
                        <span class="detail-value-static">${
                          needData.hidden ? "Yes" : "No"
                        }</span>
                    </div>
                </div>
                <div class="details-group">
                    <button id="edit-need-node-btn" class="btn-primary" style="width: 100%; padding: 8px;">
                        <i class="fas fa-edit"></i> Edit Configuration
                    </button>
                </div>
            `;

      const editBtn = this.panel.querySelector("#edit-need-node-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (this.app.needNodeModal) {
            this.app.needNodeModal.open(node);
          }
        });
      }
      return;
    }

    this.panel.innerHTML = `
            <div class="details-group">
                <h4>Node Details</h4>
                <div class="detail-row">
                    <label>Title</label>
                    <span class="detail-value-static">${
                      node.title || node.nodeKey
                    }</span>
                </div>
                 <div class="detail-row">
                    <label>Type</label>
                    <span class="detail-value-static">${node.type}</span>
                </div>
                <div class="detail-row">
                    <label>Class</label>
                    <span class="detail-value-static">${node.nodeKey}</span>
                </div>
            </div>
            <div class="details-group">
                <p style="color: #aaa;">This is a basic inspector. Full configuration options would appear here.</p>
            </div>
        `;
  }

  showComponentDetails(component) {
    this.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    if (!component) {
      this.panel.innerHTML =
        '<p style="color: #aaa; padding: 15px;">Select a component to see details.</p>';
      return;
    }

    this.panel.innerHTML = `
            <div class="details-group">
                <h4>Component Details</h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="comp-name-input" class="details-input" value="${component.name}">
                </div>
                <div class="detail-row">
                    <label>Type</label>
                    <span class="detail-value-static">${component.type}</span>
                </div>
            </div>
            <div class="details-group">
                <h4>Transform</h4>
                <div class="detail-row">
                    <label>Location</label>
                    <span class="detail-value-static">(0, 0, 0)</span>
                </div>
                <div class="detail-row">
                    <label>Rotation</label>
                    <span class="detail-value-static">(0, 0, 0)</span>
                </div>
                <div class="detail-row">
                    <label>Scale</label>
                    <span class="detail-value-static">(1, 1, 1)</span>
                </div>
            </div>
        `;

    const nameInput = this.panel.querySelector("#comp-name-input");
    if (nameInput) {
      nameInput.addEventListener("change", (e) => {
        const newName = e.target.value.trim();
        if (newName && newName !== component.name) {
          component.name = newName;
          this.app.componentsController.updateNodeLibrary();
          this.app.componentsController.render();
          if (this.app.variables) this.app.variables.renderPanel();
          this.app.persistence.autoSave();
        }
      });
    }
  }

  showCustomEventDetails(node) {
    const updateReliableState = () => {
      const isReplicated =
        (node.customData.replicates || "NotReplicated") !== "NotReplicated";
      const reliableCheckbox = this.panel.querySelector("#reliable-checkbox");
      const reliableLabel = this.panel.querySelector("#reliable-label");

      if (reliableCheckbox) {
        reliableCheckbox.disabled = !isReplicated;
        reliableCheckbox.classList.toggle("opacity-100", isReplicated);
        reliableCheckbox.classList.toggle("opacity-50", !isReplicated);
        if (!isReplicated) reliableCheckbox.checked = false;
      }

      if (reliableLabel) {
        reliableLabel.classList.toggle("text-enabled", isReplicated);
        reliableLabel.classList.toggle("text-disabled", !isReplicated);
      }
    };

    this.panel.innerHTML = `
            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                    <i class="fas fa-caret-down"></i> Graph Node
                </h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="node-title-input" class="details-input" value="${
                      node.title
                    }" style="width: 60%;">
                </div>
            </div>

            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                     <i class="fas fa-caret-down"></i> Graph
                </h4>
                <div class="detail-row">
                    <label>Keywords</label>
                    <input type="text" id="keywords-input" class="details-input" placeholder="" value="${
                      node.customData.keywords || ""
                    }" style="width: 60%;">
                </div>
                 <div class="detail-row">
                    <label>Replicates</label>
                    <select id="replicates-select" class="details-select" style="width: 60%;">
                        <option value="NotReplicated" ${
                          node.customData.replicates === "NotReplicated"
                            ? "selected"
                            : ""
                        }>Not Replicated</option>
                        <option value="Multicast" ${
                          node.customData.replicates === "Multicast"
                            ? "selected"
                            : ""
                        }>Multicast</option>
                        <option value="RunOnServer" ${
                          node.customData.replicates === "RunOnServer"
                            ? "selected"
                            : ""
                        }>Run on Server</option>
                        <option value="RunOnOwningClient" ${
                          node.customData.replicates === "RunOnOwningClient"
                            ? "selected"
                            : ""
                        }>Run on Owning Client</option>
                    </select>
                </div>
                 <div class="detail-row" style="justify-content: flex-end;">
                    <div style="width: 60%; display: flex; align-items: center;">
                        <input type="checkbox" id="reliable-checkbox" class="ue5-checkbox" ${
                          node.customData.reliable ? "checked" : ""
                        }>
                        <span id="reliable-label" style="margin-left: 8px; color: #666;">Reliable</span>
                    </div>
                </div>
                 <div class="detail-row">
                    <label>Call In Editor</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="call-in-editor-checkbox" class="ue5-checkbox" ${
                          node.customData.callInEditor ? "checked" : ""
                        }>
                    </div>
                </div>
                 <div class="detail-row">
                    <label>Access Specifier</label>
                     <select id="access-specifier-select" class="details-select" style="width: 60%;">
                        <option value="Public" ${
                          node.customData.accessSpecifier === "Public"
                            ? "selected"
                            : ""
                        }>Public</option>
                        <option value="Private" ${
                          node.customData.accessSpecifier === "Private"
                            ? "selected"
                            : ""
                        }>Private</option>
                        <option value="Protected" ${
                          node.customData.accessSpecifier === "Protected"
                            ? "selected"
                            : ""
                        }>Protected</option>
                    </select>
                </div>
            </div>

            <div class="details-group">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0;">
                        <i class="fas fa-caret-down"></i> Inputs
                    </h4>
                    <i class="fas fa-plus-circle" id="add-input-param-btn" style="color: #ccc; cursor: pointer;"></i>
                </div>
                <div id="custom-inputs-list"></div>
            </div>
        `;

    updateReliableState();

    const titleInput = this.panel.querySelector("#node-title-input");
    if (titleInput) {
      titleInput.addEventListener("input", (e) => {
        node.title = e.target.value;
        const titleEl = node.element.querySelector(
          ".node-title span:last-child"
        );
        if (titleEl) {
          titleEl.textContent = node.title;
        }
        this.app.persistence.autoSave();
      });
    }

    const bindProperty = (selector, propName, isCheckbox = false) => {
      const el = this.panel.querySelector(selector);
      if (el) {
        el.addEventListener("change", (e) => {
          node.customData[propName] = isCheckbox
            ? e.target.checked
            : e.target.value;
          this.app.persistence.autoSave();
          if (propName === "replicates") {
            updateReliableState();
          }
        });
      }
    };

    bindProperty("#keywords-input", "keywords");
    bindProperty("#replicates-select", "replicates");
    bindProperty("#reliable-checkbox", "reliable", true);
    bindProperty("#call-in-editor-checkbox", "callInEditor", true);
    bindProperty("#access-specifier-select", "accessSpecifier");

    const addBtn = this.panel.querySelector("#add-input-param-btn");
    addBtn.addEventListener("click", () => {
      this.addCustomParameter(node);
    });

    this.renderCustomParameters(node);
  }

  showFunctionDetails(func) {
    this.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    this.panel.innerHTML = `
            <div class="details-group">
                <h4>Function Details</h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="func-name-input" class="details-input" value="${
                      func.name
                    }">
                </div>
                <div class="detail-row">
                    <label>Description</label>
                    <input type="text" id="func-desc-input" class="details-input" value="${
                      func.description || ""
                    }">
                </div>
                <div class="detail-row">
                    <label>Category</label>
                    <input type="text" id="func-cat-input" class="details-input" value="${
                      func.category || "Default"
                    }">
                </div>
                <div class="detail-row">
                    <label>Access Specifier</label>
                    <select id="func-access-select" class="details-select">
                        <option value="Public" ${
                          func.accessSpecifier === "Public" ? "selected" : ""
                        }>Public</option>
                        <option value="Private" ${
                          func.accessSpecifier === "Private" ? "selected" : ""
                        }>Private</option>
                        <option value="Protected" ${
                          func.accessSpecifier === "Protected" ? "selected" : ""
                        }>Protected</option>
                    </select>
                </div>
                <div class="detail-row">
                    <label>Pure</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="func-pure-checkbox" class="ue5-checkbox" ${
                          func.isPure ? "checked" : ""
                        }>
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
        el.addEventListener("change", (e) => {
          func[prop] =
            e.target.type === "checkbox" ? e.target.checked : e.target.value;
          this.app.functionsController.render(); // Refresh list
          this.app.persistence.autoSave();

          // Sync nodes if properties affect them (e.g. Pure)
          if (prop === "isPure") {
            this.app.functionsController.syncFunctionNodes(func);
          }
        });
      }
    };

    bindInput("#func-name-input", "name");
    bindInput("#func-desc-input", "description");
    bindInput("#func-cat-input", "category");
    bindInput("#func-access-select", "accessSpecifier");
    bindInput("#func-pure-checkbox", "isPure");

    // Inputs/Outputs Management
    this.renderFunctionParameters(func);

    this.panel
      .querySelector("#add-func-input-btn")
      .addEventListener("click", () => {
        func.inputs.push({
          name: "NewInput",
          type: "bool",
          defaultValue: false,
        });
        this.renderFunctionParameters(func);
        this.app.functionsController.syncFunctionNodes(func);
        this.app.persistence.autoSave();
      });

    this.panel
      .querySelector("#add-func-output-btn")
      .addEventListener("click", () => {
        func.outputs.push({ name: "NewOutput", type: "bool" });
        this.renderFunctionParameters(func);
        this.app.functionsController.syncFunctionNodes(func);
        this.app.persistence.autoSave();
      });
  }

  renderFunctionParameters(func) {
    const inputList = this.panel.querySelector("#func-inputs-list");
    const outputList = this.panel.querySelector("#func-outputs-list");

    if (!inputList || !outputList) return;

    inputList.innerHTML = "";
    outputList.innerHTML = "";

    const renderParam = (param, index, isInput) => {
      const row = document.createElement("div");
      row.className = "param-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "details-input";
      nameInput.value = param.name;
      nameInput.classList.add("flex-grow", "mr-1");
      nameInput.addEventListener("change", (e) => {
        param.name = e.target.value;
        this.app.functionsController.syncFunctionNodes(func);
        this.app.persistence.autoSave();
      });

      // Type Selector Trigger
      const typeTrigger = document.createElement("div");
      typeTrigger.className = "variable-type-pill";
      typeTrigger.style.backgroundColor = Utils.getPinColor(param.type); // Dynamic color
      typeTrigger.title = param.type;

      typeTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = typeTrigger.getBoundingClientRect();
        this.typeSelector.showTypeMenu(
          rect.left,
          rect.bottom + 5,
          (newType) => {
            param.type = newType;
            typeTrigger.style.backgroundColor = Utils.getPinColor(newType);
            typeTrigger.title = newType;
            this.app.functionsController.syncFunctionNodes(func);
            this.app.persistence.autoSave();
          }
        );
      });

      const delBtn = document.createElement("i");
      delBtn.className = "fas fa-times param-delete-btn"; // CSS handles cursor and color
      delBtn.addEventListener("click", () => {
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

    func.inputs.forEach((p, i) =>
      inputList.appendChild(renderParam(p, i, true))
    );
    func.outputs.forEach((p, i) =>
      outputList.appendChild(renderParam(p, i, false))
    );
  }

  addCustomParameter(node) {
    const id = generateGUID();
    const newPinData = {
      id: id,
      name: "NewParam",
      type: "bool",
      dir: "out",
      isCustom: true,
    };

    const pin = new Pin(node, newPinData);
    node.pins.push(pin);
    node.refreshPinCache();

    this.app.wiring.updateVisuals(node);
    this.renderCustomParameters(node);
    this.app.persistence.autoSave();
  }

  /**
   * Shows Class Settings - Meta-properties like parent class, tick group
   * Phase 5: Class Settings vs. Defaults separation
   */
  showClassSettings() {
    this.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    // Ensure settings exist
    if (!this.app.classSettings) {
      this.app.classSettings = {
        parentClass: "Actor",
        tickGroup: "PrePhysics",
        canEverTick: true,
        startWithTickEnabled: true,
        allowTickBeforeBeginPlay: false,
        tickPrerequisites: [],
        componentTickGroup: "PrePhysics",
        generatesOverlapEvents: true,
        actorLabel: "",
      };
    }
    const settings = this.app.classSettings;

    this.panel.innerHTML = `
            <div class="details-group">
                <h4>Class Settings</h4>
                <div class="detail-row">
                    <label>Parent Class</label>
                    <span class="detail-value-static" style="color: #4a90e2; cursor: pointer;" id="parent-class-trigger">${
                      this.app.classDefaults?.parentClass || "Actor"
                    }</span>
                </div>
            </div>
            <div class="details-group">
                <h4>Tick</h4>
                <div class="detail-row">
                    <label>Tick Group</label>
                    <select id="tick-group-select" class="details-select">
                        <option value="PrePhysics" ${
                          settings.tickGroup === "PrePhysics" ? "selected" : ""
                        }>Pre Physics</option>
                        <option value="DuringPhysics" ${
                          settings.tickGroup === "DuringPhysics"
                            ? "selected"
                            : ""
                        }>During Physics</option>
                        <option value="PostPhysics" ${
                          settings.tickGroup === "PostPhysics" ? "selected" : ""
                        }>Post Physics</option>
                        <option value="PostUpdateWork" ${
                          settings.tickGroup === "PostUpdateWork"
                            ? "selected"
                            : ""
                        }>Post Update Work</option>
                    </select>
                </div>
                <div class="detail-row">
                    <label>Can Ever Tick</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="can-ever-tick-checkbox" class="ue5-checkbox" ${
                          settings.canEverTick ? "checked" : ""
                        }>
                    </div>
                </div>
                <div class="detail-row">
                    <label>Start With Tick Enabled</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="start-tick-checkbox" class="ue5-checkbox" ${
                          settings.startWithTickEnabled ? "checked" : ""
                        }>
                    </div>
                </div>
                <div class="detail-row">
                    <label>Allow Tick Before BeginPlay</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="tick-before-begin-checkbox" class="ue5-checkbox" ${
                          settings.allowTickBeforeBeginPlay ? "checked" : ""
                        }>
                    </div>
                </div>
            </div>
            <div class="details-group">
                <h4>Actor</h4>
                <div class="detail-row">
                    <label>Actor Label</label>
                    <input type="text" id="actor-label-input" class="details-input" value="${
                      settings.actorLabel || ""
                    }" placeholder="(Instance-specific)">
                </div>
                <div class="detail-row">
                    <label>Generates Overlap Events</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="overlap-events-checkbox" class="ue5-checkbox" ${
                          settings.generatesOverlapEvents ? "checked" : ""
                        }>
                    </div>
                </div>
            </div>
        `;

    // Bind events
    const bindInput = (id, prop, isCheckbox = false) => {
      const el = this.panel.querySelector(id);
      if (el) {
        el.addEventListener("change", (e) => {
          let val = isCheckbox ? e.target.checked : e.target.value;
          this.app.classSettings[prop] = val;
          this.app.persistence.autoSave();
        });
      }
    };

    bindInput("#tick-group-select", "tickGroup");
    bindInput("#can-ever-tick-checkbox", "canEverTick", true);
    bindInput("#start-tick-checkbox", "startWithTickEnabled", true);
    bindInput("#tick-before-begin-checkbox", "allowTickBeforeBeginPlay", true);
    bindInput("#actor-label-input", "actorLabel");
    bindInput("#overlap-events-checkbox", "generatesOverlapEvents", true);

    // Parent class trigger
    const parentTrigger = this.panel.querySelector("#parent-class-trigger");
    if (parentTrigger && this.app.parentClassModal) {
      parentTrigger.addEventListener("click", () => {
        this.app.parentClassModal.show();
      });
    }
  }

  showClassDefaults() {
    this.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    // Ensure defaults exist
    if (!this.app.classDefaults) {
      this.app.classDefaults = {
        parentClass: "Actor",
        tickInterval: 0.0,
        replicates: false,
        autoReceiveInput: "Disabled",
      };
    }
    const defaults = this.app.classDefaults;

    this.panel.innerHTML = `
            <div class="details-group">
                <h4>Class Defaults</h4>
                <div class="detail-row">
                    <label>Parent Class</label>
                    <span class="detail-value-static" style="color: #4a90e2; cursor: pointer;">${
                      defaults.parentClass
                    }</span>
                </div>
            </div>
            <div class="details-group">
                <h4>Actor</h4>
                <div class="detail-row">
                    <label>Tick Interval (secs)</label>
                    <input type="number" id="tick-interval-input" class="details-input" value="${
                      defaults.tickInterval || 0.0
                    }" step="0.01">
                </div>
                 <div class="detail-row">
                    <label>Replicates</label>
                    <div style="width: 60%;">
                         <input type="checkbox" id="replicates-checkbox" class="ue5-checkbox" ${
                           defaults.replicates ? "checked" : ""
                         }>
                    </div>
                </div>
            </div>
             <div class="details-group">
                <h4>Input</h4>
                <div class="detail-row">
                    <label>Auto Receive Input</label>
                    <select id="auto-input-select" class="details-select">
                        <option value="Disabled" ${
                          defaults.autoReceiveInput === "Disabled"
                            ? "selected"
                            : ""
                        }>Disabled</option>
                        <option value="Player0" ${
                          defaults.autoReceiveInput === "Player0"
                            ? "selected"
                            : ""
                        }>Player 0</option>
                    </select>
                </div>
            </div>
        `;

    // Bind events
    const bindInput = (id, prop, isCheckbox = false) => {
      const el = this.panel.querySelector(id);
      if (el) {
        el.addEventListener("change", (e) => {
          let val = isCheckbox ? e.target.checked : e.target.value;
          if (e.target.type === "number") val = parseFloat(val);
          this.app.classDefaults[prop] = val;
          this.app.persistence.autoSave();
        });
      }
    };

    bindInput("#tick-interval-input", "tickInterval");
    bindInput("#replicates-checkbox", "replicates", true);
    bindInput("#auto-input-select", "autoReceiveInput");
  }

  removeCustomParameter(node, pinId) {
    this.app.wiring.breakPinLinks(pinId);

    node.pins = node.pins.filter((p) => p.id !== pinId);
    node.refreshPinCache();

    this.app.wiring.updateVisuals(node);
    this.renderCustomParameters(node);
    this.app.persistence.autoSave();
  }

  renderCustomParameters(node) {
    const list = this.panel.querySelector("#custom-inputs-list");
    if (!list) return;
    list.innerHTML = "";

    const customPins = node.pins.filter((p) => p.isCustom);

    if (customPins.length === 0) {
      list.innerHTML = `<div style="background-color: #111; padding: 8px; color: #888; font-style: italic; font-size: 10px; border: 1px solid #333;">
            Please press the + icon above to add parameters
            </div>`;
      return;
    }

    customPins.forEach((pin) => {
      const row = document.createElement("div");
      row.className = "param-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = pin.name;
      nameInput.className = "details-input";
      nameInput.classList.add("w-100");
      nameInput.addEventListener("change", (e) => {
        pin.name = e.target.value;
        this.app.wiring.updateVisuals(node);
        this.app.persistence.autoSave();
      });

      const typeTrigger = document.createElement("div");
      typeTrigger.className = "param-type-trigger";

      const colorDot = document.createElement("span");
      colorDot.className = "param-color-dot";
      colorDot.style.backgroundColor = Utils.getPinColor(pin.type); // Dynamic color

      const typeLabel = document.createElement("span");
      typeLabel.textContent =
        pin.type.charAt(0).toUpperCase() + pin.type.slice(1);

      const downArrow = document.createElement("i");
      downArrow.className = "fas fa-caret-down";

      typeTrigger.appendChild(colorDot);
      typeTrigger.appendChild(typeLabel);
      typeTrigger.appendChild(downArrow);

      typeTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = typeTrigger.getBoundingClientRect();
        this.typeSelector.showTypeMenu(
          rect.left,
          rect.bottom + 5,
          (newType) => {
            pin.type = newType.toLowerCase();
            this.app.wiring.updateVisuals(node);
            this.app.graph.redrawNodeWires(node.id);
            this.renderCustomParameters(node);
            this.app.persistence.autoSave();
          }
        );
      });

      const delBtn = document.createElement("i");
      delBtn.className = "fas fa-times param-delete-btn";
      delBtn.addEventListener("click", () => {
        this.removeCustomParameter(node, pin.id);
      });

      row.appendChild(nameInput);
      row.appendChild(typeTrigger);
      row.appendChild(delBtn);

      list.appendChild(row);
    });
  }
}
