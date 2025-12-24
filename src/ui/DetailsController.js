/**
 * DetailsController - Manages the details panel for nodes and variables
 * Refactored to delegate to specialized sub-controllers.
 */
import { DetailsTypeSelector } from "./DetailsTypeSelector.js";
import { ClassDefaultsRenderer } from "./ClassDefaultsRenderer.js";

// Sub-controllers
import { VariableDetails } from "./details/VariableDetails.js";
import { FunctionDetails } from "./details/FunctionDetails.js";
import { ComponentDetails } from "./details/ComponentDetails.js";
import { NodeDetails } from "./details/NodeDetails.js";
import { ClassDetails } from "./details/ClassDetails.js";

export class DetailsController {
  constructor(app) {
    this.app = app;
    this.panel = document.getElementById("details-panel");
    this.currentVariable = null;
    this.typeSelector = new DetailsTypeSelector(this);

    // Initialize sub-controllers
    this.variableDetails = new VariableDetails(this);
    this.functionDetails = new FunctionDetails(this);
    this.componentDetails = new ComponentDetails(this);
    this.nodeDetails = new NodeDetails(this);
    this.classDetails = new ClassDetails(this);

    this.clear();
  }

  clear() {
    this.panel.innerHTML =
      '<p style="color: #aaa; padding: 15px;">Select a node or variable to see details.</p>';
    this.currentVariable = null;
  }

  // --- Delegation Methods ---

  showVariableDetails(variable, isPrimarySelection = false) {
    this.variableDetails.show(variable, isPrimarySelection);
  }

  addArrayElement(varId) {
    this.variableDetails.addArrayElement(varId);
  }

  removeArrayElement(varId, index) {
    this.variableDetails.removeArrayElement(varId, index);
  }

  clearArrayElements(varId) {
    this.variableDetails.clearArrayElements(varId);
  }

  addMapElement(varId) {
    this.variableDetails.addMapElement(varId);
  }

  removeMapElement(varId, index) {
    this.variableDetails.removeMapElement(varId, index);
  }

  clearMapElements(varId) {
    this.variableDetails.clearMapElements(varId);
  }

  showNodeDetails(node) {
    this.nodeDetails.show(node);
  }

  addCustomParameter(node) {
    this.nodeDetails.addCustomParameter(node);
  }

  removeCustomParameter(node, pinId) {
    this.nodeDetails.removeCustomParameter(node, pinId);
  }

  renderCustomParameters(node) {
    this.nodeDetails.renderCustomParameters(node);
  }

  showComponentDetails(component) {
    this.componentDetails.show(component);
  }

  showCustomEventDetails(node) {
    this.nodeDetails.showCustomEventDetails(node);
  }

  showFunctionDetails(func) {
    this.functionDetails.show(func);
  }

  renderFunctionParameters(func) {
    this.functionDetails.renderFunctionParameters(func);
  }

  showClassSettings() {
    this.classDetails.showSettings();
  }

  // Kept here for now as it uses a separate renderer already
  showClassDefaults() {
    if (!this.classDefaultsRenderer) {
      this.classDefaultsRenderer = new ClassDefaultsRenderer(this);
    }
    this.classDefaultsRenderer.render();
  }

  /**
   * Add an event node to the graph based on event name
   * Kept in controller as it's an action, not a details view
   */
  addEventNodeToGraph(eventName) {
    // Map event names to node keys (create custom event nodes if needed)
    const eventNodeMap = {
      OnTakeAnyDamage: "EventOnTakeAnyDamage",
      OnTakePointDamage: "EventOnTakePointDamage",
      OnTakeRadialDamage: "EventOnTakeRadialDamage",
      OnActorBeginOverlap: "EventActorBeginOverlap",
      OnActorEndOverlap: "EventActorEndOverlap",
      OnBeginCursorOver: "EventOnBeginCursorOver",
      OnEndCursorOver: "EventOnEndCursorOver",
      OnClicked: "EventOnClicked",
      OnReleased: "EventOnReleased",
      OnInputTouchBegin: "EventOnInputTouchBegin",
      OnInputTouchEnd: "EventOnInputTouchEnd",
      OnActorHit: "EventOnActorHit",
      OnDestroyed: "EventOnDestroyed",
      OnEndPlay: "EventOnEndPlay",
    };

    const nodeKey = eventNodeMap[eventName];
    if (nodeKey && this.app.graph) {
      // Find a good position for the new node
      const x = 200 + Math.random() * 100;
      const y = 200 + Math.random() * 300;

      this.app.graph.addNode(nodeKey, x, y);
      this.app.history.saveState(`Added ${eventName} event`);

      // Log to compiler results
      if (this.app.compiler && this.app.compiler.log) {
        this.app.compiler.log(
          `Added ${eventName} event node to graph`,
          "success"
        );
      }
    } else {
      console.warn(`Event node ${eventName} not found in node definitions`);
    }
  }

  // Proxy methods for compatibility if any external code calls them directly
  // Ideally these should be removed or moved to DetailsRenderer entirely
  // renderVariableDefaultInput removed (zombie code using require)

  bindVariableDefaultInputs() {
    // This was internal logic, now handled inside VariableDetails.show()
  }

  updateReplicationDependents(enabled) {
    // Used by NodeDetails internally
    this.nodeDetails.updateReplicationDependents(enabled);
  }

  updateSpatialDependents(enabled) {
    // Used by ComponentDetails/NodeDetails internally
    // Not currently implemented in the extracted files?
    // It was in the original file but only definition, mostly unused?
    // Let's keep it safe.
    this.panel.querySelectorAll(".spatial-dependent").forEach((row) => {
      row.style.opacity = enabled ? "1" : "0.5";
      const inputs = row.querySelectorAll("input, select");
      inputs.forEach((input) => {
        input.disabled = !enabled;
      });
    });
  }
}
