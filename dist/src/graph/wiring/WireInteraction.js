/**
 * WireInteraction.js
 *
 * Manages user interactions for wiring (Creation logic, Validation, Double-Click).
 * Bridge between Input Events and the Wiring Data Model.
 */
import { Utils } from "../../utils.js";
import { PinTypeValidator } from "../../utils/PinTypeValidator.js";

export class WireInteraction {
  /**
   * @param {WiringController} controller - Facade reference
   */
  constructor(controller) {
    this.controller = controller;
    this.typeValidator = new PinTypeValidator();
  }

  get app() {
    return this.controller.app;
  }
  get manager() {
    return this.controller.manager;
  }
  get renderer() {
    return this.controller.renderer;
  }

  /**
   * Attempts to connect two pins. Handles validation and auto-conversion.
   */
  connect(pinA, pinB) {
    // 1. Pre-checks
    if (this.app.simulation && this.app.simulation.isRunning) {
      console.warn("[Wiring] Cannot modify connections during simulation.");
      return;
    }
    if (!pinA || !pinB) return;
    if (pinA.node.id === pinB.node.id) {
      console.warn("[Wiring] Self-connection not allowed.");
      return;
    }

    // Normalize Direction
    const startPin = pinA.dir === "out" ? pinA : pinB;
    const endPin = pinA.dir === "in" ? pinA : pinB;

    // 2. Duplicate Check
    const exists = this._connectionExists(startPin, endPin);
    if (exists) return;

    // 3. Break Single-Link Outputs/Inputs
    if (endPin.getMaxLinks() === 1 && endPin.isConnected()) {
      this.controller.breakPinLinks(endPin.id);
    }

    // 4. Input Node Check (Auto-Conversion)
    const converted = this._tryAutoConversion(startPin, endPin);
    if (converted) return; // Conversion node created and linked

    // 5. Validation
    const validation = this.typeValidator.canConnect(startPin, endPin);
    if (!validation.valid) {
      console.error(`[Wiring] ${validation.reason}`);
      return;
    }
    if (validation.warning) {
      console.warn(`[Wiring] ${validation.warning}`);
    }

    // 6. Finalize Connection
    this.controller.createLink(startPin, endPin);
  }

  _connectionExists(startPin, endPin) {
    return startPin.links.some((id) => {
      const link = this.manager.findLink(id);
      return link && link.endPin.id === endPin.id;
    });
  }

  _tryAutoConversion(startPin, endPin) {
    const isExec = startPin.type === "exec" || endPin.type === "exec";
    if (isExec) return false;
    if (startPin.type === endPin.type) return false;

    const convKey = Utils.getConversionNodeKey(startPin.type, endPin.type);
    if (!convKey) return false;

    // Calculate position
    const startPos = Utils.getPinPosition(startPin.element, this.app);
    const endPos = Utils.getPinPosition(endPin.element, this.app);
    const midX = (startPos.x + endPos.x) / 2;
    const midY = (startPos.y + endPos.y) / 2;

    const convNode = this.app.graph.addNode(convKey, midX - 40, midY - 15);
    if (!convNode) return false;

    // Configure Titles
    this._configureConversionTitle(convNode, convKey, startPin, endPin);

    const convIn = convNode.findPinById(`${convNode.id}-val_in`);
    const convOut = convNode.findPinById(`${convNode.id}-val_out`);

    if (convIn && convOut) {
      this.controller.createLink(startPin, convIn);
      this.controller.createLink(convOut, endPin);

      // Force refresh
      this.renderer.updateNodeVisuals(convNode);
      return true;
    }

    // Failed setup
    convNode.element.remove();
    this.app.graph.nodes.delete(convNode.id);
    return false;
  }

  _configureConversionTitle(node, key, startPin, endPin) {
    if (startPin.node.variableId || endPin.node.variableId) {
      node.title = `Convert ${startPin.type.toUpperCase()} to ${endPin.type.toUpperCase()}`;
    } else if (key.includes("ToString")) {
      const sourceType =
        startPin.type.charAt(0).toUpperCase() + startPin.type.slice(1);
      node.title = `To String (${sourceType})`;
    }
  }

  /**
   * Reroute node creation on double-click.
   */
  handleDoubleClick(link, e) {
    if (this.app.simulation && this.app.simulation.isRunning) return;

    const graphPos = this.app.graph.getGraphCoords(e.clientX, e.clientY);
    const wireType = link.startPin.type;

    // Capture original link endpoints before breaking
    const originalStartPin = link.startPin;
    const originalEndPin = link.endPin;

    // Break original link first
    this.controller.breakLink(link.id);

    // Create Reroute Node - center it on click position (16x16 node, so offset by half = 8)
    const node = this.app.graph.addNode(
      "Reroute",
      graphPos.x - 8,
      graphPos.y - 8
    );
    if (!node) return;

    // Propagate Type
    node.pins.forEach((p) => (p.type = wireType));
    node.refreshPinCache();
    node.updateRerouteVisuals();

    // Defer link creation until pin elements are in DOM
    // addNode appends to DOM, but we need a frame for elements to settle
    requestAnimationFrame(() => {
      console.log("[Reroute] Creating links:", {
        startPin: originalStartPin.id,
        rerouteIn: node.pinsIn[0]?.id,
        rerouteOut: node.pinsOut[0]?.id,
        endPin: originalEndPin.id,
        rerouteInElement: node.pinsIn[0]?.element?.isConnected,
        rerouteOutElement: node.pinsOut[0]?.element?.isConnected,
      });

      if (node.pinsIn[0] && node.pinsOut[0]) {
        this.controller.createLink(originalStartPin, node.pinsIn[0]);
        this.controller.createLink(node.pinsOut[0], originalEndPin);
      } else {
        console.error("[Reroute] Pins not found on reroute node");
      }
      // NOTE: Do NOT call updateNodeVisuals here - it replaces pin elements
      // and breaks the link references. The node is already freshly rendered by addNode.
      this.app.persistence.autoSave();
    });
  }
}
