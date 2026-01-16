/**
 * DockableArea - Container for dockable panels in a dock zone
 *
 * Manages:
 * - Tab bar for switching between panels
 * - Panel content switching
 * - Resizing (delegates to existing resizers)
 */

import { panelManager } from "./PanelManager.js";

export class DockableArea {
  /**
   * @param {Object} config
   * @param {string} config.id - Unique area identifier
   * @param {string} config.dockZone - 'left' | 'right' | 'bottom'
   * @param {string} config.tabGroup - Tab group identifier
   * @param {HTMLElement} config.container - Container element
   */
  constructor(config) {
    this.id = config.id;
    this.dockZone = config.dockZone;
    this.tabGroup = config.tabGroup;
    this.container = config.container;

    this.tabBar = null;
    this.contentArea = null;
    this.panels = new Map();

    this._init();
  }

  _init() {
    // Create or find tab bar
    this.tabBar = this.container.querySelector(".dock-tab-bar");
    if (!this.tabBar) {
      this.tabBar = document.createElement("div");
      this.tabBar.className = "dock-tab-bar";
      this.container.insertBefore(this.tabBar, this.container.firstChild);
    }

    // Find content area (rest of container)
    this.contentArea = this.container.querySelector(".dock-content-area");
    if (!this.contentArea) {
      this.contentArea = document.createElement("div");
      this.contentArea.className = "dock-content-area";
      this.container.appendChild(this.contentArea);
    }

    // Get panels belonging to this tab group
    this._loadPanels();
    this._renderTabs();
  }

  _loadPanels() {
    const panelConfigs = panelManager.getPanelsInTabGroup(this.tabGroup);
    panelConfigs.forEach((config) => {
      this.panels.set(config.id, config);
    });
  }

  _renderTabs() {
    this.tabBar.innerHTML = "";

    this.panels.forEach((config, panelId) => {
      if (!config.visible) return;

      const tab = document.createElement("div");
      tab.className = "dock-tab";
      tab.dataset.panelId = panelId;
      tab.innerHTML = `
        <i class="fas ${config.icon}"></i>
        <span>${config.title}</span>
      `;

      tab.addEventListener("click", () => this.activatePanel(panelId));

      this.tabBar.appendChild(tab);
    });

    // Activate first visible panel
    const firstVisible = Array.from(this.panels.values()).find(
      (p) => p.visible
    );
    if (firstVisible) {
      this.activatePanel(firstVisible.id);
    }
  }

  /**
   * Activate a panel tab
   * @param {string} panelId
   */
  activatePanel(panelId) {
    // Update tab active states
    const tabs = this.tabBar.querySelectorAll(".dock-tab");
    tabs.forEach((tab) => {
      if (tab.dataset.panelId === panelId) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Show/hide panel content
    panelManager.activateTab(panelId);
  }

  /**
   * Refresh tabs when panel visibility changes
   */
  refresh() {
    this._loadPanels();
    this._renderTabs();
  }

  /**
   * Add a panel to this dock area
   * @param {string} panelId
   * @param {HTMLElement} panelElement
   */
  addPanel(panelId, panelElement) {
    this.contentArea.appendChild(panelElement);
    this.refresh();
  }

  /**
   * Remove a panel from this dock area
   * @param {string} panelId
   */
  removePanel(panelId) {
    const panel = this.panels.get(panelId);
    if (panel) {
      this.panels.delete(panelId);
      this.refresh();
    }
  }
}
