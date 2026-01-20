/**
 * VariableDetailsRenderer.js
 *
 * Handles HTML generation for the Variable properties metadata section of the Details Panel.
 * (Name, Type, Flags, Advanced properties)
 */
import { Utils } from "../../utils.js";

export class VariableDetailsRenderer {
  static renderVariableSection(variable) {
    return `
            <!--Variable Section-->
            <div class="details-group">
                <div id="variable-toggle" style="display: flex; align-items: center; color: #ddd; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; margin-bottom: 10px;">
                    <i id="variable-icon" class="fas fa-caret-down" style="width: 15px;"></i> <span>VARIABLE</span>
                </div>
                <div id="variable-content">
                    ${this.renderVariableFields(variable)}
                </div>
            </div>
        `;
  }

  static renderVariableFields(variable) {
    const color = Utils.getPinColor(variable.type);
    return `
            <!-- Variable Name -->
            <div class="detail-row">
                <label>Variable Name</label>
                <input type="text" id="variable-name-input" class="details-input" value="${
                  variable.name
                }" data-prop="name">
            </div>

            <!-- Variable Type (Custom Pill Selectors) -->
            <div class="detail-row">
                <label>Variable Type</label>
                <div style="display: flex; gap: 5px; align-items: center; flex-grow: 1;">

                    <!-- Type Trigger Pill -->
                    <div id="var-type-trigger" class="ue5-dropdown-pill" style="flex-grow: 1; margin-right: 2px;">
                        <span class="param-color-dot" style="background-color: ${color}"></span>
                        <span style="margin-left: 8px; flex-grow: 1; text-align: left;">${
                          variable.type.charAt(0).toUpperCase() +
                          variable.type.slice(1)
                        }</span>
                        <i class="fas fa-chevron-down" style="font-size: 8px; margin-left: 4px;"></i>
                    </div>

                    <!-- Container Trigger Pill -->
                    <div id="var-container-trigger" class="ue5-dropdown-pill" style="width: 40px; justify-content: center;">
                        ${this._getContainerIcon(
                          variable.containerType,
                          variable.type
                        )}
                        <i class="fas fa-chevron-down" style="margin-left: 4px; font-size: 8px;"></i>
                    </div>

                </div>
            </div>

            <!-- Description -->
            <div class="detail-row">
                <label>Description</label>
                <textarea class="details-textarea" data-prop="description" placeholder="Tooltip" rows="2">${
                  variable.description || ""
                }</textarea>
            </div>

            <!-- Instance Editable -->
            <div class="detail-checkbox-row">
                <label>Instance Editable</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="isInstanceEditable" ${
                  variable.isInstanceEditable ? "checked" : ""
                }>
            </div>

            <!-- Blueprint Read Only -->
            <div class="detail-checkbox-row">
                <label>Blueprint Read Only</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="blueprintReadOnly" ${
                  variable.blueprintReadOnly ? "checked" : ""
                }>
            </div>

            <!-- Expose on Spawn -->
            <div class="detail-checkbox-row">
                <label>Expose on Spawn</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="exposeOnSpawn" ${
                  variable.exposeOnSpawn ? "checked" : ""
                }>
            </div>

            <!-- Private -->
            <div class="detail-checkbox-row">
                <label>Private</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="private" ${
                  variable.private ? "checked" : ""
                }>
            </div>

            <!-- Expose to Cinematics -->
            <div class="detail-checkbox-row">
                <label>Expose to Cinematics</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="exposeToCinematics" ${
                  variable.exposeToCinematics ? "checked" : ""
                }>
            </div>

            <!-- Category -->
            <div class="detail-row">
                <label>Category</label>
                <input type="text" class="details-input" value="${
                  variable.category || "Default"
                }" data-prop="category" placeholder="Default">
            </div>

            <!-- Replication -->
            <div class="detail-row">
                <label>Replication</label>
                <select class="details-select" data-prop="replication" style="flex-grow: 1;">
                    <option value="None" ${
                      variable.replication === "None" ? "selected" : ""
                    }>None</option>
                    <option value="Replicated" ${
                      variable.replication === "Replicated" ? "selected" : ""
                    }>Replicated</option>
                    <option value="RepNotify" ${
                      variable.replication === "RepNotify" ? "selected" : ""
                    }>RepNotify</option>
                </select>
            </div>

            <!-- Replication Condition -->
            <div class="detail-row" ${
              variable.replication === "None" ? 'style="opacity: 0.5;"' : ""
            }>
                <label>Replication Condition</label>
                <select class="details-select" data-prop="replicationCondition" style="flex-grow: 1;" ${
                  variable.replication === "None" ? "disabled" : ""
                }>
                    <option value="None" ${
                      variable.replicationCondition === "None" ? "selected" : ""
                    }>None</option>
                    <option value="InitialOnly" ${
                      variable.replicationCondition === "InitialOnly"
                        ? "selected"
                        : ""
                    }>Initial Only</option>
                    <option value="OwnerOnly" ${
                      variable.replicationCondition === "OwnerOnly"
                        ? "selected"
                        : ""
                    }>Owner Only</option>
                    <option value="SkipOwner" ${
                      variable.replicationCondition === "SkipOwner"
                        ? "selected"
                        : ""
                    }>Skip Owner</option>
                    <option value="SimulatedOnly" ${
                      variable.replicationCondition === "SimulatedOnly"
                        ? "selected"
                        : ""
                    }>Simulated Only</option>
                    <option value="AutonomousOnly" ${
                      variable.replicationCondition === "AutonomousOnly"
                        ? "selected"
                        : ""
                    }>Autonomous Only</option>
                    <option value="SimulatedOrPhysics" ${
                      variable.replicationCondition === "SimulatedOrPhysics"
                        ? "selected"
                        : ""
                    }>Simulated Or Physics</option>
                    <option value="InitialOrOwner" ${
                      variable.replicationCondition === "InitialOrOwner"
                        ? "selected"
                        : ""
                    }>Initial Or Owner</option>
                    <option value="Custom" ${
                      variable.replicationCondition === "Custom"
                        ? "selected"
                        : ""
                    }>Custom</option>
                    <option value="ReplayOrOwner" ${
                      variable.replicationCondition === "ReplayOrOwner"
                        ? "selected"
                        : ""
                    }>Replay Or Owner</option>
                    <option value="ReplayOnly" ${
                      variable.replicationCondition === "ReplayOnly"
                        ? "selected"
                        : ""
                    }>Replay Only</option>
                    <option value="SimulatedOnlyNoReplay" ${
                      variable.replicationCondition === "SimulatedOnlyNoReplay"
                        ? "selected"
                        : ""
                    }>Simulated Only No Replay</option>
                    <option value="SimulatedOrPhysicsNoReplay" ${
                      variable.replicationCondition ===
                      "SimulatedOrPhysicsNoReplay"
                        ? "selected"
                        : ""
                    }>Simulated Or Physics No Replay</option>
                    <option value="SkipReplay" ${
                      variable.replicationCondition === "SkipReplay"
                        ? "selected"
                        : ""
                    }>Skip Replay</option>
                </select>
            </div>
        `;
  }

