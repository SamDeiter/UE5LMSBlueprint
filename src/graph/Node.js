/**
 * Node class - Represents a single node in the graph canvas.
 */
import { Utils } from "../utils.js";
// import { PinDefaults } from "../config/NodeDefaults.js";
import { Pin } from "./Pin.js";
import { NODE_HEADER_COLORS, NODE_TYPES } from "../config/Constants.js";
import { UE5Renderer } from "../utils/UE5Renderer.js";
import { NodeWidgets } from "./node/NodeWidgets.js";

class Node {
  constructor(id, nodeData, x, y, nodeKey, app) {
    this.id = id;
    this.title = nodeData.title || "Unknown Node";
    this.type = nodeData.type || NODE_TYPES.PURE;
    this.icon = nodeData.icon;
    this.devWarning = nodeData.devWarning;
    this.variableType = nodeData.variableType;
    this.variableId = nodeData.variableId;
    this.app = app;
    this.nodeKey = nodeKey;
    this.x = x;
    this.y = y;
    this.isBreakpoint = nodeData.isBreakpoint || false;
    this.element = null;
    this.width = nodeData.width || 250;
    this.height = nodeData.height || 150;

    this.customData = nodeData.customData || {};

    const pinDataArray = nodeData.pins || [];
    this.pins = pinDataArray.map((p) => new Pin(this, p));
    this.refreshPinCache();

    this.pinLiterals = new Map();
    this.pins.forEach((p) => {
      // Use the pin's default value or the loaded default value if present.
      // When loading, pinData.defaultValue holds the literal value saved.
      const literalValue = pinDataArray.find(
        (pd) => pd.id === p.id.replace(`${this.id}-`, "")
      )?.literalValue;
      this.pinLiterals.set(
        p.id,
        literalValue !== undefined ? literalValue : p.defaultValue
      );

      // Also initialize pinLiterals for subPins of split pins
      if (p.isSplit && p.subPins) {
        p.subPins.forEach((subPin) => {
          const subLiteralValue = pinDataArray
            .find((pd) => pd.id === p.id.replace(`${this.id}-`, ""))
            ?.subPins?.find(
              (sp) => sp.id === subPin.id.replace(`${this.id}-`, "")
            )?.literalValue;
          this.pinLiterals.set(
            subPin.id,
            subLiteralValue !== undefined
              ? subLiteralValue
              : subPin.defaultValue
          );
        });
      }
    });
  }

  refreshPinCache() {
    if (!this.pins) this.pins = [];

    // Safeguard: For pure nodes, ensure no exec pins are exposed in the cache
    // This prevents them from being rendered even if they exist in the data
    if (this.type === NODE_TYPES.PURE) {
      this.pinsIn = this.pins.filter(
        (p) => p.dir === "in" && p.type !== "exec"
      );
      this.pinsOut = this.pins.filter(
        (p) => p.dir === "out" && p.type !== "exec"
      );
    } else {
      this.pinsIn = this.pins.filter((p) => p.dir === "in");
      this.pinsOut = this.pins.filter((p) => p.dir === "out");
    }
  }

  findPinById(pinId) {
    // Try exact match first
    let pin = this.pins.find((p) => p.id === pinId);
    if (pin) return pin;

    // Check sub-pins
    for (const p of this.pins) {
      if (p.isSplit && p.subPins) {
        const subPin = p.subPins.find((sp) => sp.id === pinId);
        if (subPin) return subPin;
      }
    }

    // Try matching by local ID (suffix)
    return this.pins.find((p) => p.id === `${this.id}-${pinId}`);
  }

  getHeaderColor() {
    if (this.variableType) {
      return Utils.getVariableHeaderColor(this.variableType);
    }
    if (this.nodeKey === "ConstructionScript") {
      return NODE_HEADER_COLORS.CONSTRUCTION_SCRIPT;
    }
    if (this.type === NODE_TYPES.EVENT) {
      return NODE_HEADER_COLORS.EVENT;
    }
    if (this.type === NODE_TYPES.FUNCTION) {
      return NODE_HEADER_COLORS.FUNCTION;
    }
    if (this.type === NODE_TYPES.CAST) {
      return NODE_HEADER_COLORS.CAST;
    }
    if (this.type === NODE_TYPES.ASSESSMENT) {
      return NODE_HEADER_COLORS.ASSESSMENT;
    }
    if (this.type === NODE_TYPES.PURE) {
      return NODE_HEADER_COLORS.PURE;
    }
    // Default
    return NODE_HEADER_COLORS.DEFAULT;
  }

