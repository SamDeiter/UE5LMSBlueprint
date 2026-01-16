/**
 * ClassDetails - Handles Class Settings panel rendering
 * Enhanced with UE5-style Interfaces, Class Options, and Display Options
 */
import { interfaceRegistry } from "../../interfaces/InterfaceRegistry.js";

export class ClassDetails {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.panel = controller.panel;
  }

  showSettings() {
    this.controller.currentVariable = null;
    this.app.wiring?.clearLinkSelection();
    this.app.graph?.clearSelection();

    // Ensure settings exist with all properties
    if (!this.app.classSettings) {
      this.app.classSettings = {
        // Parent class
        parentClass: "Actor",
        // Interfaces
        interfaces: [],
        // Class Options
        isAbstract: false,
        isDeprecated: false,
        isBlueprintType: true,
        isBlueprintable: true,
        // Display Options
        displayName: "",
        category: "Default",
        description: "",
        keywords: "",
        // Tick Settings
        tickGroup: "PrePhysics",
        canEverTick: true,
        startWithTickEnabled: true,
        allowTickBeforeBeginPlay: false,
        // Actor Settings
        actorLabel: "",
        generatesOverlapEvents: true,
      };
    }
    const settings = this.app.classSettings;

    // Get interfaces from registry
    const availableInterfaces = interfaceRegistry.getAllNames();

    // Build interface list with functions
    const interfacesList = (settings.interfaces || [])
      .map((ifaceName, idx) => {
        const iface = interfaceRegistry.get(ifaceName);
        const funcs = iface
          ? iface.functions
              .map(
                (f) =>
                  `<div class="interface-function" data-interface="${ifaceName}" data-function="${
                    f.name
                  }">
            <i class="fas fa-${f.isPure ? "circle" : "bolt"}" style="color: ${
                    f.isPure ? "#27ae60" : "#e74c3c"
                  }; font-size: 10px;"></i>
            <span>${f.name}</span>
          </div>`
              )
              .join("")
          : "";
        return `
        <div class="interface-item" data-index="${idx}">
          <div class="interface-header">
            <i class="fas fa-puzzle-piece" style="color: #9b59b6;"></i>
            <span>${ifaceName}</span>
            <i class="fas fa-times interface-remove" data-index="${idx}" style="cursor: pointer; color: #e74c3c;"></i>
          </div>
          <div class="interface-functions">${funcs}</div>
        </div>
      `;
      })
      .join("");

    this.panel.innerHTML = `
      <div class="details-group">
        <h4>Class Settings</h4>
        <div class="detail-row">
          <label>Parent Class</label>
          <span class="detail-value-static" style="color: #4a90e2; cursor: pointer;" id="parent-class-trigger">
            ${this.app.classDefaults?.parentClass || "Actor"}
          </span>
        </div>
      </div>

      <div class="details-group">
        <h4>Interfaces</h4>
        <div id="interfaces-list" class="interfaces-list">
          ${interfacesList || '<span style="color: #666;">No interfaces</span>'}
        </div>
        <div class="detail-row" style="margin-top: 8px;">
          <select id="add-interface-select" class="details-select" style="flex: 1;">
            <option value="">Add Interface...</option>
            ${availableInterfaces
              .filter((i) => !(settings.interfaces || []).includes(i))
              .map((i) => `<option value="${i}">${i}</option>`)
              .join("")}
          </select>
        </div>
      </div>

      <div class="details-group">
        <h4>Class Options</h4>
        <div class="detail-row">
          <label>Abstract</label>
          <div style="width: 60%;">
            <input type="checkbox" id="is-abstract-checkbox" class="ue5-checkbox" ${
              settings.isAbstract ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Deprecated</label>
          <div style="width: 60%;">
            <input type="checkbox" id="is-deprecated-checkbox" class="ue5-checkbox" ${
              settings.isDeprecated ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Blueprint Type</label>
          <div style="width: 60%;">
            <input type="checkbox" id="is-blueprinttype-checkbox" class="ue5-checkbox" ${
              settings.isBlueprintType ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Blueprintable</label>
          <div style="width: 60%;">
            <input type="checkbox" id="is-blueprintable-checkbox" class="ue5-checkbox" ${
              settings.isBlueprintable ? "checked" : ""
            }>
          </div>
        </div>
      </div>

      <div class="details-group">
        <h4>Blueprint Display</h4>
        <div class="detail-row">
          <label>Display Name</label>
          <input type="text" id="display-name-input" class="details-input" value="${
            settings.displayName || ""
          }" placeholder="MyBlueprint">
        </div>
        <div class="detail-row">
          <label>Category</label>
          <input type="text" id="category-input" class="details-input" value="${
            settings.category || ""
          }" placeholder="Default">
        </div>
        <div class="detail-row">
          <label>Description</label>
          <textarea id="description-input" class="details-textarea" rows="2" placeholder="Blueprint description...">${
            settings.description || ""
          }</textarea>
        </div>
        <div class="detail-row">
          <label>Keywords</label>
          <input type="text" id="keywords-input" class="details-input" value="${
            settings.keywords || ""
          }" placeholder="keyword1, keyword2">
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
              settings.tickGroup === "DuringPhysics" ? "selected" : ""
            }>During Physics</option>
            <option value="PostPhysics" ${
              settings.tickGroup === "PostPhysics" ? "selected" : ""
            }>Post Physics</option>
            <option value="PostUpdateWork" ${
              settings.tickGroup === "PostUpdateWork" ? "selected" : ""
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

    this._bindEvents(settings);
  }

  _bindEvents(settings) {
    // Helper to bind input changes
    const bindInput = (id, prop, isCheckbox = false) => {
      const el = this.panel.querySelector(id);
      if (el) {
        el.addEventListener("change", (e) => {
          const val = isCheckbox ? e.target.checked : e.target.value;
          this.app.classSettings[prop] = val;
          this.app.persistence.autoSave();
        });
      }
    };

    // Class Options
    bindInput("#is-abstract-checkbox", "isAbstract", true);
    bindInput("#is-deprecated-checkbox", "isDeprecated", true);
    bindInput("#is-blueprinttype-checkbox", "isBlueprintType", true);
    bindInput("#is-blueprintable-checkbox", "isBlueprintable", true);

    // Display Options
    bindInput("#display-name-input", "displayName");
    bindInput("#category-input", "category");
    bindInput("#description-input", "description");
    bindInput("#keywords-input", "keywords");

    // Tick Settings
    bindInput("#tick-group-select", "tickGroup");
    bindInput("#can-ever-tick-checkbox", "canEverTick", true);
    bindInput("#start-tick-checkbox", "startWithTickEnabled", true);
    bindInput("#tick-before-begin-checkbox", "allowTickBeforeBeginPlay", true);

    // Actor Settings
    bindInput("#actor-label-input", "actorLabel");
    bindInput("#overlap-events-checkbox", "generatesOverlapEvents", true);

    // Parent class trigger
    const parentTrigger = this.panel.querySelector("#parent-class-trigger");
    if (parentTrigger && this.app.parentClassModal) {
      parentTrigger.addEventListener("click", () => {
        this.app.parentClassModal.show();
      });
    }

    // Interface add
    const addInterfaceSelect = this.panel.querySelector(
      "#add-interface-select"
    );
    if (addInterfaceSelect) {
      addInterfaceSelect.addEventListener("change", (e) => {
        const iface = e.target.value;
        if (iface) {
          if (!this.app.classSettings.interfaces) {
            this.app.classSettings.interfaces = [];
          }
          this.app.classSettings.interfaces.push(iface);
          this.app.persistence.autoSave();
          this.showSettings(); // Re-render
        }
      });
    }

    // Interface remove
    const removeButtons = this.panel.querySelectorAll(".interface-remove");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (this.app.classSettings.interfaces) {
          this.app.classSettings.interfaces.splice(idx, 1);
          this.app.persistence.autoSave();
          this.showSettings(); // Re-render
        }
      });
    });
  }
}
