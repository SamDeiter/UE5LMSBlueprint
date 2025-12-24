/**
 * EngineLoop.js
 *
 * Manages the high-performance 'Tick' loop and Timeline updates.
 * Handles requestAnimationFrame and delta time calculations.
 */
export class EngineLoop {
  /**
   * @param {SimulationEngine} engine - Reference to the main engine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.tickFrame = null;
    this.lastTickTime = 0;
    this.timelines = new Map();
  }

  /**
   * Starts the simulation tick loop.
   */
  start() {
    this.lastTickTime = window.performance.now();
    this.tickFrame = window.requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Stops the simulation tick loop.
   */
  stop() {
    if (this.tickFrame) {
      window.cancelAnimationFrame(this.tickFrame);
      this.tickFrame = null;
    }
  }

  /**
   * The core game loop function.
   * @param {number} timestamp - Current high-res timestamp from requestAnimationFrame
   */
  tick(timestamp) {
    if (!this.engine.isRunning) return;

    // Paused Logic: Keep loop alive but static
    if (this.engine.isPaused) {
      this.tickFrame = window.requestAnimationFrame(this.tick.bind(this));
      return;
    }

    // Delta Time
    const deltaTime = (timestamp - this.lastTickTime) / 1000; // Seconds
    this.lastTickTime = timestamp;

    try {
      this.processTickNodes(deltaTime);
      this.processTimelines(deltaTime);
    } catch (error) {
      this.engine.ui.log(
        `Runtime Error in Tick Loop: ${error.message}`,
        "error"
      );
      console.error(error);
      this.engine.stop(); // Emergency Stop
      return;
    }

    this.tickFrame = window.requestAnimationFrame(this.tick.bind(this));
  }

  /**
   * Finds and executes all EventTick nodes.
   * @param {number} deltaTime - Time in seconds since last frame
   */
  processTickNodes(deltaTime) {
    // 1. Find all EventTick nodes
    const tickNodes = [...this.engine.app.graph.nodes.values()].filter(
      (n) => n.nodeKey === "EventTick"
    );

    // 2. Execute them
    tickNodes.forEach((node) => {
      // Store delta time in a temp property so evaluateNodeValue can find it
      node.tempValues = { delta_seconds_out: deltaTime };
      this.engine.flow.executeFlow(node);
    });
  }

  /**
   * Updates all active Timelines.
   * @param {number} deltaTime - Time in seconds since last frame
   */
  processTimelines(deltaTime) {
    this.timelines.forEach((state, nodeId) => {
      if (!state.isPlaying) return;

      // Update time
      state.currentTime += deltaTime * state.direction;

      // Handle boundaries
      let finished = false;
      if (state.direction > 0 && state.currentTime >= state.length) {
        if (state.loop) {
          state.currentTime = 0;
        } else {
          state.currentTime = state.length;
          state.isPlaying = false;
          finished = true;
        }
      } else if (state.direction < 0 && state.currentTime <= 0) {
        if (state.loop) {
          state.currentTime = state.length;
        } else {
          state.currentTime = 0;
          state.isPlaying = false;
          finished = true;
        }
      }

      // Calculate Alpha (0-1)
      const alpha = Math.max(0, Math.min(1, state.currentTime / state.length));

      // Get the node to update its temp values
      const node = this.engine.app.graph.nodes.get(nodeId);
      if (node) {
        node.tempValues = {
          alpha: alpha,
          direction: state.direction,
        };

        // Fire 'Update' pin
        this.engine.flow.executeFlow(node, "update");

        if (finished) {
          this.engine.flow.executeFlow(node, "finished");
        }
      }
    });
  }
}
