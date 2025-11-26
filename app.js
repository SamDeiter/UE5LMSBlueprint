/**
 * Main Application Logic for the UE5-style Blueprint Editor.
 * This is the main entry point that imports all other modules
 * and orchestrates the application.
 */

// Import all controllers
import { WiringController, GraphController } from './graph/index.js';
import { GraphSwitcher } from './graph/GraphSwitcher.js';
import { VariableController, PaletteController, ActionMenu, ContextMenu, DetailsController, LayoutController, TaskController, ComponentsController, NeedNodeModal } from './ui.js';
import { Compiler, Persistence, GridController, HistoryManager, SimulationEngine } from './services.js';
// Cache bust the tests module to ensure latest export is found
import { TestRunner, registerTests } from './tests.js?v=4';
import { BlueprintValidator, SAMPLE_TASK } from './utils/validator.js';
import { TaskManager } from './services/TaskManager.js';
import { nodeRegistry } from './registries/NodeRegistry.js';
import { NodeDefinitions } from './data/NodeDefinitions.js';


/**
 * Main static application class to initialize and namespace all controllers.
 */
class BlueprintApp {
    /**
     * Initializes all controllers and loads the graph.
     */
    static init() {
        // Expose for inline events (onclick)
        window.app = BlueprintApp;
        BlueprintApp.nodeRegistry = nodeRegistry;

        // Register static node definitions into the runtime registry
        try {
            nodeRegistry.registerBatch(NodeDefinitions);
        } catch (err) {
            console.error('Failed to register NodeDefinitions:', err);
        }

        // DOM Elements - Fail early if missing
        const graphEditorEl = document.getElementById('graph-editor');
        const nodesContainerEl = document.getElementById('nodes-container');
        const graphSvgEl = document.getElementById('graph-svg');
        const graphCanvasEl = document.getElementById('graph-canvas');

        if (!graphEditorEl || !nodesContainerEl || !graphSvgEl || !graphCanvasEl) {
            console.error("Critical DOM elements missing. Initialization aborted.");
            return;
        }

        // --- Controller Initialization (Order is Crucial) ---

        // 1. Core Data Structures
        BlueprintApp.components = new Map();

        // 2. Low-Level Controllers (Layout, Wiring, Grid)
        BlueprintApp.layout = new LayoutController(BlueprintApp);
        BlueprintApp.wiring = new WiringController(graphSvgEl, BlueprintApp);
        BlueprintApp.grid = new GridController(graphCanvasEl, BlueprintApp);

        // 3. Data Controllers (Variables, History)
        BlueprintApp.variables = new VariableController(BlueprintApp);
        BlueprintApp.history = new HistoryManager(BlueprintApp);

        // 4. Main Graph Controller (Depends on Wiring, Variables, History)
        BlueprintApp.graph = new GraphController(
            graphEditorEl,
            graphSvgEl,
            nodesContainerEl,
            BlueprintApp
        );

        // 5. Service Controllers (Persistence, Compiler, Sim)
        BlueprintApp.persistence = new Persistence(BlueprintApp);
        BlueprintApp.compiler = new Compiler(BlueprintApp);
        BlueprintApp.sim = new SimulationEngine(BlueprintApp);

        // 6. UI Controllers
        BlueprintApp.componentsController = new ComponentsController(BlueprintApp);
        BlueprintApp.palette = new PaletteController(BlueprintApp);
        BlueprintApp.details = new DetailsController(BlueprintApp);
        BlueprintApp.actionMenu = new ActionMenu(BlueprintApp);
        BlueprintApp.contextMenu = new ContextMenu(BlueprintApp);
        BlueprintApp.needNodeModal = new NeedNodeModal(BlueprintApp);

        // 7. Task System
        BlueprintApp.taskManager = new TaskManager(BlueprintApp);
        window.setTask = (taskId) => BlueprintApp.taskManager.setCurrentTask(taskId);
        window.validateTask = () => BlueprintApp.taskManager.validateCurrentTask();
        window.clearTask = () => BlueprintApp.taskManager.clearTask();

        BlueprintApp.taskUI = new TaskController(BlueprintApp);

        // 8. Graph Switcher
        BlueprintApp.graphSwitcher = new GraphSwitcher(BlueprintApp);
        BlueprintApp.switchGraph = (graphName) => BlueprintApp.graphSwitcher.switchGraph(graphName);

        // 9. Validators & Runners
        BlueprintApp.testRunner = new TestRunner(BlueprintApp);
        registerTests(BlueprintApp.testRunner);
        window.runTests = () => BlueprintApp.testRunner.run();

        BlueprintApp.validator = new BlueprintValidator(BlueprintApp);
        window.validateSampleTask = () => BlueprintApp.validator.validateTask(SAMPLE_TASK);

        // --- Bind Events ---
        if (BlueprintApp.graph) {
            BlueprintApp.graph.initEvents();
        }

        // Trigger full compilation logic instead of just validation
        const compileBtn = document.getElementById('compile-btn');
        if (compileBtn) compileBtn.addEventListener('click', () => BlueprintApp.compiler.compile());

        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) saveBtn.addEventListener('click', () => BlueprintApp.persistence.save(true));

