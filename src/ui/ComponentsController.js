import { nodeRegistry } from "../registries/NodeRegistry.js";
import { ComponentSelector } from "./ComponentSelector.js";

export class ComponentsController {
  constructor(app) {
    console.log("ComponentsController initialized (v2)");
    this.app = app;
    this.selectedComponentIds = new Set(); // Changed to Set for multi-selection
    this.panel = document.getElementById("components-panel");
    this.listContainer = this.panel
      ? this.panel.querySelector(".panel-content")
      : null;
    this.addBtn = this.panel
      ? this.panel.querySelector(".btn-green-add")
      : null;

    // Initialize component selector modal
    this.componentSelector = new ComponentSelector(app);

    this.initEvents();
  }

  initEvents() {
    if (this.addBtn) {
      this.addBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showComponentSelector();
      });
    }

    // Deselect when clicking on empty space in the panel
    if (this.panel) {
      this.panel.addEventListener("click", (e) => {
        // If clicking directly on the panel or content area (not on an item)
        // More robust check: if we didn't click inside a tree-item, deselect.
        if (!e.target.closest(".tree-item")) {
          this.selectComponent(null);
        }
      });
    }
  }

  showComponentSelector() {
    // Pass the add button as the trigger element for positioning
    this.componentSelector.show((componentDef) => {
      this.addComponent(componentDef);
    }, this.addBtn);
  }

  addComponent(componentDef) {
    const id = "comp-" + Date.now();
    // Clean up type name for display
    const cleanType = componentDef.type.replace("Component", "");
    const name = `${cleanType}${this.app.components.size + 1}`;

    const newComponent = {
      id,
      name: name,
      type: componentDef.type,
      parentId: "root",
      properties: {},
    };

    this.app.components.set(id, newComponent);
    this.selectComponent(id); // Auto-select new component (clears others)
    this.updateNodeLibrary();

    // Render both the Components panel and the My Blueprint panel (since it mirrors components)
    this.render();
    if (this.app.variables) this.app.variables.renderPanel();

    this.app.persistence.autoSave();
  }

  selectComponent(id, multiSelect = false) {
    if (!id) {
      this.selectedComponentIds.clear();
    } else {
      if (multiSelect) {
        // Toggle selection
        if (this.selectedComponentIds.has(id)) {
          this.selectedComponentIds.delete(id);
        } else {
          this.selectedComponentIds.add(id);
        }
      } else {
        // Single selection
        this.selectedComponentIds.clear();
        this.selectedComponentIds.add(id);
      }
    }

    // Clear variable selection
    if (this.app.details) {
      this.app.details.currentVariable = null;
    }

    // Update selection in Components Panel (preserve focus)
    if (this.listContainer) {
      const items = this.listContainer.querySelectorAll(".tree-item");
      items.forEach((item) => {
        const itemId = item.dataset.componentId;
        if (itemId && this.selectedComponentIds.has(itemId)) {
          item.classList.add("selected");
        } else {
          item.classList.remove("selected");
        }
      });
    }

    // Update selection in My Blueprint Panel (preserve focus)
    if (this.app.variables && this.app.variables.panel) {
      const items = this.app.variables.panel.querySelectorAll(
        ".tree-item[data-component-id]"
      );
      items.forEach((item) => {
        const itemId = item.dataset.componentId;
        if (itemId && this.selectedComponentIds.has(itemId)) {
          item.classList.add("selected");
        } else {
          item.classList.remove("selected");
        }
      });
    }

    // Sync with Details Panel
    // Show details for the LAST selected item, or clear if empty
    if (this.app.details) {
      if (this.selectedComponentIds.size > 0) {
        // Get the last added ID (most recently clicked)
        const lastId = Array.from(this.selectedComponentIds).pop();
        this.app.details.showComponentDetails(this.app.components.get(lastId));
      } else {
        this.app.details.clear();
      }
    }
  }

  /**
   * Deletes all selected components
   */
  deleteSelectedComponents() {
    if (this.selectedComponentIds.size === 0) return;

    console.log(
      "[ComponentsController] Deleting selected components:",
      this.selectedComponentIds
    );

    // Use the same confirmation modal as variable deletion
    const modal = document.getElementById("confirmation-modal");
    const msg = document.getElementById("confirmation-msg");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");

    const count = this.selectedComponentIds.size;
    const messageText =
      count === 1
        ? `Delete component '${
            this.app.components.get([...this.selectedComponentIds][0]).name
          }'?`
        : `Delete ${count} components?`;

    if (!modal) {
      console.error(
        "[ComponentsController] Confirmation modal not found, using window.confirm as fallback"
      );
      if (window.confirm(messageText)) {
        this.executeDeletion();
      }
      return;
    }

    msg.textContent = messageText;
    modal.classList.remove("hidden");
    modal.classList.add("visible-flex");

    // Clone buttons to remove old listeners
    const newYes = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYes, yesBtn);
    const newNo = noBtn.cloneNode(true);
    noBtn.parentNode.replaceChild(newNo, noBtn);

    newYes.addEventListener("click", () => {
      this.executeDeletion();
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
    });

    newNo.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
    });
  }

  executeDeletion() {
    // 1. Collect all IDs to delete (selected + descendants)
    const idsToDelete = new Set(this.selectedComponentIds);

    // Iteratively find children until no more are found
    let added;
    do {
      added = false;
      for (const [id, comp] of this.app.components) {
        if (!idsToDelete.has(id) && idsToDelete.has(comp.parentId)) {
          idsToDelete.add(id);
          added = true;
        }
      }
    } while (added);

    // 2. Delete them
    idsToDelete.forEach((id) => {
      if (this.app.components.has(id)) {
        this.app.components.delete(id);
      }
    });

    // 3. Remove associated nodes from the graph
    if (this.app.graph && this.app.graph.nodes) {
      const nodesToRemove = [];
      for (const node of this.app.graph.nodes.values()) {
        if (
          node.customData &&
          node.customData.componentId &&
          idsToDelete.has(node.customData.componentId)
        ) {
          nodesToRemove.push(node.id);
        }
      }

      nodesToRemove.forEach((nodeId) => {
        this.app.graph.removeNode(nodeId);
      });
    }

    this.selectedComponentIds.clear();

    this.render();
    this.updateNodeLibrary();

    if (this.app.variables) {
      this.app.variables.renderPanel();
    }

    // Force immediate save to history and persistence
    this.app.history.saveState("component delete");
    this.app.persistence.save();

  }

  // Legacy method for backward compatibility if called directly
  deleteComponent(id) {
    this.selectComponent(id);
    this.deleteSelectedComponents();
  }

  updateNodeLibrary() {
    // First, unregister all component nodes to avoid duplicates
    const registry = nodeRegistry || this.app.nodeRegistry;
    if (!registry) {
      console.error("[ComponentsController] NodeRegistry not available");
      return;
    }
    const allKeys = Object.keys(registry.getAll());
    for (const key of allKeys) {
      if (key.startsWith("GetComponent_") || key.startsWith("SetComponent_")) {
        registry.unregister(key);
      }
    }

    // Register Get and Set nodes for all components
    if (this.app.components) {
      this.app.components.forEach((comp) => {
        // Register Get node
        const getKey = `GetComponent_${comp.id}`;
        registry.register(getKey, {
          title: `Get ${comp.name}`,
          category: "Components",
          type: "pure-node",
          pins: [{ id: "out", name: comp.name, type: comp.type, dir: "out" }],
          customData: { componentId: comp.id },
        });

        // Register Set node
        const setKey = `SetComponent_${comp.id}`;
        registry.register(setKey, {
          title: `Set ${comp.name}`,
          category: "Components",
          type: "function-node",
          variableType: "object", // Ensure correct header color (blue)
          pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "comp_in", name: comp.name, type: comp.type, dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
          ],
          customData: { componentId: comp.id },
        });
      });
    }
    this.app.palette.populateList();
  }

  getIconForType(type) {
    if (!type) return "fa-cube";
    const t = type.toLowerCase();
    if (t.includes("mesh")) return "fa-cube";
    if (t.includes("camera")) return "fa-video";
    if (t.includes("light")) return "fa-lightbulb";
    if (
      t.includes("collision") ||
      t.includes("box") ||
      t.includes("sphere") ||
      t.includes("capsule")
    )
      return "fa-vector-square";
    if (t.includes("audio") || t.includes("sound")) return "fa-volume-up";
    if (t.includes("particle")) return "fa-snowflake";
    return "fa-puzzle-piece";
  }

  render() {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";

    // Track expanded state (persist across renders)
    if (!this.expandedComponents) {
      this.expandedComponents = new Set(["root"]); // Root is expanded by default
    }

    // Render Root Component (Self) with expand/collapse
    const rootItem = this.createComponentTreeItem(
      {
        id: "root",
        name: "NewBlueprint (Self)",
        type: "Root",
        parentId: null,
      },
      0,
      true
    );
    this.listContainer.appendChild(rootItem);

    // Render component hierarchy recursively
    this.renderComponentChildren("root", 1);
  }

  renderComponentChildren(parentId, depth) {
    if (!this.app.components) return;

    // Find all children of this parent
    const children = [...this.app.components.values()].filter(
      (comp) => comp.parentId === parentId
    );

    children.forEach((comp) => {
      const item = this.createComponentTreeItem(comp, depth, false);
      this.listContainer.appendChild(item);

      // Recursively render children if expanded
      if (this.expandedComponents.has(comp.id)) {
        this.renderComponentChildren(comp.id, depth + 1);
      }
    });
  }

  createComponentTreeItem(comp, depth, isRoot) {
    const item = document.createElement("div");
    item.className = "tree-item";
    item.style.paddingLeft = `${depth * 16 + 8}px`;

    if (!isRoot && this.selectedComponentIds.has(comp.id)) {
      item.classList.add("selected");
    }

    item.setAttribute("tabindex", "0");
    item.dataset.componentId = comp.id;

    const iconClass = isRoot ? "fa-dot-circle" : this.getIconForType(comp.type);

    // Check if this component has children
    const hasChildren =
      !isRoot &&
      [...this.app.components.values()].some((c) => c.parentId === comp.id);
    const isExpanded = this.expandedComponents.has(comp.id);

    // Create expand/collapse arrow if has children
    let expandArrow = "";
    if (hasChildren) {
      const arrowIcon = isExpanded ? "fa-caret-down" : "fa-caret-right";
      expandArrow = `<i class="fas ${arrowIcon} expand-arrow" style="margin-right: 4px; cursor: pointer; width: 12px;"></i>`;
    } else if (!isRoot) {
      expandArrow = '<span style="display: inline-block; width: 16px;"></span>'; // Spacer for alignment
    }

    item.innerHTML = `
            ${expandArrow}
            <i class="fas ${iconClass}" style="margin-right: 8px; color: #ccc;"></i>
            <span>${comp.name}</span>
        `;

    // Expand/collapse functionality
    if (hasChildren) {
      const arrow = item.querySelector(".expand-arrow");
      arrow.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.expandedComponents.has(comp.id)) {
          this.expandedComponents.delete(comp.id);
        } else {
          this.expandedComponents.add(comp.id);
        }
        this.render();
      });
    }

    // Make draggable - serves both for graph (Get node) and reparenting
    if (!isRoot) {
      item.draggable = true;
      item.addEventListener("dragstart", (e) => {
        // We use COMPONENT_REPARENT as the universal type.
        // The GraphInteraction handles this by creating a Get node.
        // The ComponentsController handles this by reparenting.
        e.dataTransfer.setData("text/plain", `COMPONENT_REPARENT:${comp.id}`);
        e.dataTransfer.effectAllowed = "copyMove";
        e.stopPropagation();
      });
    }

    // Allow dropping components onto this item to reparent
    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      item.classList.add("component-item-selected");
    });

    item.addEventListener("dragleave", (e) => {
      e.stopPropagation();
      item.classList.remove("component-item-selected");
    });

    item.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      item.classList.remove("component-item-selected");

      const data = e.dataTransfer.getData("text/plain");

      // Check if this is a component being reparented
      if (data.startsWith("COMPONENT_REPARENT:")) {
        const draggedId = data.replace("COMPONENT_REPARENT:", "");
        const draggedComp = this.app.components.get(draggedId);

        if (draggedComp && draggedId !== comp.id) {
          // Prevent circular parenting
          if (!this.isDescendant(comp.id, draggedId)) {
            draggedComp.parentId = comp.id;
            this.expandedComponents.add(comp.id); // Auto-expand parent
            this.render();
            this.app.persistence.autoSave();
          }
        }
      }
    });

    // Selection functionality
    if (!isRoot) {
      item.addEventListener("click", (e) => {
        // Don't select if clicking arrow
        if (e.target.classList.contains("expand-arrow")) return;

        const isMulti = e.ctrlKey || e.shiftKey || e.metaKey;

        // If clicking an already-selected item with Ctrl, deselect it
        if (this.selectedComponentIds.has(comp.id) && isMulti) {
          this.selectedComponentIds.delete(comp.id);
          this.selectComponent(null); // Trigger UI update
          // Re-add remaining selections
          this.selectedComponentIds.forEach((id) =>
            this.selectedComponentIds.add(id)
          );
          this.selectComponent(
            Array.from(this.selectedComponentIds).pop(),
            false
          );
        } else {
          this.selectComponent(comp.id, isMulti);
        }
      });
    }

    return item;
  }

  // Helper to check if targetId is a descendant of potentialAncestorId
  isDescendant(targetId, potentialAncestorId) {
    let current = this.app.components.get(targetId);
    while (current && current.parentId) {
      if (current.parentId === potentialAncestorId) return true;
      current = this.app.components.get(current.parentId);
    }
    return false;
  }
}
