/**
 * EventBus.js - Simple pub/sub event system for Blueprint communication
 * Enables loose coupling between modules
 */

/**
 * Application-wide event types
 */
export const AppEvents = {
  // Graph events
  GRAPH_SWITCHED: "graph:switched",
  GRAPH_SAVED: "graph:saved",
  GRAPH_LOADED: "graph:loaded",

  // Node events
  NODE_ADDED: "node:added",
  NODE_DELETED: "node:deleted",
  NODE_SELECTED: "node:selected",
  NODE_MOVED: "node:moved",

  // Variable events
  VARIABLE_ADDED: "variable:added",
  VARIABLE_DELETED: "variable:deleted",
  VARIABLE_RENAMED: "variable:renamed",
  VARIABLE_TYPE_CHANGED: "variable:typeChanged",

  // Blueprint events
  BLUEPRINT_OPENED: "blueprint:opened",
  BLUEPRINT_CLOSED: "blueprint:closed",
  BLUEPRINT_CREATED: "blueprint:created",

  // Compile events
  COMPILE_STARTED: "compile:started",
  COMPILE_COMPLETED: "compile:completed",
  COMPILE_ERROR: "compile:error",

  // Simulation events
  SIM_STARTED: "sim:started",
  SIM_PAUSED: "sim:paused",
  SIM_STOPPED: "sim:stopped",
  SIM_BREAKPOINT_HIT: "sim:breakpointHit",
};

/**
 * EventBus - Pub/sub event system
 */
class EventBusClass {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  once(event, callback) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event).add(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Handler function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.onceListeners.has(event)) {
      this.onceListeners.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data = null) {
    // Call regular listeners
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`EventBus: Error in listener for ${event}:`, err);
        }
      });
    }

    // Call once listeners and remove
    if (this.onceListeners.has(event)) {
      this.onceListeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`EventBus: Error in once listener for ${event}:`, err);
        }
      });
      this.onceListeners.get(event).clear();
    }
  }

  /**
   * Clear all listeners for an event
   * @param {string} event - Event name (optional, clears all if omitted)
   */
  clear(event = null) {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Get listener count for debugging
   * @param {string} event - Event name (optional)
   * @returns {number}
   */
  listenerCount(event = null) {
    if (event) {
      const regular = this.listeners.get(event)?.size || 0;
      const once = this.onceListeners.get(event)?.size || 0;
      return regular + once;
    }

    let total = 0;
    this.listeners.forEach((set) => (total += set.size));
    this.onceListeners.forEach((set) => (total += set.size));
    return total;
  }
}

// Singleton instance
export const EventBus = new EventBusClass();
