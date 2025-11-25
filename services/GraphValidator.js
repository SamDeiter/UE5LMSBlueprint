/**
 * GraphValidator.js
 * 
 * Provides a robust validation system for "Need Nodes" to verify student work.
 * Supports various check types like node existence, pin connections, and variable values.
 */

export const ValidatorTypes = {
    NODE_EXISTS: 'NODE_EXISTS',
    PIN_CONNECTED: 'PIN_CONNECTED',
    VARIABLE_VALUE: 'VARIABLE_VALUE',
    COMPONENT_EXISTS: 'COMPONENT_EXISTS',
    // Future types can be added here
};

export class GraphValidator {
    constructor(app) {
        this.app = app;
    }

    /**
     * Validates a list of criteria against the current graph state.
     * @param {Array} criteria - List of criteria objects { type, params, description }
     * @returns {Array} - List of results with { passed: boolean, ...criterion }
     */
    validate(criteria) {
        if (!criteria || !Array.isArray(criteria)) return [];

        return criteria.map(criterion => {
            const passed = this.checkCriterion(criterion);
            return { ...criterion, passed };
        });
    }

    /**
     * Checks a single criterion.
     * @param {Object} criterion 
     * @returns {boolean}
     */
    checkCriterion(criterion) {
        try {
            // If type is missing, fall back to legacy description-based check (temporary)
            if (!criterion.type) {
                return this.checkLegacyDescription(criterion.description);
            }

            switch (criterion.type) {
                case ValidatorTypes.NODE_EXISTS:
                    return this.checkNodeExists(criterion.params);
                case ValidatorTypes.PIN_CONNECTED:
                    return this.checkPinConnected(criterion.params);
                case ValidatorTypes.VARIABLE_VALUE:
                    return this.checkVariableValue(criterion.params);
                case ValidatorTypes.COMPONENT_EXISTS:
                    return this.checkComponentExists(criterion.params);
                default:
                    console.warn(`[GraphValidator] Unknown validator type: ${criterion.type}`);
                    return false;
            }
        } catch (e) {
            console.error(`[GraphValidator] Error checking criterion:`, e);
            return false;
        }
    }

    // --- Specific Checks ---

    checkNodeExists(params) {
        // params: { nodeKey: 'EventBeginPlay', count: 1 }
        if (!params || !params.nodeKey) return false;
        const { nodeKey, count = 1 } = params;
        const nodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === nodeKey);
        return nodes.length >= count;
    }

    checkPinConnected(params) {
        // params: { nodeKey: 'EventBeginPlay', pinId: 'exec_out' }
        if (!params || !params.nodeKey || !params.pinId) return false;
        const { nodeKey, pinId } = params;
        const nodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === nodeKey);

        return nodes.some(node => {
            const pin = node.findPinById(`${node.id}-${pinId}`);
            return pin && pin.isConnected();
        });
    }

    checkVariableValue(params) {
        // params: { name: 'MyVar', value: 10, operator: '==' }
        if (!params || !params.name) return false;
        const { name, value, operator = '==' } = params;
        const variable = this.app.variables.variables.get(name);

        if (!variable) return false;

        // Simple equality check for now. Can be expanded.
        // Note: variable.defaultValue is what we check for edit-time validation.
        // We convert both to strings for loose comparison
        return String(variable.defaultValue) === String(value);
    }

    checkComponentExists(params) {
        // params: { type: 'PointLight' } or { name: 'MyLight' }
        if (!params) return false;
        const { type, name } = params;
        const components = [...this.app.components.values()];

        if (name) {
            return components.some(c => c.name === name);
        }
        if (type) {
            // Assuming component objects have a type property or we check the name convention
            return components.some(c => c.type === type || c.name.toLowerCase().includes(type.toLowerCase()));
        }
        return false;
    }

    // --- Legacy Support ---
    checkLegacyDescription(description) {
        if (!description) return false;
        const desc = description.toLowerCase();

        // Example: Check if "light" component exists
        if (desc.includes('light')) {
            return [...this.app.components.values()].some(c =>
                c.name.toLowerCase().includes('light')
            );
        }

        // Example: Check if "beginplay" is connected
        if (desc.includes('beginplay')) {
            const beginPlayNodes = [...this.app.graph.nodes.values()].filter(n =>
                n.nodeKey === 'EventBeginPlay'
            );
            return beginPlayNodes.some(n => n.pinsOut.some(p => p.isConnected()));
        }

        // Default to true for legacy/demo purposes if no specific keyword found
        return true;
    }
}
