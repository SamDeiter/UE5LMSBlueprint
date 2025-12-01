import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles type conversion nodes (Conv_*)
 */
export class ConversionExecutor extends BaseExecutor {
    /**
     * Conversion nodes are pure (data-only)
     */
    async execute(node) {
        return null;
    }

    /**
     * Handle Conv_* type conversions
     */
    evaluateValue(node, pin) {
        if (node.nodeKey.startsWith('Conv_')) {
            const val = this.evaluateInput(node, 'val_in');

            // Basic string conversion (can be extended for other types)
            return String(val);
        }

        return null;
    }
}
