/**
 * EngineUI.js
 *
 * Manages the User Interface updates and logging for the Simulation Engine.
 * Decouples DOM interaction from core simulation logic.
 */
export class EngineUI {
  /**
   * @param {SimulationEngine} engine - Reference to the main engine instance
   */
  constructor(engine) {
    this.engine = engine;
    this.outputPanel = document.getElementById("compiler-results");

    // Controls
    this.playBtn = document.getElementById("play-btn");
    this.stopBtn = document.getElementById("stop-btn");
    this.stepBtn = document.getElementById("step-btn");
    this.stepIntoBtn = document.getElementById("step-into-btn");
    this.stepOutBtn = document.getElementById("step-out-btn");

    // Debug Controls Group
    this.debugControls = document.querySelector(".debug-controls");
  }

  /**
   * Updates the visual state of the Play/Stop/Debug buttons and Editor classes.
   */
  update() {
    // 1. Play Button State
    if (this.playBtn) {
      const needsCompile =
        this.engine.app.compiler && this.engine.app.compiler.isDirty;

      // Disabled if running (and not paused) OR needs compile
      this.playBtn.disabled =
        (this.engine.isRunning && !this.engine.isPaused) || needsCompile;
      this.playBtn.textContent = this.engine.isPaused ? "Resume" : "Play";

      // "Needs Compile" Visual Feedback
      if (needsCompile && !this.engine.isRunning) {
        this.playBtn.title = "Compile the blueprint first (Ctrl+Shift+C)";
        this.playBtn.classList.add("needs-compile");
      } else {
        this.playBtn.title = "";
        this.playBtn.classList.remove("needs-compile");
      }
    }

    // 2. Stop Button State
    if (this.stopBtn) {
      this.stopBtn.disabled = !this.engine.isRunning;
    }

    // 3. Stepping Buttons State (Only active when paused)
    const canStep = this.engine.isPaused;
    if (this.stepBtn) this.stepBtn.disabled = !canStep;
    if (this.stepIntoBtn) this.stepIntoBtn.disabled = !canStep;
    if (this.stepOutBtn) this.stepOutBtn.disabled = !canStep;

    // 4. Editor Visual State (Simulation Border/Overlay)
    const editor = this.engine.app.graph.editor;
    if (editor) {
      editor.classList.remove(
        "simulation-playing",
        "simulation-paused",
        "simulation-inactive"
      );

      if (this.engine.isPaused) {
        editor.classList.add("simulation-paused");
      } else if (this.engine.isRunning) {
        editor.classList.add("simulation-playing");
      } else {
        editor.classList.add("simulation-inactive");
      }
    }

    // 5. Debug Controls Visibility
    if (this.debugControls) {
      if (this.engine.isPaused) {
        this.debugControls.classList.remove("hidden");
      } else if (!this.engine.isRunning) {
        this.debugControls.classList.add("hidden");
      }
    }
  }

  /**
   * Logs a message to the compiler results panel.
   * @param {string} msg - The message to display.
   * @param {string} [type='log'] - 'log', 'error', or 'success'.
   */
  log(msg, type = "log") {
    if (!this.outputPanel) return;

    const div = document.createElement("div");
    div.textContent = `[Runtime] ${msg}`;

    switch (type) {
      case "error":
        div.className = "compiler-issue";
        break;
      case "success":
        div.className = "compiler-success";
        break;
      default:
        div.className = "compiler-log";
    }

    this.outputPanel.prepend(div);
  }
}
