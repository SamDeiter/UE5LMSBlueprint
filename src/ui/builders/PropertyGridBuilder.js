/**
 * PropertyGridBuilder - Fluent API for building property grids
 *
 * Consolidates repetitive DOM creation patterns across Details panels.
 * Provides chainable methods to add form fields with UE5 styling.
 *
 * Usage:
 *   const grid = new PropertyGridBuilder(container)
 *     .addStringField('Name', 'MyVar', (val) => this.onNameChange(val))
 *     .addDropdown('Type', ['bool', 'int', 'float'], 'bool', (val) => this.onTypeChange(val))
 *     .addCheckbox('Is Public', true, (val) => this.onPublicChange(val))
 *     .build();
 */

export class PropertyGridBuilder {
  constructor(container) {
    this.container = container;
    this.rows = [];
  }

  /**
   * Add a text input field
   * @param {string} label - Display label
   * @param {string} value - Current value
   * @param {Function} onChange - Callback when value changes
   * @param {Object} options - Additional options (placeholder, disabled, etc.)
   * @returns {PropertyGridBuilder} this for chaining
   */
  addStringField(label, value, onChange, options = {}) {
    const row = this._createRow(label);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "property-input";
    input.value = value || "";
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.disabled) input.disabled = true;

    input.addEventListener("change", (e) => onChange(e.target.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.target.blur();
        onChange(e.target.value);
      }
    });

    row.valueCell.appendChild(input);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a numeric input field
   * @param {string} label - Display label
   * @param {number} value - Current value
   * @param {Function} onChange - Callback when value changes
   * @param {Object} options - min, max, step, disabled
   * @returns {PropertyGridBuilder} this for chaining
   */
  addNumberField(label, value, onChange, options = {}) {
    const row = this._createRow(label);
    const input = document.createElement("input");
    input.type = "number";
    input.className = "property-input";
    input.value = value ?? 0;
    if (options.min !== undefined) input.min = options.min;
    if (options.max !== undefined) input.max = options.max;
    if (options.step !== undefined) input.step = options.step;
    if (options.disabled) input.disabled = true;

    input.addEventListener("change", (e) =>
      onChange(parseFloat(e.target.value))
    );

    row.valueCell.appendChild(input);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a dropdown/select field
   * @param {string} label - Display label
   * @param {Array} options - Array of {value, label} or strings
   * @param {string} selected - Currently selected value
   * @param {Function} onChange - Callback when selection changes
   * @returns {PropertyGridBuilder} this for chaining
   */
  addDropdown(label, options, selected, onChange) {
    const row = this._createRow(label);
    const select = document.createElement("select");
    select.className = "property-select";

    options.forEach((opt) => {
      const option = document.createElement("option");
      if (typeof opt === "string") {
        option.value = opt;
        option.textContent = opt;
      } else {
        option.value = opt.value;
        option.textContent = opt.label || opt.value;
      }
      if (option.value === selected) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => onChange(e.target.value));

    row.valueCell.appendChild(select);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a checkbox field
   * @param {string} label - Display label
   * @param {boolean} checked - Current state
   * @param {Function} onChange - Callback when toggled
   * @returns {PropertyGridBuilder} this for chaining
   */
  addCheckbox(label, checked, onChange) {
    const row = this._createRow(label);
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "property-checkbox";
    checkbox.checked = !!checked;

    checkbox.addEventListener("change", (e) => onChange(e.target.checked));

    row.valueCell.appendChild(checkbox);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a color picker field
   * @param {string} label - Display label
   * @param {string} value - Hex color value
   * @param {Function} onChange - Callback when color changes
   * @returns {PropertyGridBuilder} this for chaining
   */
  addColorField(label, value, onChange) {
    const row = this._createRow(label);
    const input = document.createElement("input");
    input.type = "color";
    input.className = "property-color";
    input.value = value || "#000000";

    input.addEventListener("change", (e) => onChange(e.target.value));

    row.valueCell.appendChild(input);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a read-only display field
   * @param {string} label - Display label
   * @param {string} value - Display value
   * @returns {PropertyGridBuilder} this for chaining
   */
  addReadOnly(label, value) {
    const row = this._createRow(label);
    const span = document.createElement("span");
    span.className = "property-readonly";
    span.textContent = value || "";

    row.valueCell.appendChild(span);
    this.rows.push(row);
    return this;
  }

  /**
   * Add a section header
   * @param {string} title - Section title
   * @returns {PropertyGridBuilder} this for chaining
   */
  addSection(title) {
    const header = document.createElement("div");
    header.className = "property-section-header";
    header.textContent = title;
    this.rows.push({ element: header, isSection: true });
    return this;
  }

  /**
   * Add a separator line
   * @returns {PropertyGridBuilder} this for chaining
   */
  addSeparator() {
    const sep = document.createElement("hr");
    sep.className = "property-separator";
    this.rows.push({ element: sep, isSeparator: true });
    return this;
  }

  /**
   * Add a custom element
   * @param {string} label - Display label (optional, pass null for full-width)
   * @param {HTMLElement} element - Custom element to add
   * @returns {PropertyGridBuilder} this for chaining
   */
  addCustom(label, element) {
    if (label) {
      const row = this._createRow(label);
      row.valueCell.appendChild(element);
      this.rows.push(row);
    } else {
      this.rows.push({ element, isCustom: true });
    }
    return this;
  }

  /**
   * Build and append to container
   * @returns {HTMLElement} The constructed property grid
   */
  build() {
    const grid = document.createElement("div");
    grid.className = "property-grid";

    this.rows.forEach((row) => {
      if (row.isSection || row.isSeparator || row.isCustom) {
        grid.appendChild(row.element);
      } else {
        grid.appendChild(row.row);
      }
    });

    if (this.container) {
      this.container.appendChild(grid);
    }

    return grid;
  }

  /**
   * Build and replace container contents
   * @returns {HTMLElement} The constructed property grid
   */
  buildAndReplace() {
    if (this.container) {
      this.container.innerHTML = "";
    }
    return this.build();
  }

  // --- Private Helpers ---

  _createRow(label) {
    const row = document.createElement("div");
    row.className = "property-row";

    const labelCell = document.createElement("div");
    labelCell.className = "property-label";
    labelCell.textContent = label;

    const valueCell = document.createElement("div");
    valueCell.className = "property-value";

    row.appendChild(labelCell);
    row.appendChild(valueCell);

    return { row, labelCell, valueCell };
  }
}

export default PropertyGridBuilder;
