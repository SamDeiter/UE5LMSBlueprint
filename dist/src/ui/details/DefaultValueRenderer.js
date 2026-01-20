/**
 * DefaultValueRenderer.js
 *
 * Handles HTML generation for default value inputs in the Details Panel.
 * Supports: Primitives, Structs (Vector, Rotator, Transform), Arrays, and Maps.
 */

export class DefaultValueRenderer {
  static parseVectorValue(value) {
    if (value === undefined || value === null) return { x: 0, y: 0, z: 0 };
    const str = String(value).replace(/[()]/g, "").trim();
    const parts = str.split(",").map((p) => parseFloat(p.trim()) || 0);
    return { x: parts[0] || 0, y: parts[1] || 0, z: parts[2] || 0 };
  }

  static parseTransformValue(value) {
    if (value === undefined || value === null) {
      return {
        location: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      };
    }
    const str = String(value).replace(/[()]/g, "").trim();
    const sections = str.split("|");

    const parseSection = (section) => {
      const parts = (section || "0,0,0")
        .split(",")
        .map((p) => parseFloat(p.trim()) || 0);
      return { x: parts[0] || 0, y: parts[1] || 0, z: parts[2] || 0 };
    };

    return {
      location: parseSection(sections[0]),
      rotation: parseSection(sections[1]),
      scale: parseSection(sections[2]),
    };
  }

  static renderDefaultValueSection(variable, contentHTML) {
    return `
            <!--Collapsible Default Value Section-->
            <div class="details-group">
                <div id="default-toggle" style="display: flex; align-items: center; color: #ddd; font-size: 11px; font-weight: bold; cursor: pointer; text-transform: uppercase; margin-bottom: 10px;">
                    <i id="default-icon" class="fas fa-caret-down" style="width: 15px;"></i> <span>Default Value</span>
                </div>
                <div id="default-content">
                    ${contentHTML}
                </div>
            </div>
        `;
  }

  static renderDefaultValueInput(variable) {
    if (variable.containerType === "array") {
      return this.renderArrayDefaultValue(variable);
    }

    if (variable.containerType === "map") {
      return this.renderMapDefaultValue(variable);
    }

    const type = variable.type;
    const value = variable.defaultValue;
    const label = variable.name;
    const inputHTML = this.renderSingleValueInput(type, value);

    if (type === "bool") {
      return `
                <div class="detail-checkbox-row">
                    <label>${label}</label>
                    ${inputHTML}
                </div>
            `;
    }
    if (
      [
        "int",
        "int64",
        "byte",
        "float",
        "double",
        "enum",
        "string",
        "name",
        "text",
      ].includes(type)
    ) {
      return `
                <div class="detail-row">
                    <label>${label}</label>
                    ${inputHTML}
                </div>
            `;
    }

    // Structs (Vector, Rotator, Transform) handles their own rows in renderSingleValueInput logic below
    // But renderSingleValueInput usually returns just inputs.
    // Wait, looking at original code, renderSingleValueInput handles primitives.
    // For structs, renderDefaultValueInput handles the container div.

    if (type === "vector" || type === "rotator") {
      const parsed = this.parseVectorValue(value);
      return `
                <div class="detail-row" style="flex-direction: column; align-items: stretch; padding: 0;">
                    <div style="display: flex; align-items: center; min-height: 24px; border-bottom: 1px solid #1a1a1a;">
                        <label style="width: var(--details-label-width); padding: 4px 16px 4px 0; border-right: 1px solid #333; color: #ccc;">${
                          type === "vector" ? "Vector" : "Rotator"
                        }</label>
                    </div>
                    <div style="display: flex; gap: 4px; padding: 4px 8px; background: rgba(0,0,0,0.2);">
                        ${this._renderVectorComponent("X", parsed.x, "x")}
                        ${this._renderVectorComponent("Y", parsed.y, "y")}
                        ${this._renderVectorComponent("Z", parsed.z, "z")}
                    </div>
                </div>
            `;
    }

    if (type === "transform") {
      const parsed = this.parseTransformValue(value);
      return `
                <div class="detail-row" style="flex-direction: column; align-items: stretch; padding: 0;">
                    <div style="display: flex; align-items: center; min-height: 24px; border-bottom: 1px solid #1a1a1a;">
                        <label style="width: var(--details-label-width); padding: 4px 16px 4px 0; border-right: 1px solid #333; color: #ccc;">${label}</label>
                    </div>
                    ${this._renderTransformRow(
                      "Location",
                      parsed.location,
                      "location"
                    )}
                    ${this._renderTransformRow(
                      "Rotation",
                      parsed.rotation,
                      "rotation"
                    )}
                    ${this._renderTransformRow("Scale", parsed.scale, "scale")}
                </div>
            `;
    }

    return `<p class="detail-value-static">No editor available for type: ${type}</p>`;
  }

