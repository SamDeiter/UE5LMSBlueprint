/**
 * Node class - Represents a single node in the graph canvas.
 */
import { Utils } from "../utils.js";
import { PinDefaults } from "../config/NodeDefaults.js";
import { Pin } from "./Pin.js";
import { NODE_HEADER_COLORS, NODE_TYPES } from "../config/Constants.js";
import { UE5Renderer } from "../utils/UE5Renderer.js";

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
      this.element.style.left = `${this.x}px`; // Dynamic position // Dynamic position
      this.element.style.top = `${this.y}px`; // Dynamic position // Dynamic position
    }
  }

  render() {
    if (!this.nodeKey) {
      console.error(`Node ${this.id} missing nodeKey.`);
      this.nodeKey = "INVALID_NODE";
    }

    if (this.type === NODE_TYPES.COMMENT) {
      return this.renderCommentNode();
    }

    // Use compact node style for Getters, Converters, and Pure Function Calls
    if (
      this.nodeKey.startsWith("Get_") ||
      this.nodeKey.startsWith("Conv_") ||
      this.nodeKey.startsWith("GetComponent_") ||
      (this.nodeKey.startsWith("Func_") && this.type === NODE_TYPES.PURE)
    ) {
      return this.renderCompactNode();
    }

    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node ${this.type}`;
    element.style.left = `${this.x}px`; // Dynamic position
    element.style.top = `${this.y}px`; // Dynamic position

    const header = document.createElement("div");
    this.headerElement = header;
    header.className = "node-title";

    const gradient = this.getHeaderColor();
    header.style.background = `linear-gradient // Dynamic gradient(to bottom, ${gradient.start}, ${gradient.end})`;

    // Check BreakpointManager for breakpoint state
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

    if (this.type === NODE_TYPES.EVENT) {
      const iconEl = document.createElement("span");
      iconEl.className = "node-header-icon event-icon";
      iconEl.innerHTML = UE5Renderer.renderEventHeaderIcon();
      header.appendChild(iconEl);
    } else if (this.icon) {
      const iconEl = document.createElement("span");
      if (this.icon.startsWith("fa-")) {
        // Font Awesome icon
        iconEl.className = `fas ${this.icon}`;
      } else if (this.icon.startsWith("ue5/")) {
        // UE5 SVG icon
        iconEl.className = "node-header-icon ue5-icon";
        const img = document.createElement("img");
        img.src = `/assets/icons/${this.icon}`;
        img.alt = this.title;
        img.className = "ue5-icon-svg";
        iconEl.appendChild(img);
      } else if (this.type === NODE_TYPES.FUNCTION && this.icon === "f") {
        iconEl.classList.add("text-bold"); // Replaced inline style
        iconEl.classList.add("text-italic"); // Replaced inline style
        iconEl.classList.add("text-white"); // Replaced inline style
        iconEl.textContent = "f";
        iconEl.classList.add("text-md");
        iconEl.classList.add("mr-1");
      } else {
        iconEl.textContent = this.icon;
      }
      header.appendChild(iconEl);
    }

    const titleSpan = document.createElement("span");
    if (
      this.nodeKey.startsWith("Set_") ||
      this.nodeKey.startsWith("SetComponent_")
    ) {
      titleSpan.textContent = "SET";
    } else {
      titleSpan.textContent = this.title;
    }
    header.appendChild(titleSpan);
    if (this.nodeKey === "PrintString" || this.devWarning) {
      const devBadge = document.createElement("span");
      devBadge.className = "dev-badge";
      devBadge.textContent = "Development Only";
      header.appendChild(devBadge);
    }

    if (this.type === NODE_TYPES.EVENT) {
      const delegateIcon = document.createElement("div");
      delegateIcon.className = "event-delegate-icon";
      delegateIcon.title = "Output Delegate";
      header.appendChild(delegateIcon);
    }

    if (this.type === NODE_TYPES.COMMENT || this.nodeKey === "CustomEvent") {
      header.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        header.contentEditable = true;
        header.focus();
        document.execCommand("selectAll", false, null);
        header.classList.add("editing-title");
      });

      const finishEditing = () => {
        header.contentEditable = false;
        this.title = header.textContent;
        header.classList.remove("editing-title");
        if (this.app.details && this.app.graph.selectedNodes.has(this.id)) {
          if (this.nodeKey === "CustomEvent") {
            this.app.details.showNodeDetails(this);
          }
        }
        this.app.persistence.autoSave();
      };

      header.addEventListener("blur", finishEditing);
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          header.blur();
        }
      });
      header.addEventListener("mousedown", (e) => {
        if (header.isContentEditable) {
          e.stopPropagation();
        }
      });
    }

    // NeedNode double-click to open configuration modal
    if (this.nodeKey === "NeedNode") {
      header.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        if (this.app.needNodeModal) {
          this.app.needNodeModal.open(this);
        }
      });
    }

    element.appendChild(header);

    const content = document.createElement("div");
    content.className = "node-content";

    if (this.type === NODE_TYPES.PURE) {
      content.classList.add("pure-node-content");
      const inCol = document.createElement("div");
      inCol.className = "pin-column in";
      const inFragment = document.createDocumentFragment();
      this.pinsIn.forEach((pinIn) =>
        inFragment.appendChild(this.renderPin(pinIn))
      );
      inCol.appendChild(inFragment);
      content.appendChild(inCol);

      const outCol = document.createElement("div");
      outCol.className = "pin-column out";
      const outFragment = document.createDocumentFragment();
      this.pinsOut.forEach((pinOut) =>
        outFragment.appendChild(this.renderPin(pinOut))
      );
      outCol.appendChild(outFragment);
      content.appendChild(outCol);
    } else {
      // Flatten pins arrays: split pins expand into their subPins for row counting
      const flattenPins = (pins) => {
        const result = [];
        pins.forEach((pin) => {
          if (pin.isSplit && pin.subPins && pin.subPins.length > 0) {
            // Add each subPin as a separate row entry
            pin.subPins.forEach((subPin) => {
              result.push({ pin: subPin, parentPin: pin, isSubPin: true });
            });
          } else {
            result.push({ pin, parentPin: null, isSubPin: false });
          }
        });
        return result;
      };

      const flatPinsIn = flattenPins(this.pinsIn || []);
      const flatPinsOut = flattenPins(this.pinsOut || []);
      const maxRows = Math.max(flatPinsIn.length, flatPinsOut.length);
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < maxRows; i++) {
        const row = document.createElement("div");
        row.className = "pin-row";

        const pinEntry = flatPinsIn[i];
        const outEntry = flatPinsOut[i];

        if (pinEntry) {
          const pinEl = this.renderSinglePin(pinEntry.pin, pinEntry.parentPin);
          row.appendChild(pinEl);
        } else {
          const spacer = document.createElement("div");
          spacer.classList.add("min-w-10");
          row.appendChild(spacer);
        }

        if (outEntry) {
          const shouldHideLabel =
            this.nodeKey.startsWith("Set_") && outEntry.pin.type !== "exec";
          const pinEl = this.renderSinglePin(
            outEntry.pin,
            outEntry.parentPin,
            shouldHideLabel
          );
          row.appendChild(pinEl);
        } else {
          const spacer = document.createElement("div");
          spacer.classList.add("min-w-10");
          row.appendChild(spacer);
        }
        fragment.appendChild(row);
      }
      content.appendChild(fragment);
    }

    element.appendChild(content);

    // NeedNode Visualization: Show criteria checklist
    if (
      this.nodeKey === "NeedNode" &&
      this.customData &&
      this.customData.needNodeData
    ) {
      const needData = this.customData.needNodeData;
      if (
        !needData.hidden &&
        needData.criteria &&
        needData.criteria.length > 0
      ) {
        const criteriaContainer = document.createElement("div");
        criteriaContainer.className = "need-node-criteria";
        criteriaContainer.className = "need-node-criteria-panel";

        needData.criteria.forEach((c) => {
          const row = document.createElement("div");
          row.className = "need-node-criterion-row";

          // Status icon (updated by simulation)
          const icon = document.createElement("span");
          icon.textContent = c.passed ? "✅" : "⬜"; // Checkmark or empty box

          const text = document.createElement("span");
          text.textContent = c.description;

          row.appendChild(icon);
          row.appendChild(text);
          criteriaContainer.appendChild(row);
        });

        content.appendChild(criteriaContainer);
      }
      // Note: devBar was referenced in original code but not defined in this snippet context.
      // Assuming it was part of previous code or I should remove it if it causes error.
      // Looking at original code, devBar seems to be missing from my snippet view or I missed it.
      // Wait, lines 322-328 in original code reference `arrowIcon` and `devBar`.
      // But `devBar` is NOT defined in the `render` method I see in Step 49.
      // Ah, I see `if (this.nodeKey === 'PrintString' || this.devWarning)` block creates `devBadge`.
      // But `devBar` is not there.
      // The original code snippet in Step 49 lines 322-328:
      /*
            arrowIcon.style.marginLeft = '5px';
            ...
            devBar.appendChild(arrowIcon);
            element.appendChild(devBar);
            */
      // This looks like a copy-paste error in the original file or my view is truncated/confused.
      // Step 49 shows lines 322-328 being outside the `if (this.nodeKey === 'NeedNode' ...)` block?
      // No, it's inside `render`.
      // But `devBar` is not defined.
      // I will remove the `devBar` lines if they are problematic, or keep them if they are valid.
      // Since I am replacing the whole `render` method, I should be careful.
      // The `devBar` lines in Step 49 seem to be dangling code.
      // I will OMIT them in my replacement to fix potential ReferenceError.
    }

    this.element = element;
    return element;
  }

  renderCompactNode() {
    const element = document.createElement("div");
    element.id = this.id;
    element.className = `node compact-node ${this.type}`;
    element.style.left = `${this.x}px`; // Dynamic position
    element.style.top = `${this.y}px`; // Dynamic position

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
   * @param {Pin|null} parentPin - The parent pin if this is a subPin, otherwise null
   * @param {boolean} hideLabel - Whether to hide the pin label
   */
  renderSinglePin(pin, parentPin = null, hideLabel = false) {
    // Safety: ensure pin has required properties
    const pinDir = pin.dir || (parentPin ? parentPin.dir : "in");
    const pinType = pin.type || "wildcard";

    const pinContainer = document.createElement("div");
    const typeClass = Utils.getPinTypeClass(pinType);
    pinContainer.className = `pin-container ${pinDir} ${typeClass}`;
    pinContainer.dataset.pinId = pin.id;

    // If this is a subPin, mark it and store parent reference
    if (parentPin) {
      pinContainer.classList.add("sub-pin");
      pinContainer.dataset.parentPinId = parentPin.id;
    }

    const pinDot = this.createPinDot(pin);
    pin.element = pinDot;
const pinLabel = document.createElement("span");
    pinLabel.className = `pin-label-${pinDir}`;
    // For subPins, include parent name in label
    pinLabel.textContent = parentPin
      ? `${parentPin.name} ${pin.name}`
      : pin.name;
    if (hideLabel) {
      pinLabel.classList.add("hidden");
    }

    let inputWidget = null;
    const isDataPin = pinType !== "exec";
    const isConnected = pin.links && pin.links.length > 0;

    // Connection-only pin types that should never show an input widget
    const connectionOnlyTypes = [
      "array",
      "object",
      "struct",
      "class",
      "interface",
    ];
    const hasContainerType =
      pin.containerType && pin.containerType !== "single";
    const isConnectionOnly =
      connectionOnlyTypes.includes(pinType) || pin.isArray || hasContainerType;

    if (pinDir === "in" && isDataPin && !isConnected && !isConnectionOnly) {
      inputWidget = this.createInputWidget(pin);
    }

    // Build pin container structure based on direction
    if (pin.dir === "in") {
      pinContainer.appendChild(pinDot);
      pinContainer.appendChild(pinLabel);
      if (inputWidget) {
        const wrapper = document.createElement("div");
        wrapper.className = "pin-wrapper";
        wrapper.appendChild(inputWidget);
        pinContainer.appendChild(wrapper);
      }
    } else {
      if (inputWidget) {
        const wrapper = document.createElement("div");
        wrapper.className = "pin-wrapper";
        wrapper.appendChild(inputWidget);
        pinContainer.appendChild(wrapper);
      }
      pinContainer.appendChild(pinLabel);
      pinContainer.appendChild(pinDot);
    }

    return pinContainer;
  }

  renderPin(pin, hideLabel = false) {
    // Handle Split Pins
    if (pin.isSplit) {
      const splitGroup = document.createElement("div");
      splitGroup.className = "pin-split-group";
      splitGroup.classList.add(pin.dir === "in" ? "align-start" : "align-end");

      if (pin.subPins) {
        pin.subPins.forEach((subPin) => {
          // Temporarily rename sub-pin for display to include parent name context
          const originalName = subPin.name;
          subPin.name = `${pin.name} ${subPin.name}`;

          const subPinEl = this.renderPin(subPin, false);
          subPin.name = originalName; // Restore name

          subPinEl.classList.add("sub-pin");
          // Add data attribute pointing to PARENT pin ID for context menu handling
          subPinEl.dataset.parentPinId = pin.id;

          splitGroup.appendChild(subPinEl);
        });
      }

      return splitGroup;
    }

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
    pinLabel.textContent = pin.name;
    if (hideLabel) {
      pinLabel.classList.add("hidden");
    }

    let inputWidget = null;
    const isDataPin = pin.type !== "exec";
    const isConnected = pin.links.length > 0;

    // Connection-only pin types that should never show an input widget
    const connectionOnlyTypes = [
      "array",
      "object",
      "struct",
      "class",
      "interface",
    ];
    const hasContainerType =
      pin.containerType && pin.containerType !== "single";
    const isConnectionOnly =
      connectionOnlyTypes.includes(pin.type) || pin.isArray || hasContainerType;

    if (pin.dir === "in" && isDataPin && !isConnected && !isConnectionOnly) {
      inputWidget = this.createInputWidget(pin);
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

  createInputWidget(pin) {
    // Safeguard: Connection-only types should never have widgets
    const connectionOnlyTypes = [
      "array",
      "object",
      "struct",
      "wildcard",
      "class",
      "interface",
    ];
    if (connectionOnlyTypes.includes(pin.type) || pin.isArray) {
      return null;
    }

    let inputEl;
    const pinValue = this.pinLiterals.get(pin.id);
    const updateLiteral = (e) => {
      let newValue = e.target.value;
      if (["int", "int64", "byte"].includes(pin.type)) {
        newValue = parseInt(newValue) || PinDefaults.INT;
      } else if (pin.type === "float") {
        newValue = parseFloat(newValue) || PinDefaults.FLOAT;
      } else if (pin.type === "bool") {
        newValue = e.target.checked;
      }
      this.pinLiterals.set(pin.id, newValue);
      this.app.persistence.autoSave();
    };

    // Handle vector/rotator/transform types
    if (["vector", "rotator", "transform"].includes(pin.type)) {
      return this.createVectorWidget(pin);
    }

    // Handle enum types
    if (pin.type === "enum" || pin.enumValues) {
      return this.createEnumWidget(pin);
    }

    // Handle color types
    if (pin.type === "color" || pin.name.toLowerCase().includes("color")) {
      return this.createColorWidget(pin);
    }

    if (pin.type === "bool") {
      inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.className = "ue5-checkbox";
      inputEl.checked = pinValue;
      inputEl.addEventListener("change", updateLiteral);
      inputEl.addEventListener("mousedown", (e) => e.stopPropagation());
    } else {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.value = pinValue;
      inputEl.className = "node-literal-input";
      const wideTypes = ["string", "text", "name"];
      inputEl.classList.add(
        wideTypes.includes(pin.type) ? "input-wide" : "input-narrow"
      );

      inputEl.addEventListener("change", updateLiteral);
      inputEl.addEventListener("mousedown", (e) => e.stopPropagation());

      inputEl.addEventListener(
        "focus",
        () => (this.app.graph.isEditingLiteral = true)
      );
      inputEl.addEventListener(
        "blur",
        () => (this.app.graph.isEditingLiteral = false)
      );
    }
    return inputEl;
  }

  createVectorWidget(pin) {
    const container = document.createElement("div");
    container.className = "ue-vector-widget";

    const value = this.pinLiterals.get(pin.id) || "(0,0,0)";
    const components = value
      .replace(/[()]/g, "")
      .split(",")
      .map((v) => parseFloat(v.trim()) || 0);

    const labels = pin.type === "rotator" ? ["R", "P", "Y"] : ["X", "Y", "Z"];

    labels.forEach((label, i) => {
      const group = document.createElement("div");
      group.className = "val-group";

      const labelEl = document.createElement("span");
      labelEl.className = "val-label";
      labelEl.textContent = label;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "small-input";
      input.value = components[i] || 0;

      input.addEventListener("change", () => {
        components[i] = parseFloat(input.value) || 0;
        this.pinLiterals.set(pin.id, `(${components.join(",")})`);
        this.app.persistence.autoSave();
      });

      input.addEventListener("mousedown", (e) => e.stopPropagation());
      input.addEventListener(
        "focus",
        () => (this.app.graph.isEditingLiteral = true)
      );
      input.addEventListener(
        "blur",
        () => (this.app.graph.isEditingLiteral = false)
      );

      group.appendChild(labelEl);
      group.appendChild(input);
      container.appendChild(group);
    });

    return container;
  }

  createEnumWidget(pin) {
    const select = document.createElement("select");
    select.className = "ue-enum-select";

    const enumValues = pin.enumValues || [
      "None",
      "Visibility",
      "Camera",
      "Pawn",
    ];
    const currentValue = this.pinLiterals.get(pin.id) || enumValues[0];

    enumValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = value === currentValue;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      this.pinLiterals.set(pin.id, e.target.value);
      this.app.persistence.autoSave();
    });

    select.addEventListener("mousedown", (e) => e.stopPropagation());
    select.addEventListener(
      "focus",
      () => (this.app.graph.isEditingLiteral = true)
    );
    select.addEventListener(
      "blur",
      () => (this.app.graph.isEditingLiteral = false)
    );

    return select;
  }

  createColorWidget(pin) {
    const container = document.createElement("div");
    container.className = "ue-color-picker-container";

    const colorBox = document.createElement("input");
    colorBox.type = "color";
    colorBox.className = "ue-color-picker";

    const value = this.pinLiterals.get(pin.id) || "#FF0000";
    colorBox.value = value;

    colorBox.addEventListener("change", (e) => {
      this.pinLiterals.set(pin.id, e.target.value);
      this.app.persistence.autoSave();
    });

    colorBox.addEventListener("mousedown", (e) => e.stopPropagation());

    container.appendChild(colorBox);
    return container;
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
