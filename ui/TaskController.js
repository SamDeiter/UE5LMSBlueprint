

export class TaskController {
    constructor(app) {
        this.app = app;
        this.selector = document.getElementById('task-selector');
        // this.validateBtn removed in favor of Compile/Play hooks
        this.statusTab = document.querySelector('.bottom-tab[data-tab="task-status"]');
        this.statusContent = document.getElementById('task-status-content');
        this.compilerResults = document.getElementById('compiler-results');

        this.taskTitle = document.getElementById('task-title');
        this.taskDesc = document.getElementById('task-desc');
        this.requirementsList = document.getElementById('task-requirements');

        this.init();
    }

    init() {
        this.populateTaskSelector();
        this.bindEvents();
    }

    populateTaskSelector() {
        const tasks = this.app.taskManager.getAllTasks();
        this.selector.innerHTML = '<option value="">Select Task...</option>';

        // Group tasks by level
        const tasksByLevel = {};
        tasks.forEach(task => {
            const level = task.level || 0;
            if (!tasksByLevel[level]) {
                tasksByLevel[level] = [];
            }
            tasksByLevel[level].push(task);
        });

        // Sort levels
        const levels = Object.keys(tasksByLevel).sort((a, b) => a - b);

        levels.forEach(level => {
            // Add optgroup for each level
            const optgroup = document.createElement('optgroup');
            optgroup.label = level === '0' ? 'Sample Tasks' : `Level ${level}`;

            tasksByLevel[level].forEach(task => {
                const option = document.createElement('option');
                option.value = task.taskId;
                option.textContent = task.title;
                optgroup.appendChild(option);
            });

            this.selector.appendChild(optgroup);
        });
    }

    bindEvents() {
        // Task Selection
        this.selector.addEventListener('change', (e) => {
            const taskId = e.target.value;
            if (taskId) {
                // Check if there are nodes in the graph
                const hasNodes = this.app.graph.nodes.size > 0;

                if (hasNodes) {
                    // Ask user if they want to clear the graph
                    this.showClearGraphConfirmation(() => {
                        this.clearGraphAndLoadTask(taskId);
                    }, () => {
                        // User chose not to clear - just load the task
                        this.app.taskManager.setCurrentTask(taskId);
                        this.updateStatusPanel();
                        this.switchToStatusTab();
                    });
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

        this.compileBtn = document.getElementById('compile-btn');
        this.playBtn = document.getElementById('play-btn');

        // Hook into Compile and Play for Validation
        this.compileBtn.addEventListener('click', () => this.runValidation());
        this.playBtn.addEventListener('click', () => this.runValidation());
        // Tab Switching Logic (handling the new tab)
        document.querySelectorAll('.bottom-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all
                document.querySelectorAll('.bottom-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel-content').forEach(c => {
                    if (c.parentElement.id === 'bottom-strip') c.style.display = 'none';
                });

                // Activate clicked
                tab.classList.add('active');
                const tabId = tab.dataset.tab;

                if (tabId === 'task-status') {
                    this.statusContent.style.display = 'block';
                } else if (tabId === 'compiler') {
                    this.compilerResults.style.display = 'block';
                } else {
                    // Find results placeholder
                    const findResults = document.getElementById('find-results') || document.createElement('div'); // Fallback
                    findResults.style.display = 'block';
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
            this.requirementsList.innerHTML = '';
            return;
        }

        this.taskTitle.textContent = task.title;
        this.taskDesc.textContent = task.description;
        this.requirementsList.innerHTML = '';

        // Add progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = 'margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px;';

        const progressLabel = document.createElement('div');
        progressLabel.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; color: #aaa;';

        const results = validationResults ? validationResults.results : null;
        const passedCount = results ? results.filter(r => r.passed).length : 0;
        const totalCount = task.requirements.length;
        const progressPercent = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

        progressLabel.innerHTML = `<span>Progress</span><span>${passedCount}/${totalCount} (${progressPercent}%)</span>`;
        progressContainer.appendChild(progressLabel);

        const progressBarBg = document.createElement('div');
        progressBarBg.style.cssText = 'width: 100%; height: 20px; background: #222; border-radius: 10px; overflow: hidden; border: 1px solid #444;';

        const progressBarFill = document.createElement('div');
        progressBarFill.style.cssText = `width: ${progressPercent}%; height: 100%; background: linear-gradient(to right, #4CAF50, #45a049); transition: width 0.3s ease;`;
        progressBarBg.appendChild(progressBarFill);
        progressContainer.appendChild(progressBarBg);

        this.requirementsList.appendChild(progressContainer);

        // Requirements list
        task.requirements.forEach((req, index) => {
            const result = results ? results[index] : null;
            const isPassed = result ? result.passed : false;

            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                color: ${isPassed ? '#4caf50' : '#ccc'};
                background: ${isPassed ? 'rgba(76, 175, 80, 0.1)' : 'transparent'};
                transition: all 0.2s ease;
            `;

            const icon = document.createElement('i');
            icon.className = isPassed ? 'fas fa-check-circle' : 'far fa-circle';
            icon.style.cssText = `
                margin-right: 12px;
                font-size: 16px;
                color: ${isPassed ? '#4caf50' : '#666'};
            `;

            const text = document.createElement('span');
            text.textContent = req.description;
            text.style.flex = '1';

            item.appendChild(icon);
            item.appendChild(text);
            this.requirementsList.appendChild(item);
        });

        // Success message
        if (validationResults && validationResults.success) {
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                margin-top: 20px;
                padding: 20px;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
                border: 2px solid #4caf50;
                border-radius: 8px;
                color: #4caf50;
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                animation: pulse 2s ease-in-out infinite;
            `;
            successMsg.innerHTML = '<i class="fas fa-trophy" style="margin-right: 10px; font-size: 20px;"></i>Task Complete! Well Done!';
            this.requirementsList.appendChild(successMsg);

            // Add animation keyframes if not already present
            if (!document.getElementById('pulse-animation')) {
                const style = document.createElement('style');
                style.id = 'pulse-animation';
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
        this.app.wiring.links.clear();
        this.app.graph.clearSelection();
        this.app.wiring.clearLinkSelection();
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
        const modal = document.getElementById('confirmation-modal');
        const message = document.getElementById('confirmation-msg');
        const yesBtn = document.getElementById('confirm-yes-btn');
        const noBtn = document.getElementById('confirm-no-btn');

        // Store original values to restore later
        const originalYesText = yesBtn.textContent;
        const originalYesColor = yesBtn.style.backgroundColor;

        // Set custom text for clear graph confirmation
        message.textContent = 'Clear the current graph to start this task fresh?';
        yesBtn.textContent = 'Clear Graph';
        yesBtn.style.backgroundColor = '#4CAF50'; // Green for positive action

        modal.style.display = 'flex';

        const handleYes = () => {
            modal.style.display = 'none';
            // Reset to original values
            yesBtn.textContent = originalYesText;
            yesBtn.style.backgroundColor = originalYesColor;
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            if (onConfirm) onConfirm();
        };

        const handleNo = () => {
            modal.style.display = 'none';
            // Reset to original values
            yesBtn.textContent = originalYesText;
            yesBtn.style.backgroundColor = originalYesColor;
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            if (onCancel) onCancel();
        };

        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }
}
