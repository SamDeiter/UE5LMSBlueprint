/**
 * InterfaceDetails - Editor panel for a custom Blueprint Interface.
 *
 * Lets the student edit:
 *   - Interface name (with rename safety: collision-checked, nodeKeys updated)
 *   - Description
 *   - Function signatures: name, isPure, inputs[{name,type}], outputs[{name,type}]
 *
 * Every signature change re-registers the Message_/Event_ node defs via the
 * InterfacesController so the action menu stays accurate.
 */

const TYPE_OPTIONS = [
  "bool",
  "int",
  "float",
  "string",
  "name",
  "vector",
  "rotator",
  "object",
];

export class InterfaceDetails {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.panel = controller.panel;
  }

  show(iface) {
    this.iface = iface;
    this.controller.currentVariable = null;
    this.app.wiring?.clearLinkSelection();
    this.app.graph?.clearSelection();
    this._render();
  }

  _render() {
    const iface = this.iface;
    if (!iface) return;

    this.panel.innerHTML = `
      <div class="details-group">
        <h4>Interface Details</h4>
        <div class="detail-row">
          <label>Name</label>
          <input type="text" id="iface-name-input" class="details-input" value="${this._esc(
            iface.name
          )}">
        </div>
        <div class="detail-row">
          <label>Description</label>
          <textarea id="iface-desc-input" class="details-textarea" rows="2">${this._esc(
            iface.description || ""
          )}</textarea>
        </div>
      </div>

      <div class="details-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <h4>Functions</h4>
          <i class="fas fa-plus-circle" id="iface-add-fn-btn" style="cursor: pointer; color: #ccc;" title="Add Function"></i>
        </div>
        <div id="iface-fn-list">${this._renderFunctions()}</div>
      </div>
    `;

    this._bindEvents();
  }

  _renderFunctions() {
    const iface = this.iface;
    if (!iface.functions || iface.functions.length === 0) {
      return `<div style="color: #666; font-size: 11px; padding: 4px;">No functions yet.</div>`;
    }

    return iface.functions
      .map((fn, idx) => this._renderFunctionRow(fn, idx))
      .join("");
  }

  _renderFunctionRow(fn, idx) {
    return `
      <div class="iface-fn-row" data-fn-idx="${idx}" style="border: 1px solid #2a2a2a; border-radius: 4px; padding: 6px; margin-bottom: 6px; background: #1a1a1a;">
        <div class="detail-row">
          <input type="text" class="details-input iface-fn-name" data-fn-idx="${idx}" value="${this._esc(
      fn.name
    )}" style="flex: 1;">
          <i class="fas fa-times iface-fn-delete" data-fn-idx="${idx}" style="cursor: pointer; color: #e74c3c; margin-left: 6px;" title="Delete function"></i>
        </div>
        <div class="detail-row" style="margin-top: 4px;">
          <label style="font-size: 10px;">Pure</label>
          <input type="checkbox" class="ue5-checkbox iface-fn-pure" data-fn-idx="${idx}" ${
      fn.isPure ? "checked" : ""
    }>
        </div>
        <div style="margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #aaa;">Inputs</span>
            <i class="fas fa-plus-circle iface-fn-add-in" data-fn-idx="${idx}" style="cursor: pointer; color: #ccc; font-size: 11px;"></i>
          </div>
          ${this._renderParams(fn.inputs || [], idx, "in")}
        </div>
        <div style="margin-top: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #aaa;">Outputs</span>
            <i class="fas fa-plus-circle iface-fn-add-out" data-fn-idx="${idx}" style="cursor: pointer; color: #ccc; font-size: 11px;"></i>
          </div>
          ${this._renderParams(fn.outputs || [], idx, "out")}
        </div>
      </div>
    `;
  }

  _renderParams(params, fnIdx, dir) {
    if (params.length === 0) {
      return `<div style="font-size: 10px; color: #555; padding: 2px 4px;">none</div>`;
    }
    return params
      .map(
        (p, paramIdx) => `
      <div class="detail-row iface-param-row" data-fn-idx="${fnIdx}" data-dir="${dir}" data-param-idx="${paramIdx}" style="margin-top: 2px;">
        <input type="text" class="details-input iface-param-name" data-fn-idx="${fnIdx}" data-dir="${dir}" data-param-idx="${paramIdx}" value="${this._esc(
          p.name
        )}" style="flex: 1; font-size: 11px;">
        <select class="details-select iface-param-type" data-fn-idx="${fnIdx}" data-dir="${dir}" data-param-idx="${paramIdx}" style="margin-left: 4px;">
          ${TYPE_OPTIONS.map(
            (t) =>
              `<option value="${t}" ${
                p.type === t ? "selected" : ""
              }>${t}</option>`
          ).join("")}
        </select>
        <i class="fas fa-times iface-param-delete" data-fn-idx="${fnIdx}" data-dir="${dir}" data-param-idx="${paramIdx}" style="cursor: pointer; color: #e74c3c; margin-left: 4px; font-size: 10px;"></i>
      </div>
    `
      )
      .join("");
  }

  _bindEvents() {
    const iface = this.iface;
    const ctrl = this.app.interfacesController;

    // Rename
    const nameInput = this.panel.querySelector("#iface-name-input");
    if (nameInput) {
      nameInput.addEventListener("change", (e) => {
        const newName = e.target.value.trim();
        if (newName && newName !== iface.name && ctrl) {
          const ok = ctrl.renameInterface(iface, newName);
          if (!ok) {
            // Revert on collision so the input stays consistent with state.
            e.target.value = iface.name;
          } else {
            ctrl.render();
          }
        }
        this._save();
      });
    }

    // Description
    const descInput = this.panel.querySelector("#iface-desc-input");
    if (descInput) {
      descInput.addEventListener("change", (e) => {
        iface.description = e.target.value;
        this._save();
      });
    }

    // Add function
    const addFnBtn = this.panel.querySelector("#iface-add-fn-btn");
    if (addFnBtn) {
      addFnBtn.addEventListener("click", () => {
        const baseName = "NewFunction";
        let name = baseName;
        let n = 2;
        while (iface.functions.some((f) => f.name === name)) {
          name = `${baseName}${n++}`;
        }
        iface.addFunction(name, "", [], []);
        this._refreshNodes();
        this._render();
        this._save();
      });
    }

    // Delete function
    this.panel.querySelectorAll(".iface-fn-delete").forEach((el) => {
      el.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.fnIdx, 10);
        iface.functions.splice(idx, 1);
        this._refreshNodes();
        this._render();
        this._save();
      });
    });

    // Function name change
    this.panel.querySelectorAll(".iface-fn-name").forEach((el) => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.fnIdx, 10);
        iface.functions[idx].name = e.target.value.trim();
        this._refreshNodes();
        this._save();
      });
    });

    // Pure toggle
    this.panel.querySelectorAll(".iface-fn-pure").forEach((el) => {
      el.addEventListener("change", (e) => {
        const idx = parseInt(e.target.dataset.fnIdx, 10);
        iface.functions[idx].isPure = e.target.checked;
        this._refreshNodes();
        this._save();
      });
    });

    // Add input/output
    this.panel.querySelectorAll(".iface-fn-add-in").forEach((el) => {
      el.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.fnIdx, 10);
        const fn = iface.functions[idx];
        fn.inputs = fn.inputs || [];
        fn.inputs.push({ name: `Param${fn.inputs.length + 1}`, type: "bool" });
        this._refreshNodes();
        this._render();
        this._save();
      });
    });
    this.panel.querySelectorAll(".iface-fn-add-out").forEach((el) => {
      el.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.fnIdx, 10);
        const fn = iface.functions[idx];
        fn.outputs = fn.outputs || [];
        fn.outputs.push({
          name: `Return${fn.outputs.length + 1}`,
          type: "bool",
        });
        this._refreshNodes();
        this._render();
        this._save();
      });
    });

    // Param edits
    this.panel.querySelectorAll(".iface-param-name").forEach((el) => {
      el.addEventListener("change", (e) => {
        this._editParam(e, "name", e.target.value.trim());
      });
    });
    this.panel.querySelectorAll(".iface-param-type").forEach((el) => {
      el.addEventListener("change", (e) => {
        this._editParam(e, "type", e.target.value);
      });
    });
    this.panel.querySelectorAll(".iface-param-delete").forEach((el) => {
      el.addEventListener("click", (e) => {
        const fnIdx = parseInt(e.target.dataset.fnIdx, 10);
        const dir = e.target.dataset.dir;
        const paramIdx = parseInt(e.target.dataset.paramIdx, 10);
        const fn = iface.functions[fnIdx];
        const list = dir === "in" ? fn.inputs : fn.outputs;
        if (list) list.splice(paramIdx, 1);
        this._refreshNodes();
        this._render();
        this._save();
      });
    });
  }

  _editParam(e, field, value) {
    const fnIdx = parseInt(e.target.dataset.fnIdx, 10);
    const dir = e.target.dataset.dir;
    const paramIdx = parseInt(e.target.dataset.paramIdx, 10);
    const fn = this.iface.functions[fnIdx];
    const list = dir === "in" ? fn.inputs : fn.outputs;
    if (list && list[paramIdx]) {
      list[paramIdx][field] = value;
      this._refreshNodes();
      this._save();
    }
  }

  _refreshNodes() {
    if (this.app.interfacesController) {
      this.app.interfacesController.refreshInterfaceNodes(this.iface);
    }
  }

  _save() {
    if (this.app.persistence) this.app.persistence.autoSave();
  }

  _esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[c]);
  }
}
