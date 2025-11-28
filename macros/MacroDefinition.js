import { generateGUID } from '../utils/guid.js';

/**
 * Represents a user-defined Blueprint Macro.
 * Macros are expanded at compile time and can contain latent nodes and multiple exec pins.
 */
export class MacroDefinition {
    constructor(name, category = 'Default') {
        this.id = generateGUID();
        this.name = name;
        this.category = category;
        this.description = '';
        this.accessSpecifier = 'Public'; // Public, Private, Protected

        // Macro Signature
        this.inputs = [];  // Array of { name, type, defaultValue }
        this.outputs = []; // Array of { name, type }

        // The Graph
        this.graph = {
            nodes: [],
            links: []
        };
    }

    /**
     * Adds an input parameter to the macro.
     * @param {string} name 
     * @param {string} type 
     * @param {*} defaultValue 
     */
    addInput(name, type, defaultValue) {
        this.inputs.push({ name, type, defaultValue });
    }

    /**
     * Adds an output parameter to the macro.
     * @param {string} name 
     * @param {string} type 
     */
    addOutput(name, type) {
        this.outputs.push({ name, type });
    }

    /**
     * Serializes the macro definition to JSON.
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            description: this.description,
            accessSpecifier: this.accessSpecifier,
            inputs: this.inputs,
            outputs: this.outputs,
            graph: this.graph
        };
    }

    /**
     * Creates a MacroDefinition from a JSON object.
     * @param {object} data 
     */
    static fromJSON(data) {
        const macro = new MacroDefinition(data.name, data.category);
        macro.id = data.id;
        macro.description = data.description;
        macro.accessSpecifier = data.accessSpecifier;
        macro.inputs = data.inputs || [];
        macro.outputs = data.outputs || [];
        macro.graph = data.graph || { nodes: [], links: [] };
        return macro;
    }
}
