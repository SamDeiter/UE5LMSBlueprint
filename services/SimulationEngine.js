/**
 * Handles the runtime execution of the Blueprint graph.
 * Traversing execution pins and evaluating data dependencies.
 */
export class SimulationEngine {
    constructor(app) {
        this.app = app;
        this.isRunning = false;
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.consoleOutput = document.getElementById('compiler-results');
        this.simInterval = null;
    }

    /** Starts the simulation. */
    run() {
        if (this.isRunning) return;

        // FORCE VALIDATION BEFORE RUNNING
        // In UE5, you cannot Play In Editor (PIE) if there are compiler errors.
        const isValid = this.app.compiler.validate();
        if (!isValid) {
            this.log("Simulation halted: Fix compiler errors before playing.", "error");
            return;
        }

        this.isRunning = true;
        this.updateUI();
        this.log("--- Simulation Started ---", "success");

        // Find all EventBeginPlay nodes to start execution
        const startNodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === 'EventBeginPlay');

        // Even though validation ensures only 1 exists, we keep this generic loop structure.
        startNodes.forEach(node => {
            this.executeFlow(node);
        });
    }

    /** Stops the simulation. */
    stop() {
        this.isRunning = false;
        this.updateUI();
        this.log("--- Simulation Stopped ---", "error");
    }

    /** Updates Play/Stop button state and UI visual cues. */
    updateUI() {
        if (this.playBtn) this.playBtn.disabled = this.isRunning;
        if (this.stopBtn) this.stopBtn.disabled = !this.isRunning;

        if (this.isRunning) {
            this.app.graph.editor.style.boxShadow = 'inset 0 0 0 2px #4CAF50'; // Green border
        } else {
            this.app.graph.editor.style.boxShadow = 'none';
        }
    }

    /** Logs runtime messages to the output panel. */
    log(msg, type = 'log') {
        const div = document.createElement('div');
        div.textContent = `[Runtime] ${msg}`;
        if (type === 'error') div.className = 'compiler-issue';
        else if (type === 'success') div.className = 'compiler-success';
        else div.className = 'compiler-log';
        this.consoleOutput.prepend(div);
    }

    /** * Asynchronously follows the execution flow from a starting node.
     * @param {Node} startNode - The node to begin execution from.
     */
    async executeFlow(startNode) {
        let currentNode = startNode;

        // Safety limiter to prevent infinite loops crashing the browser in this phase
        let steps = 0;
        const maxSteps = 5000;

        while (currentNode && this.isRunning && steps < maxSteps) {
            steps++;

            // 1. Execute the specific logic for this node
            // Returns the ID of the output pin to follow (e.g., "exec_true"), or null for default
            const nextPinId = await this.executeNodeLogic(currentNode);

            // 2. Find the output execution pin to follow
            let outPin = null;
            if (nextPinId) {
                outPin = currentNode.findPinById(`${currentNode.id}-${nextPinId}`);
            } else {
                // Default: look for the first execution output pin
                outPin = currentNode.pinsOut.find(p => p.type === 'exec');
            }

            // If no valid output pin or it's unconnected, stop flow
            if (!outPin || !outPin.isConnected()) {
                currentNode = null;
                break;
            }

            // 3. Follow the wire to the next node
            const linkId = outPin.links[0]; // Execution pins only have one outgoing link
            const link = this.app.wiring.links.get(linkId);

            if (link) {
                currentNode = link.endPin.node;
                // Small delay to visualize flow could go here
            } else {
                currentNode = null;
            }
        }

        if (steps >= maxSteps) {
            this.log("Infinite loop detected or max steps reached. Stopping.", "error");
            this.stop();
        }
    }

    /** Executes the core logic of a specific node. */
    async executeNodeLogic(node) {
        switch (node.nodeKey) {
            case 'EventBeginPlay':
                return null; // Pass through

            case 'PrintString': {
                const strVal = this.evaluateInput(node, 'str_in');
                this.log(`Print: ${strVal}`);
                return null;
            }

            case 'Branch': {
                const condition = this.evaluateInput(node, 'cond_in');
                return condition ? 'exec_true' : 'exec_false';
            }

            default:
                // Handle dynamic Set nodes
                if (node.nodeKey.startsWith('Set_')) {
                    const varName = node.nodeKey.replace('Set_', '');
                    const val = this.evaluateInput(node, 'val_in');

                    const variable = this.app.variables.variables.get(varName);
                    if (variable) {
                        variable.defaultValue = val; // Update the runtime value
                        // Note: This mutates the 'default' value which persists in the UI.
                        // In a real engine, runtime state is separate from edit-time defaults.
                    }
                    return null;
                }
                return null;
        }
    }

    /** * Recursively evaluates the value of an input pin.
     * @param {Node} node - The node requesting the value.
     * @param {string} pinLocalId - The local ID of the input pin (e.g., 'a_in').
     */
    evaluateInput(node, pinLocalId) {
        const fullPinId = `${node.id}-${pinLocalId}`;
        const pin = node.findPinById(fullPinId);

        if (!pin) return null;

        // 1. If connected, pull value from the source node
        if (pin.isConnected()) {
            const linkId = pin.links[0]; // Data inputs only have one link
            const link = this.app.wiring.links.get(linkId);
            const sourcePin = link.startPin;
            const sourceNode = sourcePin.node;

            return this.evaluateNodeValue(sourceNode, sourcePin);
        }

        // 2. If not connected, use the literal value (or default)
        const literal = node.pinLiterals.get(fullPinId);
        return literal !== undefined ? literal : pin.defaultValue;
    }

    /** Evaluates the return value of a node (Pure nodes). */
    evaluateNodeValue(node) {
        // 1. Variable Getters
        if (node.nodeKey.startsWith('Get_')) {
            const varName = node.nodeKey.replace('Get_', '');
            const variable = this.app.variables.variables.get(varName);
            return variable ? variable.defaultValue : null;
        }

        // 2. Type Conversions
        if (node.nodeKey.startsWith('Conv_')) {
            const val = this.evaluateInput(node, 'val_in');
            // Basic string conversion
            return String(val);
        }

        // 3. Math Nodes
        if (node.nodeKey === 'AddInt') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return Number(a) + Number(b);
        }
        if (node.nodeKey === 'AddFloat') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return parseFloat(a) + parseFloat(b);
        }
        if (node.nodeKey === 'SubtractFloat') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return parseFloat(a) - parseFloat(b);
        }

        return null;
    }
}