  static renderSingleValueInput(type, value, extraAttrs = "") {
    if (type === "bool") {
      return `<input type="checkbox" class="ue5-checkbox" data-prop="defaultValue" ${
        value ? "checked" : ""
      } ${extraAttrs}>`;
    }
    if (["int", "int64", "byte", "float", "double", "enum"].includes(type)) {
      const step = type === "float" || type === "double" ? "0.01" : "1";
      const safeValue =
        value !== undefined && value !== null && value !== "" ? value : 0;
      return `<input type="number" class="details-input" value="${safeValue}" step="${step}" data-prop="defaultValue" ${extraAttrs}>`;
    }
    if (["string", "name", "text"].includes(type)) {
      const safeValue = value !== undefined && value !== null ? value : "";
      return `<input type="text" class="details-input" value="${safeValue}" data-prop="defaultValue" ${extraAttrs}>`;
    }
    if (type === "vector" || type === "rotator") {
      const parsed = this.parseVectorValue(value);
      return `
                <div style="display: flex; gap: 4px; width: 100%;">
                    <input type="number" class="details-input" value="${parsed.x}" step="0.01" data-prop="defaultValue" data-vector-component="x" ${extraAttrs} style="flex: 1; padding: 2px 4px; font-size: 10px;">
                    <input type="number" class="details-input" value="${parsed.y}" step="0.01" data-prop="defaultValue" data-vector-component="y" ${extraAttrs} style="flex: 1; padding: 2px 4px; font-size: 10px;">
                    <input type="number" class="details-input" value="${parsed.z}" step="0.01" data-prop="defaultValue" data-vector-component="z" ${extraAttrs} style="flex: 1; padding: 2px 4px; font-size: 10px;">
                </div>
            `;
    }
    // Transform falls back to simple view in single input context for now, or use _renderTransformRow logic if needed.
    // But typically Array<Transform> uses renderSingleValueInput?
    // Need to check usage. original code had specific specific HTML for Transform in renderSingleValueInput.
    if (type === "transform") {
      const parsed = this.parseTransformValue(value);
      return `
                <div style="display: flex; flex-direction: column; gap: 2px; width: 100%;">
                    ${this._renderTransformRowMinimal(
                      "Location",
                      parsed.location,
                      "location",
                      extraAttrs
                    )}
                    ${this._renderTransformRowMinimal(
                      "Rotation",
                      parsed.rotation,
                      "rotation",
                      extraAttrs
                    )}
                    ${this._renderTransformRowMinimal(
                      "Scale",
                      parsed.scale,
                      "scale",
                      extraAttrs
                    )}
                </div>
             `;
    }

    return `<p class="detail-value-static">No editor available</p>`;
  }

  static renderArrayDefaultValue(variable) {
    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    const values = variable.defaultValue;
    const count = values.length;
    const type = variable.type;

    let html = `
            <div class="detail-row">
                <div style="display: flex; align-items: center; height: 100%;">
                    <i class="fas fa-caret-down" style="margin-right: 4px; color: #888; font-size: 10px;"></i>
                    <label style="margin: 0; cursor: pointer;">${
                      variable.name
                    }</label>
                </div>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-right: 8px; height: 100%;">
                    <span style="color: #888; font-size: 10px;">${count} Array element${
      count !== 1 ? "s" : ""
    }</span>
                    <i class="fas fa-plus-circle" style="cursor: pointer; color: #ccc;" onclick="window.app.details.addArrayElement('${
                      variable.id
                    }')" title="Add Element"></i>
                    <i class="fas fa-trash" style="cursor: pointer; color: #ccc; font-size: 10px;" onclick="window.app.details.clearArrayElements('${
                      variable.id
                    }')" title="Clear All"></i>
                </div>
            </div>
        `;

    values.forEach((val, index) => {
      html += `
                <div class="detail-row">
                    <label style="padding-left: 24px; color: #888; font-size: 11px;">Index [ ${index} ]</label>
                    <div style="display: flex; align-items: center; width: 100%; padding-right: 4px;">
                        <div style="flex-grow: 1; margin-right: 4px;">
                            ${this.renderSingleValueInput(
                              type,
                              val,
                              `data-array-index="${index}"`
                            )}
                        </div>
                        <i class="fas fa-trash-alt" style="cursor: pointer; color: #666; font-size: 10px;" onclick="window.app.details.removeArrayElement('${
                          variable.id
                        }', ${index})" title="Remove"></i>
                    </div>
                </div>
            `;
    });

    return html;
  }

