import { FunctionDefinition } from './FunctionDefinition.js';

/**
 * Registry for managing user-defined functions.
 */
class FunctionRegistry {
    constructor() {
        this.functions = new Map(); // ID -> FunctionDefinition
    }

    /**
     * Registers a new function.
     * @param {FunctionDefinition} funcDef 
     */
    register(funcDef) {
        if (this.functions.has(funcDef.id)) {
            console.warn(`Function with ID ${funcDef.id} already exists. Overwriting.`);
        }
        this.functions.set(funcDef.id, funcDef);
    }

    /**
     * Unregisters a function by ID.
     * @param {string} id 
     */
    unregister(id) {
        this.functions.delete(id);
    }

    /**
     * Gets a function definition by ID.
     * @param {string} id 
     * @returns {FunctionDefinition}
     */
    get(id) {
        return this.functions.get(id);
    }

    /**
     * Gets a function definition by Name.
     * @param {string} name 
     * @returns {FunctionDefinition}
     */
    getByName(name) {
        return [...this.functions.values()].find(f => f.name === name);
    }

    /**
     * Gets all registered functions.
     * @returns {FunctionDefinition[]}
     */
    getAll() {
        return Array.from(this.functions.values());
    }

    /**
     * Checks if a function name is already taken.
     * @param {string} name 
     * @returns {boolean}
     */
    isNameTaken(name) {
        return [...this.functions.values()].some(f => f.name === name);
    }

    /**
     * Generates a unique function name based on a base name.
     * @param {string} baseName 
     * @returns {string}
     */
    getUniqueName(baseName = 'NewFunction') {
        let name = baseName;
        let counter = 0;
        while (this.isNameTaken(name)) {
            name = `${baseName}_${counter}`;
            counter++;
        }
        return name;
    }

    /**
     * Clears all functions.
     */
    clear() {
        this.functions.clear();
    }
}

export const functionRegistry = new FunctionRegistry();
