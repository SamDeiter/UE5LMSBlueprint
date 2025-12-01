import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles PrintString node for console output
 */
export class PrintExecutor extends BaseExecutor {
    async execute(node) {
        if (node.nodeKey === 'PrintString') {
            const strVal = this.evaluateInput(node, 'str_in');
            this.log(`Print: ${strVal}`);
        }
        return null;
    }
}
