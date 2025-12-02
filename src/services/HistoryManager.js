/**
 * Manages the history stack for undo/redo and handles application state persistence.
 */
export class HistoryManager {
    constructor(app, maxHistory = 50) {
        this.app = app;
        this.maxHistory = maxHistory;
        this.undoStack = [];
        this.redoStack = [];
        this.isPerformingHistoryAction = false;
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        this.updateButtons(); // Initialize button states
    }

    /**
     * Captures the current application state (graph, links, variables) and pushes it to the undo stack.
     * Clears the redo stack.
     */
    saveState(actionType = 'action') {
        if (this.isPerformingHistoryAction) return;

        // 1. Capture current graph state into the graphs map
        // Use Persistence helper to ensure consistent serialization
        if (!this.app.graphs) {
            this.app.graphs = {};
        }
        if (!this.app.activeGraph) {
            this.app.activeGraph = 'EventGraph';
        }

        this.app.graphs[this.app.activeGraph] = {
            nodes: this.app.persistence.serializeNodes(),
            links: this.app.persistence.serializeLinks()
        };

                const variablesArray = (this.app.variables && this.app.variables.variables) ? [...this.app.variables.variables.values()] : [];
        const functionsArray = (this.app.functionRegistry) ? this.app.functionRegistry.getAll().map(f => f.toJSON()) : [];
        const macrosArray = (this.app.macroRegistry) ? this.app.macroRegistry.getAll().map(m => m.toJSON()) : [];
        const componentsArray = (this.app.components) ? [...this.app.components.values()] : [];

        const state = {
            activeGraph: this.app.activeGraph,
            graphs: this.app.graphs,
            variables: variablesArray,
            components: componentsArray,
            functions: functionsArray,
            macros: macrosArray,
            // Persist pending renames so they aren't lost on reload
            pendingRenames: this.app.compiler ? this.app.compiler.pendingRenames : []
        };

        const stateJSON = JSON.stringify(state);

        // 2. Check if the state is actually different from the last saved state
        if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1].state === stateJSON) {
            return;
        }

        // 3. Push to undo stack
        this.undoStack.push({ state: stateJSON, action: actionType });

        // 4. Truncate undo stack if necessary
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }

        // 5. Clear redo stack
        this.redoStack = [];

        this.updateButtons();
        // Automatically save the latest state to localStorage when the history state changes
        this.app.persistence.save();
    }

    /**
     * Applies a state retrieved from a stack to the application.
     * @param {string} stateJSON - The serialized state to load.
     */
    applyState(stateJSON) {
        this.isPerformingHistoryAction = true;
        try {
            const state = JSON.parse(stateJSON);

            // 1. Clear current state (ULTRA-DEFENSIVE CHECKS: Resolves previous TypeErrors)
            if (this.app.graph && this.app.graph.nodes) this.app.graph.nodes.clear();
            if (this.app.wiring && this.app.wiring.links) this.app.wiring.links.clear();
            if (this.app.variables && this.app.variables.variables) this.app.variables.variables.clear();
            if (this.app.components) this.app.components.clear();

            // Clear DOM elements
            if (this.app.graph && this.app.graph.nodesContainer) this.app.graph.nodesContainer.innerHTML = '';
            if (this.app.wiring && this.app.wiring.svgGroup) {
                // Ensure ghost wire path remains
                this.app.wiring.svgGroup.innerHTML = '<path id="ghost-wire" class="wire" style="pointer-events: none;"></path>';
            }

            // 2. Load the state. Must ensure variables load first to populate NodeLibrary
            if (this.app.variables) this.app.variables.loadState(state); // Loads variables & updates NodeLibrary

            // Restore Functions
            if (state.functions && this.app.functionRegistry) {
                this.app.functionRegistry.clear();
                state.functions.forEach(fData => {
                    // We need to import FunctionDefinition class or have a static helper, 
                    // but we can't import here easily if not already imported.
                    // However, FunctionRegistry stores FunctionDefinition objects.
                    // Let's assume we can reconstruct them or just store the data if Registry handles it.
                    // Actually, we should use FunctionDefinition.fromJSON if available, or just pass data if registry handles it.
                    // Let's check FunctionRegistry.register. It expects a FunctionDefinition object.
                    // We need to reconstruct it.
                    // Since we can't easily import FunctionDefinition here without changing imports at top,
                    // let's check if we can access it via app? No.
                    // But wait, FunctionRegistry is imported in app.js.
                    // Maybe we can add a loadState method to FunctionsController?
                    // Or just manually reconstruct if it's simple data.
                    // FunctionDefinition has methods like addInput.
                    // If we just store raw JSON, we lose methods.
                    // Ideally, FunctionsController should handle loading.
                });
                // Better approach: Delegate to FunctionsController
                if (this.app.functionsController) {
                    this.app.functionsController.loadState(state.functions);
                }
            }

            // Restore Macros
            if (state.macros && this.app.macrosController) {
                this.app.macrosController.loadState(state.macros);
            }

            // Restore Components
            if (state.components && this.app.components) {
                state.components.forEach(c => this.app.components.set(c.id, c));
                if (this.app.componentsController) {
                    this.app.componentsController.render();
                    this.app.componentsController.updateNodeLibrary();
                }
            }

            // Restore graphs map and active graph
            this.app.graphs = state.graphs || { 'EventGraph': { nodes: [], links: [] } };
            // Ensure ConstructionScript exists
            if (!this.app.graphs['ConstructionScript']) {
                this.app.graphs['ConstructionScript'] = { nodes: [], links: [] };
            }

            this.app.activeGraph = state.activeGraph || 'EventGraph';

            // Load the active graph data
            const activeGraphData = this.app.graphs[this.app.activeGraph] || { nodes: [], links: [] };
            if (this.app.graph) this.app.graph.loadState(activeGraphData);

            // 3. Restore Compiler State (Pending Renames)
            if (this.app.compiler && state.pendingRenames) {
                this.app.compiler.pendingRenames = state.pendingRenames;
                if (state.pendingRenames.length > 0) {
                    this.app.compiler.markDirty();
                }
            }

            // 4. Re-render UI
            // The remaining checks here ensure that if any component fails to initialize (like graph), 
            // we don't attempt to call methods on it, preventing the cascading 'renderAllNodes' error.
            if (this.app.graph) this.app.graph.renderAllNodes();
            if (this.app.graph) this.app.graph.drawAllWires();
            if (this.app.graph) this.app.graph.updateTransform();
            if (this.app.details) this.app.details.clear();
            if (this.app.compiler) this.app.compiler.validate();
            if (this.app.graph) this.app.graph.clearSelection();
        } catch (e) {
            this.app.compiler.log(`Error performing history action: ${e.message}`, 'error');
            console.error("History Application Error:", e);
        } finally {
            this.isPerformingHistoryAction = false;
        }
    }

    /** Rolls back the state by one step. */
    undo() {
        if (this.undoStack.length < 2) return; // Need at least two states (current + previous)

        // 1. Move current state from undo to redo
        const currentState = this.undoStack.pop();
        this.redoStack.push(currentState);

        // 2. Load the previous state
        const prevState = this.undoStack[this.undoStack.length - 1];
        if (prevState) {
            this.applyState(prevState.state);
            this.app.compiler.log(`Undo successful: Rolled back one ${prevState.action}.`);
        }

        this.updateButtons();
        this.app.persistence.save(); // Save current state to local storage
    }

    /** Rolls forward the state by one step. */
    redo() {
        if (this.redoStack.length === 0) return;

        // 1. Move state from redo back to undo
        const nextState = this.redoStack.pop();
        this.undoStack.push(nextState);

        // 2. Apply the state
        this.applyState(nextState.state);
        this.app.compiler.log(`Redo successful: Reverted one ${nextState.action}.`);

        this.updateButtons();
        this.app.persistence.save(); // Save current state to local storage
    }

    /** Enables/disables the undo/redo buttons based on stack size. */
    updateButtons() {
        if (this.undoBtn && this.redoBtn) {
            this.undoBtn.disabled = this.undoStack.length <= 1;
            this.redoBtn.disabled = this.redoStack.length === 0;
        }
    }
}
