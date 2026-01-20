/**
 * WireRenderer.js
 *
 * Handles the visual representation of wires using SVG.
 * Manages drawing, styling, thickness, and active states (pulse).
 */
import { Utils } from "../../utils.js";
import { GRAPH_CONSTANTS } from "../../config/Constants.js";
import { UE5Renderer } from "../../utils/UE5Renderer.js";

// UE5 Wire Thickness Specifications (from GraphEditorSettings.cpp)
const WIRE_THICKNESS = {
  data: 1.5, // DefaultDataWireThickness
  exec: 2.5, // DefaultExecutionWireThickness
  container: 2.5, // Containers use exec thickness
};

export class WireRenderer {
  /**
   * @param {WiringController} controller - Facade reference
   * @param {SVGSVGElement} svgRoot - The root SVG element for the graph
   */
  constructor(controller, svgRoot) {
    this.controller = controller;
    this.svgGroup = svgRoot.getElementById("wire-group");
    this.ghostWire = svgRoot.getElementById("ghost-wire");

    this._initializeGhostWire();
  }

  get app() {
    return this.controller.app;
  }
  get manager() {
    return this.controller.manager;
  }

  _initializeGhostWire() {
    this.ghostWire.setAttribute("fill", "none");
    this.ghostWire.classList.add("hidden");
  }

  // --- DRAWING ---

  drawWire(link) {
    const { startPin, endPin } = link;

    // Lookup pin elements fresh from DOM (cached references can become stale after re-renders)
    const startEl = startPin.element?.isConnected
      ? startPin.element
      : document.querySelector(`[data-pin-id="${startPin.id}"] .pin-dot`);
    const endEl = endPin.element?.isConnected
      ? endPin.element
      : document.querySelector(`[data-pin-id="${endPin.id}"] .pin-dot`);

    // Update cached references if we had to look them up
    if (startEl && startEl !== startPin.element) startPin.element = startEl;
    if (endEl && endEl !== endPin.element) endPin.element = endEl;

    // Safety Check: Ensure elements exist
    if (!startEl || !endEl) {
      console.warn(
        "[WireRenderer] Cannot draw wire - pin elements not found:",
        {
          startPinId: startPin.id,
          endPinId: endPin.id,
          startElFound: !!startEl,
          endElFound: !!endEl,
        }
      );
      // Don't delete the link - maybe the node just hasn't rendered yet
      return;
    }

    let wireEl = document.getElementById(link.id);

    // Create if missing
    if (!wireEl) {
      wireEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      wireEl.id = link.id;
      this.svgGroup.appendChild(wireEl);
      this._bindEvents(wireEl, link);
    } else {
      wireEl.classList.remove("hidden");
    }

    // Styling
    this._applyStyle(wireEl, startPin, link.id);

    // Geometry
    const p1 = Utils.getPinPosition(startEl, this.app);
    const p2 = Utils.getPinPosition(endEl, this.app);
    wireEl.setAttribute("d", Utils.getWirePath(p1.x, p1.y, p2.x, p2.y));
  }

