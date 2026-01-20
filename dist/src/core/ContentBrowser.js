/**
 * ContentBrowser.js - Content Browser controller for Blueprint asset management
 * Provides UE5-style asset browsing and management
 */
import { el, icon } from "../utils/DOMHelper.js";
import { EventBus, AppEvents } from "./EventBus.js";
import { BLUEPRINT_TYPES } from "./BlueprintAssetManager.js";

/**
 * Asset folder structure
 */
export class AssetFolder {
  constructor(name, parentPath = "") {
    this.name = name;
    this.path = parentPath ? `${parentPath}/${name}` : name;
    this.children = new Map(); // name -> AssetFolder
    this.assets = new Set(); // asset IDs
  }

  addSubfolder(name) {
    if (!this.children.has(name)) {
      this.children.set(name, new AssetFolder(name, this.path));
    }
    return this.children.get(name);
  }

  addAsset(assetId) {
    this.assets.add(assetId);
  }

  removeAsset(assetId) {
    this.assets.delete(assetId);
  }
}

/**
 * ContentBrowser - UE5-style asset browser
 */
export class ContentBrowser {
  constructor(assetManager) {
    this.assetManager = assetManager;
    this.rootFolder = new AssetFolder("Content");
    this.currentPath = "Content";
    this.selectedAssets = new Set();
    this.viewMode = "tiles"; // 'tiles' or 'list'
    this.filterText = "";
    this.typeFilter = null;
  }

  /**
   * Initialize with default folder structure
   */
  initialize() {
    // Create default UE5-style folders
    this.rootFolder.addSubfolder("Blueprints");
    this.rootFolder.addSubfolder("Functions");
    this.rootFolder.addSubfolder("Macros");
    this.rootFolder.addSubfolder("Interfaces");
    this.rootFolder.addSubfolder("Enumerations");
    this.rootFolder.addSubfolder("Structures");
  }

  /**
   * Navigate to a folder path
   * @param {string} path - Folder path (e.g., 'Content/Blueprints')
   */
  navigateTo(path) {
    this.currentPath = path;
    this.selectedAssets.clear();
    EventBus.emit("contentbrowser:navigated", { path });
  }

  /**
   * Get current folder
   * @returns {AssetFolder|null}
   */
  getCurrentFolder() {
    return this.getFolderByPath(this.currentPath);
  }

  /**
   * Get folder by path
   * @param {string} path - Folder path
   * @returns {AssetFolder|null}
   */
  getFolderByPath(path) {
    if (path === "Content" || path === "") return this.rootFolder;

    const parts = path.split("/").filter((p) => p && p !== "Content");
    let folder = this.rootFolder;

    for (const part of parts) {
      folder = folder.children.get(part);
      if (!folder) return null;
    }

    return folder;
  }

  /**
   * Create new Blueprint asset
   * @param {string} name - Asset name
   * @param {string} type - Asset type from BLUEPRINT_TYPES
   * @returns {Object} Created asset
   */
  createAsset(name, type = BLUEPRINT_TYPES.CLASS) {
    const asset = this.assetManager.createAsset(name, type);

    // Add to appropriate folder
    const folder = this.getDefaultFolderForType(type);
    folder.addAsset(asset.id);

    EventBus.emit(AppEvents.BLUEPRINT_CREATED, { asset });
    return asset;
  }

  /**
   * Get default folder for asset type
   * @param {string} type - Asset type
   * @returns {AssetFolder}
   */
  getDefaultFolderForType(type) {
    const folderMap = {
      [BLUEPRINT_TYPES.CLASS]: "Blueprints",
      [BLUEPRINT_TYPES.FUNCTION_LIBRARY]: "Functions",
      [BLUEPRINT_TYPES.MACRO_LIBRARY]: "Macros",
      [BLUEPRINT_TYPES.INTERFACE]: "Interfaces",
      [BLUEPRINT_TYPES.ENUMERATION]: "Enumerations",
      [BLUEPRINT_TYPES.STRUCTURE]: "Structures",
    };

    const folderName = folderMap[type] || "Blueprints";
    return this.rootFolder.children.get(folderName) || this.rootFolder;
  }

  /**
   * Delete selected assets
   */
  deleteSelectedAssets() {
    this.selectedAssets.forEach((assetId) => {
      this.assetManager.deleteAsset(assetId);
      // Remove from all folders
      this.removeAssetFromFolders(this.rootFolder, assetId);
    });
    this.selectedAssets.clear();
  }

  /**
   * Remove asset from folders recursively
   */
  removeAssetFromFolders(folder, assetId) {
    folder.assets.delete(assetId);
    folder.children.forEach((child) => {
      this.removeAssetFromFolders(child, assetId);
    });
  }

  /**
   * Get assets in current folder (filtered)
   * @returns {Array}
   */
  getVisibleAssets() {
    const folder = this.getCurrentFolder();
    if (!folder) return [];

    let assets = [...folder.assets]
      .map((id) => this.assetManager.getAsset(id))
      .filter(Boolean);

    // Apply text filter
    if (this.filterText) {
      const filter = this.filterText.toLowerCase();
      assets = assets.filter((a) => a.name.toLowerCase().includes(filter));
    }

    // Apply type filter
    if (this.typeFilter) {
      assets = assets.filter((a) => a.type === this.typeFilter);
    }

    return assets;
  }

  /**
   * Get icon for asset type
   * @param {string} type - Asset type
   * @returns {string} Icon class
   */
  getAssetIcon(type) {
    const icons = {
      [BLUEPRINT_TYPES.CLASS]: "fa-project-diagram",
      [BLUEPRINT_TYPES.FUNCTION_LIBRARY]: "fa-code",
      [BLUEPRINT_TYPES.MACRO_LIBRARY]: "fa-layer-group",
      [BLUEPRINT_TYPES.INTERFACE]: "fa-plug",
      [BLUEPRINT_TYPES.ENUMERATION]: "fa-list-ol",
      [BLUEPRINT_TYPES.STRUCTURE]: "fa-cubes",
    };
    return icons[type] || "fa-file";
  }

  /**
   * Serialize state
   */
  toJSON() {
    const serializeFolder = (folder) => ({
      name: folder.name,
      path: folder.path,
      assets: [...folder.assets],
      children: [...folder.children.entries()].map(([name, child]) =>
        serializeFolder(child)
      ),
    });

    return {
      folders: serializeFolder(this.rootFolder),
      currentPath: this.currentPath,
    };
  }
}
