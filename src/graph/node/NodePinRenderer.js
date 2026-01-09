/**
 * NodePinRenderer.js - Pin rendering utilities for nodes
 * Extracted from Node.js for modularity
 */
import { Utils } from "../utils.js";
import { NodeWidgets } from "./node/NodeWidgets.js";

/**
 * Render a single pin element
 * @param {Node} node - The parent node
 * @param {Pin} pin - The pin to render
 * @param {boolean} hideLabel - Whether to hide the pin label
 * @returns {HTMLElement} Pin container element
 */
export function renderPin(node, pin, hideLabel = false) {
  const pinContainer = document.createElement("div");
  const typeClass = Utils.getPinTypeClass(pin.type);
  pinContainer.className = `pin-container ${pin.dir} ${typeClass}`;
  pinContainer.dataset.pinId = pin.id;

  const pinDot = createPinDot(node, pin);
  pin.element = pinDot;

  let effectiveHideLabel = hideLabel;
  // Hide labels for single exec pins but show for multiple exec pins
  if (pin.type === "exec") {
    const execPinsCount = node.pins.filter(
      (p) => p.type === "exec" && p.dir === pin.dir
    ).length;
    effectiveHideLabel = execPinsCount <= 1;
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

  const connectionOnlyTypes = [
    "exec",
    "array",
    "object",
    "struct",
    "interface",
  ];
  const hasContainerType = pin.containerType && pin.containerType !== "single";
  const isConnectionOnly =
    connectionOnlyTypes.includes(pin.type) || pin.isArray || hasContainerType;

  if (
    pin.dir === "in" &&
    isDataPin &&
    !isConnected &&
    !isConnectionOnly &&
    !pin.noDefaultValue
  ) {
    inputWidget = NodeWidgets.createInputWidget(pin, node);
  }

  if (pin.dir === "in") {
    pinContainer.appendChild(pinDot);
    const wrapper = document.createElement("div");
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

/**
 * Create pin dot element
 * @param {Node} node - The parent node
 * @param {Pin} pin - The pin
 * @param {boolean} forceHollow - Force hollow style
 * @returns {HTMLElement} Pin dot element
 */
export function createPinDot(node, pin, forceHollow = false) {
  const pinDot = document.createElement("div");
  const isExec = pin.type === "exec";

  pinDot.className = `pin-dot ${isExec ? "pin-exec" : `pin-${pin.type}`}`;
  pinDot.dataset.pinId = pin.id;
  pinDot.title = `${pin.name} (${pin.type})`;

  // Apply type color for data pins
  if (!isExec) {
    pinDot.style.backgroundColor = Utils.getTypeColor(pin.type);
  }

  // Hollow style for container types or unconnected
  if (forceHollow || (pin.containerType && pin.containerType !== "single")) {
    pinDot.classList.add("hollow");
  }

  // Connected indicator
  if (pin.links.length > 0) {
    pinDot.classList.add("connected");
  }

  return pinDot;
}

/**
 * Flatten pins for row-based rendering (handles split struct pins)
 * @param {Pin[]} pins - Array of pins
 * @returns {Pin[]} Flattened array including sub-pins
 */
export function flattenPins(pins) {
  const result = [];
  for (const pin of pins) {
    if (pin.isSplit && pin.subPins && pin.subPins.length > 0) {
      pin.subPins.forEach((sp) => result.push(sp));
    } else {
      result.push(pin);
    }
  }
  return result;
}

/**
 * Get type color for a pin
 * @param {string} type - Pin type
 * @returns {string} CSS color
 */
export function getPinColor(type) {
  return Utils.getTypeColor(type);
}
