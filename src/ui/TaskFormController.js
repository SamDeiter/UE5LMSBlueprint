/**
 * TaskFormController.js
 *
 * Manages the "Create/Edit Task" sub-form within the NeedNodeModal.
 * Handles DOM interaction and communication with TaskManager.
 */
export class TaskFormController {
  constructor(app, modalInstance) {
    this.app = app;
    this.modal = modalInstance; // Reference to main modal for callbacks/state
    this.tempRequirements = [];
  }

  bindEvents() {
    const newTaskForm = document.getElementById("new-task-form");
    const showCreateBtn = document.getElementById("btn-show-create-task");
    const editTaskBtn = document.getElementById("btn-edit-task");
    const cancelCreateBtn = document.getElementById("btn-cancel-create-task");
    const confirmCreateBtn = document.getElementById("btn-confirm-create-task");
    const taskSelect = document.getElementById("need-task-id");

    // Show Edit button only when a task is selected
    taskSelect.addEventListener("change", () => {
      if (taskSelect.value) editTaskBtn.classList.remove("hidden");
      else editTaskBtn.classList.add("hidden");
    });

    showCreateBtn.addEventListener("click", () => {
      this.resetForm("create");
      newTaskForm.classList.remove("hidden");
      showCreateBtn.classList.add("hidden");
      editTaskBtn.classList.add("hidden");
    });

    editTaskBtn.addEventListener("click", () => {
      const taskId = taskSelect.value;
      if (taskId) {
        this.populateForm(taskId);
        newTaskForm.classList.remove("hidden");
        showCreateBtn.classList.add("hidden");
        editTaskBtn.classList.add("hidden");
      }
    });

    cancelCreateBtn.addEventListener("click", () => this.closeForm());

    confirmCreateBtn.addEventListener("click", () => this.handleSave());

    // Add Requirement Button
    document.getElementById("btn-add-req").addEventListener("click", () => {
      const input = document.getElementById("new-req-input");
      const text = input.value.trim();
      if (text) {
        this.tempRequirements.push({ description: text });
        this.renderRequirementsList();
        input.value = "";
      }
    });
  }

  closeForm() {
    const newTaskForm = document.getElementById("new-task-form");
    if (newTaskForm && !newTaskForm.classList.contains("hidden")) {
      newTaskForm.classList.add("hidden");

      const showCreateBtn = document.getElementById("btn-show-create-task");
      const editTaskBtn = document.getElementById("btn-edit-task");
      const taskSelect = document.getElementById("need-task-id");

      if (showCreateBtn) showCreateBtn.classList.remove("hidden");
      if (editTaskBtn && taskSelect) {
        if (taskSelect.value) editTaskBtn.classList.remove("hidden");
        else editTaskBtn.classList.add("hidden");
      }
      return true;
    }
    return false;
  }

  resetForm(mode) {
    const idInput = document.getElementById("new-task-id-input");
    const titleInput = document.getElementById("new-task-title-input");
    const descInput = document.getElementById("new-task-desc-input");
    const formTitle = document.getElementById("task-form-title");
    const confirmBtn = document.getElementById("btn-confirm-create-task");

    if (mode === "create") {
      formTitle.textContent = "Create New Task";
      confirmBtn.textContent = "Create Task";
      idInput.value = "";
      idInput.disabled = false;
      titleInput.value = "";
      descInput.value = "";
      this.tempRequirements = [];
      this.renderRequirementsList();
      confirmBtn.dataset.mode = "create";
    } else {
      formTitle.textContent = "Edit Task";
      confirmBtn.textContent = "Update Task";
      idInput.disabled = true; // ID cannot be changed
      confirmBtn.dataset.mode = "edit";
    }
  }

  populateForm(taskId) {
    const task = this.app.taskManager.getTaskById(taskId);
    if (task) {
      this.resetForm("edit");
      document.getElementById("new-task-id-input").value = task.taskId;
      document.getElementById("new-task-title-input").value = task.title;
      document.getElementById("new-task-desc-input").value =
        task.description || "";

      // Deep copy requirements
      this.tempRequirements = [];
      if (task.requirements && task.requirements.length > 0) {
        this.tempRequirements = JSON.parse(JSON.stringify(task.requirements));
      }
      this.renderRequirementsList();
    }
  }

  renderRequirementsList() {
    const reqList = document.getElementById("task-requirements-list");
    if (!reqList) return;

    reqList.innerHTML = "";
    if (this.tempRequirements.length > 0) {
      this.tempRequirements.forEach((req, index) => {
        const div = document.createElement("div");
        div.classList.add("req-item-row");

        const textSpan = document.createElement("span");
        textSpan.textContent =
          req.description || req.text || req.id || "Unknown Requirement";

        const delBtn = document.createElement("button");
        delBtn.innerHTML = "&times;";
        delBtn.classList.add("btn-delete-text");
        delBtn.onclick = () => {
          this.tempRequirements.splice(index, 1);
          this.renderRequirementsList();
        };

        div.appendChild(textSpan);
        div.appendChild(delBtn);
        reqList.appendChild(div);
      });
    } else {
      reqList.innerHTML =
        '<em class="text-muted">No requirements defined.</em>';
    }
  }

  handleSave() {
    const idInput = document.getElementById("new-task-id-input");
    const titleInput = document.getElementById("new-task-title-input");
    const descInput = document.getElementById("new-task-desc-input");

    const taskId = idInput.value.trim();
    const title = titleInput.value.trim();
    const description = descInput.value.trim();

    if (!taskId || !title) {
      window.alert("Task ID and Title are required.");
      return;
    }

    const confirmBtn = document.getElementById("btn-confirm-create-task");
    const mode = confirmBtn.dataset.mode || "create";
    let success = false;

    const taskData = {
      taskId: taskId,
      title: title,
      description: description,
      requirements: this.tempRequirements,
    };

    if (mode === "create") {
      success = this.app.taskManager.addTask(taskData);
    } else {
      success = this.app.taskManager.updateTask(taskData);
    }

    if (success) {
      this.updateSelector(taskId, title, mode);
      this.closeForm();

      // Refresh the main toolbar task selector if UI exists
      if (this.app.taskUI) {
        this.app.taskUI.populateTaskSelector();
      }
    } else {
      window.alert(
        mode === "create"
          ? "Failed to create task. ID might already exist."
          : "Failed to update task."
      );
    }
  }

  updateSelector(taskId, title, mode) {
    const taskSelect = document.getElementById("need-task-id");
    if (mode === "create") {
      const option = document.createElement("option");
      option.value = taskId;
      option.textContent = `${taskId}: ${title}`;
      taskSelect.appendChild(option);
    } else {
      const option = taskSelect.querySelector(`option[value="${taskId}"]`);
      if (option) {
        option.textContent = `${taskId}: ${title}`;
      }
    }
    taskSelect.value = taskId;

    // Update edit button visibility since a task is now selected
    const editTaskBtn = document.getElementById("btn-edit-task");
    if (editTaskBtn) editTaskBtn.classList.remove("hidden");
  }
}
