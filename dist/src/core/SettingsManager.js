/**
 * SettingsManager.js - User preferences and editor settings
 * Persists settings to localStorage with defaults
 */
import { EventBus } from "./EventBus.js";

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  // Graph settings
  gridSize: 16,
  snapToGrid: true,
  showGrid: true,
  wireStyle: "bezier", // 'bezier', 'straight', 'stepped'

  // Zoom settings
  zoomMin: 0.1,
  zoomMax: 2.0,
  zoomStep: 0.1,
  defaultZoom: 1.0,

  // UI settings
  theme: "dark",
  fontSize: 13,
  showMinimap: false,
  showNodeStats: true,
  confirmDelete: true,

  // Auto-save settings
  autoSave: true,
  autoSaveInterval: 30000,

  // Simulation settings
  simSpeed: 1.0,
  showExecutionPath: true,
  pauseOnBreakpoint: true,

  // Accessibility
  highContrast: false,
  reducedMotion: false,
  colorblindMode: "none", // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
};

/**
 * SettingsManager - Manages user preferences
 */
class SettingsManagerClass {
  constructor() {
    this.storageKey = "blueprintEditor_settings_v1";
    this.settings = { ...DEFAULT_SETTINGS };
    this.listeners = new Map();
  }

  /**
   * Initialize and load settings from storage
   */
  initialize() {
    this.load();
    return this;
  }

  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  get(key) {
    return this.settings[key] ?? DEFAULT_SETTINGS[key];
  }

  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   */
  set(key, value) {
    const oldValue = this.settings[key];
    this.settings[key] = value;

    // Notify listeners
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach((callback) => {
        callback(value, oldValue);
      });
    }

    // Emit global event
    EventBus.emit("settings:changed", { key, value, oldValue });

    // Auto-save
    this.save();
  }

  /**
   * Get all settings
   * @returns {Object}
   */
  getAll() {
    return { ...this.settings };
  }

  /**
   * Update multiple settings
   * @param {Object} updates - Key-value pairs to update
   */
  setMultiple(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.settings[key] = value;
    });
    this.save();
    EventBus.emit("settings:batchChanged", { updates });
  }

  /**
   * Reset a setting to default
   * @param {string} key - Setting key
   */
  reset(key) {
    if (key in DEFAULT_SETTINGS) {
      this.set(key, DEFAULT_SETTINGS[key]);
    }
  }

  /**
   * Reset all settings to defaults
   */
  resetAll() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    EventBus.emit("settings:reset");
  }

  /**
   * Subscribe to setting changes
   * @param {string} key - Setting key
   * @param {Function} callback - Callback(newValue, oldValue)
   * @returns {Function} Unsubscribe function
   */
  onChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Load settings from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new settings
        this.settings = { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn("SettingsManager: Failed to load settings", e);
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save settings to localStorage
   */
  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch (e) {
      console.error("SettingsManager: Failed to save settings", e);
    }
  }

  /**
   * Export settings as JSON string
   * @returns {string}
   */
  export() {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   * @param {string} json - JSON settings string
   */
  import(json) {
    try {
      const imported = JSON.parse(json);
      this.settings = { ...DEFAULT_SETTINGS, ...imported };
      this.save();
      EventBus.emit("settings:imported");
    } catch (e) {
      throw new Error("Invalid settings format");
    }
  }

  /**
   * Check if a setting has been changed from default
   * @param {string} key - Setting key
   * @returns {boolean}
   */
  isModified(key) {
    return this.settings[key] !== DEFAULT_SETTINGS[key];
  }

  /**
   * Get default value for a setting
   * @param {string} key - Setting key
   * @returns {*}
   */
  getDefault(key) {
    return DEFAULT_SETTINGS[key];
  }
}

// Singleton instance
export const SettingsManager = new SettingsManagerClass();
