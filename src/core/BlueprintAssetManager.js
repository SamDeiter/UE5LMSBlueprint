/**
 * BlueprintAssetManager.js - Manages Blueprint assets for multi-Blueprint support
 * This module will be the foundation for the Content Browser and tab system
 */
import { generateGUID } from "../utils/guid.js";
import { interfaceRegistry } from "../interfaces/InterfaceRegistry.js";

/**
 * Naming convention for an interface implementation graph on a Blueprint.
 * One graph per implemented function, e.g. Interface_IInteractable_Interact.
 */
export function getInterfaceImplGraphName(ifaceName, funcName) {
  return `Interface_${ifaceName}_${funcName}`;
}

/**
 * Build a stub implementation graph (Entry + Result wired by Exec) for an
 * interface function. Pins on Entry/Result match the function signature so
 * the student opens the graph to a usable starting point.
 *
 * Pin id conventions match what InterfaceExecutor expects:
 *   • Entry outputs an exec pin + one data pin per input, named by input.name
 *   • Result inputs an exec pin + one data pin per output, named by output.name
 */
export function buildStubImplGraph(iface, fn) {
  const entryId = generateGUID();
  const resultId = generateGUID();
  const entryExecOutId = generateGUID();
  const resultExecInId = generateGUID();

  const entryPins = [
    {
      id: entryExecOutId,
      name: "Exec",
      type: "exec",
      dir: "out",
    },
  ];
  for (const input of fn.inputs || []) {
    entryPins.push({
      id: generateGUID(),
      name: input.name,
      type: input.type,
      dir: "out",
    });
  }

  const resultPins = [
    {
      id: resultExecInId,
      name: "Exec",
      type: "exec",
      dir: "in",
    },
  ];
  for (const output of fn.outputs || []) {
    resultPins.push({
      id: generateGUID(),
      name: output.name,
      type: output.type,
      dir: "in",
    });
  }

  const entryNode = {
    id: entryId,
    title: `${iface.name}.${fn.name}`,
    x: 200,
    y: 240,
    width: 220,
    height: 80 + (fn.inputs?.length || 0) * 24,
    type: "event-node",
    nodeKey: "InterfaceFunctionEntry",
    icon: "f",
    isCollapsed: false,
    pins: entryPins,
    customData: { interfaceName: iface.name, functionName: fn.name },
  };

  const resultNode = {
    id: resultId,
    title: "Return Node",
    x: 600,
    y: 240,
    width: 200,
    height: 80 + (fn.outputs?.length || 0) * 24,
    type: "flow-node",
    nodeKey: "InterfaceFunctionResult",
    icon: "fa-sign-out-alt",
    isCollapsed: false,
    pins: resultPins,
    customData: { interfaceName: iface.name, functionName: fn.name },
  };

  // Pre-wire the exec link so the stub graph runs end-to-end out of the box —
  // student only needs to fill in the data return value. Pin IDs get
  // namespaced as `${nodeId}-${pinId}` at Pin construction time, so link
  // endpoints must use the namespaced form to match findPinById's lookup.
  const link = {
    id: generateGUID(),
    startPinId: `${entryId}-${entryExecOutId}`,
    endPinId: `${resultId}-${resultExecInId}`,
  };

  return {
    nodes: [entryNode, resultNode],
    links: [link],
    pan: { x: 0, y: 0 },
    zoom: 1,
  };
}

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
    this.implementedInterfaces = []; // string[] of interface names
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
   * Add an interface to this Blueprint.
   * Auto-creates a stub implementation graph per function with seeded
   * InterfaceFunctionEntry + InterfaceFunctionResult nodes whose pins match
   * the interface signature. Returns the list of created graph names.
   */
  addInterface(ifaceName) {
    if (this.implementedInterfaces.includes(ifaceName)) return [];
    const iface = interfaceRegistry.get(ifaceName);
    if (!iface) return [];

    this.implementedInterfaces.push(ifaceName);
    const created = [];
    for (const fn of iface.functions) {
      const graphName = getInterfaceImplGraphName(ifaceName, fn.name);
      if (!this.graphs.has(graphName)) {
        this.addGraph(graphName, buildStubImplGraph(iface, fn));
        created.push(graphName);
      }
    }
    this.modified = new Date().toISOString();
    return created;
  }

  /**
   * Remove an interface and its implementation graphs from this Blueprint.
   * Returns the list of removed graph names.
   */
  removeInterface(ifaceName) {
    const idx = this.implementedInterfaces.indexOf(ifaceName);
    if (idx === -1) return [];
    this.implementedInterfaces.splice(idx, 1);

    const removed = [];
    const iface = interfaceRegistry.get(ifaceName);
    const funcNames = iface
      ? iface.functions.map((f) => f.name)
      : // Fallback: nuke any graph keyed under this interface name even if the
        // interface definition is no longer registered.
        [...this.graphs.keys()]
          .filter((g) => g.startsWith(`Interface_${ifaceName}_`))
          .map((g) => g.substring(`Interface_${ifaceName}_`.length));

    for (const fnName of funcNames) {
      const graphName = getInterfaceImplGraphName(ifaceName, fnName);
      if (this.graphs.delete(graphName)) {
        removed.push(graphName);
      }
    }
    this.modified = new Date().toISOString();
    return removed;
  }

  /**
   * @returns {boolean} true if this Blueprint declares it implements ifaceName.
   */
  implementsInterface(ifaceName) {
    return this.implementedInterfaces.includes(ifaceName);
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
      implementedInterfaces: [...this.implementedInterfaces],
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
    asset.implementedInterfaces = data.implementedInterfaces || [];
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
