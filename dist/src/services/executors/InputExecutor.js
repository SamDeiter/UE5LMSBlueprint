/**
 * InputExecutor - Handles Enhanced Input System nodes
 * Simulates UE5's Enhanced Input for educational purposes
 */
import { BaseExecutor } from "./BaseExecutor.js";

export class InputExecutor extends BaseExecutor {
  constructor(engine) {
    super(engine);

    // Track keyboard state for simulation
    this.keysDown = new Set();
    this.inputActions = new Map(); // action name -> { value, triggered, elapsedTime }
    this.mappingContexts = new Map(); // context name -> priority

    // Set up keyboard listeners for simulation
    this.setupKeyboardListeners();
  }

  /**
   * Setup keyboard listeners for interactive simulation
   */
  setupKeyboardListeners() {
    document.addEventListener("keydown", (e) => {
      if (!this.engine.isRunning) return;

      const key = this.normalizeKeyName(e.key);
      if (!this.keysDown.has(key)) {
        this.keysDown.add(key);
        this.updateInputActions(key, true);
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!this.engine.isRunning) return;

      const key = this.normalizeKeyName(e.key);
      this.keysDown.delete(key);
      this.updateInputActions(key, false);
    });
  }

  /**
   * Normalize key names to UE5 style
   */
  normalizeKeyName(key) {
    const keyMap = {
      " ": "SpaceBar",
      ArrowUp: "Up",
      ArrowDown: "Down",
      ArrowLeft: "Left",
      ArrowRight: "Right",
      Control: "LeftCtrl",
      Shift: "LeftShift",
      Alt: "LeftAlt",
      Enter: "Enter",
      Escape: "Escape",
      Tab: "Tab",
    };
    return keyMap[key] || key.toUpperCase();
  }

  /**
   * Update input action states based on key events
   */
  updateInputActions(key, isDown) {
    // Simple mapping: WASD -> IA_Move, Space -> IA_Jump
    const actionMappings = {
      W: { action: "IA_Move", axis: { x: 0, y: 1, z: 0 } },
      S: { action: "IA_Move", axis: { x: 0, y: -1, z: 0 } },
      A: { action: "IA_Move", axis: { x: -1, y: 0, z: 0 } },
      D: { action: "IA_Move", axis: { x: 1, y: 0, z: 0 } },
      SpaceBar: { action: "IA_Jump", axis: { x: 0, y: 0, z: 1 } },
      LeftShift: { action: "IA_Sprint", axis: { x: 1, y: 0, z: 0 } },
    };

    const mapping = actionMappings[key];
    if (mapping) {
      const actionName = mapping.action;
      const existing = this.inputActions.get(actionName) || {
        value: { x: 0, y: 0, z: 0 },
        triggered: false,
        elapsedTime: 0,
        triggeredTime: 0,
      };

      if (isDown) {
        existing.value.x += mapping.axis.x;
        existing.value.y += mapping.axis.y;
        existing.value.z += mapping.axis.z;
        existing.triggered = true;
      } else {
        existing.value.x -= mapping.axis.x;
        existing.value.y -= mapping.axis.y;
        existing.value.z -= mapping.axis.z;
        // Only untrigger if all axes are zero
        if (
          existing.value.x === 0 &&
          existing.value.y === 0 &&
          existing.value.z === 0
        ) {
          existing.triggered = false;
        }
      }

      this.inputActions.set(actionName, existing);
    }
  }

  /**
   * Execute impure input nodes
   */
  async execute(node) {
    switch (node.nodeKey) {
      case "AddMappingContext":
        return this.executeAddMappingContext(node);
      case "RemoveMappingContext":
        return this.executeRemoveMappingContext(node);
      case "EnhancedInputAction":
        // Event nodes don't execute logic, they're triggered by events
        return null;
      default:
        return null;
    }
  }

