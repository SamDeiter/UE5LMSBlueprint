
/**
 * TaskManager - Manages task selection, validation, and progress tracking
 */
import { BlueprintValidator, ALL_TASKS } from '../utils/validator.js';
import { GraphValidator } from './GraphValidator.js';

export class TaskManager {
    constructor(app) {
        this.app = app;
        this.validator = new BlueprintValidator(app);
        this.graphValidator = new GraphValidator(app);
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

        if (updatedTask.graphData) {
            newProps.graphData = updatedTask.graphData;
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

        // Trigger initial validation to update UI
        this.validateCurrentTask();

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

        // 1. Standard JSON-based validation
        const jsonValidation = this.validator.validateTask(this.currentTask);
        let allPassed = jsonValidation.success;
        let combinedResults = [...jsonValidation.results];

        // 2. NeedNode-based validation
        // Find all NeedNodes associated with this task
        const needNodes = [...this.app.graph.nodes.values()]
            .filter(n => n.nodeKey === 'NeedNode' && n.customData?.needNodeData?.taskId === this.currentTask.taskId);

        if (needNodes.length > 0) {
            needNodes.forEach(node => {
                const needData = node.customData.needNodeData;
                if (needData.criteria && needData.criteria.length > 0) {
                    // Validate criteria using GraphValidator
                    const validatedCriteria = this.graphValidator.validate(needData.criteria);

                    // Update node data with results
                    node.customData.needNodeData.criteria = validatedCriteria;

                    // Check if this node passed (all criteria met)
                    const nodePassed = validatedCriteria.every(c => c.passed);
                    if (!nodePassed) allPassed = false;

                    // Add to combined results for UI display
                    validatedCriteria.forEach(c => {
                        combinedResults.push({
                            description: `[${node.title}] ${c.description}`,
                            passed: c.passed
                        });
                    });

                    // Force re-render of this node to show updated status
                    // We can't easily re-render just one node without accessing the renderer, 
                    // but we can update its element if we have access to it.
                    // The simplest way is to re-render all nodes or trigger a specific update.
                    // For now, let's try to re-render the specific node if possible, or all.
                    if (this.app.graph && this.app.graph.renderer) {
                        // Ideally we'd have a updateNode(node) method. 
                        // For now, let's just re-render all to be safe and simple.
                        // Optimization: could be improved later.
                        // this.app.graph.renderer.renderAllNodes(); 
                        // Actually, renderAllNodes is expensive. Let's try to update the specific node element.
                        const newElement = node.render();
                        const oldElement = document.getElementById(node.id);
                        if (oldElement && oldElement.parentNode) {
                            oldElement.parentNode.replaceChild(newElement, oldElement);
                            // Re-bind events? Node.render() creates new elements with events attached.
                            // We need to make sure wires are re-drawn if positions changed (they didn't).
                            // But we need to make sure the node is still draggable.
                            // GraphController handles drag events on the container, so it should be fine.
                        }
                    }
                }
            });
        }

        this.validationResults = {
            success: allPassed,
            results: combinedResults
        };

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
