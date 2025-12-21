/**
 * EventDispatcherController - Manages Event Dispatchers in the My Blueprint panel
 * Phase 5: Panel Implementation (UE5 Parity)
 */
import { _Utils } from "../utils.js";
import { generateGUID } from "../utils/guid.js";
import { createCollapsibleHeader } from "./ui-helpers.js";

export class EventDispatcherController {
  constructor(app) {
    this.app = app;
    this.listContainer = document.getElementById("event-dispatchers-list");
    this.dispatchers = new Map(); // id -> dispatcher object
    this.renamingId = null;
  }

  /**
   * Create dispatcher object structure
   */
  createDispatcher(id, name) {
    return {
      id,
      name,
      description: "",
      parameters: [], // Array of { name, type }
      // Replication settings
      replicates: "NotReplicated",
      reliable: false,
    };
  }

  /**
   * Generate unique dispatcher name
   */
  generateUniqueName(baseName = "NewEventDispatcher") {
    let index = 0;
    let name = baseName;
    while (this.isNameTaken(name)) {
      name = `${baseName}_${index}`;
      index++;
    }
    return name;
  }

  isNameTaken(name, currentId = null) {
    for (const dispatcher of this.dispatchers.values()) {
      if (dispatcher.name === name && dispatcher.id !== currentId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add a new event dispatcher
   */
  addDispatcher() {
    const name = this.generateUniqueName();
    const id = generateGUID();
    const dispatcher = this.createDispatcher(id, name);

    this.dispatchers.set(id, dispatcher);
    this.renamingId = id; // Start in rename mode

    this.renderPanel();
    this.app.persistence.autoSave();
  }

  /**
   * Delete an event dispatcher
   */
  deleteDispatcher(id) {
    const dispatcher = this.dispatchers.get(id);
    if (!dispatcher) return;

    const modal = document.getElementById("confirmation-modal");
    const msg = document.getElementById("confirmation-msg");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");

    if (!modal) return;

    msg.textContent = `Delete event dispatcher '${dispatcher.name}'?`;
    modal.classList.remove("hidden");
    modal.classList.add("visible-flex");

    const newYes = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYes, yesBtn);
    const newNo = noBtn.cloneNode(true);
    noBtn.parentNode.replaceChild(newNo, noBtn);

    newYes.addEventListener("click", () => {
      this.dispatchers.delete(id);
      this.renderPanel();
      this.app.persistence.autoSave();
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
    });

    newNo.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
    });
  }

  /**
   * Finish renaming a dispatcher
   */
  finishRenaming(dispatcher, newName) {
    this.renamingId = null;
    if (
      newName &&
      newName !== dispatcher.name &&
      !this.isNameTaken(newName, dispatcher.id)
    ) {
      dispatcher.name = newName;
      this.app.persistence.autoSave();
    }
    this.renderPanel();
  }

  /**
   * Render the Event Dispatchers panel section
   */
  renderPanel() {
    if (!this.listContainer) return;
    this.listContainer.innerHTML = "";

    // Create collapsible section
    const section = document.createElement("div");
    section.className = "sidebar-section";

    const content = document.createElement("div");
    content.id = "section-event-dispatchers";

    createCollapsibleHeader(section, "Event Dispatchers", content, {
      onAdd: () => this.addDispatcher(),
      isExpanded: true,
      iconClass: "fas fa-caret-down",
    });

    section.appendChild(content);
    this.listContainer.appendChild(section);

    // Render each dispatcher
    for (const dispatcher of this.dispatchers.values()) {
      const el = document.createElement("div");
      el.className = "ue5-variable-item";
      el.dataset.dispatcherId = dispatcher.id;
      el.setAttribute("tabindex", "0");

      // Rename mode
      if (this.renamingId === dispatcher.id) {
        const input = document.createElement("input");
        input.type = "text";
        input.value = dispatcher.name;
        input.className = "ue5-variable-rename-input";

        const commit = () =>
          this.finishRenaming(dispatcher, input.value.trim());
        input.addEventListener("blur", commit);
        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            input.blur();
          }
        });

