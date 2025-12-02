import { generateGUID } from '../utils/guid.js';

/**
 * Represents a user-defined Blueprint Function.
 */
export class FunctionDefinition {
    constructor(name, category = 'Default') {
        this.id = generateGUID();
        this.name = name;
        this.category = category;
        this.description = '';
        this.isPure = false;
        this.accessSpecifier = 'Public'; // Public, Private, Protected

        // Function Signature
        this.inputs = [];  // Array of { name, type, defaultValue }
        this.outputs = []; // Array of { name, type }

        // Local Variables
        this.localVariables = []; // Array of { name, type, defaultValue }

        // The Graph
        this.graph = {
            nodes: [],
            links: []
        };
    }

    /**
     * Adds an input parameter to the function.
     * @param {string} name 
     * @param {string} type 
     * @param {*} defaultValue 
     */
    addInput(name, type, defaultValue) {
        this.inputs.push({ name, type, defaultValue });
    }

    /**
     * Adds an output parameter to the function.
     * @param {string} name 
     * @param {string} type 
     */
    addOutput(name, type) {
        this.outputs.push({ name, type });
    }

    /**
     * Serializes the function definition to JSON.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            isPure: this.isPure,
            accessSpecifier: this.accessSpecifier,
            inputs: this.inputs,
            outputs: this.outputs,
            localVariables: this.localVariables,
            graph: this.graph
        };
    }

    /**
     * Creates a FunctionDefinition from a JSON object.
     * @param {object} data 
     */
    static fromJSON(data) {
        const func = new FunctionDefinition(data.name, data.category);
        func.id = data.id;
        func.description = data.description;
        func.isPure = data.isPure;
        func.accessSpecifier = data.accessSpecifier;
        func.inputs = data.inputs || [];
        func.outputs = data.outputs || [];
        func.localVariables = data.localVariables || [];
        func.graph = data.graph || { nodes: [], links: [] };
        return func;
    }
}
