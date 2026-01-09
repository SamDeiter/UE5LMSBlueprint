/**
 * BlueprintAssetManager.js - Manages Blueprint assets for multi-Blueprint support
 * This module will be the foundation for the Content Browser and tab system
 */
import { generateGUID } from "../utils/guid.js";

/**
 * Blueprint asset types
 */
export const BLUEPRINT_TYPES = {
  CLASS: "BlueprintClass",
  FUNCTION_LIBRARY: "BlueprintFunctionLibrary",
  INTERFACE: "BlueprintInterface",
  MACRO_LIBRARY: "BlueprintMacroLibrary",
  ENUMERATION: "Enumeration",
  STRUCTURE: "Structure",
};

/**
 * Blueprint asset definition
 */
export class BlueprintAsset {
  constructor(name, type = BLUEPRINT_TYPES.CLASS) {
    this.id = generateGUID();
    this.name = name;
    this.type = type;
    this.created = new Date().toISOString();
    this.modified = this.created;
    this.parentClass = "Actor";
    this.graphs = new Map(); // graphName -> graphData
    this.variables = new Map();
    this.functions = [];
    this.macros = [];
    this.components = new Map();
  }

  /**
   * Add a graph to this Blueprint
   * @param {string} name - Graph name
   * @param {Object} data - Graph data
   */
  addGraph(
    name,
    data = { nodes: [], links: [], pan: { x: 0, y: 0 }, zoom: 1 }
  ) {
    this.graphs.set(name, data);
    this.modified = new Date().toISOString();
  }

  /**
   * Get serializable representation
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      created: this.created,
      modified: this.modified,
      parentClass: this.parentClass,
      graphs: Object.fromEntries(this.graphs),
      variables: Object.fromEntries(this.variables),
      functions: this.functions,
      macros: this.macros,
      components: Object.fromEntries(this.components),
    };
  }

  /**
   * Create from serialized data
   */
  static fromJSON(data) {
    const asset = new BlueprintAsset(data.name, data.type);
    asset.id = data.id;
    asset.created = data.created;
    asset.modified = data.modified;
    asset.parentClass = data.parentClass;
    asset.graphs = new Map(Object.entries(data.graphs || {}));
    asset.variables = new Map(Object.entries(data.variables || {}));
    asset.functions = data.functions || [];
    asset.macros = data.macros || [];
    asset.components = new Map(Object.entries(data.components || {}));
    return asset;
  }
}

/**
 * Blueprint Asset Manager - Central registry for all Blueprints
 */
export class BlueprintAssetManager {
  constructor() {
    this.assets = new Map(); // id -> BlueprintAsset
    this.activeAssetId = null;
  }

  /**
   * Create a new Blueprint asset
   * @param {string} name - Asset name
   * @param {string} type - Asset type from BLUEPRINT_TYPES
   * @returns {BlueprintAsset}
   */
  createAsset(name, type = BLUEPRINT_TYPES.CLASS) {
    const asset = new BlueprintAsset(name, type);

    // Initialize default graphs based on type
    if (type === BLUEPRINT_TYPES.CLASS) {
      asset.addGraph("EventGraph");
      asset.addGraph("ConstructionScript");
    } else if (type === BLUEPRINT_TYPES.INTERFACE) {
      asset.addGraph("Interface");
    }

    this.assets.set(asset.id, asset);
    return asset;
  }

  /**
   * Get an asset by ID
   * @param {string} id - Asset ID
   * @returns {BlueprintAsset|undefined}
   */
  getAsset(id) {
    return this.assets.get(id);
  }

  /**
   * Get all assets of a specific type
   * @param {string} type - Asset type
   * @returns {BlueprintAsset[]}
   */
  getAssetsByType(type) {
    return [...this.assets.values()].filter((a) => a.type === type);
  }

  /**
   * Delete an asset
   * @param {string} id - Asset ID
   */
  deleteAsset(id) {
    this.assets.delete(id);
    if (this.activeAssetId === id) {
      this.activeAssetId = null;
    }
  }

  /**
   * Set the active asset
   * @param {string} id - Asset ID
   */
  setActiveAsset(id) {
    if (this.assets.has(id)) {
      this.activeAssetId = id;
    }
  }

  /**
   * Get all assets as array
   * @returns {BlueprintAsset[]}
   */
  getAllAssets() {
    return [...this.assets.values()];
  }

  /**
   * Serialize all assets
   */
  toJSON() {
    return {
      assets: [...this.assets.values()].map((a) => a.toJSON()),
      activeAssetId: this.activeAssetId,
    };
  }

  /**
   * Load from serialized data
   */
  fromJSON(data) {
    this.assets.clear();
    (data.assets || []).forEach((assetData) => {
      const asset = BlueprintAsset.fromJSON(assetData);
      this.assets.set(asset.id, asset);
    });
    this.activeAssetId = data.activeAssetId;
  }
}
