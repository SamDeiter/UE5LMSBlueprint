/**
 * TabManager.js - Manages Blueprint editor tabs
 * Foundation for multi-Blueprint editing experience
 */
import { EventBus, AppEvents } from "./EventBus.js";

/**
 * Represents a single tab
 */
export class Tab {
  constructor(id, title, type = "blueprint") {
    this.id = id;
    this.title = title;
    this.type = type;
    this.isDirty = false;
    this.isActive = false;
    this.createdAt = Date.now();
  }

  markDirty() {
    this.isDirty = true;
  }

  markClean() {
    this.isDirty = false;
  }
}

/**
 * TabManager - Handles tab creation, switching, and state
 */
export class TabManager {
  constructor() {
    this.tabs = new Map();
    this.activeTabId = null;
    this.tabOrder = []; // Maintains insertion order
    this.maxTabs = 20;
  }

  /**
   * Add a new tab
   * @param {string} id - Unique tab ID
   * @param {string} title - Tab display title
   * @param {string} type - Tab type (blueprint, function, macro)
   * @returns {Tab|null} Created tab or null if limit reached
   */
  addTab(id, title, type = "blueprint") {
    if (this.tabs.size >= this.maxTabs) {
      console.warn("TabManager: Maximum tab limit reached");
      return null;
    }

    if (this.tabs.has(id)) {
      // Tab already exists, activate it
      return this.activateTab(id);
    }

    const tab = new Tab(id, title, type);
    this.tabs.set(id, tab);
    this.tabOrder.push(id);

    EventBus.emit(AppEvents.BLUEPRINT_OPENED, { tabId: id, title });

    return tab;
  }

  /**
   * Remove a tab
   * @param {string} id - Tab ID
   * @returns {boolean} True if removed
   */
  removeTab(id) {
    if (!this.tabs.has(id)) return false;

    const tab = this.tabs.get(id);
    const wasActive = this.activeTabId === id;

    this.tabs.delete(id);
    this.tabOrder = this.tabOrder.filter((tabId) => tabId !== id);

    EventBus.emit(AppEvents.BLUEPRINT_CLOSED, { tabId: id, title: tab.title });

    // If closing active tab, switch to previous or next
    if (wasActive && this.tabOrder.length > 0) {
      const newActiveId = this.tabOrder[this.tabOrder.length - 1];
      this.activateTab(newActiveId);
    } else if (this.tabOrder.length === 0) {
      this.activeTabId = null;
    }

    return true;
  }

  /**
   * Activate a tab
   * @param {string} id - Tab ID
   * @returns {Tab|null} Activated tab
   */
  activateTab(id) {
    if (!this.tabs.has(id)) return null;

    // Deactivate current tab
    if (this.activeTabId) {
      const currentTab = this.tabs.get(this.activeTabId);
      if (currentTab) currentTab.isActive = false;
    }

    // Activate new tab
    const tab = this.tabs.get(id);
    tab.isActive = true;
    this.activeTabId = id;

    EventBus.emit(AppEvents.GRAPH_SWITCHED, { tabId: id, title: tab.title });

    return tab;
  }

  /**
   * Get active tab
   * @returns {Tab|null}
   */
  getActiveTab() {
    return this.activeTabId ? this.tabs.get(this.activeTabId) : null;
  }

  /**
   * Get all tabs in order
   * @returns {Tab[]}
   */
  getAllTabs() {
    return this.tabOrder.map((id) => this.tabs.get(id)).filter(Boolean);
  }

  /**
   * Get tab by ID
   * @param {string} id - Tab ID
   * @returns {Tab|null}
   */
  getTab(id) {
    return this.tabs.get(id) || null;
  }

  /**
   * Check if any tabs are dirty
   * @returns {boolean}
   */
  hasDirtyTabs() {
    return [...this.tabs.values()].some((tab) => tab.isDirty);
  }

  /**
   * Get all dirty tabs
   * @returns {Tab[]}
   */
  getDirtyTabs() {
    return [...this.tabs.values()].filter((tab) => tab.isDirty);
  }

  /**
   * Reorder tabs
   * @param {string} tabId - Tab to move
   * @param {number} newIndex - New position
   */
  reorderTab(tabId, newIndex) {
    const currentIndex = this.tabOrder.indexOf(tabId);
    if (currentIndex === -1) return;

    this.tabOrder.splice(currentIndex, 1);
    this.tabOrder.splice(newIndex, 0, tabId);
  }

  /**
   * Update tab title
   * @param {string} id - Tab ID
   * @param {string} newTitle - New title
   */
  updateTabTitle(id, newTitle) {
    const tab = this.tabs.get(id);
    if (tab) {
      tab.title = newTitle;
    }
  }

  /**
   * Serialize tab state
   */
  toJSON() {
    return {
      tabs: this.tabOrder.map((id) => {
        const tab = this.tabs.get(id);
        return {
          id: tab.id,
          title: tab.title,
          type: tab.type,
          isDirty: tab.isDirty,
        };
      }),
      activeTabId: this.activeTabId,
    };
  }

  /**
   * Restore from serialized state
   */
  fromJSON(data) {
    this.tabs.clear();
    this.tabOrder = [];

    if (data?.tabs) {
      data.tabs.forEach((tabData) => {
        const tab = new Tab(tabData.id, tabData.title, tabData.type);
        tab.isDirty = tabData.isDirty || false;
        this.tabs.set(tab.id, tab);
        this.tabOrder.push(tab.id);
      });
    }

    if (data?.activeTabId && this.tabs.has(data.activeTabId)) {
      this.activateTab(data.activeTabId);
    }
  }
}

// Singleton instance
export const tabManager = new TabManager();