        el.appendChild(input);
        requestAnimationFrame(() => {
          input.focus();
          input.select();
        });
      } else {
        // Normal display mode
        const nameSpan = document.createElement("span");
        nameSpan.className = "ue5-variable-name-text";
        nameSpan.textContent = dispatcher.name;

        // Double click to rename
        nameSpan.addEventListener("dblclick", (e) => {
          e.stopPropagation();
          this.renamingId = dispatcher.id;
          this.renderPanel();
        });

        el.appendChild(nameSpan);
      }

      // Right side: dispatcher icon
      const rightGroup = document.createElement("div");
      rightGroup.className = "ue5-variable-type-group";

      // Dispatcher icon (red for events)
      const iconSpan = document.createElement("span");
      iconSpan.className =
        "ue5-variable-type-icon d-flex align-center justify-center";
      iconSpan.innerHTML = `<i class="fas fa-bolt text-xs text-exec"></i>`;

      const typeLabel = document.createElement("span");
      typeLabel.className = "ue5-variable-type-name";
      typeLabel.textContent = "Dispatcher";
      typeLabel.classList.add("text-exec");

      rightGroup.appendChild(iconSpan);
      rightGroup.appendChild(typeLabel);
      el.appendChild(rightGroup);

      // Context menu
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.showContextMenu(e, dispatcher);
      });

      // Click to show details
      el.addEventListener("click", () => {
        this.showDispatcherDetails(dispatcher);
      });

      content.appendChild(el);
    }

    // Placeholder if empty
    if (this.dispatchers.size === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder-text placeholder-italic";
      placeholder.textContent = "No event dispatchers";
      content.appendChild(placeholder);
    }
  }

  /**
   * Show dispatcher details in Details panel
   */
  showDispatcherDetails(dispatcher) {
    if (!this.app.details) return;

    const panel = this.app.details.panel;
    if (!panel) return;

    panel.innerHTML = `
            <div class="details-group">
                <h4 class="details-header-uppercase">
                    <i class="fas fa-caret-down"></i> Event Dispatcher
                </h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="dispatcher-name-input" class="details-input" value="${
                      dispatcher.name
                    }" class="w-60">
                </div>
                <div class="detail-row">
                    <label>Description</label>
                    <input type="text" id="dispatcher-desc-input" class="details-input" value="${
                      dispatcher.description || ""
                    }" class="w-60">
                </div>
            </div>
            <div class="details-group">
                <h4 class="details-header-uppercase">
                    <i class="fas fa-caret-down"></i> Replication
                </h4>
                <div class="detail-row">
                    <label>Replicates</label>
                    <select id="dispatcher-replicates-select" class="details-select" class="w-60">
                        <option value="NotReplicated" ${
                          dispatcher.replicates === "NotReplicated"
                            ? "selected"
                            : ""
                        }>Not Replicated</option>
                        <option value="Multicast" ${
                          dispatcher.replicates === "Multicast"
                            ? "selected"
                            : ""
                        }>Multicast</option>
                        <option value="Server" ${
                          dispatcher.replicates === "Server" ? "selected" : ""
                        }>Run on Server</option>
                    </select>
                </div>
                <div class="detail-row">
                    <label>Reliable</label>
                    <div class="w-60">
                        <input type="checkbox" id="dispatcher-reliable-checkbox" class="ue5-checkbox" ${
                          dispatcher.reliable ? "checked" : ""
                        }>
                    </div>
                </div>
            </div>
        `;

    // Bind events
    const nameInput = panel.querySelector("#dispatcher-name-input");
    if (nameInput) {
      nameInput.addEventListener("change", (e) => {
        const newName = e.target.value.trim();
        if (newName && !this.isNameTaken(newName, dispatcher.id)) {
          dispatcher.name = newName;
          this.renderPanel();
          this.app.persistence.autoSave();
        }
      });
    }

    const descInput = panel.querySelector("#dispatcher-desc-input");
    if (descInput) {
      descInput.addEventListener("change", (e) => {
        dispatcher.description = e.target.value;
        this.app.persistence.autoSave();
      });
    }

    const replicatesSelect = panel.querySelector(
      "#dispatcher-replicates-select"
    );
    if (replicatesSelect) {
      replicatesSelect.addEventListener("change", (e) => {
        dispatcher.replicates = e.target.value;
        this.app.persistence.autoSave();
      });
    }

    const reliableCheckbox = panel.querySelector(
      "#dispatcher-reliable-checkbox"
    );
    if (reliableCheckbox) {
      reliableCheckbox.addEventListener("change", (e) => {
        dispatcher.reliable = e.target.checked;
        this.app.persistence.autoSave();
      });
    }
  }

  /**
   * Show context menu for dispatcher
   */
  showContextMenu(e, dispatcher) {
    const existingMenu = document.querySelector(".dispatcher-context-menu");
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement("div");
    menu.className = "context-menu dispatcher-context-menu";
    menu.classList.add("z-max");
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    const createMenuItem = (label, icon, onClick) => {
      const item = document.createElement("div");
      item.className = "menu-item";
      item.innerHTML = `<i class="${icon}" class="mr-1 w-12"></i> ${label}`;
      item.addEventListener("click", (ev) => {
        ev.stopPropagation();
        document.body.removeChild(menu);
        onClick();
      });
      return item;
    };

    menu.appendChild(
      createMenuItem("Rename", "fas fa-edit", () => {
        this.renamingId = dispatcher.id;
        this.renderPanel();
      })
    );

    menu.appendChild(
      createMenuItem("Delete", "fas fa-trash", () => {
        this.deleteDispatcher(dispatcher.id);
      })
    );

    document.body.appendChild(menu);

    const closeMenu = (ev) => {
      if (!menu.contains(ev.target)) {
        if (document.body.contains(menu)) {
          document.body.removeChild(menu);
        }
        document.removeEventListener("click", closeMenu);
      }
    };

    setTimeout(() => document.addEventListener("click", closeMenu), 0);
  }

  /**
   * Load state from persistence
   */
  loadState(state) {
    this.dispatchers.clear();
    if (state.eventDispatchers) {
      state.eventDispatchers.forEach((d) => {
        this.dispatchers.set(d.id, d);
      });
    }
    this.renderPanel();
  }

  /**
   * Clear all dispatchers
   */
  clearAll() {
    this.dispatchers.clear();
    this.renderPanel();
  }

  /**
   * Get state for persistence
   */
  getState() {
    return Array.from(this.dispatchers.values());
  }
}
