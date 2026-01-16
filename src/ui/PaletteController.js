/**
 * PaletteController - Manages the node palette in the right panel
 */
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { buildCategoryTree, renderCategoryTree } from "./ui-helpers.js";
import { BaseController } from "./BaseController.js";

export class PaletteController extends BaseController {
  constructor(app) {
    super(app); // Initialize BaseController for memory leak prevention
    // Right panel palette (tabbed view)
    this.container = document.getElementById("right-palette-content");
    this.filterInput = document.getElementById("right-palette-filter");

    // Set up filter input event listener using BaseController's tracked method
    if (this.filterInput) {
      this.addListener(this.filterInput, "input", () => this.populateList());
    }
  }

  populateList() {
    if (!this.container) return;

    const filter = this.filterInput ? this.filterInput.value.toLowerCase() : "";

    this._renderPalette(this.container, filter);
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
