/**
 * Manages saving and loading from localStorage (now delegates heavy lifting to HistoryManager).
 */
export class Persistence {
    constructor(app, storageKey = 'blueprintGraph_v3') {
        this.storageKey = storageKey;
        this.timeoutId = null;
        this.app = app;
    }

    /** Saves the graph with a small delay to bundle quick changes. */
    autoSave(actionType = 'change') {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            // Instead of saving directly to localStorage, we save to history.
            this.app.history.saveState(actionType);
            this.timeoutId = null;
        }, 500); // Wait 500ms after the last change to save
    }

    /** Serializes the latest state from history and saves it to localStorage. */
    save() {
        try {
            if (this.app.history.undoStack.length === 0) {
                // Nothing to save if the undo stack is empty (should only happen on startup)
                return;
            }
            // Use the JSON state from the top of the history stack
            const stateJSON = this.app.history.undoStack[this.app.history.undoStack.length - 1].state;

            localStorage.setItem(this.storageKey, stateJSON);
            this.app.compiler.log("Graph saved to local storage.", "success");
        } catch (e) {
            // CRITICAL: Log persistence failure explicitly
            console.error("Failed to save graph:", e);
            this.app.compiler.log(`Failed to save graph. Error: ${e.message}.`, "error");
        }
    }

    /** Loads the graph state from localStorage and initializes the history stack. */
    load() {
        try {
            const stateJSON = localStorage.getItem(this.storageKey);

            if (stateJSON) {
                // Check for migration (old format vs new format)
                const parsedState = JSON.parse(stateJSON);
                let finalStateJSON = stateJSON;

                if (!parsedState.graphs) {
                    console.log("Migrating legacy save format to multi-graph format...");
                    const migratedState = {
                        activeGraph: 'EventGraph',
                        graphs: {
                            'EventGraph': { nodes: parsedState.nodes || [], links: parsedState.links || [] },
                            'ConstructionScript': { nodes: [], links: [] }
                        },
                        variables: parsedState.variables || [],
                        components: [],
                        pendingRenames: parsedState.pendingRenames || []
                    };
                    finalStateJSON = JSON.stringify(migratedState);
                }

                // Push to history and apply
                this.app.history.undoStack.push({ state: finalStateJSON, action: 'initial load' });
                this.app.history.applyState(finalStateJSON);
                this.app.compiler.log("Graph loaded from previous session.");
            } else {
                // If no saved state, load the default graph.
                this.loadDefaultGraph();
                this.app.compiler.log("Loaded default graph.");
            }
        } catch (e) {
            console.error("Failed to load or parse graph data:", e);
            // If parsing/loading fails, clear corrupted data and restart clean (default graph).
            localStorage.removeItem(this.storageKey);

            // FIX: Ensure history stack is reset before loading default, and re-run loadDefaultGraph
            if (this.app.history.undoStack.length > 0) {
                this.app.history.undoStack = [];
                this.app.history.redoStack = [];
            }
            this.loadDefaultGraph();
            this.app.compiler.log("Failed to load graph, starting fresh.", 'error');
        }
    }

    serializeNodes() {
        return (this.app.graph && this.app.graph.nodes) ? [...this.app.graph.nodes.values()].map(node => ({
            id: node.id, title: node.title, x: node.x, y: node.y,
            type: node.type, nodeKey: node.nodeKey, icon: node.icon,
            isCollapsed: node.isCollapsed, pins: node.getPinsData(),
            customData: node.customData,
            variableId: node.variableId
        })) : [];
    }

    serializeLinks() {
        return (this.app.wiring && this.app.wiring.links) ? [...this.app.wiring.links.values()].map(link => ({
            id: link.id, startPinId: link.startPin.id, endPinId: link.endPin.id,
        })) : [];
    }

    loadGraphData(data) {
        if (this.app.graph) {
            this.app.graph.loadState(data);
        }
    }

    /** Loads a simple default graph if no save file is found. */
    loadDefaultGraph() {
        // Clear existing nodes and links in case this is called mid-load from a catch block
        if (this.app.graph) {
            this.app.graph.nodes.clear();
            this.app.graph.nodesContainer.innerHTML = '';
        }
        if (this.app.wiring) {
            this.app.wiring.links.clear();
            if (this.app.wiring.svgGroup) {
                this.app.wiring.svgGroup.innerHTML = '<path id="ghost-wire" class="wire" style="pointer-events: none;"></path>';
            }
        }

        // --- CRITICAL FIX: Ensure graph and history are available before execution ---
        if (this.app.graph && this.app.history) {
            // This helper only ADDS nodes, then calls history.saveState to capture the new state
            this.app.graph.addNode("EventBeginPlay", 200, 200);
            this.app.graph.addNode("EventTick", 200, 400);
            this.app.graph.addNode("EventActorBeginOverlap", 200, 600);

            // Capture the state immediately here. HistoryManager handles adding it to the stack.
            this.app.history.saveState('default graph load');
        } else {
            console.error("Persistence.loadDefaultGraph: Required components (graph/history) are undefined.");
            // If this fails, the calling function (app.js init) must handle the cleanup.
        }
    }
}
