/**
 * ReviewUI Module
 * Implements the user interface for the ReviewCore SDK using Web Components.
 */

class ReviewHighlightOverlay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.highlights = [];
    this.isDrawing = false;
    this.startPos = { x: 0, y: 0 };
    this.active = false;
    this.onFinish = null;
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  setupListeners() {
    this.shadowRoot.addEventListener("mousedown", (e) => {
      if (!this.active) return;
      this.isDrawing = true;
      const rect = this.getBoundingClientRect();
      this.startPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this.currentHighlight = {
        x1: this.startPos.x,
        y1: this.startPos.y,
        x2: this.startPos.x,
        y2: this.startPos.y,
      };
      this.render();
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDrawing) return;
      const rect = this.getBoundingClientRect();
      this.currentHighlight.x2 = e.clientX - rect.left;
      this.currentHighlight.y2 = e.clientY - rect.top;
      this.render();
    });

    window.addEventListener("mouseup", () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.highlights.push({ ...this.currentHighlight });
      this.currentHighlight = null;
      this.render();
    });
  }

  clear() {
    this.highlights = [];
    this.render();
  }

  getHighlights() {
    return this.highlights;
  }

  setHighlights(h) {
    this.highlights = h || [];
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: ${this.active ? "auto" : "none"};
          z-index: 10001;
          cursor: ${this.active ? "crosshair" : "default"};
        }
        svg {
          width: 100%;
          height: 100%;
        }
        .highlight {
          fill: rgba(239, 68, 68, 0.2);
          stroke: #ef4444;
          stroke-width: 2;
          stroke-dasharray: 4;
        }
        .highlight-num {
          fill: #fff;
          font-family: sans-serif;
          font-size: 14px;
          font-weight: bold;
        }
        .guide-text {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,0,0,0.9);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          pointer-events: none;
          display: ${this.active ? "flex" : "none"};
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border: 1px solid #444;
        }
        .finish-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          pointer-events: auto;
        }
      </style>
      <div class="guide-text">
        <span>Click and drag to highlight issues.</span>
        <button class="finish-btn" id="finish-btn">Finish (ESC)</button>
      </div>
      <svg>
        ${this.highlights
          .map(
            (h, i) => `
          <rect class="highlight" 
            x="${Math.min(h.x1, h.x2)}" 
            y="${Math.min(h.y1, h.y2)}" 
            width="${Math.abs(h.x2 - h.x1)}" 
            height="${Math.abs(h.y2 - h.y1)}" />
          <text class="highlight-num" 
            x="${Math.min(h.x1, h.x2) + 5}" 
            y="${Math.min(h.y1, h.y2) + 20}">${i + 1}</text>
        `,
          )
          .join("")}
        ${
          this.currentHighlight
            ? `
          <rect class="highlight" 
            x="${Math.min(this.currentHighlight.x1, this.currentHighlight.x2)}" 
            y="${Math.min(this.currentHighlight.y1, this.currentHighlight.y2)}" 
            width="${Math.abs(this.currentHighlight.x2 - this.currentHighlight.x1)}" 
            height="${Math.abs(this.currentHighlight.y2 - this.currentHighlight.y1)}" />
        `
            : ""
        }
      </svg>
    `;

    if (this.active) {
      this.shadowRoot.getElementById("finish-btn").onclick = () =>
        this.onFinish?.();
    }
  }
}
window.customElements.define(
  "review-highlight-overlay",
  ReviewHighlightOverlay,
);

class ReviewIssueDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.onConfirm = null;
    this.onCancel = null;
    this.onHighlight = null;
    this.onRemoveHighlight = null;
  }

  show(initialNote = "", highlights = []) {
    this.style.display = "flex";
    this.render(initialNote, highlights);
    this.shadowRoot.querySelector("textarea").focus();
  }

  hide() {
    this.style.display = "none";
  }

  render(note = "", highlights = []) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.85);
          z-index: 10002;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
        }
        .dialog {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          width: 550px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
        }
        h2 { margin: 0 0 16px 0; color: #fff; font-size: 20px; }
        textarea {
          width: 100%;
          background: #0a0a0a;
          border: 1px solid #444;
          color: #eee;
          padding: 12px;
          border-radius: 6px;
          height: 120px;
          resize: vertical;
          margin-bottom: 20px;
          box-sizing: border-box;
          font-family: inherit;
          line-height: 1.5;
        }
        .highlight-section {
          margin-bottom: 20px;
          background: #252525;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #333;
        }
        .highlight-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .highlight-item {
          background: #ef4444;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .remove-highlight {
          cursor: pointer;
          font-weight: bold;
          opacity: 0.8;
          margin-left: 4px;
        }
        .remove-highlight:hover { opacity: 1; text-decoration: underline; }
        .actions { display: flex; justify-content: flex-end; gap: 12px; }
        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #444;
          background: #333;
          color: #ccc;
          transition: all 0.2s;
        }
        .btn:hover { background: #444; color: #fff; border-color: #666; }
        .btn-danger { background: #ef4444; border-color: #dc2626; color: white; }
        .btn-danger:hover { background: #dc2626; }
        .btn-highlight { background: #3b82f6; border-color: #2563eb; color: white; }
        .btn-highlight:hover { background: #2563eb; }
      </style>
      <div class="dialog">
        <h2>Report Issue</h2>
        
        <div class="highlight-section">
          <div style="font-size: 12px; color: #888; text-transform: uppercase;">Visual Highlights</div>
          <div class="highlight-list">
            ${
              highlights.length === 0
                ? '<span style="color: #666; font-size: 12px;">No highlights.</span>'
                : highlights
                    .map(
                      (h, i) => `
                <div class="highlight-item">
                  #${i + 1}
                  <span class="remove-highlight" data-index="${i}">[x]</span>
                </div>
              `,
                    )
                    .join("")
            }
          </div>
        </div>

        <textarea placeholder="Describe what is wrong here...">${note}</textarea>
        
        <div class="actions">
          <button class="btn" id="cancel-dlg">Cancel</button>
          <button class="btn btn-highlight" id="highlight-dlg">🖌️ Add Highlight</button>
          <button class="btn btn-danger" id="submit-dlg">Save Issue</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById("cancel-dlg").onclick = () =>
      this.onCancel?.();
    this.shadowRoot.getElementById("highlight-dlg").onclick = () => {
      const currentNote = this.shadowRoot.querySelector("textarea").value;
      this.onHighlight?.(currentNote);
    };
    this.shadowRoot.getElementById("submit-dlg").onclick = () => {
      const note = this.shadowRoot.querySelector("textarea").value;
      this.onConfirm?.(note);
    };
    this.shadowRoot.querySelectorAll(".remove-highlight").forEach((btn) => {
      btn.onclick = () => {
        const index = parseInt(btn.getAttribute("data-index"));
        const currentNote = this.shadowRoot.querySelector("textarea").value;
        this.onRemoveHighlight?.(index, currentNote);
      };
    });
  }
}
window.customElements.define("review-issue-dialog", ReviewIssueDialog);

class ReviewBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = { currentIndex: 0, itemStatuses: {} };
    this.items = [];
    this.onPrev = null;
    this.onNext = null;
    this.onVerify = null;
    this.onIssue = null;
    this.onExport = null;
  }

  connectedCallback() {
    this.render();
  }

  update(state, items) {
    this.state = state;
    this.items = items;
    this.render();
  }

  render() {
    const currentItem = this.items[this.state.currentIndex];
    const status = (
      this.state.itemStatuses[currentItem?.id]?.status || "pending"
    ).toUpperCase();
    const progress =
      this.items.length > 0
        ? Math.round(((this.state.currentIndex + 1) / this.items.length) * 100)
        : 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #0a0a0a;
          border-top: 1px solid #333;
          color: #eee;
          font-family: 'Inter', system-ui, sans-serif;
          z-index: 10000;
          padding: 8px 16px;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .info {
          flex: 1;
        }
        .title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 4px;
        }
        .meta {
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn {
          background: #252525;
          border: 1px solid #444;
          color: #ccc;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn:hover {
          background: #333;
          border-color: #666;
          color: #fff;
        }
        .btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .btn-primary {
          background: #3b82f6;
          border-color: #2563eb;
          color: #fff;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-success {
          background: #10b981;
          border-color: #059669;
          color: #fff;
        }
        .btn-danger {
          background: #ef4444;
          border-color: #dc2626;
          color: #fff;
        }
        .status-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 99px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending { background: #444; color: #aaa; }
        .status-verified { background: #065f46; color: #34d399; }
        .status-issue { background: #7f1d1d; color: #f87171; }

        .progress-container {
          width: 150px;
          height: 4px;
          background: #222;
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s;
        }
      </style>
      <div class="container">
        <div class="info">
          <div class="meta">Reviewing ${this.state.currentIndex + 1} of ${this.items.length} | <span class="status-badge status-${status.toLowerCase()}">${status}</span></div>
          <div class="title">${currentItem?.title || "Unknown Item"}</div>
          <div class="progress-container">
            <div class="progress-bar" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <div class="controls">
          <button class="btn" id="prev-btn" ${this.state.currentIndex === 0 ? "disabled" : ""}>← Prev</button>
          <button class="btn" id="next-btn" ${this.state.currentIndex === this.items.length - 1 ? "disabled" : ""}>Next →</button>
          
          <div style="width: 1px; height: 24px; background: #333; margin: 0 8px;"></div>
          
          <button class="btn ${status === "VERIFIED" ? "btn-success" : ""}" id="verify-btn">✓ Verify</button>
          <button class="btn ${status === "ISSUE" ? "btn-danger" : ""}" id="issue-btn">⚠️ Issue</button>
          
          <div style="width: 1px; height: 24px; background: #333; margin: 0 8px;"></div>
          
          <button class="btn btn-primary" id="export-sdk-btn">📤 Export Report</button>
        </div>
      </div>
    `;

    this.shadowRoot.getElementById("prev-btn").onclick = () => this.onPrev?.();
    this.shadowRoot.getElementById("next-btn").onclick = () => this.onNext?.();
    this.shadowRoot.getElementById("verify-btn").onclick = () =>
      this.onVerify?.();
    this.shadowRoot.getElementById("issue-btn").onclick = () =>
      this.onIssue?.();
    this.shadowRoot.getElementById("export-sdk-btn").onclick = () =>
      this.onExport?.();
  }
}
window.customElements.define("review-bar", ReviewBar);

