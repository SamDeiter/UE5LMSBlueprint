/**
 * PanelManager - Manages all dockable panels in the Blueprint Editor
 *
 * Provides UE5-style panel management with:
 * - Show/hide panels via Window menu
 * - Layout persistence (localStorage)
 * - Default layout restoration
 */

import { EventBus, AppEvents } from "../../core/EventBus.js";

/**
 * Panel configuration object
 * @typedef {Object} PanelConfig
 * @property {string} id - Unique panel identifier
 * @property {string} title - Display title
 * @property {string} icon - Font Awesome icon class
 * @property {string} dockZone - 'left' | 'right' | 'bottom' | 'center'
 * @property {string} tabGroup - Group ID for tabbed panels
 * @property {boolean} visible - Current visibility state
 * @property {number} order - Order within dock zone
 */

const STORAGE_KEY = "blueprint_panel_layout";

// Default panel configurations
const DEFAULT_PANELS = {
  components: {
    id: "components",
    title: "Components",
    icon: "fa-cube",
    dockZone: "left",
    tabGroup: "left-top",
    visible: true,
    order: 0,
  },
  myBlueprint: {
    id: "myBlueprint",
    title: "My Blueprint",
    icon: "fa-book",
    dockZone: "left",
    tabGroup: "left-bottom",
    visible: true,
    order: 1,
  },
  details: {
    id: "details",
    title: "Details",
    icon: "fa-info-circle",
    dockZone: "right",
    tabGroup: "right-main",
    visible: true,
    order: 0,
  },
  palette: {
    id: "palette",
    title: "Palette",
    icon: "fa-palette",
    dockZone: "right",
    tabGroup: "right-main",
    visible: true,
    order: 1,
  },
  compiler: {
    id: "compiler",
    title: "Compiler Results",
    icon: "fa-check-circle",
    dockZone: "bottom",
    tabGroup: "bottom-main",
    visible: true,
    order: 0,
  },
  findResults: {
    id: "findResults",
    title: "Find Results",
    icon: "fa-search",
    dockZone: "bottom",
    tabGroup: "bottom-main",
    visible: true,
    order: 1,
  },
  taskStatus: {
    id: "taskStatus",
    title: "Task Status",
    icon: "fa-tasks",
    dockZone: "bottom",
    tabGroup: "bottom-main",
    visible: true,
    order: 2,
  },
};

class PanelManager {
  constructor() {
    /** @type {Map<string, PanelConfig>} */
    this.panels = new Map();

    /** @type {Map<string, HTMLElement>} */
    this.panelElements = new Map();

    /** @type {Map<string, Set<string>>} Active tab in each tab group */
    this.activeTabsByGroup = new Map();

    this._initialized = false;
  }

  /**
   * Initialize the panel manager with default or saved layout
   */
  init() {
    if (this._initialized) return;

    // Load saved layout or use defaults
    const savedLayout = this._loadLayout();
    const panelConfigs = savedLayout || DEFAULT_PANELS;

    // Register all panels
    Object.values(panelConfigs).forEach((config) => {
      this.panels.set(config.id, { ...config });
    });

    // Find existing panel elements in DOM
    this._findPanelElements();

    // Apply initial visibility
    this._applyLayout();

    this._initialized = true;
    EventBus.emit(AppEvents.PANEL_LAYOUT_CHANGED);
  }

  /**
   * Show a panel
   * @param {string} panelId
   */
  showPanel(panelId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;

    panel.visible = true;
    this._applyPanelVisibility(panelId);
    this._activateTab(panelId);
    this._saveLayout();
    EventBus.emit(AppEvents.PANEL_VISIBILITY_CHANGED, {
      panelId,
      visible: true,
    });
  }

  /**
   * Hide a panel
   * @param {string} panelId
   */
  hidePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;

    panel.visible = false;
    this._applyPanelVisibility(panelId);
    this._saveLayout();
    EventBus.emit(AppEvents.PANEL_VISIBILITY_CHANGED, {
      panelId,
      visible: false,
    });
  }

  /**
   * Toggle panel visibility
   * @param {string} panelId
   */
  togglePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;

    if (panel.visible) {
      this.hidePanel(panelId);
    } else {
      this.showPanel(panelId);
    }
  }

  /**
   * Check if panel is visible
   * @param {string} panelId
   * @returns {boolean}
   */
  isPanelVisible(panelId) {
    const panel = this.panels.get(panelId);
    return panel ? panel.visible : false;
  }

  /**
   * Activate a tab within its tab group
   * @param {string} panelId
   */
  activateTab(panelId) {
    this._activateTab(panelId);
    this._saveLayout();
  }

  /**
   * Get all panels in a dock zone
   * @param {string} dockZone
   * @returns {PanelConfig[]}
   */
  getPanelsInZone(dockZone) {
    return Array.from(this.panels.values())
      .filter((p) => p.dockZone === dockZone)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get all panels in a tab group
   * @param {string} tabGroup
   * @returns {PanelConfig[]}
   */
  getPanelsInTabGroup(tabGroup) {
    return Array.from(this.panels.values())
      .filter((p) => p.tabGroup === tabGroup)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Restore default layout
   */
  restoreDefaultLayout() {
    Object.values(DEFAULT_PANELS).forEach((config) => {
      this.panels.set(config.id, { ...config });
    });
    this._applyLayout();
    this._saveLayout();
    EventBus.emit(AppEvents.PANEL_LAYOUT_CHANGED);
  }

  /**
   * Register a panel element
   * @param {string} panelId
   * @param {HTMLElement} element
   */
  registerPanelElement(panelId, element) {
    this.panelElements.set(panelId, element);
  }

  // ----- Private Methods -----

  _findPanelElements() {
    // Map DOM elements to panel IDs
    const mappings = {
      components: document.getElementById("components-panel"),
      myBlueprint: document.getElementById("my-blueprint"),
      details: document.getElementById("details-panel"),
      palette: document.getElementById("right-palette-panel"),
      compiler: document.getElementById("compiler-results"),
      findResults: document.getElementById("find-results-content"),
      taskStatus: document.getElementById("task-status-content"),
    };

    Object.entries(mappings).forEach(([id, el]) => {
      if (el) this.panelElements.set(id, el);
    });
  }

  _applyLayout() {
    this.panels.forEach((_config, panelId) => {
      this._applyPanelVisibility(panelId);
    });
  }

  _applyPanelVisibility(panelId) {
    const panel = this.panels.get(panelId);
    const element = this.panelElements.get(panelId);
    if (!panel || !element) return;

    if (panel.visible) {
      element.classList.remove("hidden");
    } else {
      element.classList.add("hidden");
    }
  }

  _activateTab(panelId) {
    const panel = this.panels.get(panelId);
    if (!panel) return;

    // Set this panel as active in its tab group
    this.activeTabsByGroup.set(panel.tabGroup, panelId);

    // Apply tab activation to DOM
    const tabGroupPanels = this.getPanelsInTabGroup(panel.tabGroup);
    tabGroupPanels.forEach((p) => {
      const el = this.panelElements.get(p.id);
      if (!el) return;

      if (p.id === panelId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    });
  }

  _saveLayout() {
    try {
      const layout = {};
      this.panels.forEach((config, id) => {
        layout[id] = { ...config };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch (e) {
      console.warn("Failed to save panel layout:", e);
    }
  }

  _loadLayout() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Failed to load panel layout:", e);
    }
    return null;
  }
}

// Singleton export
export const panelManager = new PanelManager();
