/**
 * Panel - Base class for dockable panels
 *
 * Provides common functionality for all panels:
 * - Header with title, icon, close button
 * - Show/hide methods
 * - Tab integration
 */

import { panelManager } from "./PanelManager.js";

export class Panel {
  /**
   * @param {Object} config
   * @param {string} config.id - Unique panel identifier
   * @param {string} config.title - Display title
   * @param {string} config.icon - Font Awesome icon class (e.g., 'fa-cube')
   * @param {HTMLElement} config.container - Container element for content
   */
  constructor(config) {
    this.id = config.id;
    this.title = config.title;
    this.icon = config.icon;
    this.container = config.container;
    this.element = null;

    this._createPanel();
    panelManager.registerPanelElement(this.id, this.element);
  }

  /**
   * Show this panel
   */
  show() {
    panelManager.showPanel(this.id);
  }

  /**
   * Hide this panel
   */
  hide() {
    panelManager.hidePanel(this.id);
  }

  /**
   * Toggle visibility
   */
  toggle() {
    panelManager.togglePanel(this.id);
  }

  /**
   * Check if visible
   * @returns {boolean}
   */
  isVisible() {
    return panelManager.isPanelVisible(this.id);
  }

  /**
   * Set the panel content
   * @param {HTMLElement|string} content
   */
  setContent(content) {
    const contentArea = this.element.querySelector(".panel-content");
    if (!contentArea) return;

    if (typeof content === "string") {
      contentArea.innerHTML = content;
    } else {
      contentArea.innerHTML = "";
      contentArea.appendChild(content);
    }
  }

  /**
   * Get the content area element
   * @returns {HTMLElement}
   */
  getContentArea() {
    return this.element.querySelector(".panel-content");
  }

  // ----- Private Methods -----

  _createPanel() {
    // If container already exists as the panel element, use it
    if (this.container) {
      this.element = this.container;
      return;
    }

    // Otherwise create a new panel structure
    this.element = document.createElement("div");
    this.element.id = `panel-${this.id}`;
    this.element.className = "dockable-panel";

    // Create header
    const header = document.createElement("div");
    header.className = "panel-header";
    header.innerHTML = `
      <i class="fas ${this.icon} panel-header-icon"></i>
      <span>${this.title}</span>
      <i class="fas fa-times panel-header-close"></i>
    `;

    // Add close handler
    const closeBtn = header.querySelector(".panel-header-close");
    closeBtn.addEventListener("click", () => this.hide());

    // Create content area
    const content = document.createElement("div");
    content.className = "panel-content";

    this.element.appendChild(header);
    this.element.appendChild(content);
  }

  /**
   * Destroy the panel and clean up
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
