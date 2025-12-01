import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles flow control nodes (Branch, Sequence, Delay, etc.)
 */
export class FlowControlExecutor extends BaseExecutor {
    async execute(node) {
        switch (node.nodeKey) {
            case 'Branch': {
                const condition = this.evaluateInput(node, 'cond_in');
                return condition ? 'exec_true' : 'exec_false';
            }

            case 'Delay': {
                const duration = this.evaluateInput(node, 'duration_in');
                const durationMs = (duration || 1.0) * 1000; // Convert to milliseconds

                // Return a promise that resolves after the delay
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve('exec_out');
                    }, durationMs);
                });
            }

            default:
                return null;
        }
    }
}