  toggleBreakpoint() {
    // Use BreakpointManager instead of local flag
    if (!this.app.breakpointManager) {
      console.warn("BreakpointManager not initialized");
      return;
    }

    this.app.breakpointManager.toggleBreakpoint(this.id);

    // Update visual state
    if (this.element) {
      const header =
        this.headerElement || this.element.querySelector(".node-title");
      if (header) {
        const hasBreakpoint = this.app.breakpointManager.hasBreakpoint(this.id);

        if (hasBreakpoint) {
          header.classList.add("has-breakpoint");
          if (!header.querySelector(".breakpoint-icon")) {
            const bpIcon = document.createElement("div");
            bpIcon.className = "breakpoint-icon";
            bpIcon.innerHTML = UE5Renderer.renderBreakpointIcon();
            header.appendChild(bpIcon);
          }
        } else {
          header.classList.remove("has-breakpoint");
          const bpIcon = header.querySelector(".breakpoint-icon");
          if (bpIcon) bpIcon.remove();
        }
      }
    }

    // Note: BreakpointManager handles its own persistence via sessionStorage
  }

  updatePosition() {
    if (this.element) {
      this.element.style.left = `${this.x}px`;
      this.element.style.top = `${this.y}px`;
    }
  }

  /**
   * Re-evaluates pins based on current state (e.g. selected class/asset).
   * Usually triggered by a property change in the Details panel.
   */
  reallocatePins() {
    // 1. Collect links from existing dynamic pins to preserve them
    const linkMap = new Map();
    this.pins.forEach((p) => {
      if (p.isDynamic && p.links.length > 0) {
        // We use the ID portion after the node ID as the key
        const localId = p.id.split("-").pop();
        linkMap.set(localId, p.links);
      }
    });

    // 2. Remove dynamic pins
    this.pins = this.pins.filter((p) => !p.isDynamic);

    // 3. Request new dynamic pins from the AssetInterfacingService
    const dynamicPinData =
      this.app.assetInterfacingService?.getDynamicPinsForNode(this) || [];

    // 4. Create new Pin instances and restore links if available
    dynamicPinData.forEach((pData) => {
      const pin = new Pin(this, pData);
      pin.isDynamic = true;

      // Restore links if we have a match
      const preservedLinks = linkMap.get(pData.id);
      if (preservedLinks) {
        pin.links = preservedLinks;
        // Update the link objects in the registry to point to the new Pin instance
        pin.links.forEach((linkId) => {
          const lObj = this.app.wiring.findLink(linkId);
          if (lObj) {
            if (lObj.startPin.id === pin.id) lObj.startPin = pin;
            if (lObj.endPin.id === pin.id) lObj.endPin = pin;
          }
        });
      }

      this.pins.push(pin);
    });

    // 4. Refresh caches and re-render
    this.refreshPinCache();

    // 5. Re-render the node element if it exists
    if (this.element) {
      const newElement = this.render();
      this.element.replaceWith(newElement);
      this.element = newElement;

      // Notify graph that node size might have changed (for wires)
      this.app.graph.requestRedraw();
    }
  }

  /**
   * Called when a property is changed in the Details panel.
   * @param {string} propName
   * @param {any} value
   */
  onPropertyChanged(propName, value) {
    console.log(`Node ${this.id} property ${propName} changed to ${value}`);
    this.customData[propName] = value;

    // Specific logic for dynamic pin nodes
    if (
      propName === "class" ||
      propName === "asset" ||
      propName === "DataTable"
    ) {
      if (propName === "class") {
        if (this.nodeKey === "SpawnActorFromClass") {
          this.title = `SpawnActor ${value || "NONE"}`;
        } else if (this.nodeKey === "CreateWidget") {
          this.title = `Create ${value || "NONE"}_C`;
        }
      }
      this.reallocatePins();
    }

    this.app.persistence.autoSave();
  }

