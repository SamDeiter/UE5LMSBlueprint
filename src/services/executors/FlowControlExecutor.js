
import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles flow control nodes (Branch, Sequence, Delay, etc.)
 */
export class FlowControlExecutor extends BaseExecutor {
    async execute(node, inputPin) {
        // Initialize tempValues if needed
        if (!node.tempValues) node.tempValues = {};

        const pinName = inputPin ? inputPin.id.split('-').pop() : 'exec_in';

        switch (node.nodeKey) {
            case 'Branch': {
                const condition = this.evaluateInput(node, 'cond_in');
                return condition ? 'exec_true' : 'exec_false';
            }

            case 'Sequence': {
                // Sequence fires all outputs in order.
                // But execute() returns ONE next pin.
                // To support multiple outputs, we need to return an array or handle it in SimulationEngine.
                // CURRENT LIMITATION: SimulationEngine only follows one return value.
                // Workaround: We can't easily support Sequence without changing SimulationEngine to support multiple concurrent flows or a queue.
                // For now, let's just fire exec_0.
                // TODO: Implement full Sequence support.
                return 'exec_0';
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

            case 'DoOnce': {
                if (pinName === 'reset_in') {
                    node.tempValues.closed = false;
                    return null; // Don't fire output on reset
                }

                if (!node.tempValues.closed) {
                    node.tempValues.closed = true;
                    return 'exec_completed';
                }
                return null;
            }

            case 'DoN': {
                if (pinName === 'reset_in') {
                    node.tempValues.counter = 0;
                    return null;
                }

                const n = this.evaluateInput(node, 'n_in') || 0;
                let counter = node.tempValues.counter || 0;
                counter++;
                node.tempValues.counter = counter;
                node.tempValues.exit_int = counter; // Update output value

                if (counter <= n) {
                    return 'exec_counter';
                }
                return null;
            }

            case 'Gate': {
                // Initialize open state (default closed? or open? UE5 default is Open=False usually, but check pins)
                if (node.tempValues.isOpen === undefined) node.tempValues.isOpen = false; // Default closed

                if (pinName === 'open_in') {
                    node.tempValues.isOpen = true;
                    return null;
                } else if (pinName === 'close_in') {
                    node.tempValues.isOpen = false;
                    return null;
                } else if (pinName === 'toggle_in') {
                    node.tempValues.isOpen = !node.tempValues.isOpen;
                    return null;
                } else if (pinName === 'enter_in' || pinName === 'exec_in') {
                    if (node.tempValues.isOpen) {
                        return 'exec_exit';
                    }
                }
                return null;
            }

            case 'MultiGate': {
                const startIndex = node.customData.startIndex || 0;
                if (node.tempValues.currentIndex === undefined) node.tempValues.currentIndex = startIndex;

                if (pinName === 'reset_in') {
                    node.tempValues.currentIndex = startIndex;
                    return null;
                }

                const isRandom = this.evaluateInput(node, 'loop_in'); // Using loop_in as IsRandom/Loop boolean for now
                // Actually MultiGate has "Loop" and "IsRandom". My definition has "IsRandom".
                // Let's assume sequential for now.

                const index = node.tempValues.currentIndex;
                const outPin = `exec_out_${index}`;

                // Increment
                node.tempValues.currentIndex++;

                // Check bounds (assuming 2 outputs for MVP)
                if (node.tempValues.currentIndex > 1) {
                    if (isRandom) { // If Loop is true
                        node.tempValues.currentIndex = 0;
                    } else {
                        // Stop?
                    }
                }

                return outPin;
            }

            case 'FlipFlop': {
                if (node.tempValues.isA === undefined) node.tempValues.isA = true;

                const isA = node.tempValues.isA;
                node.tempValues.isA = !isA; // Toggle for next time
                node.tempValues.is_a_bool = isA;

                return isA ? 'exec_a' : 'exec_b';
            }

            default:
                return null;
        }
    }
}
