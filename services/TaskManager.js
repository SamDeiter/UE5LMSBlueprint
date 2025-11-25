/**
 * TaskManager - Manages task selection, validation, and progress tracking
 */
import { BlueprintValidator, ALL_TASKS } from '../utils/validator.js';

export class TaskManager {
    constructor(app) {
        this.app = app;
        this.validator = new BlueprintValidator(app);
        this.tasks = [...ALL_TASKS]; // Initialize with copy of static tasks
        this.currentTask = null;
        this.validationResults = null;
        this.autoValidate = false; // Auto-validate on graph changes
    }

    /**
     * Get all available tasks
     */
    getAllTasks() {
        return this.tasks;
    }

    /**
     * Get task by ID
     */
    getTaskById(taskId) {
        return this.tasks.find(t => t.taskId === taskId);
    }

    /**
     * Add a new task
     */
    addTask(task) {
        if (!task.taskId || !task.title) {
            console.error('Cannot add task: Missing ID or Title');
            return false;
        }

        if (this.getTaskById(task.taskId)) {
            console.error(`Cannot add task: Task ID ${task.taskId} already exists`);
            return false;
        }

        this.tasks.push(task);
        console.log(`Task added: ${task.title} (${task.taskId})`);
        return true;
    }

    /**
     * Update an existing task
     */
    updateTask(updatedTask) {
        const index = this.tasks.findIndex(t => t.taskId === updatedTask.taskId);
        if (index === -1) {
            console.error(`Cannot update task: Task ID ${updatedTask.taskId} not found`);
            return false;
        }

        // Update properties
        const newProps = {
            title: updatedTask.title,
            description: updatedTask.description
        };

        if (updatedTask.requirements) {
            newProps.requirements = updatedTask.requirements;
        }

        this.tasks[index] = {
            ...this.tasks[index],
            ...newProps
        };

        console.log(`Task updated: ${updatedTask.title} (${updatedTask.taskId})`);
        return true;
    }

    /**
     * Set the current active task
     */
    setCurrentTask(taskId) {
        const task = this.getTaskById(taskId);
        if (!task) {
            console.error(`Task ${taskId} not found`);
            return false;
        }

        this.currentTask = task;
        this.validationResults = null;



        return true;
    }

    /**
     * Clear the current task
     */
    clearTask() {
        this.currentTask = null;
        this.validationResults = null;
    }

    /**
     * Validate the current task
     */
    validateCurrentTask() {
        if (!this.currentTask) {
            console.warn('No active task to validate');
            return { success: false, results: [] };
        }

        this.validationResults = this.validator.validateTask(this.currentTask);
        return this.validationResults;
    }

    /**
     * Get current validation results
     */
    getValidationResults() {
        return this.validationResults;
    }

    /**
     * Get current task
     */
    getCurrentTask() {
        return this.currentTask;
    }

    /**
     * Get task progress (percentage complete)
     */
    getTaskProgress() {
        if (!this.validationResults) return 0;
        if (this.validationResults.results.length === 0) return 0;

        const passed = this.validationResults.results.filter(r => r.passed).length;
        const total = this.validationResults.results.length;

        return Math.round((passed / total) * 100);
    }

    /**
     * Enable/disable auto-validation
     */
    setAutoValidate(enabled) {
        this.autoValidate = enabled;
        if (enabled && this.currentTask) {
            this.validateCurrentTask();
        }
    }

    /**
     * Called when graph changes (for auto-validation)
     */
    onGraphChange() {
        if (this.autoValidate && this.currentTask) {
            this.validateCurrentTask();
        }
    }

    /**
     * Get summary of current state
     */
    getSummary() {
        if (!this.currentTask) {
            return {
                hasTask: false,
                taskTitle: null,
                progress: 0,
                isComplete: false
            };
        }

        const progress = this.getTaskProgress();

        return {
            hasTask: true,
            taskTitle: this.currentTask.title,
            taskDescription: this.currentTask.description,
            progress: progress,
            isComplete: this.validationResults?.success || false,
            requirementCount: this.currentTask.requirements.length,
            passedCount: this.validationResults?.results.filter(r => r.passed).length || 0
        };
    }
}