  static renderMapDefaultValue(variable) {
    if (!Array.isArray(variable.defaultValue)) {
      variable.defaultValue = [];
    }

    const entries = variable.defaultValue;
    const count = entries.length;
    const type = variable.type;

    let html = `
            <div class="detail-row">
                <div style="display: flex; align-items: center; height: 100%;">
                    <i class="fas fa-caret-down" style="margin-right: 4px; color: #888; font-size: 10px;"></i>
                    <label style="margin: 0; cursor: pointer;">${
                      variable.name
                    }</label>
                </div>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-right: 8px; height: 100%;">
                    <span style="color: #888; font-size: 10px;">${count} Map element${
      count !== 1 ? "s" : ""
    }</span>
                    <i class="fas fa-plus-circle" style="cursor: pointer; color: #ccc;" onclick="window.app.details.addMapElement('${
                      variable.id
                    }')" title="Add Element"></i>
                    <i class="fas fa-trash" style="cursor: pointer; color: #ccc; font-size: 10px;" onclick="window.app.details.clearMapElements('${
                      variable.id
                    }')" title="Clear All"></i>
                </div>
            </div>
        `;

    entries.forEach((entry, index) => {
      const key = entry.key !== undefined ? entry.key : "";
      const value = entry.value !== undefined ? entry.value : "";

      html += `
                <div class="detail-row" style="flex-direction: column; align-items: stretch; padding: 4px 8px;">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                        <label style="padding-left: 16px; color: #888; font-size: 11px; flex-shrink: 0; width: 80px;">Index [ ${index} ]</label>
                        <i class="fas fa-trash-alt" style="cursor: pointer; color: #666; font-size: 10px; margin-left: auto;" onclick="window.app.details.removeMapElement('${
                          variable.id
                        }', ${index})" title="Remove"></i>
                    </div>
                    <div style="display: flex; gap: 8px; padding-left: 16px;">
                        <div style="flex: 1;">
                            <label style="color: #888; font-size: 9px; display: block; margin-bottom: 2px;">Key</label>
                            ${this.renderSingleValueInput(
                              "string",
                              key,
                              `data-map-index="${index}" data-map-field="key"`
                            )}
                        </div>
                        <div style="flex: 1;">
                            <label style="color: #888; font-size: 9px; display: block; margin-bottom: 2px;">Value</label>
                            ${this.renderSingleValueInput(
                              type,
                              value,
                              `data-map-index="${index}" data-map-field="value"`
                            )}
                        </div>
                    </div>
                </div>
            `;
    });

    return html;
  }

  // --- Helpers ---

  static _renderVectorComponent(label, value, component) {
    return `
            <div style="flex: 1; display: flex; flex-direction: column; gap: 2px;">
                <label style="color: #999; font-size: 9px;">${label}</label>
                <input type="number" class="details-input" value="${value}" step="0.01" data-prop="defaultValue" data-vector-component="${component}" style="padding: 2px 4px; font-size: 10px;">
            </div>
        `;
  }

  static _renderTransformRow(label, parsedSection, sectionName) {
    return `
            <div style="display: flex; border-bottom: 1px solid #1a1a1a;">
                <span style="width: 80px; padding: 4px 8px; color: #888; font-size: 10px; border-right: 1px solid #1a1a1a; display: flex; align-items: center;">${label}</span>
                <div style="flex: 1; display: flex; gap: 4px; padding: 4px 8px;">
                     ${this._renderTransformInput(
                       parsedSection.x,
                       sectionName + "-x",
                       "#d63031"
                     )}
                     ${this._renderTransformInput(
                       parsedSection.y,
                       sectionName + "-y",
                       "#00b894"
                     )}
                     ${this._renderTransformInput(
                       parsedSection.z,
                       sectionName + "-z",
                       "#0984e3"
                     )}
                </div>
            </div>
         `;
  }

  static _renderTransformRowMinimal(
    label,
    parsedSection,
    sectionName,
    extraAttrs
  ) {
    return `
            <div style="display: flex; gap: 4px;">
                <span style="width: 70px; color: #888; font-size: 9px; display: flex; align-items: center;">${label}</span>
                ${this._renderTransformInput(
                  parsedSection.x,
                  sectionName + "-x",
                  "#d63031",
                  extraAttrs
                )}
                ${this._renderTransformInput(
                  parsedSection.y,
                  sectionName + "-y",
                  "#00b894",
                  extraAttrs
                )}
                ${this._renderTransformInput(
                  parsedSection.z,
                  sectionName + "-z",
                  "#0984e3",
                  extraAttrs
                )}
            </div>
        `;
  }

  static _renderTransformInput(value, component, borderColor, extraAttrs = "") {
    return `<input type="number" class="details-input" value="${value}" step="0.1" data-prop="defaultValue" data-transform-component="${component}" ${extraAttrs} style="flex: 1; padding: 2px 4px; font-size: 10px; border-left: 2px solid ${borderColor};">`;
  }
}
