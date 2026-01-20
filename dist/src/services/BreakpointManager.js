/**
 * BreakpointManager - Manages breakpoints for Blueprint debugging
 *
 * This is a client-side simulation of UE5's breakpoint system.
 * Breakpoints are stored in memory (sessionStorage) and cleared on page refresh.
 *
 * UE5 Reference: KismetDebugUtilities.h - FBlueprintBreakpoint
 */

/* global sessionStorage */

class BreakpointManager {
  constructor() {
    // Map of nodeId -> breakpoint data
    this.breakpoints = new Map();

    // Load from sessionStorage if available
    this.loadFromSession();
  }

  /**
   * Add a breakpoint to a node
   * @param {string} nodeId - The node ID to add breakpoint to
   */
  addBreakpoint(nodeId) {
    if (!this.breakpoints.has(nodeId)) {
      this.breakpoints.set(nodeId, {
        enabled: true,
        hitCount: 0,
        createdAt: Date.now(),
      });
      this.saveToSession();
    }
  }

  /**
   * Remove a breakpoint from a node
   * @param {string} nodeId - The node ID to remove breakpoint from
   */
  removeBreakpoint(nodeId) {
    if (this.breakpoints.delete(nodeId)) {
      this.saveToSession();
    }
  }

  /**
   * Toggle breakpoint enabled/disabled state
   * @param {string} nodeId - The node ID to toggle
   */
  toggleEnabled(nodeId) {
    const bp = this.breakpoints.get(nodeId);
    if (bp) {
      bp.enabled = !bp.enabled;
      this.saveToSession();
    }
  }

  /**
   * Toggle breakpoint existence (add if missing, remove if exists)
   * @param {string} nodeId - The node ID to toggle
   */
  toggleBreakpoint(nodeId) {
    if (this.hasBreakpoint(nodeId)) {
      this.removeBreakpoint(nodeId);
    } else {
      this.addBreakpoint(nodeId);
    }
  }

  /**
   * Check if node has a breakpoint
   * @param {string} nodeId - The node ID to check
   * @returns {boolean} True if breakpoint exists
   */
  hasBreakpoint(nodeId) {
    return this.breakpoints.has(nodeId);
  }

  /**
   * Check if breakpoint is enabled
   * @param {string} nodeId - The node ID to check
   * @returns {boolean} True if breakpoint exists and is enabled
   */
  isEnabled(nodeId) {
    const bp = this.breakpoints.get(nodeId);
    return bp && bp.enabled;
  }

  /**
   * Check if execution should break at this node
   * Increments hit count if breakpoint is enabled
   * @param {string} nodeId - The node ID to check
   * @returns {boolean} True if should pause execution
   */
  shouldBreak(nodeId) {
    if (!this.isEnabled(nodeId)) {
      return false;
    }

    const bp = this.breakpoints.get(nodeId);
    bp.hitCount++;
    bp.lastHit = Date.now();
    this.saveToSession();

    return true;
  }

  /**
   * Get breakpoint data for a node
   * @param {string} nodeId - The node ID
   * @returns {Object|null} Breakpoint data or null
   */
  getBreakpoint(nodeId) {
    return this.breakpoints.get(nodeId) || null;
  }

  /**
   * Get all breakpoints
   * @returns {Array} Array of {nodeId, ...breakpointData}
   */
  getAllBreakpoints() {
    const result = [];
    this.breakpoints.forEach((bp, nodeId) => {
      result.push({ nodeId, ...bp });
    });
    return result;
  }

  /**
   * Clear all breakpoints
   */
  clearAll() {
    this.breakpoints.clear();
    this.saveToSession();
  }

  /**
   * Get count of enabled breakpoints
   * @returns {number} Count of enabled breakpoints
   */
  getEnabledCount() {
    let count = 0;
    this.breakpoints.forEach((bp) => {
      if (bp.enabled) count++;
    });
    return count;
  }

  /**
   * Save breakpoints to sessionStorage
   * Note: Limited to 4KB for SCORM compatibility
   */
  saveToSession() {
    try {
      const data = {};
      this.breakpoints.forEach((bp, nodeId) => {
        data[nodeId] = bp;
      });
      sessionStorage.setItem("blueprint_breakpoints", JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save breakpoints to sessionStorage:", e);
    }
  }

  /**
   * Load breakpoints from sessionStorage
   */
  loadFromSession() {
    try {
      const data = sessionStorage.getItem("blueprint_breakpoints");
      if (data) {
        const parsed = JSON.parse(data);
        Object.keys(parsed).forEach((nodeId) => {
          this.breakpoints.set(nodeId, parsed[nodeId]);
        });
      }
    } catch (e) {
      console.warn("Failed to load breakpoints from sessionStorage:", e);
    }
  }

  /**
   * Get statistics about breakpoints
   * @returns {Object} Statistics object
   */
  getStats() {
    let totalHits = 0;
    let enabledCount = 0;

    this.breakpoints.forEach((bp) => {
      totalHits += bp.hitCount;
      if (bp.enabled) enabledCount++;
    });

    return {
      total: this.breakpoints.size,
      enabled: enabledCount,
      disabled: this.breakpoints.size - enabledCount,
      totalHits: totalHits,
    };
  }
}

export { BreakpointManager };
