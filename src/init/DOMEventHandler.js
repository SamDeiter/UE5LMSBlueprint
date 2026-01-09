/**
 * DOMEventHandler.js
 *
 * Handles binding global event listeners for the application.
 * - Toolbar buttons (Compile, Save, Play, etc.)
 * - Global Hotkeys (Ctrl+S, Delete, F-keys)
 * - Menu interactions
 */
import { DOMElements } from "../config/DOMElements.js";

export class DOMEventHandler {
  constructor(app) {
    this.app = app;
  }

  bindAll() {
    this.bindToolbarEvents();
    this.bindMenuEvents();
    this.bindGlobalHotkeys();
    this.bindHelpEvents();

    // Initial initEvents for Graph (legacy, maybe move later)
    if (this.app.graph) {
      this.app.graph.initEvents();
    }
  }

  bindToolbarEvents() {
    const { compiler, persistence, history, sim } = this.app;

    this._bindClick(DOMElements.COMPILE_BTN, () => compiler.compile());
    this._bindClick(DOMElements.SAVE_BTN, () => persistence.save(true));

    this._bindClick(DOMElements.UNDO_BTN, () => history.undo());
    this._bindClick(DOMElements.REDO_BTN, () => history.redo());

    this._bindClick(DOMElements.PLAY_BTN, () => sim.run());
    this._bindClick(DOMElements.STOP_BTN, () => sim.stop());

    this._bindClick(DOMElements.STEP_BTN, () => sim.stepOver());
    this._bindClick(DOMElements.STEP_INTO_BTN, () => sim.stepInto());
    this._bindClick(DOMElements.STEP_OUT_BTN, () => sim.stepOut());

    // Class Settings/Defaults (Phase 5)
    this._bindClick("class-settings-btn", () => {
      if (this.app.details) this.app.details.showClassSettings();
    });
    this._bindClick("class-defaults-btn", () => {
      if (this.app.details) this.app.details.showClassDefaults();
    });
  }

  bindMenuEvents() {
    // New Blueprint Menu Item
    this._bindClick("new-blueprint-menu-item", () => {
      if (this.app.parentClassModal) {
        this.app.parentClassModal.open();
      }
    });

    // Tools Menu - Assessment Mode
    this._bindClick("assessment-menu-item", () => {
      if (this.app.assessment) this.app.assessment.open();
    });

    // Tools Menu - Run Tests
    this._bindClick("run-tests-menu-item", () => {
      if (window.runTests) window.runTests();
    });
  }

  bindHelpEvents() {
    const modal = document.getElementById(DOMElements.HELP_MODAL);

    this._bindClick(DOMElements.HELP_BTN, () => {
      if (modal) modal.style.display = "flex";
    });

    this._bindClick(DOMElements.HELP_MODAL_CLOSE, () => {
      if (modal) modal.style.display = "none";
    });
  }

  bindGlobalHotkeys() {
    document.addEventListener("keydown", (e) => {
      const target = e.target;
      const tagName = target.tagName ? target.tagName.toUpperCase() : "";
      const isTextEditor =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTextEditor) return;

      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
          e.preventDefault();
          this.app.history.undo();
          return;
        }
        if (e.key === "y" || e.key === "Y") {
          e.preventDefault();
          this.app.history.redo();
          return;
        }
        if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          this.app.persistence.save();
          return;
        }
        if (e.key === "w" || e.key === "W") {
          // Duplicate
          e.preventDefault();
          this.app.graph.duplicateSelectedNodes();
          return;
        }
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          const findTab = document.querySelector(
            '.bottom-tab[data-tab="find"]'
          );
          if (findTab) findTab.click();
          return;
        }
      }

      // Function Keys
      if (e.key === "F10") {
        e.preventDefault();
        this.app.sim && this.app.sim.stepOver();
        return;
      }
      if (e.key === "F11") {
        e.preventDefault();
        if (this.app.sim) {
          if (e.shiftKey) this.app.sim.stepOut();
          else this.app.sim.stepInto();
        }
        return;
      }

      // Deletion
      if (e.key === "Delete" || e.key === "Backspace") {
        this._handleDeletion(e);
      }
    });
  }

  _handleDeletion(e) {
    // If graph objects are selected, let GraphInteraction handle it
    if (this.app.graph && this.app.graph.selectedNodes.size > 0) return;
    if (this.app.wiring && this.app.wiring.selectedLinks.size > 0) return;

    e.preventDefault();

    // Check for specific UI panel interactions
    let varToDelete = this.app.details.currentVariable;
    let componentToDelete = null;
    let hasSelectedComponents =
      this.app.componentsController &&
      this.app.componentsController.selectedComponentIds.size > 0;

    if (!varToDelete && !hasSelectedComponents) {
      const activeEl = document.activeElement;
      if (activeEl) {
        // Check Tree Items
        if (
          activeEl.closest(
            ".ue5-variable-item[data-var-id], .tree-item[data-var-id]"
          )
        ) {
          const id = activeEl.closest("[data-var-id]").dataset.varId;
          varToDelete = [...this.app.variables.variables.values()].find(
            (v) => v.id === id
          );
        } else if (activeEl.closest(".tree-item[data-component-id]")) {
          componentToDelete =
            activeEl.closest(".tree-item").dataset.componentId;
        }
      }
    }

    if (varToDelete) {
      this.app.variables.deleteVariable(varToDelete);
    } else if (hasSelectedComponents) {
      this.app.componentsController.deleteSelectedComponents();
    } else if (componentToDelete) {
      this.app.componentsController.deleteComponent(componentToDelete);
    }
  }

  _bindClick(elementId, callback) {
    const el = document.getElementById(elementId);
    if (el) el.addEventListener("click", callback);
  }
}