        // Bind Undo/Redo Buttons
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => BlueprintApp.history.undo());

        const redoBtn = document.getElementById('redo-btn');
        if (redoBtn) redoBtn.addEventListener('click', () => BlueprintApp.history.redo());

        // Bind Play/Stop Buttons
        const playBtn = document.getElementById('play-btn');
        if (playBtn) playBtn.addEventListener('click', () => BlueprintApp.sim.run());

        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) stopBtn.addEventListener('click', () => BlueprintApp.sim.stop());

        // Help Modal Events
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                const modal = document.getElementById('help-modal');
                if (modal) modal.style.display = 'flex';
            });
        }

        const helpCloseBtn = document.getElementById('help-modal-close');
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => {
                const modal = document.getElementById('help-modal');
                if (modal) modal.style.display = 'none';
            });
        }

        // --- Global Hotkeys ---
        document.addEventListener('keydown', (e) => {
            const target = e.target;
            const tagName = target.tagName ? target.tagName.toUpperCase() : '';
            const isTextEditor = tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;

            if (isTextEditor) return;

            if (e.ctrlKey) {
                if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); BlueprintApp.history.undo(); return; }
                if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); BlueprintApp.history.redo(); return; }
                if (e.key === 's' || e.key === 'S') { e.preventDefault(); BlueprintApp.persistence.save(); return; }
                if (e.key === 'w' || e.key === 'W') { e.preventDefault(); BlueprintApp.graph.duplicateSelectedNodes(); return; }
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                let varToDelete = BlueprintApp.details.currentVariable;

                if (!varToDelete) {
                    const activeEl = document.activeElement;
                    if (activeEl) {
                        const focusedVarEl = activeEl.closest('.tree-item[data-var-id]');
                        if (focusedVarEl) {
                            varToDelete = [...BlueprintApp.variables.variables.values()].find(v => v.id === focusedVarEl.dataset.varId);
                        }
                    }
                }

                let componentToDelete = null;
                if (!varToDelete) {
                    const activeEl = document.activeElement;
                    if (activeEl) {
                        const focusedCompEl = activeEl.closest('.tree-item[data-component-id]');
                        if (focusedCompEl) {
                            componentToDelete = focusedCompEl.dataset.componentId;
                        }
                    }
                    if (!componentToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {
                        componentToDelete = BlueprintApp.componentsController.selectedComponentId;
                    }
                }

                if (varToDelete) {
                    BlueprintApp.variables.deleteVariable(varToDelete);
                } else if (componentToDelete) {
                    BlueprintApp.componentsController.deleteComponent(componentToDelete);
                }
            }
        });

        // --- Load & Render Sequence ---
        try {
            if (BlueprintApp.persistence) {
                BlueprintApp.persistence.load();
            } else {
                console.error("Persistence controller not initialized!");
            }
        } catch (err) {
            console.error("Failed to load persistence state:", err);
        }

        // Initialize history with the loaded state
        if (BlueprintApp.history) {
            BlueprintApp.history.saveState('initial load');
        }

        if (BlueprintApp.graph) {
            BlueprintApp.graph.renderAllNodes();
            requestAnimationFrame(() => {
                BlueprintApp.graph.drawAllWires();
            });
        }

        BlueprintApp.palette.populateList();
        BlueprintApp.variables.renderPanel();
        BlueprintApp.componentsController.render(); // Ensure components panel is rendered
        BlueprintApp.compiler.validate();
        BlueprintApp.grid.draw();
    }
}

// Start the application once the DOM is fully loaded
window.addEventListener('load', () => {
    try {
        BlueprintApp.init.bind(BlueprintApp)();
    } catch (e) {
        console.error("APP INITIALIZATION ERROR:", e.message, e);
    }
});
