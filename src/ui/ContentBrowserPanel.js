/**
 * ContentBrowserPanel.js - UI panel for browsing Blueprint assets
 * Provides UE5-style content browser with folder tree and asset grid
 */
import { BaseController } from "./BaseController.js";
import { el, icon } from "../utils/DOMHelper.js";

export class ContentBrowserPanel extends BaseController {
  constructor(app) {
    super(app);
    this.isOpen = false;
    this.panel = null;
  }

  /**
   * Toggle the Content Browser panel visibility
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open the Content Browser panel
   */
  open() {
    if (this.panel) {
      this.panel.classList.add("open");
      this.isOpen = true;
      this.render();
      return;
    }

    this.createPanel();
    this.isOpen = true;
  }

  /**
   * Close the Content Browser panel
   */
  close() {
    if (this.panel) {
      this.panel.classList.remove("open");
      this.isOpen = false;
    }
  }

  /**
   * Create the panel DOM structure
   */
  createPanel() {
    this.panel = el("div", { class: "content-browser-panel open" }, [
      // Header
      el("div", { class: "cb-header" }, [
        icon("fa-folder-open"),
        el("span", { class: "cb-title" }, "Content Browser"),
        el("button", { class: "cb-close-btn", onclick: () => this.close() }, [
          icon("fa-times"),
        ]),
      ]),

      // Toolbar
      el("div", { class: "cb-toolbar" }, [
        el("button", { class: "cb-btn", onclick: () => this.createAsset() }, [
          icon("fa-plus"),
          el("span", {}, "Add"),
        ]),
        el("input", {
          type: "text",
          class: "cb-search",
          placeholder: "Search...",
          oninput: (e) => this.onSearch(e.target.value),
        }),
      ]),

      // Main content area
      el("div", { class: "cb-content" }, [
        // Folder tree
        el("div", { class: "cb-tree", id: "cb-folder-tree" }),
        // Asset grid
        el("div", { class: "cb-assets", id: "cb-asset-grid" }),
      ]),

      // Status bar
      el("div", { class: "cb-status" }, [
        el("span", { id: "cb-status-text" }, "Ready"),
      ]),
    ]);

    document.body.appendChild(this.panel);
    this.render();
  }

  /**
   * Render the folder tree and asset grid
   */
  render() {
    if (!this.panel) return;

    this.renderFolderTree();
    this.renderAssetGrid();
    this.updateStatus();
  }

  /**
   * Render the folder tree navigation
   */
  renderFolderTree() {
    const treeContainer = this.panel.querySelector("#cb-folder-tree");
    if (!treeContainer) return;

    const cb = this.app.contentBrowser;
    if (!cb) return;

    treeContainer.innerHTML = "";
    treeContainer.appendChild(this.createFolderNode(cb.rootFolder, 0));
  }

  /**
   * Create a folder node element
   */
  createFolderNode(folder, depth) {
    const cb = this.app.contentBrowser;
    const isSelected = cb.currentPath === folder.path;

    const folderEl = el(
      "div",
      {
        class: `cb-folder ${isSelected ? "selected" : ""}`,
        style: `padding-left: ${depth * 16 + 8}px`,
        onclick: () => {
          cb.navigateTo(folder.path);
          this.render();
        },
      },
      [
        icon(folder.children.size > 0 ? "fa-folder-open" : "fa-folder"),
        el("span", { class: "cb-folder-name" }, folder.name),
        el("span", { class: "cb-folder-count" }, `(${folder.assets.size})`),
      ]
    );

    const container = el("div", { class: "cb-folder-container" }, [folderEl]);

    // Add children
    folder.children.forEach((child) => {
      container.appendChild(this.createFolderNode(child, depth + 1));
    });

    return container;
  }

  /**
   * Render the asset grid
   */
  renderAssetGrid() {
    const gridContainer = this.panel.querySelector("#cb-asset-grid");
    if (!gridContainer) return;

    const cb = this.app.contentBrowser;
    if (!cb) return;

    const assets = cb.getVisibleAssets();
    gridContainer.innerHTML = "";

    if (assets.length === 0) {
      gridContainer.appendChild(
        el("div", { class: "cb-empty" }, [
          icon("fa-inbox"),
          el("span", {}, "No assets in this folder"),
        ])
      );
      return;
    }

    assets.forEach((asset) => {
      const assetEl = el(
        "div",
        {
          class: `cb-asset ${
            cb.selectedAssets.has(asset.id) ? "selected" : ""
          }`,
          onclick: (e) => {
            if (e.ctrlKey) {
              if (cb.selectedAssets.has(asset.id)) {
                cb.selectedAssets.delete(asset.id);
              } else {
                cb.selectedAssets.add(asset.id);
              }
            } else {
              cb.selectedAssets.clear();
              cb.selectedAssets.add(asset.id);
            }
            this.render();
          },
          ondblclick: () => this.openAsset(asset),
        },
        [
          el("div", { class: "cb-asset-icon" }, [
            icon(cb.getAssetIcon(asset.type)),
          ]),
          el("div", { class: "cb-asset-name" }, asset.name),
          el("div", { class: "cb-asset-type" }, asset.type),
        ]
      );
      gridContainer.appendChild(assetEl);
    });
  }

  /**
   * Update status bar
   */
  updateStatus() {
    const statusEl = this.panel.querySelector("#cb-status-text");
    if (!statusEl) return;

    const cb = this.app.contentBrowser;
    if (!cb) return;

    const assets = cb.getVisibleAssets();
    const selected = cb.selectedAssets.size;

    if (selected > 0) {
      statusEl.textContent = `${selected} selected of ${assets.length} assets`;
    } else {
      statusEl.textContent = `${assets.length} assets in ${cb.currentPath}`;
    }
  }

  /**
   * Handle search input
   */
  onSearch(query) {
    const cb = this.app.contentBrowser;
    if (cb) {
      cb.filterText = query;
      this.renderAssetGrid();
      this.updateStatus();
    }
  }

  /**
   * Create a new asset
   */
  createAsset() {
    const name = window.prompt("Enter asset name:", "NewBlueprint");
    if (!name) return;

    const cb = this.app.contentBrowser;
    if (cb) {
      cb.createAsset(name);
      this.render();
    }
  }

  /**
   * Open an asset
   */
  openAsset(asset) {
    console.log("Opening asset:", asset.name);
    // TODO: Implement asset opening logic
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }
    this.panel = null;
    this.isOpen = false;
    super.cleanup();
  }
}
