import { nodeRegistry } from "../registries/NodeRegistry.js";
import { UE5Renderer } from "../utils/UE5Renderer.js";
import { graphAnalyzer, IssueSeverity } from "../core/GraphAnalyzer.js";

/**
 * Compiler - Validates graph and detects Blueprint pitfalls
 * Integrates with GraphAnalyzer for educational feedback
 */
export class Compiler {
  constructor(app) {
    this.output = document.getElementById("compiler-results");
    this.statusElement = document.getElementById("toolbar-status");
    this.countElement = document.getElementById("compiler-count");
    this.compileBtn = document.getElementById("compile-btn");
    this.app = app;
    this.lastValidationErrors = 0;

    // Queue to store variable renames that haven't been applied to the graph yet
    this.pendingRenames = [];
    this.isDirty = false;

    // Initial icon state
    if (this.compileBtn) {
      const iconStack = this.compileBtn.querySelector(".icon-stack");
      if (iconStack)
        iconStack.innerHTML = UE5Renderer.renderCompileIcon("stable");
    }
  }

  /**
   * Logs a message to the compiler results panel.
   * @param {string} message - The message to log.
   * @param {'log' | 'error' | 'success'} [type='log'] - The type of message.
   * @returns {boolean} True if the message was an error.
   */
  log(message, type = "log") {
    const div = document.createElement("div");
    div.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    if (type === "error") div.className = "compiler-issue";
    else if (type === "success") div.className = "compiler-success";
    else div.className = "compiler-log";
    this.output.prepend(div);
    return type === "error";
  }

  /** Registers a variable rename operation to be applied on Compile. */
  registerRename(oldName, newName) {
    this.pendingRenames.push({ oldName, newName });
    this.markDirty();
  }

  markDirty() {
    this.isDirty = true;
    if (this.app.dirtyState) {
      this.app.dirtyState.markDirty();
    }
    if (this.statusElement) {
      this.statusElement.textContent = "Status: Dirty (Needs Compile)";
      this.statusElement.style.color = "#ffaa00";
    }

    if (this.compileBtn) {
      const iconStack = this.compileBtn.querySelector(".icon-stack");
      if (iconStack)
        iconStack.innerHTML = UE5Renderer.renderCompileIcon("dirty");
      this.compileBtn.classList.add("dirty");
      this.compileBtn.classList.remove("success", "error");
    }

    // Update simulation UI to disable Play button
    if (this.app.simulation) {
      this.app.simulation.updateUI();
    }
  }

  /**
   * Compiles the graph: Applies pending changes (renames) and runs validation.
   */
  compile() {
    this.log("Compiling...", "log");

    // 1. Apply pending variable renames to the graph nodes
    if (this.pendingRenames.length > 0) {
      this.pendingRenames.forEach(({ oldName, newName }) => {
        this.app.graph.updateVariableNodes(oldName, newName);
      });
      this.log(
        `Applied ${this.pendingRenames.length} pending variable rename(s).`
      );
      this.pendingRenames = [];
    }

    // 2. Run standard validation
    const isValid = this.validate();

    // 3. Update state
    this.isDirty = !isValid;

    if (isValid) {
      this.log("Compile Complete!", "success");
      // Clear any persistent dirty state
      this.app.persistence.autoSave();

      if (this.app.dirtyState) {
        this.app.dirtyState.markClean();
      }

      if (this.compileBtn) {
        const iconStack = this.compileBtn.querySelector(".icon-stack");
        if (iconStack)
          iconStack.innerHTML = UE5Renderer.renderCompileIcon("success");
        this.compileBtn.classList.remove("dirty", "error");
        this.compileBtn.classList.add("success");

        // Keep the success icon, but remove the highlight class after delay
        setTimeout(() => {
          this.compileBtn.classList.remove("success");
        }, 2000);
      }
    } else {
      this.log("Compile Failed.", "error");
      if (this.compileBtn) {
        const iconStack = this.compileBtn.querySelector(".icon-stack");
        if (iconStack)
          iconStack.innerHTML = UE5Renderer.renderCompileIcon("error");
        this.compileBtn.classList.remove("dirty", "success");
        this.compileBtn.classList.add("error");
      }
    }

    // Update simulation UI to reflect new compile state (enable/disable Play button)
    if (this.app.simulation) {
      this.app.simulation.updateUI();
    }

    // Force a redraw of wires to make them visible again (if they were hidden)
    if (this.app.graph) this.app.graph.drawAllWires();
  }

