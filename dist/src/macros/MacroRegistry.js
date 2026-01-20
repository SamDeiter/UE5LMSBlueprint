/**
 * Manages the collection of user-defined macros.
 */
export class MacroRegistry {
    constructor() {
        this.macros = new Map(); // id -> MacroDefinition
    }

    register(macroDef) {
        if (this.macros.has(macroDef.id)) {
            console.warn(`Macro ${macroDef.name} already registered.`);
            return;
        }
        this.macros.set(macroDef.id, macroDef);
    }

    unregister(macroId) {
        this.macros.delete(macroId);
    }

    get(macroId) {
        return this.macros.get(macroId);
    }

    getByName(name) {
        return [...this.macros.values()].find(m => m.name === name);
    }

    getAll() {
        return Array.from(this.macros.values());
    }

    /**
     * Generates a unique name for a new macro.
     * @param {string} baseName 
     */
    getUniqueName(baseName) {
        let name = baseName;
        let counter = 1;
        while ([...this.macros.values()].some(f => f.name === name)) {
            name = `${baseName}_${counter}`;
            counter++;
        }
        return name;
    }

    clear() {
        this.macros.clear();
    }
}
