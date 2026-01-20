/**
 * ActionMenu - Handles the right-click action menu
 * Refactored to use MenuContentProvider for data logic.
 */
import { Utils } from "../utils.js";
import { buildCategoryTree, renderCategoryTree } from "./ui-helpers.js";
import { MenuContentProvider } from "./menu/MenuContentProvider.js";
import { BaseController } from "./BaseController.js";
import { debounce } from "../utils/debounce.js";

export class ActionMenu extends BaseController {
  constructor(app) {
    super(app); // Call BaseController constructor
    this.element = document.getElementById("action-menu");
    this.searchInput = document.getElementById("action-menu-search");
    this.list = document.getElementById("action-menu-list");
    this.graphPos = { x: 0, y: 0 };
    this.sourcePin = null;
    this.droppedVarName = null;
    this.droppedComponent = null;

    // Config
    const savedContext = localStorage.getItem("ue5_context_sensitive");
    this.isContextSensitive =
      savedContext !== null ? savedContext === "true" : true;

    // Dependencies
    this.provider = new MenuContentProvider(app);

    // Event Bindings
    this.addListener(this.element, "click", (e) => e.stopPropagation());
    this.addListener(
      this.searchInput,
      "input",
      debounce(this.filter.bind(this), 150)
    );

    // Enter key
    this.addListener(this.searchInput, "keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.selectFirstItem();
      }
    });

    // Outer Click Hide
    this.addListener(document, "click", (e) => {
      if (!this.isHideDelayActive) {
        if (
          !this.element.classList.contains("hidden") &&
          !this.element.contains(e.target)
        ) {
          this.hide();
        }
      }
    });
  }

  show(
    clientX,
    clientY,
    sourcePin = null,
    droppedVarName = null,
    droppedComponent = null
  ) {
    this.element.classList.remove("hidden");
    this.element.classList.add("visible");
    this.element.style.left = `${clientX}px`;
    this.element.style.top = `${clientY}px`;

    this.graphPos = this.app.graph.getGraphCoords(clientX, clientY);
    this.sourcePin = sourcePin;
    this.droppedVarName = droppedVarName;
    this.droppedComponent = droppedComponent;

    this.app.contextMenu.hide(); // Hide other menus

    // Flag to prevent immediate closing by document click
    this.isHideDelayActive = true;
    setTimeout(() => {
      this.isHideDelayActive = false;
    }, 100);

    // Setup Search
    this.searchInput.value = "";
    if (droppedVarName || droppedComponent) {
      this.searchInput.classList.add("hidden");
    } else {
      this.searchInput.classList.remove("hidden");
    }

    this.render();
    this.searchInput.focus();

    // Show Ghost Wire
    if (sourcePin) {
      const fakeEvent = { clientX, clientY };
      this.app.wiring.updateGhostWire(fakeEvent, sourcePin);
    }
  }

  hide() {
    this.element.classList.add("hidden");
    this.element.classList.remove("visible");

    const hadSourcePin = this.sourcePin !== null;
    this.sourcePin = null;
    this.droppedVarName = null;
    this.droppedComponent = null;

    if (this.app.graph.activePin) {
      this.app.graph.activePin = null;
    }

    if (
      hadSourcePin ||
      !this.app.wiring.ghostWire.classList.contains("hidden")
    ) {
      this.app.wiring.ghostWire.classList.add("hidden");
    }
  }

  filter() {
    this.render();
  }

  render() {
    this.list.innerHTML = "";
    const filterText = this.searchInput.value;

    // 1. Render Header (if Wiring)
    if (this.sourcePin) {
      this._renderWiringHeader();
    }

    // 2. Fetch Items
    const items = this.provider.getActions(
      filterText,
      this.sourcePin,
      this.isContextSensitive,
      this.droppedVarName,
      this.droppedComponent
    );

    if (items.length === 0) {
      this.list.innerHTML += `<div class="menu-item" style="color:#666; font-style:italic;">No matching actions</div>`;
      return;
    }

    // 3. Special case: Variable or Component drop - render directly without tree
    if (this.droppedVarName || this.droppedComponent) {
      items.forEach((item) => {
        const el = this._createMenuItemElement(item);
        if (el) {
          el.style.paddingLeft = "12px";
          this.list.appendChild(el);
        }
      });
      return;
    }

    // 4. Build Tree for normal menu
    const treeRoot = buildCategoryTree(items, (item) => item.category);

    // 5. Render Tree
    // renderCategoryTree appends directly to the container
    renderCategoryTree(
      treeRoot,
      this.list,
      (item) => this._createMenuItemElement(item),
      { menuStyle: true, autoExpand: !!this.searchInput.value }
    );
  }

  selectFirstItem() {
    const firstItem = this.list.querySelector(
      ".menu-item:not(.menu-header):not(.menu-header-toggle)"
    );
    if (firstItem) firstItem.click();
  }

  // --- Helpers ---

  _renderWiringHeader() {
    const header = document.createElement("div");
    header.className = "action-header";

    const pinColor = Utils.getPinColor(this.sourcePin.type);
    const typeName =
      this.sourcePin.type.charAt(0).toUpperCase() +
      this.sourcePin.type.slice(1);
    const titleText =
      this.sourcePin.type === "exec"
        ? "Executable actions"
        : `Actions taking a(n) ${typeName}`;

    header.innerHTML = `
        <div class="action-header-row">
            <span class="pin-color-circle" style="background-color: ${pinColor}"></span>
            <span class="text-bold text-light">${titleText}</span>
        </div>
        <div class="action-header-row justify-end text-sm text-light mt-1">
             <input type="checkbox" id="context-sensitive-check" class="mr-1" ${
               this.isContextSensitive ? "checked" : ""
             }>
             Context Sensitive
        </div>
      `;

    this.list.appendChild(header);

    // Bind Checkbox
    const checkbox = header.querySelector("#context-sensitive-check");
    this.addListener(checkbox, "change", (e) => {
      this.isContextSensitive = e.target.checked;
      localStorage.setItem("ue5_context_sensitive", this.isContextSensitive);
      this.filter(); // Re-render
    });

    this.list.appendChild(Utils.createSeparator());
  }

  _createMenuItemElement(item) {
    const el = document.createElement("div");

    // Highlight Logic
    const filter = this.searchInput.value;
    const displayName = this._highlightText(item.name, filter);

    // Handle header items (component type headers like "POINTLIGHT")
    if (item.isHeader) {
      el.className = "menu-header";
      el.innerHTML = `<span style="color:#888; font-size:11px; text-transform:uppercase;">${displayName}</span>
                      <hr style="margin:4px 0; border:0; border-top:1px solid #444;">`;
      return el; // No click handler for headers
    }

    el.className = "menu-item tree-item-indent-1";

    if (item.isVariableOp) {
      el.innerHTML = `<span class="var-pill" style="background-color:${item.color}"></span>${displayName}`;
    } else if (item.isPlainText) {
      // Simple text for component Get/Set options (no icons)
      el.innerHTML = `<span>${displayName}</span>`;
    } else if (item.isComponentOp) {
      // Component operations - use a cube icon like UE5
      el.innerHTML = `<i class="fas fa-cube mr-1" style="color:#4fc3f7;"></i>${displayName}`;
    } else if (item.isCustomEventCall) {
      el.innerHTML = `<span>${displayName}</span>`;
    } else if (item.isStandardNode || item.isSuggested) {
      el.innerHTML = `<span>${displayName}</span>`;
    } else if (item.isDebug) {
      el.innerHTML = `<span class="text-muted">${displayName}</span>`;
    } else {
      // Fallback - ensure all items are displayed
      el.innerHTML = `<span>${displayName}</span>`;
    }

    this.addListener(el, "click", (e) => {
      e.stopPropagation();
      this._executeAction(item);
    });

    return el;
  }

  _executeAction(item) {
    if (item.isDebug && item.action) {
      item.action();
      this.hide();
      return;
    }

    let newNode = null;

    // 1. Add Node
    if (item.isCustomEventCall) {
      // Special handling for Call Custom Event
      newNode = this.app.graph.addNode(
        "CallCustomEvent",
        this.graphPos.x,
        this.graphPos.y
      );
      if (newNode) {
        newNode.title = item.name;
        newNode.customData = { eventName: item.eventName };
        // Basic Mock Pins for now - real logic should be in Node Class or Factory
        this._setupCallCustomEventPins(newNode, item.eventName);
      }
    } else if (item.nodeKey === "NeedNode") {
      // Special handling for NeedNode Modal
      if (this.app.needNodeModal) {
        this.app.needNodeModal._pendingLocation = this.graphPos;
        this.app.needNodeModal.open();
        this.hide();
        return; // Exit early
      }
    } else {
      // Standard Node
      newNode = this.app.graph.addNode(
        item.nodeKey,
        this.graphPos.x,
        this.graphPos.y
      );
    }

    // 2. Auto-Wire
    if (newNode && this.sourcePin) {
      const targetPin = newNode.pins.find((p) =>
        this.app.graph.canConnect(this.sourcePin, p)
      );
      if (targetPin) {
        this.app.wiring.createConnection(this.sourcePin, targetPin);
      }
    }

    this.app.persistence.autoSave();
    this.hide();
  }

  _setupCallCustomEventPins(node, eventName) {
    // Find source event
    const sourceNode = [...this.app.graph.nodes.values()].find(
      (n) => n.title === eventName && n.nodeKey === "CustomEvent"
    );
    if (sourceNode) {
      sourceNode.pins.forEach((p) => {
        if (p.type !== "exec" && p.type !== "delegate" && p.dir === "out") {
          node.addPin({
            id: `in_${p.name}`,
            name: p.name,
            type: p.type,
            dir: "in",
          });
        }
      });
    }
    // Force UI update
    if (node.element) {
      const titleSpan = node.element.querySelector(
        ".node-title span:last-child"
      );
      if (titleSpan) titleSpan.textContent = node.title;
    }
  }

  _highlightText(text, filter) {
    if (!filter) return text;
    const index = text.toLowerCase().indexOf(filter.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + filter.length);
    const after = text.substring(index + filter.length);
    return `${before}<span class="search-highlight">${match}</span>${after}`;
  }

  // Cleanup method - called when controller is destroyed
  cleanup() {
    super.cleanup(); // Remove all event listeners and timers
    console.log("ActionMenu cleaned up");
  }
}
