/**
 * SearchController.js
 * Handles the "Find Results" panel, searching nodes, and navigation.
 */

export class SearchController {
  constructor(app) {
    this.app = app;
    this.container = document.getElementById("find-results-content");
    this.input = document.getElementById("find-input");
    this.resultsList = document.getElementById("find-results-list");
    this.countLabel = document.getElementById("find-count");

    this.init();
  }

  init() {
    if (this.input) {
      this.input.addEventListener("input", (e) => {
        this.search(e.target.value);
      });
      this.input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.input.blur();
        }
      });
    }
  }

  toggle(show) {
    // This is largely handled by the bottom tab logic in app.js or LayoutController
    // But we can ensure focus when shown
    if (show && this.input) {
      // Use requestAnimationFrame + timeout to ensure DOM is fully updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          const rect = this.input.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            this.input.focus();
          }
        }, 100);
      });
    }
  }

  search(query) {
    if (!query || query.trim() === "") {
      this.renderResults([]);
      return;
    }

    const term = query.toLowerCase();
    const results = [];

    // Search Nodes
    this.app.graph.nodes.forEach((node) => {
      let match = false;
      let matchType = "Node";
      let matchText = node.title;

      // 1. Comment Text Match (check first as it's more specific)
      if (
        node.type === "comment-node" &&
        node.title.toLowerCase().includes(term)
      ) {
        match = true;
        matchType = "Comment";
      }
      // 2. Title Match
      else if (node.title.toLowerCase().includes(term)) {
        match = true;
      }
      // 3. Node Key Match (e.g. "EventBeginPlay")
      else if (node.nodeKey && node.nodeKey.toLowerCase().includes(term)) {
        match = true;
        matchText = node.nodeKey;
      }
      // 4. Pin Name Match
      else {
        const matchingPin = node.pins.find((p) =>
          p.name.toLowerCase().includes(term)
        );
        if (matchingPin) {
          match = true;
          matchType = "Pin";
          matchText = `${node.title} -> ${matchingPin.name}`;
        }
      }

      if (match) {
        results.push({
          id: node.id,
          title: matchText,
          type: matchType,
          icon: node.icon || "fa-cube",
          node: node,
        });
      }
    });

    this.renderResults(results);
  }

  renderResults(results) {
    if (!this.resultsList) return;
    this.resultsList.innerHTML = "";

    if (this.countLabel) {
      this.countLabel.textContent = `${results.length} result(s)`;
    }

    if (results.length === 0) {
      const empty = document.createElement("div");
      empty.className = "find-result-empty placeholder-italic";
      empty.textContent = "No results found.";
      this.resultsList.appendChild(empty);
      return;
    }

    results.forEach((res) => {
      const item = document.createElement("div");
      item.className = "find-result-item";
      

      item.innerHTML = `
        <i class="fas ${res.icon} mr-2 w-16 opacity-70"></i>
        <span class="find-result-text">
            <span class="find-result-type">[${res.type}]</span> ${res.title}
        </span>
      `;

      
      

      item.addEventListener("click", () => {
        this.app.graph.focusNode(res.id);
        this.app.graph.selectNode(res.id, true, "new");
      });

      this.resultsList.appendChild(item);
    });
  }
}