  render() {
    if (!this.nodeKey) {
      console.error(`Node ${this.id} missing nodeKey.`);
      this.nodeKey = "INVALID_NODE";
    }

    if (this.type === NODE_TYPES.COMMENT) {
      return this.renderCommentNode();
    }

    if (
      this.nodeKey.startsWith("Get_") ||
      this.nodeKey.startsWith("Conv_") ||
      this.nodeKey.startsWith("GetComponent_") ||
      (this.nodeKey.startsWith("Func_") && this.type === NODE_TYPES.PURE)
    ) {
      return this.renderCompactNode();
    }

    if (this.type === NODE_TYPES.REROUTE) {
      return this.renderRerouteNode();
    }

    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node ${this.type
      .toLowerCase()
      .replace(/_/g, "-")}-node`;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;

    if (this.customData && this.customData.advancedExpanded) {
      element.classList.add("advanced-expanded");
    }

    const header = document.createElement("div");
    this.headerElement = header;
    header.className = "node-title";

    const gradient = this.getHeaderColor();
    header.style.background = `linear-gradient(to bottom, ${gradient.start}, ${gradient.end})`;

    // Breakpoint Support
    const hasBreakpoint =
      this.app.breakpointManager &&
      this.app.breakpointManager.hasBreakpoint(this.id);
    if (hasBreakpoint) {
      header.classList.add("has-breakpoint");
      const bpIcon = document.createElement("div");
      bpIcon.className = "breakpoint-icon";
      bpIcon.innerHTML = UE5Renderer.renderBreakpointIcon();
      header.appendChild(bpIcon);
    }

    // Header Icon
    if (this.type === NODE_TYPES.EVENT) {
      const iconEl = document.createElement("span");
      iconEl.className = "node-header-icon event-icon";
      iconEl.innerHTML = UE5Renderer.renderEventHeaderIcon();
      header.appendChild(iconEl);
    } else if (this.icon) {
      const iconEl = document.createElement("span");
      if (this.icon.startsWith("ue5/")) {
        iconEl.className = "node-header-icon ue5-icon";
        const img = document.createElement("img");
        img.src = `/assets/icons/${this.icon}`;
        img.className = "ue5-icon-svg";
        iconEl.appendChild(img);
      } else if (this.icon === "f") {
        iconEl.className = "fas fa-function text-italic mr-1";
        iconEl.textContent = "f";
      }
      header.appendChild(iconEl);
    }

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.textContent = this.nodeKey.startsWith("Set_")
      ? "SET"
      : this.title;
    header.appendChild(titleSpan);

    if (this.type === NODE_TYPES.EVENT) {
      const delegateIcon = document.createElement("div");
      delegateIcon.className = "event-delegate-icon";
      header.appendChild(delegateIcon);
    }

    element.appendChild(header);

    const content = document.createElement("div");
    content.className = "node-content";

    // Zip pins into logical rows for horizontal parity (UE5 style)
    const execIn = this.pinsIn.filter((p) => p.type === "exec");
    const execOut = this.pinsOut.filter((p) => p.type === "exec");
    const dataIn = this.pinsIn.filter((p) => p.type !== "exec");
    const dataOut = this.pinsOut.filter((p) => p.type !== "exec");

    const execRows = Math.max(execIn.length, execOut.length);
    const dataRows = Math.max(dataIn.length, dataOut.length);

    let hasAdvanced = false;

    // Helper to process a pin for rendering and advanced tracking
    const processPin = (pin) => {
      if (!pin) return null;
      const pinEl = this.renderPin(pin);
      if (pin.advanced) {
        pinEl.classList.add("advanced");
        hasAdvanced = true;
        if (pin.links && pin.links.length > 0) pinEl.classList.add("connected");
      }
      return pinEl;
    };

    // 1. Render Exec Rows
    for (let i = 0; i < execRows; i++) {
      const row = document.createElement("div");
      row.className = "pin-row exec-row";
      const pIn = processPin(execIn[i]);
      const pOut = processPin(execOut[i]);
      if (pIn) row.appendChild(pIn);
      if (pOut) row.appendChild(pOut);
      content.appendChild(row);
    }

    // 2. Render Data Rows
    // Flatten split pins into individual pin elements for proper row alignment
    const flattenPins = (pins) => {
      const result = [];
      for (const pin of pins) {
        if (pin.isSplit && pin.subPins && pin.subPins.length > 0) {
          // Add each sub-pin as a separate row item
          pin.subPins.forEach((subPin) => {
            result.push({ pin: subPin, isSubPin: true, parentPin: pin });
          });
        } else {
          result.push({ pin, isSubPin: false });
        }
      }
      return result;
    };

    const flatDataIn = flattenPins(dataIn);
    const flatDataOut = flattenPins(dataOut);
    const flatDataRows = Math.max(flatDataIn.length, flatDataOut.length);

    for (let i = 0; i < flatDataRows; i++) {
      const row = document.createElement("div");
      row.className = "pin-row data-row";

      const itemIn = flatDataIn[i];
      const itemOut = flatDataOut[i];

      let pInEl = null;
      let pOutEl = null;

      if (itemIn) {
        pInEl = this.renderPin(itemIn.pin);
        if (itemIn.isSubPin) {
          // Add sub-pin prefix to name for display
          const displayName = `${itemIn.parentPin.name} ${itemIn.pin.name}`;
          const labelEl = pInEl.querySelector(".pin-label-in");
          if (labelEl) labelEl.textContent = displayName;
          pInEl.classList.add("sub-pin");
          pInEl.dataset.parentPinId = itemIn.parentPin.id;
        }
        if (itemIn.pin.advanced) {
          pInEl.classList.add("advanced");
          hasAdvanced = true;
          if (itemIn.pin.links && itemIn.pin.links.length > 0)
            pInEl.classList.add("connected");
        }
      }

      if (itemOut) {
        pOutEl = this.renderPin(itemOut.pin);
        if (itemOut.isSubPin) {
          // Add sub-pin prefix to name for display
          const displayName = `${itemOut.parentPin.name} ${itemOut.pin.name}`;
          const labelEl = pOutEl.querySelector(".pin-label-out");
          if (labelEl) labelEl.textContent = displayName;
          pOutEl.classList.add("sub-pin");
          pOutEl.dataset.parentPinId = itemOut.parentPin.id;
        }
        if (itemOut.pin.advanced) {
          pOutEl.classList.add("advanced");
          hasAdvanced = true;
          if (itemOut.pin.links && itemOut.pin.links.length > 0)
            pOutEl.classList.add("connected");
        }
      }

      if (pInEl) row.appendChild(pInEl);
      if (pOutEl) row.appendChild(pOutEl);

      content.appendChild(row);
    }

    element.appendChild(content);

    // Advanced Toggle
    if (hasAdvanced) {
      const toggle = document.createElement("div");
      toggle.className = "advanced-toggle-container";
      if (this.customData && this.customData.advancedExpanded)
        toggle.classList.add("expanded");

      const icon = document.createElement("div");
      icon.className = "advanced-toggle-icon";
      toggle.appendChild(icon);

      toggle.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        this.toggleAdvanced();
      });
      element.appendChild(toggle);
    }

    this.element = element;
    return element;
  }

  toggleAdvanced() {
    if (!this.customData) this.customData = {};
    this.customData.advancedExpanded = !this.customData.advancedExpanded;

    if (this.element) {
      if (this.customData.advancedExpanded) {
        this.element.classList.add("advanced-expanded");
        const toggle = this.element.querySelector(".advanced-toggle-container");
        if (toggle) toggle.classList.add("expanded");
      } else {
        this.element.classList.remove("advanced-expanded");
        const toggle = this.element.querySelector(".advanced-toggle-container");
        if (toggle) toggle.classList.remove("expanded");
      }
    }

    if (this.app && this.app.graph) {
      this.app.graph.requestRedraw();
    }
    this.app.persistence.autoSave();
  }

  renderRerouteNode() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node reroute-node`;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;

    const content = document.createElement("div");
    content.className = "node-content";

    const pinIn = this.pinsIn[0];
    const pinOut = this.pinsOut[0];

    // Determine color for the knot
    const pinType = pinIn ? pinIn.type : pinOut ? pinOut.type : "wildcard";
    let color = Utils.getPinColor(pinType);
    if (pinType === "exec") color = "#ffffff";

    // Create the visual "knot"
    const knot = document.createElement("div");
    knot.className = "visual-knot";
    knot.style.backgroundColor = color;
    content.appendChild(knot);

    const row = document.createElement("div");
    row.className = "pin-row";

    if (pinIn) {
      const pEl = this.renderPin(pinIn);
      // Hide SVG to rely on knot
      const svg = pEl.querySelector("svg");
      if (svg) svg.style.display = "none";
      row.appendChild(pEl);
    }
    if (pinOut) {
      const pEl = this.renderPin(pinOut);
      const svg = pEl.querySelector("svg");
      if (svg) svg.style.display = "none";
      row.appendChild(pEl);
    }

    content.appendChild(row);
    element.appendChild(content);

    this.element = element;

    // Set explicit dimensions for marquee selection hit-testing
    // Without these, offsetWidth/offsetHeight would include overflow elements
    this.width = 16;
    this.height = 16;

    // Immediate visual update to ensure correct shape/color
    requestAnimationFrame(() => this.updateRerouteVisuals());

    return element;
  }

