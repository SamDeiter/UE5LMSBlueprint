/**
 * PaletteController - Manages the node palette
 */
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { buildCategoryTree, renderCategoryTree } from "./ui-helpers.js";

export class PaletteController {
  constructor(app) {
    this.app = app;
    // Left sidebar palette (existing)
    this.container = document.getElementById("palette-content");
    this.filterInput = document.getElementById("palette-filter");

    // Right panel palette (new - for tabbed view)
    this.rightContainer = document.getElementById("right-palette-content");
    this.rightFilterInput = document.getElementById("right-palette-filter");

    // Set up event listeners for both filter inputs
    if (this.filterInput) {
      this.filterInput.addEventListener("input", () => this.populateList());
    }
    if (this.rightFilterInput) {
      this.rightFilterInput.addEventListener("input", () =>
        this.populateList()
      );
    }
  }

  populateList() {
    // Get filter value from whichever input has focus, or use the active one
    const leftFilter = this.filterInput
      ? this.filterInput.value.toLowerCase()
      : "";
    const rightFilter = this.rightFilterInput
      ? this.rightFilterInput.value.toLowerCase()
      : "";

    // Populate left palette if it exists
    if (this.container) {
      this._renderPalette(this.container, leftFilter);
    }

    // Populate right palette if it exists
    if (this.rightContainer) {
      this._renderPalette(this.rightContainer, rightFilter);
    }
  }

  _renderPalette(container, filter) {
    container.innerHTML = "";
    const nodeNames = Object.keys(nodeRegistry.getAll());

    // 1. Filter Nodes
    const filtered = nodeNames.filter((name) => {
      const def = nodeRegistry.get(name);
      if (def.hidden) return false;

      return (
        name.toLowerCase().includes(filter) ||
        (def.title && def.title.toLowerCase().includes(filter))
      );
    });

    // 2. Build Tree using shared helper
    const root = buildCategoryTree(
      filtered,
      (name) => nodeRegistry.get(name).category || ""
    );

    // 3. Helper to create draggable items (Palette-specific)
    const createItem = (name) => {
      const nodeData = nodeRegistry.get(name);
      const el = document.createElement("div");
      el.className = "tree-item";
      el.textContent = nodeData.title || name;
      el.dataset.nodeType = name;
      if (nodeData.icon) {
        const icon = document.createElement("span");
        if (nodeData.icon.startsWith("fa-")) {
          const iconEl = document.createElement("i");
          iconEl.className = `fas ${nodeData.icon}`;
          icon.appendChild(iconEl);
        } else {
          icon.textContent = nodeData.icon;
        }
        el.prepend(icon);
      }
      el.draggable = true;
      el.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", `PALETTE_NODE:${name}`);
        e.dataTransfer.effectAllowed = "copy";
      });
      return el;
    };

    // 4. Render tree using shared helper
    renderCategoryTree(root, container, createItem, {
      sectionClass: "sidebar-section",
      headerClass: "sidebar-section-header",
      itemIndent: 20,
      sortCategories: true,
    });
  }
}
