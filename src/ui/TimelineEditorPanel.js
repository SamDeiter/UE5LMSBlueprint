import { TimelineDefinition } from "../timeline/TimelineDefinition.js";

/**
 * TimelineEditorPanel - Visual editor for Timeline keyframes and curves
 */
export class TimelineEditorPanel {
  constructor(app) {
    this.app = app;
    this.panel = null;
    this.timeline = null;
    this.currentTime = 0;
    this.isPlaying = false;
    this.selectedKeyframe = null;
    this.zoom = 1;
    this.scrollX = 0;

    this._animationId = null;
  }

  /**
   * Open the editor for a specific node
   */
  open(node) {
    // Get or create timeline definition for this node
    if (!node.timelineData) {
      node.timelineData = new TimelineDefinition(node.title);
      // Add default float track
      const track = node.timelineData.addTrack("Alpha", "float");
      track.addKeyframe(0, 0);
      track.addKeyframe(node.customProperties?.length || 5.0, 1);
    }

    this.timeline = node.timelineData;
    this.node = node;
    this.currentTime = 0;

    this._createPanel();
    this._render();
  }

  /**
   * Close the editor
   */
  close() {
    if (this._animationId) {
      window.cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
    if (this.panel && this.panel.parentNode) {
      this.panel.remove();
    }
    this.panel = null;
    this.timeline = null;
    this.isPlaying = false;
  }

  _createPanel() {
    // Remove existing panel
    const existing = document.getElementById("timeline-editor-panel");
    if (existing) existing.remove();

    this.panel = document.createElement("div");
    this.panel.id = "timeline-editor-panel";
    this.panel.className = "timeline-editor-panel";

    document.getElementById("graph-editor")?.appendChild(this.panel);
  }

  _render() {
    console.log(
      "[Timeline] _render called, tracks:",
      this.timeline?.tracks?.length
    );
    if (!this.panel || !this.timeline) {
      console.log("[Timeline] _render aborted: panel or timeline missing");
      return;
    }

    const tl = this.timeline;

    this.panel.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-title">
          <i class="fas fa-clock"></i>
          <span>${tl.name}</span>
          <button class="timeline-close-btn" title="Close"><i class="fas fa-times"></i></button>
        </div>
        <div class="timeline-controls">
          <button id="tl-play-btn" class="tl-btn ${
            this.isPlaying ? "active" : ""
          }" title="Play">
            <i class="fas ${this.isPlaying ? "fa-pause" : "fa-play"}"></i>
          </button>
          <button id="tl-stop-btn" class="tl-btn" title="Stop">
            <i class="fas fa-stop"></i>
          </button>
          <label class="tl-checkbox">
            <input type="checkbox" id="tl-loop" ${tl.loop ? "checked" : ""}>
            Loop
          </label>
          <div class="tl-length">
            <label>Length:</label>
            <input type="number" id="tl-length-input" value="${
              tl.length
            }" min="0.1" step="0.5">s
          </div>
        </div>
      </div>