  static renderAdvancedSection(variable, propertyFlagsHTML) {
    return `
            <!--Collapsible Advanced Section-->
            <div class="details-group" style="border-bottom: none; padding-bottom: 0;">
                <div id="advanced-toggle" style="display: flex; align-items: center; color: #ddd; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase;">
                    <i id="advanced-icon" class="fas fa-caret-right" style="width: 15px;"></i> <span>Advanced</span>
                </div>
                <div id="advanced-content" style="display: none; margin-top: 10px;">
                    ${this.renderAdvancedFields(variable)}

                    <!-- Defined Property Flags (Inside Advanced) -->
                    <div style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; margin-top: 15px;">Defined Property Flags</div>
                    <div class="property-flags-list" style="background: #111; padding: 5px; border: 1px solid #333;">
                        ${propertyFlagsHTML}
                    </div>
                </div>
            </div>
        `;
  }

  static renderAdvancedFields(variable) {
    return `
            <div class="detail-checkbox-row">
                <label>Config Variable</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="configVariable" ${
                  variable.configVariable ? "checked" : ""
                }>
            </div>
            <div class="detail-checkbox-row">
                <label>Transient</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="transient" ${
                  variable.transient ? "checked" : ""
                }>
            </div>
            <div class="detail-checkbox-row">
                <label>SaveGame</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="saveGame" ${
                  variable.saveGame ? "checked" : ""
                }>
            </div>
            <div class="detail-checkbox-row">
                <label>Advanced Display</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="advancedDisplay" ${
                  variable.advancedDisplay ? "checked" : ""
                }>
            </div>
            <div class="detail-checkbox-row">
                <label>Multi line</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="multiLine" ${
                  variable.multiLine ? "checked" : ""
                }>
            </div>
            <div class="detail-checkbox-row">
                <label>Deprecated</label>
                <input type="checkbox" class="ue5-checkbox" data-prop="deprecated" ${
                  variable.deprecated ? "checked" : ""
                }>
            </div>
            <div class="detail-row">
                <label>Deprecation Message</label>
                <input type="text" class="details-input" data-prop="deprecationMessage" value="${
                  variable.deprecationMessage || ""
                }">
            </div>

            <!-- Value Range (for numeric types only) -->
            ${this._renderValueRange(variable)}

            <div class="detail-row">
                <label>Drop-down Options</label>
                <select class="details-select" style="flex-grow: 1;">
                    <option value="">None</option>
                </select>
            </div>
        `;
  }