  /** Runs validation rules on the entire graph. */
  validate() {
    this.output.innerHTML = "";
    this.log("Running validation...");

    // CRITICAL FIX: Ensure graph components are ready before accessing them.
    if (!this.app.graph || !this.app.graph.nodes) {
      this.log("Validation skipped: Graph model not yet initialized.", "error");
      this.lastValidationErrors = 1;
      if (this.countElement) this.countElement.textContent = 1;
      return false;
    }

    let errorCount = 0;

    const singletonCounts = new Map();
    const customEventNames = new Set();

    // Validation Loop
    for (const node of this.app.graph.nodes.values()) {
      const nodeDef = nodeRegistry.get(node.nodeKey);

      // Rule 0: Check for Stale/Broken Variable Nodes
      if (node.nodeKey.startsWith("Get_") || node.nodeKey.startsWith("Set_")) {
        const varName = node.nodeKey.replace("Get_", "").replace("Set_", "");

        // Check 1: Does the variable exist by name?
        // We trim() the name to handle accidental whitespaces from user input
        if (
          !this.app.variables.variables.has(varName) &&
          !this.app.variables.variables.has(varName.trim())
        ) {
          // Check 2: Can we recover it by ID?
          let recovered = false;
          if (node.variableId) {
            // Find variable by ID
            const variable = [...this.app.variables.variables.values()].find(
              (v) => v.id === node.variableId
            );

            if (variable) {
              // AUTO-FIX: We found the variable, but the name didn't match.
              this.log(
                `Auto-fixing node "${node.title}": Name mismatch detected. Updating to "${variable.name}".`,
                "log"
              );

              // Update Key immediately
              const newName = variable.name;
              node.nodeKey = node.nodeKey.startsWith("Get_")
                ? `Get_${newName}`
                : `Set_${newName}`;
              // Note: Title and Pins will be updated by the sync method below

              // Force complete refresh from template to ensure Pins (labels) match new variable name
              this.app.graph.synchronizeNodeWithTemplate(node);

              recovered = true;
            }
          }

          if (!recovered) {
            this.log(
              `Error: Node "${node.title}" references a missing variable "${varName}". Recompile to fix.`,
              "error"
            );
            errorCount++;
            continue;
          }
        }
      }

      // Rule 1: Strict Singleton Check (BeginPlay, Tick, etc.)
      if (nodeDef && nodeDef.isSingleton) {
        const count = (singletonCounts.get(node.nodeKey) || 0) + 1;
        singletonCounts.set(node.nodeKey, count);

        if (count > 1) {
          this.log(
            `Error: Duplicate event "${node.title}" detected. This event type must be unique in the graph.`,
            "error"
          );
          errorCount++;
        }
      }

      // Rule 2: Custom Event Name Uniqueness Check
      if (node.nodeKey === "CustomEvent") {
        if (customEventNames.has(node.title)) {
          this.log(
            `Error: Ambiguous Custom Event "${node.title}". Multiple custom events cannot share the same name.`,
            "error"
          );
          errorCount++;
        } else {
          customEventNames.add(node.title);
        }
      }

      // REVISED Rule 3: Relaxed check for unconnected pins.
      // We no longer flag unconnected data pins as errors, because they have default/literal values.
    }

    // === PITFALL ANALYSIS (Educational) ===
    // Run GraphAnalyzer to detect common Blueprint mistakes
    const graphData = {
      nodes: [...this.app.graph.nodes.values()].map((n) => ({
        id: n.id,
        nodeKey: n.nodeKey,
        title: n.title,
        type: n.type,
        x: n.x,
        y: n.y,
        pins:
          n.pins?.map((p) => ({
            id: p.id,
            name: p.name,
            localId: p.localId,
            type: p.type,
            dir: p.dir,
            links: p.links || [],
          })) || [],
      })),
      links: [...this.app.wiring.links.values()].map((l) => ({
        id: l.id,
        startPinId: l.startPin?.id,
        endPinId: l.endPin?.id,
      })),
    };

    const analysisResult = graphAnalyzer.analyze(graphData, {
      graphName: this.app.activeGraph || "EventGraph",
      app: this.app,
    });

    // Log analysis issues
    if (analysisResult.issues.length > 0) {
      this.log(
        `--- Blueprint Quality Analysis (Score: ${analysisResult.score}/100) ---`
      );

      analysisResult.issues.forEach((issue) => {
        const typeMap = {
          [IssueSeverity.ERROR]: "error",
          [IssueSeverity.WARNING]: "error", // Show warnings as errors for visibility
          [IssueSeverity.INFO]: "log",
          [IssueSeverity.HINT]: "log",
        };

        const prefix =
          issue.severity === IssueSeverity.ERROR
            ? "❌"
            : issue.severity === IssueSeverity.WARNING
            ? "⚠️"
            : issue.severity === IssueSeverity.INFO
            ? "ℹ️"
            : "💡";

        this.log(
          `${prefix} [${issue.category}] ${issue.title}: ${issue.message}`,
          typeMap[issue.severity]
        );

        if (issue.suggestion) {
          this.log(`   → Suggestion: ${issue.suggestion}`, "log");
        }

        // Highlight problem nodes visually
        if (issue.nodeId && issue.severity === IssueSeverity.ERROR) {
          this.highlightProblemNode(issue.nodeId, "error");
        } else if (issue.nodeId && issue.severity === IssueSeverity.WARNING) {
          this.highlightProblemNode(issue.nodeId, "warning");
        }
      });

      // Only count ERROR severity as actual compilation errors
      const analysisErrors = analysisResult.issues.filter(
        (i) => i.severity === IssueSeverity.ERROR
      ).length;
      errorCount += analysisErrors;

      this.log(
        `Found ${analysisResult.stats.errors} errors, ${analysisResult.stats.warnings} warnings, ${analysisResult.stats.infos} suggestions.`
      );
    } else {
      this.log("✅ No Blueprint pitfalls detected!", "success");
    }

    // Store analysis result for external access
    this.lastAnalysisResult = analysisResult;

    this.lastValidationErrors = errorCount;

    // Update status
    if (this.countElement) this.countElement.textContent = errorCount;

    const statusText =
      errorCount === 0
        ? "Status: Up to date"
        : `Status: ${errorCount} Error(s)`;
    const statusColor = errorCount === 0 ? "#888" : "#ff5555";

    if (this.statusElement) {
      this.statusElement.textContent = statusText;
      this.statusElement.style.color = statusColor;
    }

    return errorCount === 0;
  }

  /**
   * Highlight a problem node with visual indicator
   * @param {string} nodeId - Node ID to highlight
   * @param {string} type - 'error' or 'warning'
   */
  highlightProblemNode(nodeId, type = "error") {
    const node = this.app.graph.nodes.get(nodeId);
    if (!node || !node.element) return;

    // Add highlight class
    const className = type === "error" ? "node-error" : "node-warning";
    node.element.classList.add(className);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      node.element?.classList.remove(className);
    }, 10000);
  }

  /**
   * Clear all problem highlights
   */
  clearProblemHighlights() {
    this.app.graph.nodes.forEach((node) => {
      if (node.element) {
        node.element.classList.remove("node-error", "node-warning");
      }
    });
  }
}
