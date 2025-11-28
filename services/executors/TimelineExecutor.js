import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles Timeline nodes for animation control
 */
export class TimelineExecutor extends BaseExecutor {
    async execute(node) {
        if (node.nodeKey === 'Timeline') {
            // Ensure state exists
            let state = this.engine.timelines.get(node.id);
            if (!state) {
                state = {
                    currentTime: 0,
                    length: node.customProperties?.length || 5.0,
                    loop: node.customProperties?.loop || false,
                    isPlaying: false,
                    direction: 1 // 1 = forward, -1 = backward
                };
                this.engine.timelines.set(node.id, state);
            }

            // Determine which input pin was triggered
            // executeNodeLogic doesn't strictly know *which* pin triggered it in this architecture
            // But we can infer or we might need to change how executeNodeLogic is called.
            // However, for MVP, we can check inputs. But wait, 'exec' inputs aren't "evaluated" like data inputs.
            // The current architecture has a limitation: executeNodeLogic is called when the node is visited.
            // It doesn't know *which* input pin was followed.

            // WORKAROUND: For now, we'll assume "Play" if we just arrived here.
            // To support multiple exec inputs properly, we'd need to pass the `entryPinId` to executeNodeLogic.

            // Let's check if we can determine the entry pin.
            // In executeFlow, we have `outPin` from the previous node.
            // `link.endPin` is the input pin on this node.

            // For this MVP, let's just default to Play/Resume.
            // Real implementation requires refactoring executeFlow to pass the input pin ID.

            state.isPlaying = true;
            state.direction = 1;
            return null;
        }

        return null;
    }

    evaluateValue(node, pin) {
        // Timeline outputs are set via tempValues in the tick loop
        if (node.tempValues) {
            if (node.tempValues.alpha !== undefined) {
                return node.tempValues.alpha;
            }
            if (node.tempValues.direction !== undefined) {
                return node.tempValues.direction;
            }
        }
        return null;
    }
}