window.ReviewUI = {
  createBar: (core) => {
    // Ensure styles are available
    if (!document.getElementById("review-sdk-styles")) {
      const style = document.createElement("style");
      style.id = "review-sdk-styles";
      style.textContent = `
            body { margin-bottom: 60px !important; }
        `;
      document.head.appendChild(style);
    }

    const bar = document.createElement("review-bar");
    const overlay = document.createElement("review-highlight-overlay");
    const dialog = document.createElement("review-issue-dialog");

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    document.body.appendChild(bar);

    // Wire up Bar
    bar.onPrev = () => core.showItem(core.state.currentIndex - 1);
    bar.onNext = () => core.showItem(core.state.currentIndex + 1);
    bar.onVerify = () => core.updateCurrentStatus("verified");
    bar.onIssue = () => {
      const currentStatus =
        core.state.itemStatuses[core.config.items[core.state.currentIndex].id];
      dialog.show(currentStatus?.note || "", currentStatus?.highlights || []);
    };
    bar.onExport = () => core.storage.save("report", core.exportData());

    // Wire up Dialog
    dialog.onCancel = () => dialog.hide();
    dialog.onConfirm = (note) => {
      core.updateCurrentStatus("issue", note, overlay.getHighlights());
      dialog.hide();
      overlay.setHighlights([]);
    };
    dialog.onHighlight = (currentNote) => {
      dialog.hide();
      overlay.active = true;
      overlay.render();
    };
    dialog.onRemoveHighlight = (index, currentNote) => {
      const h = overlay.getHighlights();
      h.splice(index, 1);
      overlay.setHighlights(h);
      dialog.render(currentNote, h);
    };

    // Wire up Overlay
    overlay.onFinish = () => {
      overlay.active = false;
      overlay.render();
      const currentNote = dialog.shadowRoot.querySelector("textarea").value;
      dialog.show(currentNote, overlay.getHighlights());
    };

    const escListener = (e) => {
      if (e.key === "Escape" && overlay.active) {
        overlay.onFinish();
      }
    };
    window.addEventListener("keydown", escListener);

    // When core shows a new item, update everything
    core.onShowItemInternal = (item) => {
      const status = core.state.itemStatuses[item.id];
      overlay.setHighlights(status?.highlights || []);
    };

    core.ui = bar;
    bar.update(core.state, core.config.items);

    return bar;
  },
};
