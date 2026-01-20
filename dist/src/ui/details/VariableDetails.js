// import { Utils } from "../../utils.js";
import { DetailsRenderer } from "../DetailsRenderer.js";
import { setupToggle } from "../ui-helpers.js";
import { BaseController } from "../BaseController.js";

export class VariableDetails extends BaseController {
  constructor(controller) {
    super(controller.app); // Call BaseController with app reference
    this.controller = controller;
    this.panel = controller.panel;
  }

  show(variable, isPrimarySelection = false) {
    if (isPrimarySelection) {
      this.app.graph.clearSelection();
      this.controller.currentVariable = variable;
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
      this.addListener(typeTrigger, "click", (e) => {
        e.stopPropagation();
        const rect = typeTrigger.getBoundingClientRect();
        this.controller.typeSelector.showTypeMenu(
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
      this.addListener(containerTrigger, "click", (e) => {
        e.stopPropagation();
        const rect = containerTrigger.getBoundingClientRect();
        this.controller.typeSelector.showContainerTypeMenu(
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
      this.addListener(input, "change", (e) => {
        this.handleInputChange(e, variable);
      });

      if (input.tagName === "INPUT" || input.tagName === "TEXTAREA") {
        this.addListener(input, "input", (e) => {
          this.handleInputLiveUpdate(e, variable);
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

  handleInputChange(e, variable) {
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
      const parsed = DetailsRenderer.parseVectorValue(variable.defaultValue);
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
      const parsed = DetailsRenderer.parseTransformValue(variable.defaultValue);
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
  }

  handleInputLiveUpdate(e, variable) {
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
      const parsed = DetailsRenderer.parseVectorValue(variable.defaultValue);
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
      const parsed = DetailsRenderer.parseTransformValue(variable.defaultValue);
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
      this.app.variables.updateVariableProperty(variable, prop, value, true);
    }
  }

  addArrayElement(varId) {
    let variable = this._findVariable(varId);
    if (!variable) return;

    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    const type = variable.type;
    let newVal = this._getDefaultValueForType(type);

    const newArray = [...variable.defaultValue, newVal];
    this.app.variables.updateVariableProperty(
      variable,
      "defaultValue",
      newArray
    );
  }

  removeArrayElement(varId, index) {
    let variable = this._findVariable(varId);
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
    let variable = this._findVariable(varId);
    if (!variable) return;
    this.app.variables.updateVariableProperty(variable, "defaultValue", []);
  }

  addMapElement(varId) {
    let variable = this._findVariable(varId);
    if (!variable) return;

    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    const type = variable.type;
    let newVal = this._getDefaultValueForType(type);

    const newEntry = { key: "", value: newVal };
    const newMap = [...variable.defaultValue, newEntry];
    this.app.variables.updateVariableProperty(variable, "defaultValue", newMap);
  }

  removeMapElement(varId, index) {
    let variable = this._findVariable(varId);
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
    let variable = this._findVariable(varId);
    if (!variable) return;
    this.app.variables.updateVariableProperty(variable, "defaultValue", []);
  }

  _findVariable(varId) {
    let variable =
      this.controller.currentVariable &&
      this.controller.currentVariable.id === varId
        ? this.controller.currentVariable
        : null;
    if (!variable) {
      variable = [...this.app.variables.variables.values()].find(
        (v) => v.id === varId
      );
    }
    return variable;
  }

  _getDefaultValueForType(type) {
    if (type === "bool") return false;
    if (
      type === "int" ||
      type === "int64" ||
      type === "byte" ||
      type === "float"
    )
      return 0;
    if (type === "vector") return "(0,0,0)";
    if (type === "rotator") return "(0,0,0)";
    if (type === "transform") return "(0,0,0|0,0,0|1,1,1)";
    return "";
  }

  // Cleanup method - called when controller is destroyed
  cleanup() {
    super.cleanup(); // Remove all event listeners and timers
    console.log("VariableDetails cleaned up");
  }
}