  _bindEvents(wireEl, link) {
    wireEl.addEventListener("click", (e) => {
      e.stopPropagation();
      this.controller.handleLinkClick(link.id);
    });
    wireEl.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.controller.handleLinkDoubleClick(link, e);
    });
  }

  _applyStyle(wireEl, pin, linkId) {
    const isExec = pin.type === "exec";
    const isContainer = pin.containerType && pin.containerType !== "single";

    let thickness = WIRE_THICKNESS.data;
    if (isExec) thickness = WIRE_THICKNESS.exec;
    else if (isContainer) thickness = WIRE_THICKNESS.container;

    const pinColor = Utils.getPinColor(pin.type);
    wireEl.setAttribute("stroke", pinColor);
    wireEl.setAttribute("stroke-width", thickness);

    const typeClass = Utils.getPinTypeClass(pin.type);
    const isSelected = this.manager.selectedLinks.has(linkId);

    wireEl.setAttribute(
      "class",
      `wire ${typeClass} ${isSelected ? "link-selected" : ""}`
    );
  }

  drawGhostWire(e, startPin) {
    if (!startPin || !startPin.element) {
      this.ghostWire.classList.add("hidden");
      return;
    }

    this.ghostWire.classList.remove("hidden");

    // Ensure z-index via DOM Append
    if (this.ghostWire.parentNode !== this.svgGroup) {
      this.svgGroup.appendChild(this.ghostWire);
    }

    const p1 = Utils.getPinPosition(startPin.element, this.app);
    const p2 = this.app.graph.getGraphCoords(e.clientX, e.clientY);

    // Determine direction
    const startX = startPin.dir === "out" ? p1.x : p2.x;
    const startY = startPin.dir === "out" ? p1.y : p2.y;
    const endX = startPin.dir === "out" ? p2.x : p1.x;
    const endY = startPin.dir === "out" ? p2.y : p1.y;

    const pathData = Utils.getWirePath(startX, startY, endX, endY);
    this.ghostWire.setAttribute("d", pathData);

    // Style
    const pinColor = Utils.getPinColor(startPin.type);
    this.ghostWire.style.stroke = pinColor;
    this.ghostWire.style.strokeWidth = `${GRAPH_CONSTANTS.WIRE_STROKE_WIDTH}px`;

    const typeClass = Utils.getPinTypeClass(startPin.type);
    this.ghostWire.setAttribute("class", `wire ${typeClass}`);
  }

  hideGhostWire() {
    this.ghostWire.classList.add("hidden");
  }

  // --- VISUAL UPDATES ---

  updatePinVisualState(pin) {
    if (!pin) return;

    // Ensure we have the latest pin state (especially links) from the graph
    // The passed 'pin' object might be from a drag event (stale/copy)
    const livePin = this.controller.findPinById(pin.id) || pin;

    if (!livePin.element) return;
    const isConnected = livePin.links && livePin.links.length > 0;

    // Toggle hollow class for CSS-based styling
    if (isConnected) {
      livePin.element.classList.remove("hollow");
    } else {
      livePin.element.classList.add("hollow");
    }

    // CRITICAL: Regenerate SVG to update fill colors
    // UE5Renderer generates static SVG, so we must update innerHTML
    const svgEl = livePin.element.querySelector(".ue5-pin-svg");
    if (svgEl) {
      livePin.element.innerHTML = UE5Renderer.renderPinIcon(
        livePin,
        isConnected
      );
    }

    // For reroute nodes, also update the visual knot
    if (
      livePin.node &&
      livePin.node.type === "reroute-node" &&
      livePin.node.updateRerouteVisuals
    ) {
      livePin.node.updateRerouteVisuals();
    }
  }

  updateNodeVisuals(node) {
    if (!node || !node.element || !node.element.parentNode) return;

    const oldEl = node.element;
    const isSelected = oldEl.classList.contains("selected");
    const newEl = node.render();

    oldEl.replaceWith(newEl);
    node.element = newEl;

    // CRITICAL: Update pin.element references to the new DOM elements
    // After render(), the old pin.element references are stale (no longer in DOM)
    for (const pin of node.pins) {
      const pinEl = newEl.querySelector(
        `[data-pin-id="${pin.id}"] .pin-dot, [data-pin-id="${pin.id}"]`
      );
      if (pinEl) {
        pin.element = pinEl.classList.contains("pin-dot")
          ? pinEl
          : pinEl.querySelector(".pin-dot");
      }
      // Also update sub-pin elements if split
      if (pin.isSplit && pin.subPins) {
        for (const subPin of pin.subPins) {
          const subPinEl = newEl.querySelector(
            `[data-pin-id="${subPin.id}"] .pin-dot, [data-pin-id="${subPin.id}"]`
          );
          if (subPinEl) {
            subPin.element = subPinEl.classList.contains("pin-dot")
              ? subPinEl
              : subPinEl.querySelector(".pin-dot");
          }
        }
      }
    }

    if (isSelected) newEl.classList.add("selected");
  }

  removeWireElement(linkId) {
    const el = document.getElementById(linkId);
    if (el) el.remove();
    this.removePulse(linkId);
  }

  clearAll() {
    while (this.svgGroup.firstChild) {
      this.svgGroup.removeChild(this.svgGroup.firstChild);
    }
  }

  // --- ANIMATION / ACTIVE STATE ---

  setWireActive(linkId) {
    const wireEl = document.getElementById(linkId);
    if (!wireEl) return;

    wireEl.classList.add("active-wire");
    this._createPulse(wireEl, linkId);
  }

  _createPulse(wireEl, linkId) {
    let pulse = document.getElementById(`${linkId}-pulse`);

    if (pulse) {
      // Reset Timer
      if (pulse._cleanupTimer) clearTimeout(pulse._cleanupTimer);
    } else {
      // Create Pulse
      pulse = wireEl.cloneNode(true);
      pulse.id = `${linkId}-pulse`;
      pulse.classList.add("wire-pulse");
      this.svgGroup.appendChild(pulse);

      // Animation Frame Sync
      const sync = () => {
        if (pulse && pulse.isConnected) {
          pulse.setAttribute("d", wireEl.getAttribute("d"));
          requestAnimationFrame(sync);
        }
      };
      requestAnimationFrame(sync);
    }

    // Auto-Cleanup
    pulse._cleanupTimer = setTimeout(() => {
      wireEl.classList.remove("active-wire");
      if (pulse) pulse.remove();
    }, 1000);
  }

  removePulse(linkId) {
    const pulse = document.getElementById(`${linkId}-pulse`);
    if (pulse) pulse.remove();
  }

  clearActiveWires() {
    const active = this.svgGroup.querySelectorAll(".active-wire");
    active.forEach((el) => el.classList.remove("active-wire"));

    const pulses = this.svgGroup.querySelectorAll(".wire-pulse");
    pulses.forEach((el) => el.remove());
  }

  setLinkSelected(linkId, isSelected) {
    const el = document.getElementById(linkId);
    if (!el) return;
    if (isSelected) el.classList.add("link-selected");
    else el.classList.remove("link-selected");
  }
}