  static renderPropertyFlag(name, isSet) {
    return `
            <div class="property-flag-item" style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #aaa; margin-bottom: 2px;">
                <span>${name}</span>
                ${
                  isSet
                    ? '<i class="fas fa-check" style="color: #007bff;"></i>'
                    : ""
                }
            </div>
        `;
  }

  // --- Private Helpers ---

  static _getContainerIcon(containerType, variableType) {
    const color = Utils.getPinColor(variableType);
    switch (containerType) {
      case "array":
        return `<i class="fas fa-th" style="color: ${color};"></i>`;
      case "set":
        return `<span style="color: ${color}; font-weight: bold; font-size: 10px;">{}</span>`;
      case "map":
        return `<i class="fas fa-list-ul" style="color: ${color};"></i>`;
      default:
        return `<span class="param-color-dot" style="background-color: ${color};"></span>`; // Single
    }
  }

  static _renderValueRange(variable) {
    if (["int", "int64", "byte", "float", "double"].includes(variable.type)) {
      return `
            <div class="detail-row">
                <label>Value Range</label>
                <div style="display: flex; gap: 5px; width: 100%;">
                    <input type="number" class="details-input" placeholder="Min" data-prop="valueMin" value="${
                      variable.valueMin != null ? variable.valueMin : ""
                    }" style="flex: 1;">
                    <input type="number" class="details-input" placeholder="Max" data-prop="valueMax" value="${
                      variable.valueMax != null ? variable.valueMax : ""
                    }" style="flex: 1;">
                </div>
            </div>
            <div class="detail-row">
                <label>UI Range</label>
                <div style="display: flex; gap: 5px; width: 100%;">
                    <input type="number" class="details-input" placeholder="UI Min" data-prop="uiMin" value="${
                      variable.uiMin != null ? variable.uiMin : ""
                    }" style="flex: 1;">
                    <input type="number" class="details-input" placeholder="UI Max" data-prop="uiMax" value="${
                      variable.uiMax != null ? variable.uiMax : ""
                    }" style="flex: 1;">
                </div>
            </div>
           `;
    }
    return "";
  }
}
