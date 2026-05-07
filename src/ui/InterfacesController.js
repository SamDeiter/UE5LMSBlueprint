/**
 * InterfacesController - Sidebar list + management for custom Blueprint Interfaces.
 *
 * Built-in interfaces (IInteractable, IDamageable, ISaveable, IPoolable,
 * IAnimNotify, IGameplayTagAsset) are NOT shown here — they're added to
 * Blueprints via the Class Settings panel. This sidebar is for the student to
 * AUTHOR new interfaces (define name + function signatures), which is the
 * higher-order test of understanding.
 *
 * On signature change, Message_/Event_ node defs are re-registered so the
 * action menu always shows the correct shape.
 */

import { InterfaceDefinition } from "../interfaces/InterfaceDefinition.js";
import { interfaceRegistry } from "../interfaces/InterfaceRegistry.js";
import {
  registerNodesForInterface,
  unregisterNodesForInterface,
} from "../data/nodes/InterfaceNodes.js";
import { nodeRegistry } from "../registries/NodeRegistry.js";
import { createCollapsibleHeader } from "./ui-helpers.js";

const STANDARD_INTERFACE_NAMES = new Set([
  "IInteractable",
  "IDamageable",
  "ISaveable",
  "IPoolable",
  "IAnimNotify",
  "IGameplayTagAsset",
]);

export class InterfacesController {
  constructor(app) {
    this.app = app;
    this.listContainer = document.getElementById("interfaces-list");
    this.selectedId = null;
    this.render();
  }

  /**
   * Custom interfaces only — built-ins are managed elsewhere and shouldn't be
   * editable from this panel.
   */
  _customInterfaces() {
    return interfaceRegistry
      .getAll()
      .filter((i) => !STANDARD_INTERFACE_NAMES.has(i.name));
  }

  /**
   * Pick a name that doesn't collide with anything already registered.
   * Naming convention is to prefix with "I", which UE5 students learn early.
   */
  _uniqueName(base = "INewInterface") {
    let name = base;
    let counter = 2;
    while (interfaceRegistry.has(name)) {
      name = `${base}${counter++}`;
    }
    return name;
  }

  addNewInterface() {
    const iface = new InterfaceDefinition(this._uniqueName());
    // Seed with one default function so the student has a tangible thing to
    // edit — staring at an empty interface is confusing.
    iface.addFunction(
      "DoSomething",
      "",
      [],
      [{ name: "Success", type: "bool" }]
    );

    interfaceRegistry.register(iface);
    registerNodesForInterface(nodeRegistry, iface);

    this.render();
    this.select(iface.id);
    if (this.app.persistence) this.app.persistence.autoSave();
  }

  /**
   * Delete a custom interface. Unregisters from both the interface registry
   * and the node registry (so Message_/Event_ nodes vanish from menus).
   * Does NOT prune existing Message/Event node instances from saved graphs;
   * those will warn at load time and become inert, which is acceptable for
   * a teaching tool. (Real UE5 surfaces a "compile error" in the same case.)
   */
  deleteInterface(iface) {
    if (
      typeof window !== "undefined" &&
      window.confirm &&
      !window.confirm(
        `Delete interface '${iface.name}'?\n` +
          `Any Blueprint that implements it will lose its implementation graphs the next time the interface is removed from Class Settings.`
      )
    ) {
      return;
    }

    unregisterNodesForInterface(nodeRegistry, iface);
    interfaceRegistry.unregister(iface.name);

    if (this.selectedId === iface.id) this.selectedId = null;
    this.render();
    if (this.app.persistence) this.app.persistence.autoSave();
  }

  /**
   * Re-register all Message_/Event_ node defs for an interface — call after
   * any signature edit (rename, add/remove function, change inputs/outputs).
   * Cheap: just rewrites a handful of registry entries.
   */
  refreshInterfaceNodes(iface) {
    unregisterNodesForInterface(nodeRegistry, iface);
    registerNodesForInterface(nodeRegistry, iface);
  }

  /**
   * Rename an interface. Because nodeKey embeds the interface name, the
   * Message_/Event_ keys change — re-register under the new name and unregister
   * the old keys. Existing node instances in graphs will be dangling, which
   * is the same compromise UE5 makes (you generally don't rename interfaces
   * in production once they have callers).
   */
  renameInterface(iface, newName) {
    if (!newName || newName === iface.name) return false;
    if (interfaceRegistry.has(newName)) {
      // Don't silently overwrite an existing interface.
      return false;
    }
    unregisterNodesForInterface(nodeRegistry, iface);
    interfaceRegistry.unregister(iface.name);

    iface.name = newName;
    interfaceRegistry.register(iface);
    registerNodesForInterface(nodeRegistry, iface);
    return true;
  }

  select(id) {
    this.selectedId = id;
    const items = this.listContainer.querySelectorAll(".tree-item");
    items.forEach((el) => el.classList.remove("selected"));
    if (id) {
      const sel = this.listContainer.querySelector(
        `[data-interface-id="${id}"]`
      );
      if (sel) sel.classList.add("selected");

      const iface = interfaceRegistry
        .getAll()
        .find((i) => i.id === id);
      if (iface && this.app.detailsController?.showInterfaceDetails) {
        this.app.detailsController.showInterfaceDetails(iface);
      }
    }
  }

  render() {
    if (!this.listContainer) return;

    this.listContainer.innerHTML = "";

    const section = document.createElement("div");
    section.className = "sidebar-section";

    const content = document.createElement("div");
    content.classList.remove("hidden");

    createCollapsibleHeader(section, "Interfaces", content, {
      onAdd: () => this.addNewInterface(),
      isExpanded: true,
      iconClass: "fas fa-caret-down",
    });

    const interfaces = this._customInterfaces();

    if (interfaces.length === 0) {
      const empty = document.createElement("div");
      empty.style.cssText = "color: #666; padding: 4px 12px; font-size: 11px;";
      empty.textContent = "No custom interfaces. Click + to create one.";
      content.appendChild(empty);
    }

    interfaces.forEach((iface) => {
      const item = document.createElement("div");
      item.className = "tree-item";
      item.dataset.interfaceId = iface.id;
      if (this.selectedId === iface.id) item.classList.add("selected");

      const icon = document.createElement("i");
      icon.className = "fas fa-puzzle-piece function-icon mr-1";
      icon.style.color = "#9b59b6";

      const label = document.createElement("span");
      label.className = "tree-item-label";
      label.textContent = iface.name;

      item.appendChild(icon);
      item.appendChild(label);

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.select(iface.id);
      });

      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (this.app.contextMenu) {
          this.app.contextMenu.show(e.clientX, e.clientY, [
            { label: "Edit", callback: () => this.select(iface.id) },
            { label: "---", callback: () => {} },
            { label: "Delete", callback: () => this.deleteInterface(iface) },
          ]);
        }
      });

      content.appendChild(item);
    });

    section.appendChild(content);
    this.listContainer.appendChild(section);
  }
}
