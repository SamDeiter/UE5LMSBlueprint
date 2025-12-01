/**
 * Base class for all node executors.
 * Executors handle the runtime logic for specific node types.
 */
export class BaseExecutor {
    /**
     * @param {SimulationEngine} engine - Reference to the simulation engine
     */
    constructor(engine) {
        this.engine = engine;
        this.app = engine.app;
    }

    /**
     * Executes the node's logic during flow execution.
     * @param {Node} node - The node to execute
     * @returns {Promise<string|null>} The ID of the next execution pin to follow, or null
     */
    async execute(node) {
        throw new Error(`execute() must be implemented by ${this.constructor.name}`);
    }

    /**
     * Evaluates the output value of a pure node (data flow).
     * @param {Node} node - The node to evaluate
     * @param {Pin} pin - The output pin being evaluated
     * @returns {*} The computed value
     */
    evaluateValue(node, pin) {
        // Default: return null (not all executors need this)
        return null;
    }

    /**
     * Helper: Evaluate an input pin value
     * @param {Node} node - The node
     * @param {string} pinLocalId - Local pin ID (e.g., 'a_in')
     * @returns {*} The evaluated value
     */
    evaluateInput(node, pinLocalId) {
        return this.engine.evaluateInput(node, pinLocalId);
    }

    /**
     * Helper: Log a message
     * @param {string} msg - Message to log
     * @param {string} type - Log type ('log', 'error', 'success')
     */
    log(msg, type = 'log') {
        this.engine.log(msg, type);
    }
}
