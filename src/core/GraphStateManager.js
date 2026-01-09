/**
 * GraphStateManager.js - Manages graph state switching and caching
 * Essential for multi-Blueprint support with tabs
 */

/**
 * Represents a cached graph state
 */
class CachedGraphState {
  constructor(graphName) {
    this.graphName = graphName;
    this.nodes = [];
    this.links = [];
    this.pan = { x: 0, y: 0 };
    this.zoom = 1;
    this.lastModified = Date.now();
  }
}

/**
 * GraphStateManager - Handles switching between graphs with state preservation
 */
export class GraphStateManager {
  constructor() {
    this.cache = new Map(); // graphName -> CachedGraphState
    this.currentGraph = null;
  }

  /**
   * Cache the current graph state
   * @param {string} graphName - Name of the graph
   * @param {Object} state - Graph state object
   */
  cacheState(graphName, state) {
    const cached = new CachedGraphState(graphName);
    cached.nodes = state.nodes || [];
    cached.links = state.links || [];
    cached.pan = state.pan || { x: 0, y: 0 };
    cached.zoom = state.zoom || 1;
    cached.lastModified = Date.now();
    this.cache.set(graphName, cached);
  }

  /**
   * Get cached state for a graph
   * @param {string} graphName - Name of the graph
   * @returns {CachedGraphState|null}
   */
  getCachedState(graphName) {
    return this.cache.get(graphName) || null;
  }

  /**
   * Check if a graph has cached state
   * @param {string} graphName - Name of the graph
   * @returns {boolean}
   */
  hasCachedState(graphName) {
    return this.cache.has(graphName);
  }

  /**
   * Clear cached state for a graph
   * @param {string} graphName - Name of the graph
   */
  clearCache(graphName) {
    this.cache.delete(graphName);
  }

  /**
   * Clear all cached states
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Switch to a different graph
   * @param {string} fromGraph - Current graph name
   * @param {string} toGraph - Target graph name
   * @param {Object} currentState - Current graph state to cache
   * @returns {Object|null} Cached state for toGraph or null if not cached
   */
  switchGraph(fromGraph, toGraph, currentState) {
    // Cache current state
    if (fromGraph && currentState) {
      this.cacheState(fromGraph, currentState);
    }

    this.currentGraph = toGraph;
    return this.getCachedState(toGraph);
  }

  /**
   * Get all cached graph names
   * @returns {string[]}
   */
  getCachedGraphNames() {
    return [...this.cache.keys()];
  }

  /**
   * Get memory usage estimate (for debugging)
   * @returns {Object}
   */
  getMemoryStats() {
    let totalNodes = 0;
    let totalLinks = 0;

    this.cache.forEach((state) => {
      totalNodes += state.nodes.length;
      totalLinks += state.links.length;
    });

    return {
      cachedGraphs: this.cache.size,
      totalNodes,
      totalLinks,
    };
  }

  /**
   * Serialize all cached states
   * @returns {Object}
   */
  toJSON() {
    const result = {};
    this.cache.forEach((state, name) => {
      result[name] = {
        nodes: state.nodes,
        links: state.links,
        pan: state.pan,
        zoom: state.zoom,
      };
    });
    return result;
  }

  /**
   * Restore from serialized data
   * @param {Object} data - Serialized cache data
   */
  fromJSON(data) {
    this.cache.clear();
    if (data) {
      Object.entries(data).forEach(([name, state]) => {
        this.cacheState(name, state);
      });
    }
  }
}

// Singleton instance for app-wide use
export const graphStateManager = new GraphStateManager();
