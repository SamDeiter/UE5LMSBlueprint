/**
 * Central registry for node executors.
 * Maps node types to their corresponding executor instances.
 */
export class ExecutorRegistry {
    /**
     * @param {SimulationEngine} engine - Reference to the simulation engine
     */
    constructor(engine) {
        this.engine = engine;

        // Exact match registry: nodeKey → Executor
        this.executors = new Map();

        // Pattern-based registry: { pattern: RegExp, executor: Executor }[]
        this.patternExecutors = [];
    }

    /**
     * Register an executor for a specific node type
     * @param {string} nodeKey - The exact node key (e.g., 'Branch', 'PrintString')
     * @param {BaseExecutor} executor - The executor instance
     */
    register(nodeKey, executor) {
        this.executors.set(nodeKey, executor);
    }

    /**
     * Register an executor for a pattern of node types
     * @param {RegExp|string} pattern - Pattern to match (e.g., /^Get_/, 'Set_*')
     * @param {BaseExecutor} executor - The executor instance
     */
    registerPattern(pattern, executor) {
        // Convert string patterns to RegExp
        if (typeof pattern === 'string') {
            // Convert glob-style pattern to regex
            const regexStr = pattern
                .replace(/\*/g, '.*')
                .replace(/\?/g, '.');
            pattern = new RegExp(`^${regexStr}$`);
        }

        this.patternExecutors.push({ pattern, executor });
    }

    /**
     * Get the executor for a given node type
     * @param {string} nodeKey - The node key to look up
     * @returns {BaseExecutor|null} The executor, or null if not found
     */
    getExecutor(nodeKey) {
        // 1. Try exact match first
        if (this.executors.has(nodeKey)) {
            return this.executors.get(nodeKey);
        }

        // 2. Try pattern matching
        for (const { pattern, executor } of this.patternExecutors) {
            if (pattern.test(nodeKey)) {
                return executor;
            }
        }

        // 3. Not found
        return null;
    }

    /**
     * Check if an executor exists for a node type
     * @param {string} nodeKey - The node key to check
     * @returns {boolean} True if an executor exists
     */
    hasExecutor(nodeKey) {
        return this.getExecutor(nodeKey) !== null;
    }

    /**
     * Get all registered node keys (exact matches only)
     * @returns {string[]} Array of registered node keys
     */
    getRegisteredKeys() {
        return Array.from(this.executors.keys());
    }
}
