/**
 * LayoutController - Handles resizable panels
 */

export class LayoutController {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("app-container");
    this.resizerLeft = document.getElementById("resizer-left");
    this.resizerRight = document.getElementById("resizer-right");
    this.resizerBottom = document.getElementById("resizer-bottom");

    // Initial sizes (matching CSS defaults)
    this.leftWidth = 280;
    this.rightWidth = 400;
    this.bottomHeight = 200;

    this.isResizing = false;
    this.currentResizer = null;
    this.startX = 0;
    this.startY = 0;
    this.startSize = 0;

    this.initResizers();
    this.initDetailsResizer();
    this.initTabs();
  }

  initResizers() {
    const attach = (resizer, type) => {
      resizer.addEventListener("mousedown", (e) => {
        this.isResizing = true;
        this.currentResizer = type;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (type === "left") this.startSize = this.leftWidth;
        if (type === "right") this.startSize = this.rightWidth;
        if (type === "bottom") this.startSize = this.bottomHeight;

        document.body.style.cursor =
          type === "bottom" ? "row-resize" : "col-resize";
        e.preventDefault();
      });
    };

    attach(this.resizerLeft, "left");
    attach(this.resizerRight, "right");
    attach(this.resizerBottom, "bottom");

    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  handleMouseMove(e) {
    if (!this.isResizing) return;

    if (this.currentResizer === "left") {
      const delta = e.clientX - this.startX;
      this.leftWidth = Math.max(150, this.startSize + delta); // Min width 150
    } else if (this.currentResizer === "right") {
      const delta = this.startX - e.clientX; // Drag left increases width
      this.rightWidth = Math.max(150, this.startSize + delta);
    } else if (this.currentResizer === "bottom") {
      const delta = this.startY - e.clientY; // Drag up increases height
      this.bottomHeight = Math.max(100, this.startSize + delta);
    }

    this.updateLayout();
  }

  handleMouseUp() {
    this.isResizing = false;
    this.currentResizer = null;
    document.body.style.cursor = "";
    // Optional: Trigger canvas resize on graph grid
    if (this.app.grid) this.app.grid.resize();
  }

  updateLayout() {
    // Update CSS Grid Template Columns and Rows based on new pixel values
    // Columns: Left | Resizer | Graph | Resizer | Right
    this.container.style.gridTemplateColumns = `${this.leftWidth}px 4px 1fr 4px ${this.rightWidth}px`;

    // Rows: Menu | Tab | Toolbar | Graph | Resizer | Bottom
    this.container.style.gridTemplateRows = `32px 28px 44px 1fr 4px ${this.bottomHeight}px`;
  }

  initDetailsResizer() {
    const panel = document.getElementById("details-panel");
    let isResizing = false;
    let startX = 0;
    let startWidth = 140;

    // We'll attach the event listener to the panel itself to catch events on the labels
    panel.addEventListener("mousedown", (e) => {
      // Check if we are clicking near the border of a label
      // The label is the first child of .detail-row or .detail-checkbox-row
      const row = e.target.closest(".detail-row, .detail-checkbox-row");
      if (!row) return;

      const label = row.querySelector("label");
      if (!label) return;

      const rect = label.getBoundingClientRect();
      // Check if click is within 15px of the right edge for easier grabbing
      if (Math.abs(e.clientX - rect.right) < 15) {
        isResizing = true;
        startX = e.clientX;
        // Get current width from CSS variable or computed style
        const rootStyle = getComputedStyle(document.documentElement);
        const currentVal = rootStyle
          .getPropertyValue("--details-label-width")
          .trim();
        startWidth = parseInt(currentVal, 10) || 140;

        document.body.style.cursor = "col-resize";
        e.preventDefault();
        e.stopPropagation(); // Prevent text selection
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;

      const delta = e.clientX - startX;
      const newWidth = Math.max(140, Math.min(300, startWidth + delta)); // Clamp width between 140px and 300px

      document.documentElement.style.setProperty(
        "--details-label-width",
        `${newWidth}px`
      );
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = "";
      }
    });
  }

  initTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Determine graph name
        let graphName = tab.dataset.graph;

        if (!graphName) {
          // Fallback to text content if data attribute missing
          const text = tab.querySelector("span").textContent.trim();
          if (text === "Construction Script") {
            graphName = "ConstructionScript";
          } else if (text === "Event Graph") {
            graphName = "EventGraph";
          } else {
            graphName = "EventGraph";
          }
        }

        // Switch graph (GraphSwitcher handles UI update if we use it)
        if (this.app.switchGraph) {
          this.app.switchGraph(graphName);
        } else {
          // Manual UI update fallback
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
        }
      });
    });

    this.initBottomTabs();
    this.initRightPanelTabs();
  }

  initRightPanelTabs() {
    const rightPanelTabs = document.querySelectorAll(".right-panel-tab");
    const detailsPanel = document.getElementById("details-panel");
    const rightPalettePanel = document.getElementById("right-palette-panel");

    rightPanelTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update tab active state
        rightPanelTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Show/hide content panels
        const targetTab = tab.dataset.tab;
        if (targetTab === "details") {
          if (detailsPanel) detailsPanel.classList.remove("hidden");
          if (rightPalettePanel) rightPalettePanel.classList.add("hidden");
        } else if (targetTab === "palette") {
          if (detailsPanel) detailsPanel.classList.add("hidden");
          if (rightPalettePanel) rightPalettePanel.classList.remove("hidden");
        }
      });
    });
  }

  initBottomTabs() {
    const bottomTabs = document.querySelectorAll(".bottom-tab");
    const panels = {
      compiler: document.getElementById("compiler-results"),
      find: document.getElementById("find-results-content"),
      "task-status": document.getElementById("task-status-content"),
    };

    bottomTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // UI Toggle
        bottomTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Content Toggle
        const target = tab.dataset.tab; // compiler, find, task-status

        Object.entries(panels).forEach(([key, panel]) => {
          if (panel) {
            if (key === target) {
              panel.classList.remove("hidden");
              panel.classList.add("active-bottom-panel");

              // Focus search input if opening find tab
              if (key === "find" && this.app.search) {
                // Force child elements to be visible
                const findToolbar = panel.querySelector(".find-toolbar");
                const searchBox = panel.querySelector(".search-box");
                const findInput = panel.querySelector("#find-input");

                if (findToolbar)
                  findToolbar.classList.add("find-toolbar-active");
                if (searchBox) searchBox.classList.add("search-box-active");
                if (findInput) findInput.classList.add("find-input-active");

                this.app.search.toggle(true);
              }
            } else {
              panel.classList.add("hidden");
              panel.classList.remove("active-bottom-panel");
              // Clear search classes if hidden
              const findToolbar = panel.querySelector(".find-toolbar");
              const searchBox = panel.querySelector(".search-box");
              const findInput = panel.querySelector("#find-input");
              if (findToolbar)
                findToolbar.classList.remove("find-toolbar-active");
              if (searchBox) searchBox.classList.remove("search-box-active");
              if (findInput) findInput.classList.remove("find-input-active");
            }
          } else {
            console.warn("Panel not found for key:", key);
          }
        });
      });
    });
  }
}