  updateRerouteVisuals() {
    if (!this.element || this.type !== "reroute-node") return;

    const knot = this.element.querySelector(".visual-knot");
    if (!knot) return;

    const pinIn = this.pinsIn[0];
    const pinOut = this.pinsOut[0];
    const pinType = pinIn ? pinIn.type : pinOut ? pinOut.type : "wildcard";

    // Check if connected (either input or output has links)
    const isConnected =
      (pinIn && pinIn.links.length > 0) || (pinOut && pinOut.links.length > 0);

    // Toggle hollow class based on connection state
    if (isConnected) {
      knot.classList.remove("hollow");
    } else {
      knot.classList.add("hollow");
    }

    let color = Utils.getPinColor(pinType);
    if (pinType === "exec") {
      knot.classList.add("is-exec");
      // Let CSS handle the fill color for exec pins based on hollow class
      knot.style.backgroundColor = "";
    } else {
      knot.classList.remove("is-exec");
      knot.style.backgroundColor = color;
    }
  }

  renderCompactNode() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node compact-node ${this.type}`;
    element.style.left = `${this.x}px`; // Dynamic position
    element.style.top = `${this.y}px`; // Dynamic position

    // Note: Background styling is now handled by CSS (nodes.css .node.compact-node)
    // The type color is indicated by the pin connector color, not the node background

    const container = document.createElement("div");
    container.className = "compact-node-container";

    // Ensure pins are correctly cached before accessing
    if (!this.pinsIn || !this.pinsOut) {
      this.refreshPinCache();
    }

    const pinIn = this.pinsIn[0];
    const pinOut = this.pinsOut[0];

    // 1. Left Pin (Input) - Use renderPin to support split pins
    if (pinIn) {
      const pinEl = this.renderPin(pinIn);
      // Add compact styling if not split
      if (!pinIn.isSplit && !pinIn.isConnected()) {
        const inputWidget = pinEl.querySelector(
          ".node-literal-input, .ue5-checkbox"
        );
        if (inputWidget) {
          inputWidget.classList.add("compact-input-widget");
        }
      }
      container.appendChild(pinEl);
    }

    // --- INSERT LABEL (only for Get/GetComponent/Func nodes, not Conv nodes) ---
    if (!this.nodeKey.startsWith("Conv_")) {
      const labelSpan = document.createElement("span");
      labelSpan.className = "compact-node-label";
      // Clean up prefixes for display
      if (this.nodeKey.startsWith("Get_")) {
        labelSpan.textContent = this.nodeKey.substring(4);
      } else if (this.nodeKey.startsWith("GetComponent_")) {
        labelSpan.textContent = this.title.replace("Get ", "");
      } else if (this.nodeKey.startsWith("Func_")) {
        // Remove "Call " prefix if present
        labelSpan.textContent = this.title.replace("Call ", "");
      } else {
        labelSpan.textContent = this.title;
      }
      container.appendChild(labelSpan);
    }

    // 3. Right Pin (Output) - Use renderPin to support split pins
    if (pinOut) {
      // Hide pin label for Get/GetComponent nodes since central label shows the name
      // For Func_ nodes, we also hide the label if it's generic like "Return Value" or if we want compact look
      const hideLabel =
        this.nodeKey.startsWith("Get_") ||
        this.nodeKey.startsWith("GetComponent_") ||
        this.nodeKey.startsWith("Func_");
      const pinEl = this.renderPin(pinOut, hideLabel);
      container.appendChild(pinEl);
    }

    element.appendChild(container);
    this.element = element;
    return element;
  }

  createPinDot(pin, forceHollow = false) {
    const typeClass = Utils.getPinTypeClass(pin.type);
    const pinDot = document.createElement("div");
    let dotClasses = `pin-dot ${typeClass}`;
    const isConnected = pin.links.length > 0;
    if (forceHollow || !isConnected) {
      dotClasses += " hollow";
    }
    pinDot.className = dotClasses;
    pinDot.title = `${pin.name} (${pin.type})`;

    // Use UE5Renderer for high-fidelity SVG pins
    pinDot.innerHTML = UE5Renderer.renderPinIcon(pin, isConnected);

    // Handle container types with proper icons (legacy font-awesome removed in favor of UE5Renderer SVGs)
    if (pin.containerType && pin.containerType !== "single") {
      pinDot.classList.add("container-pin");
      if (pin.containerType === "array") pinDot.classList.add("array-pin");
      else if (pin.containerType === "set") pinDot.classList.add("set-pin");
      else if (pin.containerType === "map") pinDot.classList.add("map-pin");
    }

    // Handle reference pins (pass-by-reference diamond shape)
    if (pin.isReference) {
      pinDot.classList.add("reference-pin");
    }

    return pinDot;
  }

  /**
   * Render a single pin element (used for flattened row layout).
   * Unlike renderPin, this doesn't create split groups - each pin is rendered individually.
   * @param {Pin} pin - The pin to render
   * @param {boolean} hideLabel - Whether to hide the pin label
   */
  renderPin(pin, hideLabel = false) {
    // Note: Split pins are now handled by flattening in the main render loop,
    // so renderPin is only called for individual pins or sub-pins, never for a split parent

    const pinContainer = document.createElement("div");
    const typeClass = Utils.getPinTypeClass(pin.type);
    pinContainer.className = `pin-container ${pin.dir} ${typeClass}`;
    pinContainer.dataset.pinId = pin.id;

    const pinDot = this.createPinDot(pin);
    pin.element = pinDot;

    let effectiveHideLabel = hideLabel;
    // Hide labels for all exec pins to match UE5 style
    if (pin.type === "exec") {
      effectiveHideLabel = true;
    }

    const pinLabel = document.createElement("span");
    pinLabel.className = `pin-label-${pin.dir}`;
    pinLabel.textContent = Utils.formatNodeProperty(pin.name);
    if (effectiveHideLabel) {
      pinLabel.classList.add("hidden");
    }

    let inputWidget = null;
    const isDataPin = pin.type !== "exec";
    const isConnected = pin.links.length > 0;

    // Connection-only pin types that should never show an input widget
    const connectionOnlyTypes = [
      "exec",
      "array",
      "object",
      "struct",
      "interface",
    ];
    // NOTE: 'class' is NOT in connectionOnlyTypes here because SpawnActor needs a dropdown
    const hasContainerType =
      pin.containerType && pin.containerType !== "single";
    const isConnectionOnly =
      connectionOnlyTypes.includes(pin.type) || pin.isArray || hasContainerType;

    if (
      pin.dir === "in" &&
      isDataPin &&
      !isConnected &&
      !isConnectionOnly &&
      !pin.noDefaultValue
    ) {
      inputWidget = NodeWidgets.createInputWidget(pin, this);
    }

    if (pin.dir === "in") {
      pinContainer.appendChild(pinDot);
      const wrapper = document.createElement("div");
      wrapper.className = "pin-wrapper";
      wrapper.className = "pin-wrapper";

      if (!effectiveHideLabel) wrapper.appendChild(pinLabel);
      if (inputWidget) wrapper.appendChild(inputWidget);
      pinContainer.appendChild(wrapper);
    } else {
      if (!effectiveHideLabel) pinContainer.appendChild(pinLabel);
      pinContainer.appendChild(pinDot);
    }
    return pinContainer;
  }

  getPinsData() {
    return this.pins.map((p) => this.serializePin(p));
  }

  serializePin(pin) {
    const data = {
      id: pin.id ? pin.id.replace(`${this.id}-`, "") : "CORRUPTED",
      name: pin.name,
      type: pin.type,
      dir: pin.dir,
      containerType: pin.containerType,
      literalValue: this.pinLiterals.get(pin.id),
      isCustom: pin.isCustom,
      isReference: pin.isReference,
      isSplit: pin.isSplit,
    };

    // Recursively serialize sub-pins (for nested splits)
    if (pin.subPins && pin.subPins.length > 0) {
      data.subPins = pin.subPins.map((sp) => this.serializePin(sp));
    } else {
      data.subPins = [];
    }

    return data;
  }

  renderCommentNode() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node comment-node`;
    element.style.left = `${this.x}px`;
    element.style.top = `${this.y}px`;
    element.style.width = `${this.width}px`;
    element.style.height = `${this.height}px`;

    const header = document.createElement("div");
    this.headerElement = header;
    header.className = "node-title comment-title";
    header.textContent = this.title;

    // Double-click to rename comment
    header.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      header.contentEditable = true;
      header.focus();
      document.execCommand("selectAll", false, null);
    });

    header.addEventListener("blur", () => {
      header.contentEditable = false;
      this.title = header.textContent;
      this.app.persistence.autoSave();
    });

    header.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        header.blur();
      }
    });

    element.appendChild(header);

    // Resize Observer to persist dimensions
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.width = entry.contentRect.width;
        this.height = entry.contentRect.height;
        // Don't autosave on every resize frame, maybe debounced in a real app
      }
    });
    observer.observe(element);

    this.element = element;
    return element;
  }
}

export { Node };