  /**
   * Evaluate pure input nodes
   */
  evaluateValue(node, pin) {
    switch (node.nodeKey) {
      case "GetInputActionValue":
        return this.evaluateGetInputActionValue(node, pin);
      case "IsInputKeyDown":
        return this.evaluateIsInputKeyDown(node, pin);
      case "GetInputAxisValue":
        return this.evaluateGetInputAxisValue(node, pin);
      case "EnhancedInputAction":
        return this.evaluateEnhancedInputAction(node, pin);
      default:
        return null;
    }
  }

  /**
   * Add Mapping Context - registers an input context
   */
  executeAddMappingContext(node) {
    const mappingContext = this.evaluateInput(node, "mapping_context_in");
    const priority = parseInt(this.evaluateInput(node, "priority_in")) || 0;

    const contextName = mappingContext?.name || "DefaultContext";
    this.mappingContexts.set(contextName, priority);

    this.log(
      `Added Mapping Context: ${contextName} (Priority: ${priority})`,
      "success"
    );
    return "exec_out";
  }

  /**
   * Remove Mapping Context
   */
  executeRemoveMappingContext(node) {
    const mappingContext = this.evaluateInput(node, "mapping_context_in");
    const contextName = mappingContext?.name || "DefaultContext";

    if (this.mappingContexts.has(contextName)) {
      this.mappingContexts.delete(contextName);
      this.log(`Removed Mapping Context: ${contextName}`, "info");
    }

    return "exec_out";
  }

  /**
   * Evaluate Enhanced Input Action outputs
   */
  evaluateEnhancedInputAction(node, pin) {
    const actionName = node.customData?.inputAction || "IA_Move";
    const actionState = this.inputActions.get(actionName) || {
      value: { x: 0, y: 0, z: 0 },
      triggered: false,
      elapsedTime: 0,
      triggeredTime: 0,
    };

    switch (pin.id) {
      case "action_value_out":
        return actionState.value;
      case "elapsed_time_out":
        return actionState.elapsedTime;
      case "triggered_time_out":
        return actionState.triggeredTime;
      default:
        return null;
    }
  }

  /**
   * Get Input Action Value - pure node
   */
  evaluateGetInputActionValue(node, pin) {
    const actionName = this.evaluateInput(node, "action_in") || "IA_Move";
    const actionState = this.inputActions.get(actionName) || {
      value: { x: 0, y: 0, z: 0 },
      triggered: false,
    };

    switch (pin.id) {
      case "value_out":
        return actionState.value;
      case "triggered_out":
        return actionState.triggered;
      default:
        return null;
    }
  }

  /**
   * Is Input Key Down - checks if a specific key is pressed
   */
  evaluateIsInputKeyDown(node, pin) {
    if (pin.id !== "is_down_out") return null;

    const keyName = this.evaluateInput(node, "key_in") || "SpaceBar";
    return this.keysDown.has(keyName);
  }

  /**
   * Get Input Axis Value - legacy axis input
   */
  evaluateGetInputAxisValue(node, pin) {
    if (pin.id !== "value_out") return null;

    const axisName = this.evaluateInput(node, "axis_in") || "MoveForward";

    // Map axis names to keyboard
    const axisMappings = {
      MoveForward: () =>
        (this.keysDown.has("W") ? 1 : 0) - (this.keysDown.has("S") ? 1 : 0),
      MoveRight: () =>
        (this.keysDown.has("D") ? 1 : 0) - (this.keysDown.has("A") ? 1 : 0),
      Turn: () =>
        (this.keysDown.has("Right") ? 1 : 0) -
        (this.keysDown.has("Left") ? 1 : 0),
      LookUp: () =>
        (this.keysDown.has("Up") ? 1 : 0) - (this.keysDown.has("Down") ? 1 : 0),
    };

    const axisFunc = axisMappings[axisName];
    return axisFunc ? axisFunc() : 0.0;
  }

  /**
   * Clean up on simulation stop
   */
  reset() {
    this.keysDown.clear();
    this.inputActions.clear();
    // Keep mapping contexts as they persist across play sessions
  }
}
