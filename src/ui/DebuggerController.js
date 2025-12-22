export class DebuggerController {
  constructor(app) {
    this.app = app;
    this.panel = null;
    this.watchPanel = null;
    this.watchedPins = new Set();
    this.createPanel();
    this.createWatchPanel();
  }

  createPanel() {
    this.panel = document.createElement("div");
    this.panel.id = "call-stack-panel";
    this.panel.className = "debug-floating-panel hidden";
    this.panel.innerHTML =
      '<div class="debug-panel-title">Call Stack</div><div id="call-stack-list"></div>';

    const editor = document.getElementById("graph-editor");
    if (editor) {
      editor.appendChild(this.panel);
    }
  }

  update() {
    this.updateWatchPanel();
    const list = this.panel.querySelector("#call-stack-list");
    if (!list) return;

    list.innerHTML = "";

    const stack = this.app.sim.callStack;
    // Only show if we are paused or have a stack
    if (stack.length === 0 && !this.app.sim.isPaused) {
      this.panel.classList.add("hidden");
      return;
    }

    this.panel.classList.remove("hidden");

    // 1. Current Frame (Active Graph)
    const currentFrame = document.createElement("div");
    currentFrame.textContent = `> ${this.app.activeGraph}`;
    currentFrame.className = "stack-frame-current";

    currentFrame.addEventListener("click", () => {
      this.app.switchGraph(this.app.activeGraph);
    });
    list.appendChild(currentFrame);

    // 2. Stack Frames (Reverse Order)
    for (let i = stack.length - 1; i >= 0; i--) {
      const frame = stack[i];
      const el = document.createElement("div");
      el.textContent = frame.callerGraph;
      el.className = "stack-frame-item";

      el.addEventListener("click", () => {
        // Switch to that graph
        this.app.switchGraph(frame.callerGraph);
        // Highlight the caller node
        const callerNode = this.app.graph.nodes.get(frame.callerNodeId);
        if (callerNode) {
          this.app.graph.selectNode(callerNode.id);
          // Optional: Pan to it
          // this.app.graph.panToNode(callerNode);
        }
      });
      list.appendChild(el);
    }
  }

  createWatchPanel() {
    this.watchPanel = document.createElement("div");
    this.watchPanel.id = "watch-panel";
    this.watchPanel.className = "debug-floating-panel hidden";
    this.watchPanel.innerHTML =
      '<div class="debug-panel-title">Watched Values</div><div id="watch-list"></div>';

    const editor = document.getElementById("graph-editor");
    if (editor) {
      editor.appendChild(this.watchPanel);
    }
  }

  addWatch(pin) {
    this.watchedPins.add(pin.id);
    this.updateWatchPanel();
    this.watchPanel.classList.remove("hidden");
  }

  updateWatchPanel() {
    const list = this.watchPanel.querySelector("#watch-list");
    if (!list) return;
    list.innerHTML = "";

    if (this.watchedPins.size === 0) {
      this.watchPanel.classList.add("hidden");
      return;
    }

    this.watchedPins.forEach((pinId) => {
      let pin = null;
      // Search in all nodes
      for (const node of this.app.graph.nodes.values()) {
        pin = node.findPinById(pinId);
        if (pin) break;
      }

      if (pin) {
        const row = document.createElement("div");
        row.className = "d-flex justify-between mb-1";

        // Get value from node's tempValues or literals
        let val = "N/A";
        if (
          pin.node.tempValues &&
          pin.node.tempValues[pin.name] !== undefined
        ) {
          val = pin.node.tempValues[pin.name];
        } else if (pin.node.pinLiterals.has(pin.id)) {
          val = pin.node.pinLiterals.get(pin.id);
        }

        row.innerHTML = `<span class="text-muted">${pin.node.title}.${pin.name}:</span> <span class="text-success">${val}</span>`;
        list.appendChild(row);
      }
    });

    if (this.watchedPins.size > 0) {
      this.watchPanel.classList.remove("hidden");
    }
  }
  /**
   * Phase 6: Create a watch bubble positioned next to a pin
   */
  createWatchBubble(pin, value) {
    // Remove existing bubble for this pin
    this.removeWatchBubble(pin.id);

    const pinDot = pin.node.element?.querySelector(
      `[data-pin-id="${pin.id}"] .pin-dot`
    );
    if (!pinDot) return;

    const bubble = document.createElement("div");
    bubble.className = "watch-bubble";
    bubble.id = `watch-bubble-${pin.id}`;

    // Create close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "watch-bubble-close";
    closeBtn.innerHTML = "×";
    closeBtn.title = "Stop watching this value";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.removeWatchBubble(pin.id);
      this.watchedPins.delete(pin.id);
      this.updateWatchPanel();
    });

    bubble.innerHTML = `<span class="bubble-label">${
      pin.name
    }:</span><span class="bubble-value">${this.formatValue(value)}</span>`;
    bubble.appendChild(closeBtn);

    // Position relative to pin
    const rect = pinDot.getBoundingClientRect();
    const editorRect = document
      .getElementById("graph-editor")
      .getBoundingClientRect();

    bubble.style.left = `${rect.right - editorRect.left + 10}px`;
    bubble.style.top = `${rect.top - editorRect.top + rect.height / 2 - 12}px`;

    const editor = document.getElementById("graph-editor");
    if (editor) {
      editor.appendChild(bubble);
    }

    // Track previous value for change detection
    bubble.dataset.previousValue = String(value);
  }

  /**
   * Update a watch bubble value and highlight if changed
   */
  updateWatchBubble(pin, value) {
    const bubble = document.getElementById(`watch-bubble-${pin.id}`);
    if (!bubble) {
      this.createWatchBubble(pin, value);
      return;
    }

    const valueEl = bubble.querySelector(".bubble-value");
    const previousValue = bubble.dataset.previousValue;
    const newValue = String(value);

    if (previousValue !== newValue) {
      valueEl.textContent = this.formatValue(value);
      valueEl.classList.add("value-changed");
      bubble.dataset.previousValue = newValue;

      // Remove flash class after animation
      setTimeout(() => valueEl.classList.remove("value-changed"), 300);
    }
  }

  /**
   * Remove a watch bubble
   */
  removeWatchBubble(pinId) {
    const bubble = document.getElementById(`watch-bubble-${pinId}`);
    if (bubble) bubble.remove();
  }

  /**
   * Clear all watch bubbles
   */
  clearAllBubbles() {
    document.querySelectorAll(".watch-bubble").forEach((b) => b.remove());
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    if (value === undefined || value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }
}
