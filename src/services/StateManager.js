/**
 * StateManager - Centralized state management with pub/sub subscriptions
 *
 * Provides reactive state updates for UI components. Works alongside
 * HistoryManager (which handles undo/redo) to add subscription-based
 * notifications when state changes.
 *
 * Usage:
 *   // Subscribe to variable changes
 *   app.stateManager.subscribe('variables', (variables) => {
 *     console.log('Variables updated:', variables);
 *   });
 *
 *   // Notify after changes
 *   app.stateManager.notify('variables');
 */
export class StateManager {
  constructor(app) {
    this.app = app;
    // Map of path -> Set of callbacks
    this.subscribers = new Map();
    // Batch notification queue
    this.pendingNotifications = new Set();
    this.batchTimeout = null;
  }

  /**
   * Subscribe to state changes for a path
   * @param {string} path - State path (e.g., 'variables', 'components', 'graph')
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path).add(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(path, callback);
  }

  /**
   * Unsubscribe from state changes
   * @param {string} path - State path
   * @param {Function} callback - The callback to remove
   */
  unsubscribe(path, callback) {
    const subs = this.subscribers.get(path);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) {
        this.subscribers.delete(path);
      }
    }
  }

  /**
   * Notify subscribers that state at path has changed
   * @param {string} path - State path that changed
   * @param {*} [value] - Optional new value (if not provided, will be fetched)
   */
  notify(path, value) {
    const subs = this.subscribers.get(path);
    if (!subs || subs.size === 0) return;

    // Get value if not provided
    const stateValue = value !== undefined ? value : this.getState(path);

    // Notify all subscribers
    for (const callback of subs) {
      try {
        callback(stateValue, path);
      } catch (err) {
        console.error(`[StateManager] Error in subscriber for '${path}':`, err);
      }
    }
  }

  /**
   * Batch multiple notifications to prevent redundant updates
   * @param {string} path - State path that changed
   */
  notifyBatched(path) {
    this.pendingNotifications.add(path);

    // Debounce notifications
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      for (const p of this.pendingNotifications) {
        this.notify(p);
      }
      this.pendingNotifications.clear();
      this.batchTimeout = null;
    }, 10); // 10ms debounce
  }

  /**
   * Get current state for a path
   * @param {string} path - State path
   * @returns {*} Current state value
   */
  getState(path) {
    switch (path) {
      case "variables":
        return this.app.variables?.variables
          ? [...this.app.variables.variables.values()]
          : [];

      case "components":
        return this.app.components ? [...this.app.components.values()] : [];

      case "functions":
        return this.app.functionRegistry
          ? this.app.functionRegistry.getAll()
          : [];

      case "macros":
        return this.app.macroRegistry ? this.app.macroRegistry.getAll() : [];

      case "graph":
        return {
          nodes: this.app.graph?.nodes
            ? [...this.app.graph.nodes.values()]
            : [],
          links: this.app.wiring?.links
            ? [...this.app.wiring.links.values()]
            : [],
        };

      case "selection":
        return {
          nodes: this.app.graph?.selectedNodes || [],
          variable: this.app.variables?.selectedVariable || null,
          component: this.app.componentsController?.selectedComponent || null,
        };

      case "activeGraph":
        return this.app.activeGraph || "EventGraph";

      case "classDefaults":
        return this.app.classDefaults || {};

      default:
        console.warn(`[StateManager] Unknown state path: ${path}`);
        return null;
    }
  }

  /**
   * Notify all state paths (e.g., after undo/redo)
   */
  notifyAll() {
    const paths = [
      "variables",
      "components",
      "functions",
      "macros",
      "graph",
      "selection",
      "activeGraph",
      "classDefaults",
    ];
    for (const path of paths) {
      this.notify(path);
    }
  }

  // --- Convenience Methods for Common State Operations ---

  /**
   * Add a variable and notify subscribers
   */
  addVariable(variable) {
    if (this.app.variables?.variables) {
      this.app.variables.variables.set(variable.id, variable);
      this.notify("variables");
      return true;
    }
    return false;
  }

  /**
   * Update a variable and notify subscribers
   */
  updateVariable(id, updates) {
    const variable = this.app.variables?.variables?.get(id);
    if (variable) {
      Object.assign(variable, updates);
      this.notify("variables");
      return true;
    }
    return false;
  }

  /**
   * Remove a variable and notify subscribers
   */
  removeVariable(id) {
    if (this.app.variables?.variables?.delete(id)) {
      this.notify("variables");
      return true;
    }
    return false;
  }

  /**
   * Add a component and notify subscribers
   */
  addComponent(component) {
    if (this.app.components) {
      this.app.components.set(component.id, component);
      this.notify("components");
      return true;
    }
    return false;
  }

  /**
   * Remove a component and notify subscribers
   */
  removeComponent(id) {
    if (this.app.components?.delete(id)) {
      this.notify("components");
      return true;
    }
    return false;
  }

  /**
   * Update selection and notify subscribers
   */
  setSelection(selection) {
    this.notify("selection", selection);
  }

  /**
   * Get subscriber count for debugging
   */
  getStats() {
    const stats = {};
    for (const [path, subs] of this.subscribers) {
      stats[path] = subs.size;
    }
    return stats;
  }

  /**
   * Clear all subscriptions (for cleanup)
   */
  clearAll() {
    this.subscribers.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.pendingNotifications.clear();
  }
}
