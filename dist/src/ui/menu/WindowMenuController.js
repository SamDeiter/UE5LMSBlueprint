/**
 * WindowMenuController - Handles Window menu panel toggles
 *
 * Integrates with PanelManager to show/hide panels via Window menu
 */

import { panelManager } from "../panels/PanelManager.js";
import { EventBus, AppEvents } from "../../core/EventBus.js";

export class WindowMenuController {
  constructor() {
    this._bindEvents();
    this._setupEventListeners();
  }

  _bindEvents() {
    // Panel toggle items
    const toggleItems = document.querySelectorAll(".panel-toggle");
    toggleItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const panelId = item.dataset.panel;
        if (panelId) {
          panelManager.togglePanel(panelId);
          this._updateCheckmarks();
        }
      });
    });

    // Restore Layout
    const restoreItem = document.getElementById("restore-layout-item");
    if (restoreItem) {
      restoreItem.addEventListener("click", (e) => {
        e.stopPropagation();
        panelManager.restoreDefaultLayout();
        this._updateCheckmarks();
      });
    }
  }

  _setupEventListeners() {
    // Update checkmarks when panel visibility changes
    EventBus.on(AppEvents.PANEL_VISIBILITY_CHANGED, () => {
      this._updateCheckmarks();
    });

    EventBus.on(AppEvents.PANEL_LAYOUT_CHANGED, () => {
      this._updateCheckmarks();
    });

    // Initial update
    this._updateCheckmarks();
  }

  _updateCheckmarks() {
    const toggleItems = document.querySelectorAll(".panel-toggle");
    toggleItems.forEach((item) => {
      const panelId = item.dataset.panel;
      if (panelId) {
        const isVisible = panelManager.isPanelVisible(panelId);
        if (isVisible) {
          item.classList.add("panel-visible");
        } else {
          item.classList.remove("panel-visible");
        }
      }
    });
  }

  /**
   * Programmatically update a panel's visibility
   * @param {string} panelId
   * @param {boolean} visible
   */
  setPanelVisibility(panelId, visible) {
    if (visible) {
      panelManager.showPanel(panelId);
    } else {
      panelManager.hidePanel(panelId);
    }
  }
}
