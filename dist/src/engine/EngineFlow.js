/**
 * EngineFlow.js
 *
 * Manages the Blueprint Execution Flow (Graph Traversal).
 * Handles execution pins, stepping, pausing, and node logic evaluation.
 */
export class EngineFlow {
  /**
   * @param {SimulationEngine} engine - Reference to the main engine instance
   */
  constructor(engine) {
    this.engine = engine;

    // Call Stack & Debugging
    this.callStack = [];
    this.resolveStep = null; // Promise resolver for stepping
  }

  /**
   * Asynchronously follows the execution flow from a starting node.
   * @param {Node} startNode - The node to begin execution from.
   * @param {string} [startPinId] - Optional specific output pin ID to start from (e.g. 'update').
   */
  async executeFlow(startNode, startPinId = null) {
    let currentInputPin = null;
    let currentNode = startNode;

    // Safety limiter to prevent infinite loops crashing the browser
    let steps = 0;
    const maxSteps = 5000;

    // If a specific start pin is requested (like 'update' on Timeline), we need to find the connected node first.
    // However, the original logic started with currentNode as startNode, executed its logic, then found the output pin.
    // For 'update' calls from EngineLoop, the logic has already run (state updated). We just need to trigger the downstream flow.
    // Special Case: Direct Exec Trigger (bypass executeNodeLogic for the first node if startPinId is provided??)
    // Actually, EngineLoop says: executeFlow(node, "update").
    // The original logic executed node logic, then looked for output pin.
    // Let's preserve the loop structure.

    while (currentNode && this.engine.isRunning && steps < maxSteps) {
      steps++;

      try {
        // --- PAUSE / STEPPING LOGIC ---
        await this.handleStepping(currentNode);

        // --- EXECUTE LOGIC ---
        let nextPinId = null;

        // If this is the FIRST step and we have a specific startPinId (e.g. Timeline Update),
        // we might verify that pin exists, but usually we just executed logic.
        // Wait, for Timeline, 'update' IS the output pin we want to fire. We don't re-execute logic there?
        // The original logic ran executeNodeLogic. TimelineExecutor.execute returns null usually?

        // Execute Node Logic
        // Note: Logic is skipped for the START node if startPinId is provided??
        // No, original code ran executor.execute(node).
        // For Timeline, executor.execute returns null.

        const executor = this.engine.executorRegistry.getExecutor(
          currentNode.nodeKey
        );

        if (executor) {
          // We pass startPinId only if it's relevant to the execution? No, original didn't use it in executeNodeLogic.
          nextPinId = await executor.execute(currentNode, currentInputPin);
        } else {
          this.engine.ui.log(
            `Unknown node type: ${currentNode.nodeKey}`,
            "error"
          );
        }

        // Override nextPinId if startPinId dictates the flow (e.g. Timeline firing 'update')
        if (steps === 1 && startPinId) {
          nextPinId = startPinId;
        }

        // --- FIND OUTPUT PIN ---
        let outPin = null;

        if (nextPinId) {
          // Precise pin selection (Multi-Gate, Branch True/False, Sequence Then_0)
          outPin = currentNode.findPinById(`${currentNode.id}-${nextPinId}`);
          // Fallback if ID doesn't include node ID (legacy or just pin Name)
          if (!outPin)
            outPin = currentNode.pinsOut.find(
              (p) => p.id === nextPinId || p.name === nextPinId
            );
        } else {
          // Default: look for the first execution output pin
          outPin = currentNode.pinsOut.find((p) => p.type === "exec");
        }

        // If no valid output pin or it's unconnected, stop flow
        if (!outPin || !outPin.isConnected()) {
          currentNode = null;
          break;
        }

        // --- TRAVERSE WIRE ---
        // Execution pins only have one outgoing link
        const linkId = outPin.links[0];
        const link = this.engine.app.wiring.links.get(linkId);

        if (link) {
          this.engine.app.wiring.setWireActive(linkId); // Visual Pulse
          currentNode = link.endPin.node;
          currentInputPin = link.endPin;
        } else {
          currentNode = null;
        }
      } catch (error) {
        this.engine.ui.log(
          `Runtime Error at ${currentNode.title}: ${error.message}`,
          "error"
        );
        console.error(error);
        this.engine.stop();
        break;
      }
    }

    if (steps >= maxSteps) {
      this.engine.ui.log(
        "Infinite loop detected or max steps reached. Stopping.",
        "error"
      );
      this.engine.stop();
    }
  }

  /**
   * Handles breakpoint and stepping suspension.
   */
  async handleStepping(node) {
    let shouldPause = false;
    const stackDepth = this.callStack.length;

    if (this.engine.isStepping) {
      if (this.engine.stepMode === "into") {
        shouldPause = true;
      } else if (this.engine.stepMode === "over") {
        if (stackDepth <= this.engine.stepOverStackDepth) shouldPause = true;
      } else if (this.engine.stepMode === "out") {
        if (stackDepth < this.engine.stepOutStackDepth) shouldPause = true;
      }
    } else if (
      this.engine.app.breakpointManager &&
      this.engine.app.breakpointManager.shouldBreak(node.id)
    ) {
      shouldPause = true;
      this.engine.ui.log(`Breakpoint hit at: ${node.title}`, "warning");
    } else if (this.engine.isPaused) {
      // Manual pause triggered externally
      shouldPause = true;
    }

    if (shouldPause) {
      this.engine.pause(node);
      // specific promise approach to halt execution
      await new Promise((resolve) => (this.resolveStep = resolve));
      // Reset logic after resume is handled in Engine.resume()
    }
  }

  resume() {
    if (this.resolveStep) {
      const resolve = this.resolveStep;
      this.resolveStep = null;
      resolve();
    }
  }
}
