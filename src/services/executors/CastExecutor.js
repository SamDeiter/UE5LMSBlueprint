import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles type casting nodes (CastTo_*)
 */
export class CastExecutor extends BaseExecutor {
    /**
     * Handle CastTo_* execution flow
     */
    async execute(node) {
        if (node.nodeKey.startsWith('CastTo_')) {
            const targetType = node.nodeKey.replace('CastTo_', '');
            const obj = this.evaluateInput(node, 'object_in');

            const isMatch = this.checkTypeMatch(obj, targetType);
            return isMatch ? 'exec_out' : 'cast_failed';
        }

        return null;
    }

    /**
     * Handle CastTo_* data output
     */
    evaluateValue(node, _pin) {
        if (node.nodeKey.startsWith('CastTo_')) {
            const targetType = node.nodeKey.replace('CastTo_', '');
            const obj = this.evaluateInput(node, 'object_in');

            const isMatch = this.checkTypeMatch(obj, targetType);
            if (isMatch) {
                return obj;
            }
        }

        return null;
    }

    /**
     * Check if an object matches the target type
     * @param {*} obj - The object to check
     * @param {string} targetType - The target type name
     * @returns {boolean} True if the object matches the type
     */
    checkTypeMatch(obj, targetType) {
        // Check object with _type property
        if (obj && typeof obj === 'object' && obj._type === targetType) {
            return true;
        }

        // Fallback for simple string testing if users pass a string as an "object"
        if (typeof obj === 'string' && obj === targetType) {
            return true;
        }

        return false;
    }
}
