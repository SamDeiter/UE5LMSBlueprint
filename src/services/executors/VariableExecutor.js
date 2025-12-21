import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles variable getter and setter nodes (Get_*, Set_*)
 */
export class VariableExecutor extends BaseExecutor {
    /**
     * Handle Set_* nodes (execution flow)
     */
    async execute(node) {
        if (node.nodeKey.startsWith('Set_')) {
            const varName = node.nodeKey.replace('Set_', '');
            const val = this.evaluateInput(node, 'val_in');

            // Check Local Variables First (in function context)
            if (this.engine.callStack.length > 0) {
                const currentFrame = this.engine.callStack[this.engine.callStack.length - 1];
                if (currentFrame.localVariables && Object.prototype.hasOwnProperty.call(currentFrame.localVariables, varName)) {
                    currentFrame.localVariables[varName] = val;
                    return null;
                }
            }

            // Set global variable
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

    /**
     * Handle Get_* nodes (data flow)
     */
    evaluateValue(node, _pin) {
        if (node.nodeKey.startsWith('Get_')) {
            const varName = node.nodeKey.replace('Get_', '');

            // Check Local Variables First (if in function context)
            if (this.engine.callStack.length > 0) {
                const currentFrame = this.engine.callStack[this.engine.callStack.length - 1];
                if (currentFrame.localVariables && currentFrame.localVariables[varName] !== undefined) {
                    return currentFrame.localVariables[varName];
                }
            }

            // Get global variable
            const variable = this.app.variables.variables.get(varName);
            return variable ? variable.defaultValue : null;
        }

        return null;
    }
}