      <div class="timeline-body">
        <div class="timeline-ruler">
          ${this._renderRuler()}
        </div>
        <div class="timeline-tracks-container">
          ${this._renderTracks()}
        </div>
        <div class="timeline-playhead" style="left: ${this._timeToX(
          this.currentTime
        )}px"></div>
      </div>

      <div class="timeline-footer">
        <button id="tl-add-track-btn" class="tl-btn">
          <i class="fas fa-plus"></i> Add Track
        </button>
        <select id="tl-track-type-select">
          <option value="float">Float</option>
          <option value="vector">Vector</option>
          <option value="event">Event</option>
          <option value="color">Color</option>
        </select>
        <span class="tl-time-display">Time: ${this.currentTime.toFixed(
          2
        )}s</span>
      </div>
    `;

    this._bindEvents();
  }

  _renderRuler() {
    const tickCount = Math.ceil(this.timeline.length);
    let html = "";
    for (let i = 0; i <= tickCount; i++) {
      const x = this._timeToX(i);
      html += `<div class="ruler-tick" style="left: ${x}px">${i}s</div>`;
    }
    return html;
  }

  _renderTracks() {
    console.log(
      "[Timeline] _renderTracks called, count:",
      this.timeline.tracks.length
    );
    if (this.timeline.tracks.length === 0) {
      return '<div class="no-tracks">No tracks. Add a track to begin.</div>';
    }

    return this.timeline.tracks
      .map((track) => {
        const color = this._getTrackColor(track.type);
        return `
        <div class="timeline-track" data-track-id="${track.id}">
          <div class="track-header">
            <span class="track-color" style="background: ${color}"></span>
            <span class="track-name">${track.name}</span>
            <span class="track-type">(${track.type})</span>
            <button class="track-delete-btn" data-track-id="${
              track.id
            }" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="track-curve" data-track-id="${track.id}">
            <svg class="curve-svg" width="100%" height="50">
              ${this._renderCurve(track, color)}
            </svg>
            ${this._renderKeyframes(track)}
          </div>
        </div>
      `;
      })
      .join("");
  }

  _renderCurve(track, color) {
    if (track.keyframes.length < 2) return "";

    const points = [];
    const steps = 50;
    const height = 50;
    const pixelsPerSecond = 80 * this.zoom;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * this.timeline.length;
      let val = track.evaluate(t);

      // Normalize value for display
      if (track.type === "float") {
        val = Math.max(0, Math.min(1, val));
      } else if (track.type === "vector") {
        val = Math.max(0, Math.min(1, (val.x + val.y + val.z) / 3));
      } else {
        val = val > 0 ? 1 : 0;
      }

      // Use local coordinates (relative to track-curve container)
      const x = t * pixelsPerSecond;
      const y = height - val * (height - 4);
      points.push(`${x},${y}`);
    }

    return `<polyline points="${points.join(
      " "
    )}" fill="none" stroke="${color}" stroke-width="2"/>`;
  }

  _renderKeyframes(track) {
    const pixelsPerSecond = 80 * this.zoom;
    const height = 50; // Match SVG height

    return track.keyframes
      .map((kf) => {
        // Calculate X position from time
        const x = kf.time * pixelsPerSecond;

        // Calculate Y position from value (same formula as curve)
        let normalizedVal = 0;
        if (track.type === "float") {
          normalizedVal = Math.max(0, Math.min(1, kf.value));
        } else if (track.type === "vector") {
          normalizedVal = Math.max(
            0,
            Math.min(1, (kf.value.x + kf.value.y + kf.value.z) / 3)
          );
        } else {
          normalizedVal = kf.value > 0 ? 1 : 0;
        }
        const y = height - normalizedVal * (height - 4) - 6; // -6 to center 12px keyframe

        const isSelected = this.selectedKeyframe?.id === kf.id;
        return `
        <div class="keyframe ${isSelected ? "selected" : ""}"
             data-keyframe-id="${kf.id}"
             data-track-id="${track.id}"
             style="left: ${x}px; top: ${y}px"
             title="Time: ${kf.time.toFixed(2)}s, Value: ${this._formatValue(
          kf.value
        )}">
        </div>
      `;
      })
      .join("");
  }

  _timeToX(time) {
    const pixelsPerSecond = 80 * this.zoom;
    return 100 + time * pixelsPerSecond - this.scrollX;
  }

  _xToTime(x) {
    const pixelsPerSecond = 80 * this.zoom;
    return (x - 100 + this.scrollX) / pixelsPerSecond;
  }

  _getTrackColor(type) {
    const colors = {
      float: "#7FFF00", // Chartreuse
      vector: "#FFD700", // Gold
      event: "#FF6347", // Tomato
      color: "#9370DB", // Medium purple
    };
    return colors[type] || "#888";
  }

  _formatValue(val) {
    if (typeof val === "number") return val.toFixed(2);
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  }

  _bindEvents() {
    // Close button
    this.panel
      .querySelector(".timeline-close-btn")
      ?.addEventListener("click", () => {
        this.close();
      });

    // Play button
    this.panel.querySelector("#tl-play-btn")?.addEventListener("click", () => {
      this.isPlaying = !this.isPlaying;
      if (this.isPlaying) {
        this._startPlayback();
      } else {
        this._stopPlayback();
      }
      this._render();
    });

    // Stop button
    this.panel.querySelector("#tl-stop-btn")?.addEventListener("click", () => {
      this.isPlaying = false;
      this.currentTime = 0;
      this._stopPlayback();
      this._render();
    });

    // Loop checkbox
    this.panel.querySelector("#tl-loop")?.addEventListener("change", (e) => {
      this.timeline.loop = e.target.checked;
    });

    // Length input
    this.panel
      .querySelector("#tl-length-input")
      ?.addEventListener("change", (e) => {
        this.timeline.length = parseFloat(e.target.value) || 5.0;
        this._render();
      });

    // Add track button
    this.panel
      .querySelector("#tl-add-track-btn")
      ?.addEventListener("click", () => {
        console.log("[Timeline] Add Track clicked");
        const type = this.panel.querySelector("#tl-track-type-select").value;
        const name = `Track${this.timeline.tracks.length + 1}`;
        console.log(`[Timeline] Adding track: ${name} (${type})`);
        const track = this.timeline.addTrack(name, type);
        console.log("[Timeline] Track created:", track);

        // Add default keyframes
        track.addKeyframe(0, track.getDefaultValue());
        track.addKeyframe(
          this.timeline.length,
          type === "float" ? 1 : track.getDefaultValue()
        );
        console.log("[Timeline] Tracks count:", this.timeline.tracks.length);

        // Render UI first so tracks appear immediately
        this._render();
        console.log("[Timeline] Render complete");

        // Then try to update node pins (may fail if node doesn't support it)
        try {
          this._updateNodePins();
        } catch (err) {
          console.warn("[Timeline] Failed to update node pins:", err);
        }
      });

    // Delete track buttons
    this.panel.querySelectorAll(".track-delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const trackId = e.currentTarget.dataset.trackId;
        this.timeline.removeTrack(trackId);
        this._render();
        try {
          this._updateNodePins();
        } catch (err) {
          console.warn("[Timeline] Failed to update node pins:", err);
        }
      });
    });

    // Keyframe interaction
    this.panel.querySelectorAll(".keyframe").forEach((kf) => {
      kf.addEventListener("mousedown", (e) => {
        this._startKeyframeDrag(e);
      });

      kf.addEventListener("dblclick", (e) => {
        this._editKeyframe(e);
      });
    });

    // Click on track to add keyframe
    this.panel.querySelectorAll(".track-curve").forEach((curve) => {
      curve.addEventListener("dblclick", (e) => {
        if (e.target.classList.contains("keyframe")) return;
        this._addKeyframeAtClick(e);
      });
    });
  }

  _startPlayback() {
    let lastTime = window.performance.now();

    const tick = (now) => {
      if (!this.isPlaying) return;

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      this.currentTime += delta;

      if (this.currentTime >= this.timeline.length) {
        if (this.timeline.loop) {
          this.currentTime = 0;
        } else {
          this.currentTime = this.timeline.length;
          this.isPlaying = false;
          this._render();
          return;
        }
      }

      // Update playhead
      const playhead = this.panel?.querySelector(".timeline-playhead");
      if (playhead) {
        playhead.style.left = `${this._timeToX(this.currentTime)}px`;
      }

      const timeDisplay = this.panel?.querySelector(".tl-time-display");
      if (timeDisplay) {
        timeDisplay.textContent = `Time: ${this.currentTime.toFixed(2)}s`;
      }

      // Update node temp values
      if (this.node) {
        const values = this.timeline.evaluateAll(this.currentTime);
        this.node.tempValues = this.node.tempValues || {};
        Object.assign(this.node.tempValues, values);
      }

      this._animationId = requestAnimationFrame(tick);
    };

    this._animationId = requestAnimationFrame(tick);
  }

  _stopPlayback() {
    if (this._animationId) {
      window.cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }
  }

  _startKeyframeDrag(e) {
    e.preventDefault();
    const kfEl = e.target;
    const trackId = kfEl.dataset.trackId;
    const keyframeId = kfEl.dataset.keyframeId;

    const track = this.timeline.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const keyframe = track.keyframes.find((k) => k.id === keyframeId);
    if (!keyframe) return;

    this.selectedKeyframe = keyframe;

    const onMove = (moveE) => {
      // Get the track curve container for this track
      const trackCurve = this.panel.querySelector(
        `.track-curve[data-track-id="${trackId}"]`
      );
      if (!trackCurve) return;

      const rect = trackCurve.getBoundingClientRect();
      const x = moveE.clientX - rect.left;

      // Convert X to time using pixelsPerSecond (no offset needed for track-curve)
      const pixelsPerSecond = 80 * this.zoom;
      const newTime = Math.max(
        0,
        Math.min(this.timeline.length, x / pixelsPerSecond)
      );

      keyframe.time = newTime;
      track.keyframes.sort((a, b) => a.time - b.time);
      this._render();
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  _editKeyframe(e) {
    const trackId = e.target.dataset.trackId;
    const keyframeId = e.target.dataset.keyframeId;

    const track = this.timeline.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const keyframe = track.keyframes.find((k) => k.id === keyframeId);
    if (!keyframe) return;

    let newValue;
    if (track.type === "float") {
      newValue = parseFloat(
        window.prompt("Enter value (0-1):", keyframe.value) || keyframe.value
      );
    } else if (track.type === "vector") {
      const str = window.prompt(
        "Enter x,y,z:",
        `${keyframe.value.x},${keyframe.value.y},${keyframe.value.z}`
      );
      if (str) {
        const parts = str.split(",").map(Number);
        newValue = { x: parts[0] || 0, y: parts[1] || 0, z: parts[2] || 0 };
      }
    }

    if (newValue !== undefined) {
      keyframe.value = newValue;
      this._render();
    }
  }

  _addKeyframeAtClick(e) {
    const trackId = e.currentTarget.dataset.trackId;
    const track = this.timeline.tracks.find((t) => t.id === trackId);
    if (!track) return;

    const rect = this.panel
      .querySelector(".timeline-body")
      .getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, Math.min(this.timeline.length, this._xToTime(x)));

    // Interpolate value at this time
    const value = track.evaluate(time);
    track.addKeyframe(time, value);
    this._render();
  }

  _updateNodePins() {
    if (!this.node || !this.node.app) return;

    // Update customProperties
    this.node.customProperties = this.node.customProperties || {};
    this.node.customProperties.tracks = this.timeline.tracks.map((t) => t.name);
    this.node.customProperties.length = this.timeline.length;
    this.node.customProperties.loop = this.timeline.loop;

    // Remove existing track output pins (keep exec pins)
    this.node.pins = this.node.pins.filter(
      (p) => p.type === "exec" || !p.isTrackPin
    );

    // Add output pins for each track
    const Pin = this.node.pins[0]?.constructor;
    if (Pin) {
      this.timeline.tracks.forEach((track) => {
        const pinType = track.type === "vector" ? "vector" : "float";
        const pinData = {
          id: `track_${track.name}`,
          name: track.name,
          type: pinType,
          dir: "out",
          isTrackPin: true,
        };
        const pin = new Pin(this.node, pinData);
        pin.isTrackPin = true;
        this.node.pins.push(pin);
      });
    }

    // Refresh and re-render node
    this.node.refreshPinCache();
    if (this.node.element) {
      const newElement = this.node.render();
      this.node.element.replaceWith(newElement);
      this.node.element = newElement;
      this.node.app.graph?.requestRedraw();
    }
  }
}

// Singleton
export const timelineEditor = new TimelineEditorPanel(null);
