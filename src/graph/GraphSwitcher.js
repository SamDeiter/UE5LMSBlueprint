/**
 * Handles switching between different graph contexts (EventGraph, ConstructionScript, Functions, Macros)
 */
export class GraphSwitcher {
    constructor(app) {
        this.app = app;
    }

    /**
     * Switches to a different graph context
     * @param {string} graphName - Name of the graph to switch to
     */
    switchGraph(graphName) {
        if (this.app.activeGraph === graphName) return;

        // 1. Save current graph state to memory
        let currentGraphStorage;
        if (this.app.graphs[this.app.activeGraph]) {
            currentGraphStorage = this.app.graphs[this.app.activeGraph];
        } else if (this.app.functionRegistry && this.app.functionRegistry.getByName(this.app.activeGraph)) {
            currentGraphStorage = this.app.functionRegistry.getByName(this.app.activeGraph).graph;
        } else if (this.app.macroRegistry && this.app.macroRegistry.getByName(this.app.activeGraph)) {
            currentGraphStorage = this.app.macroRegistry.getByName(this.app.activeGraph).graph;
        }

        if (currentGraphStorage) {
            currentGraphStorage.nodes = this.app.persistence.serializeNodes();
            currentGraphStorage.links = this.app.persistence.serializeLinks();
        }

        // 2. Switch Context
        this.app.activeGraph = graphName;

        // 3. Load New Graph
        let newGraphData;
        if (this.app.graphs[graphName]) {
            newGraphData = this.app.graphs[graphName];
        } else if (this.app.functionRegistry && this.app.functionRegistry.getByName(graphName)) {
            newGraphData = this.app.functionRegistry.getByName(graphName).graph;
        } else if (this.app.macroRegistry && this.app.macroRegistry.getByName(graphName)) {
            newGraphData = this.app.macroRegistry.getByName(graphName).graph;
        }

        // 4. Clear and Reload Nodes/Links
        this.app.graph.nodes.clear();
        this.app.wiring.links.clear();

        // Clear visual wire elements (keep ghost wire)
        const ghostWire = this.app.wiring.ghostWire;
        const svgGroup = this.app.wiring.svgGroup;
        while (svgGroup.firstChild) {
            if (svgGroup.firstChild !== ghostWire) {
                svgGroup.removeChild(svgGroup.firstChild);
            } else {
                // If ghost wire is first, move to next or break if it's the only one
                if (svgGroup.childNodes.length === 1) break;
                // Move ghost wire to end to preserve it while removing others? 
                // Easier: just re-append it after clearing if we nuked it, 
                // but safer to just filter removal.
                // Actually, let's just remove all children that aren't the ghost wire.
                // Since we're iterating, let's do it safely:
                break; // Let's use a safer loop below
            }
        }
        // Safer clear loop:
        Array.from(svgGroup.children).forEach(child => {
            if (child.id !== 'ghost-wire') {
                child.remove();
            }
        });

        if (newGraphData) {
            this.app.persistence.loadGraphData(newGraphData);
        }

        // 5a. Populate Default Nodes if Empty (UE5 Style)
        if (this.app.graph.nodes.size === 0) {
            if (graphName === 'ConstructionScript') {
                this.app.graph.addNode('ConstructionScript', 200, 200);
            } else if (graphName === 'EventGraph') {
                this.app.graph.addNode('EventBeginPlay', 200, 200);
                this.app.graph.addNode('EventTick', 200, 400);
                this.app.graph.addNode('EventActorBeginOverlap', 200, 600);
            } else if (this.app.functionRegistry && this.app.functionRegistry.getByName(graphName)) {
                // Spawn Entry and Result nodes for new functions
                this.app.graph.addNode('FunctionEntry', 200, 200);
                this.app.graph.addNode('FunctionResult', 600, 200);
            } else if (this.app.macroRegistry && this.app.macroRegistry.getByName(graphName)) {
                // Spawn Entry and Result nodes for new macros
                this.app.graph.addNode('MacroEntry', 200, 200);
                this.app.graph.addNode('MacroResult', 600, 200);
            }
        }

        // 5. Re-render
        this.app.graph.renderAllNodes();
        this.app.graph.drawAllWires();

        // 6. Update active tab styling and create tab if needed
        this.updateTabs(graphName);

        // 7. Update Local Variables Panel
        if (this.app.localVariablesController) {
            this.app.localVariablesController.render();
        }
    }

    updateTabs(graphName) {
        const tabBar = document.getElementById('tabbar');
        if (!tabBar) {
            console.warn('Tab bar not found');
            return;
        }

        // Check if tab exists
        let tab = document.querySelector(`.graph-tab[data-graph="${graphName}"]`);

        // Create tab if it doesn't exist
        if (!tab) {
            tab = document.createElement('div');
            tab.className = 'tab graph-tab';
            tab.dataset.graph = graphName;

            // Determine icon and color based on type
            let icon = 'fas fa-cube';
            let color = '#a8b';

            if (graphName === 'EventGraph') {
                icon = 'fas fa-file-code';
                color = '#4a90e2';
            } else if (graphName === 'ConstructionScript') {
                icon = 'fas fa-tools';
                color = '#8A3B04'; // Match header color
            } else if (this.app.macroRegistry && this.app.macroRegistry.getByName(graphName)) {
                icon = 'fas fa-project-diagram';
                color = '#4ae2a8';
            } else if (this.app.functionRegistry && this.app.functionRegistry.getByName(graphName)) {
                icon = 'fas fa-cube';
                color = '#a8b';
            }

            tab.innerHTML = `
                <i class="${icon}" style="color: ${color}; margin-right: 6px;"></i>
                <span>${graphName === 'ConstructionScript' ? 'Construction Script' : (graphName === 'EventGraph' ? 'Event Graph' : graphName)}</span>
                <i class="fas fa-times tab-close"></i>
            `;

            // Add click handler to switch to this graph
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    this.app.switchGraph(graphName);
                }
            });

            // Add close handler
            const closeBtn = tab.querySelector('.tab-close');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tab.remove();
                // Switch to EventGraph when closing a tab
                this.app.switchGraph('EventGraph');
            });

            // Insert before the tab-spacer
            const spacer = tabBar.querySelector('.tab-spacer');
            if (spacer) {
                tabBar.insertBefore(tab, spacer);
            } else {
                tabBar.appendChild(tab);
            }
        }

        // Update active state
        document.querySelectorAll('.graph-tab').forEach(t => t.classList.remove('active'));
        if (tab) {
            tab.classList.add('active');
        }
    }
