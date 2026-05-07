/**
 * ClassDetails - Handles Class Settings panel rendering
 * Enhanced with UE5-style Interfaces, Class Options, and Display Options
 */
import { interfaceRegistry } from "../../interfaces/InterfaceRegistry.js";
import {
  buildStubImplGraph,
  getInterfaceImplGraphName,
} from "../../core/BlueprintAssetManager.js";

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
        // Replication Settings
        replicates: false,
        replicateMovement: false,
        netLoadOnClient: true,
        netUpdateFrequency: 100,
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

      <div class="details-group">
        <h4>Replication</h4>
        <div class="detail-row">
          <label>Replicates</label>
          <div style="width: 60%;">
            <input type="checkbox" id="replicates-checkbox" class="ue5-checkbox" ${
              settings.replicates ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Replicate Movement</label>
          <div style="width: 60%;">
            <input type="checkbox" id="replicate-movement-checkbox" class="ue5-checkbox" ${
              settings.replicateMovement ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Net Load on Client</label>
          <div style="width: 60%;">
            <input type="checkbox" id="net-load-client-checkbox" class="ue5-checkbox" ${
              settings.netLoadOnClient !== false ? "checked" : ""
            }>
          </div>
        </div>
        <div class="detail-row">
          <label>Net Update Frequency</label>
          <input type="number" id="net-update-freq-input" class="details-input" value="${
            settings.netUpdateFrequency || 100
          }" min="0" step="10">
        </div>
      </div>
    `;

    this._bindEvents(settings);
  }

  _bindEvents(_settings) {
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

    // Replication Settings
    bindInput("#replicates-checkbox", "replicates", true);
    bindInput("#replicate-movement-checkbox", "replicateMovement", true);
    bindInput("#net-load-client-checkbox", "netLoadOnClient", true);
    bindInput("#net-update-freq-input", "netUpdateFrequency");

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
        const ifaceName = e.target.value;
        if (ifaceName) {
          this._addInterface(ifaceName);
        }
      });
    }

    // Interface remove
    const removeButtons = this.panel.querySelectorAll(".interface-remove");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(e.target.dataset.index, 10);
        const ifaceName = (this.app.classSettings.interfaces || [])[idx];
        if (ifaceName) {
          this._removeInterface(ifaceName);
        }
      });
    });

    // Open impl graph when a function row is clicked.
    const fnRows = this.panel.querySelectorAll(".interface-function");
    fnRows.forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        const ifaceName = row.dataset.interface;
        const fnName = row.dataset.function;
        if (ifaceName && fnName) {
          this._openImplGraph(ifaceName, fnName);
        }
      });
    });
  }

  /**
   * Add an interface to the active Blueprint.
   * Updates both legacy classSettings (for serialization compat) and the
   * asset manager's modern implementedInterfaces list. Seeds stub impl
   * graphs into app.graphs so GraphSwitcher can navigate to them.
   */
  _addInterface(ifaceName) {
    const iface = interfaceRegistry.get(ifaceName);
    if (!iface) return;

    // Legacy mirror — keeps existing classSettings serialization working.
    if (!this.app.classSettings.interfaces) {
      this.app.classSettings.interfaces = [];
    }
    if (!this.app.classSettings.interfaces.includes(ifaceName)) {
      this.app.classSettings.interfaces.push(ifaceName);
    }

    // Modern path — record on the active asset and let it seed impl graphs.
    const asset = this._activeAsset();
    if (asset) {
      asset.addInterface(ifaceName);
    }

    // Mirror impl graph data into the legacy app.graphs store so
    // GraphSwitcher (which only knows about app.graphs / function /
    // macro registries) can find and load them.
    if (this.app.graphs) {
      for (const fn of iface.functions) {
        const graphName = getInterfaceImplGraphName(ifaceName, fn.name);
        if (this.app.graphs[graphName]) continue;
        const stub =
          asset && asset.graphs.has(graphName)
            ? asset.graphs.get(graphName)
            : buildStubImplGraph(iface, fn);
        this.app.graphs[graphName] = stub;
      }
    }

    if (this.app.persistence) this.app.persistence.autoSave();
    this.showSettings();
  }

  /**
   * Remove an interface from the active Blueprint and delete its impl graphs.
   * If the user is currently viewing one of those graphs, switch them to the
   * EventGraph so they're not left looking at a stale view.
   */
  _removeInterface(ifaceName) {
    const iface = interfaceRegistry.get(ifaceName);
    const funcs = iface ? iface.functions : [];

    // Confirm with the student — removing wipes any custom impl work.
    if (
      typeof window !== "undefined" &&
      window.confirm &&
      !window.confirm(
        `Remove interface '${ifaceName}'?\n` +
          `This will delete the implementation graph${
            funcs.length === 1 ? "" : "s"
          } for ${funcs.map((f) => f.name).join(", ") || "(no functions)"}.`
      )
    ) {
      return;
    }

    // Legacy classSettings update
    if (this.app.classSettings.interfaces) {
      const idx = this.app.classSettings.interfaces.indexOf(ifaceName);
      if (idx !== -1) this.app.classSettings.interfaces.splice(idx, 1);
    }

    // Asset update
    const asset = this._activeAsset();
    if (asset) asset.removeInterface(ifaceName);

    // Drop impl graphs from the legacy store
    const orphanedGraphNames = [];
    if (this.app.graphs && iface) {
      for (const fn of iface.functions) {
        const graphName = getInterfaceImplGraphName(ifaceName, fn.name);
        if (graphName in this.app.graphs) {
          delete this.app.graphs[graphName];
          orphanedGraphNames.push(graphName);
        }
      }
    }

    // If the user is sitting on one of those graphs, kick them back to
    // the event graph rather than leaving them on a deleted view.
    if (orphanedGraphNames.includes(this.app.activeGraph)) {
      this.app.switchGraph("EventGraph");
    }
    // Close any open tabs for orphaned graphs.
    orphanedGraphNames.forEach((name) => {
      const tab = document.querySelector(
        `.graph-tab[data-graph="${name}"]`
      );
      if (tab) tab.remove();
    });

    if (this.app.persistence) this.app.persistence.autoSave();
    this.showSettings();
  }

  _openImplGraph(ifaceName, fnName) {
    const graphName = getInterfaceImplGraphName(ifaceName, fnName);
    // Defensive: ensure the graph exists in app.graphs before switching.
    if (this.app.graphs && !this.app.graphs[graphName]) {
      const iface = interfaceRegistry.get(ifaceName);
      const fn = iface ? iface.getFunction(fnName) : null;
      if (iface && fn) {
        this.app.graphs[graphName] = buildStubImplGraph(iface, fn);
      }
    }
    if (this.app.switchGraph) {
      this.app.switchGraph(graphName);
    }
  }

  _activeAsset() {
    const am = this.app.assetManager;
    if (!am) return null;
    return am.getAsset(am.activeAssetId);
  }
}
