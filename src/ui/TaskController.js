export class TaskController {
  constructor(app) {
    this.app = app;
    this.selector = document.getElementById("task-selector");
    // this.validateBtn removed in favor of Compile/Play hooks
    this.statusTab = document.querySelector(
      '.bottom-tab[data-tab="task-status"]'
    );
    this.statusContent = document.getElementById("task-status-content");
    this.compilerResults = document.getElementById("compiler-results");

    this.taskTitle = document.getElementById("task-title");
    this.taskDesc = document.getElementById("task-desc");
    this.requirementsList = document.getElementById("task-requirements");

    this.init();
  }

  init() {
    this.populateTaskSelector();
    this.bindEvents();
  }

  populateTaskSelector() {
    if (!this.app.taskManager) {
      console.warn("TaskManager not initialized yet.");
      return;
    }
    const tasks = this.app.taskManager.getAllTasks();
    this.selector.innerHTML = '<option value="">Select Task...</option>';

    // Group tasks by level
    const tasksByLevel = {};
    tasks.forEach((task) => {
      const level = task.level || 0;
      if (!tasksByLevel[level]) {
        tasksByLevel[level] = [];
      }
      tasksByLevel[level].push(task);
    });

    // Sort levels
    const levels = Object.keys(tasksByLevel).sort((a, b) => a - b);

    levels.forEach((level) => {
      // Add optgroup for each level
      const optgroup = document.createElement("optgroup");
      optgroup.label = level === "0" ? "Sample Tasks" : `Level ${level}`;

      tasksByLevel[level].forEach((task) => {
        const option = document.createElement("option");
        option.value = task.taskId;
        option.textContent = task.title;
        optgroup.appendChild(option);
      });

      this.selector.appendChild(optgroup);
    });
  }

  bindEvents() {
    // Task Selection
    this.selector.addEventListener("change", (e) => {
      const taskId = e.target.value;
      if (taskId) {
        // Check if there are nodes in the graph
        const hasNodes = this.app.graph.nodes.size > 0;

        if (hasNodes) {
          // Ask user if they want to clear the graph
          this.showClearGraphConfirmation(
            () => {
              this.clearGraphAndLoadTask(taskId);
            },
            () => {
              // User chose not to clear - just load the task
              this.app.taskManager.setCurrentTask(taskId);
              this.updateStatusPanel();
              this.switchToStatusTab();
            }
          );
        } else {
          // No nodes, just load the task
          this.app.taskManager.setCurrentTask(taskId);
          this.updateStatusPanel();
          this.switchToStatusTab();
        }
      } else {
        this.app.taskManager.clearTask();
        this.updateStatusPanel();
      }
    });

    this.compileBtn = document.getElementById("compile-btn");
    this.playBtn = document.getElementById("play-btn");

    // Hook into Compile and Play for Validation (only if buttons exist)
    if (this.compileBtn) {
      this.compileBtn.addEventListener("click", () => this.runValidation());
    }
    if (this.playBtn) {
      this.playBtn.addEventListener("click", () => this.runValidation());
    }
    // Tab Switching Logic (handling the new tab)
    document.querySelectorAll(".bottom-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        // Deactivate all
        document
          .querySelectorAll(".bottom-tab")
          .forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".panel-content").forEach((c) => {
          if (c.parentElement.id === "bottom-strip") c.classList.add("hidden");
        });

        // Activate clicked
        tab.classList.add("active");
        const tabId = tab.dataset.tab;

        if (tabId === "task-status") {
          this.statusContent.classList.remove("hidden");
        } else if (tabId === "compiler") {
          this.compilerResults.classList.remove("hidden");
        } else {
          // Find results placeholder
          const findResults =
            document.getElementById("find-results") ||
            document.createElement("div"); // Fallback
          findResults.classList.remove("hidden");
        }
      });
    });
  }

  runValidation() {
    // Only validate if a task is active
    if (this.app.taskManager.getCurrentTask()) {
      const results = this.app.taskManager.validateCurrentTask();
      this.updateStatusPanel(results);
      this.switchToStatusTab();
    }
  }

  switchToStatusTab() {
    // Simulate click on the status tab
    if (this.statusTab) this.statusTab.click();
  }

  updateStatusPanel(validationResults = null) {
    const task = this.app.taskManager.getCurrentTask();

    if (!task) {
      this.taskTitle.textContent = "No Active Task";
      this.taskDesc.textContent = "Select a task from the toolbar to begin.";
      this.requirementsList.innerHTML = "";
      return;
    }

    this.taskTitle.textContent = task.title;
    this.taskDesc.textContent = task.description;
    this.requirementsList.innerHTML = "";

    // Add progress bar
    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";

    const progressLabel = document.createElement("div");
    progressLabel.className = "progress-label";

    const results = validationResults ? validationResults.results : null;
    const passedCount = results ? results.filter((r) => r.passed).length : 0;
    const totalCount = task.requirements.length;
    const progressPercent =
      totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    progressLabel.innerHTML = `<span>Progress</span><span>${passedCount}/${totalCount} (${progressPercent}%)</span>`;
    progressContainer.appendChild(progressLabel);

    const progressBarBg = document.createElement("div");
    progressBarBg.className = "progress-bar-bg";

    const progressBarFill = document.createElement("div");
    progressBarFill.className = "progress-bar-fill";
    progressBarFill.style.width = `${progressPercent}%`;
    progressBarBg.appendChild(progressBarFill);
    progressContainer.appendChild(progressBarBg);

    this.requirementsList.appendChild(progressContainer);

    // Requirements list
    task.requirements.forEach((req, index) => {
      const result = results ? results[index] : null;
      const isPassed = result ? result.passed : false;

      const item = document.createElement("div");
      item.className = `status-item ${isPassed ? "passed" : ""}`;

      const icon = document.createElement("i");
      icon.className = isPassed
        ? "fas fa-check-circle text-success icon-lg"
        : "far fa-circle text-muted icon-lg mr-3";

      const text = document.createElement("span");
      text.textContent = req.description;
      text.classList.add("flex-1");

      item.appendChild(icon);
      item.appendChild(text);
      this.requirementsList.appendChild(item);
    });

    // Success message
    if (validationResults && validationResults.success) {
      const successMsg = document.createElement("div");
      successMsg.className = "success-message task-complete";
      successMsg.innerHTML =
        '<i class="fas fa-trophy mr-2 icon-lg"></i>Task Complete! Well Done!';
      this.requirementsList.appendChild(successMsg);

      // Add animation keyframes if not already present
      if (!document.getElementById("pulse-animation")) {
        const style = document.createElement("style");
        style.id = "pulse-animation";
        style.textContent = `
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                    }
                `;
        document.head.appendChild(style);
      }
    }
  }

  clearGraphAndLoadTask(taskId) {
    // Clear the graph completely
    this.app.graph.nodes.clear();
    // Robust clearing of wires (handles potential caching issues)
    if (typeof this.app.wiring.clear === "function") {
      this.app.wiring.clear();
    } else {
      console.warn("WiringController.clear() not found. Using fallback.");
      this.app.wiring.links.clear();
      const wireGroup = document.getElementById("wire-group");
      if (wireGroup) wireGroup.innerHTML = "";
    }

    this.app.graph.clearSelection();
    this.app.graph.renderAllNodes();
    this.app.graph.drawAllWires();
    this.app.variables.clearAllVariables();

    // Reset pan and zoom
    this.app.graph.pan = { x: 0, y: 0 };
    this.app.graph.zoom = 1;
    this.app.graph.updateTransform();

    // Load the new task
    this.app.taskManager.setCurrentTask(taskId);
    this.updateStatusPanel();
    this.switchToStatusTab();

    // Save the cleared state
    this.app.persistence.autoSave();
  }

  showClearGraphConfirmation(onConfirm, onCancel) {
    const modal = document.getElementById("confirmation-modal");
    const message = document.getElementById("confirmation-msg");
    const yesBtn = document.getElementById("confirm-yes-btn");
    const noBtn = document.getElementById("confirm-no-btn");

    // Store original values to restore later
    const originalYesText = yesBtn.textContent;

    // Set custom text for clear graph confirmation
    message.textContent = "Clear the current graph to start this task fresh?";
    yesBtn.textContent = "Clear Graph";
    yesBtn.classList.add("bg-success"); // Green for positive action

    modal.classList.remove("hidden");
    modal.classList.add("visible-flex");

    const handleYes = () => {
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
      // Reset to original values
      yesBtn.textContent = originalYesText;
      yesBtn.classList.remove("bg-success");
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
      if (onConfirm) onConfirm();
    };

    const handleNo = () => {
      modal.classList.add("hidden");
      modal.classList.remove("visible-flex");
      // Reset to original values
      yesBtn.textContent = originalYesText;
      yesBtn.classList.remove("bg-success");
      yesBtn.removeEventListener("click", handleYes);
      noBtn.removeEventListener("click", handleNo);
      if (onCancel) onCancel();
    };

    yesBtn.addEventListener("click", handleYes);
    noBtn.addEventListener("click", handleNo);
  }
}
