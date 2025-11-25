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
        } else if (this.app.functions.has(this.app.activeGraph)) {
            currentGraphStorage = this.app.functions.get(this.app.activeGraph).graph;
        } else if (this.app.macros.has(this.app.activeGraph)) {
            currentGraphStorage = this.app.macros.get(this.app.activeGraph).graph;
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
        } else if (this.app.functions.has(graphName)) {
            newGraphData = this.app.functions.get(graphName).graph;
        } else if (this.app.macros.has(graphName)) {
            newGraphData = this.app.macros.get(graphName).graph;
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
            }
        }

        // 5. Re-render
        this.app.graph.renderAllNodes();
        this.app.graph.drawAllWires();

        // 6. Update active tab styling
        document.querySelectorAll('.graph-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.graph-tab[data-graph="${graphName}"]`)?.classList.add('active');
    }
}
