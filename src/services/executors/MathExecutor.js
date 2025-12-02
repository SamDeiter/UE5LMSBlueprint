import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles mathematical operation nodes (AddInt, AddFloat, SubtractFloat, etc.)
 */
export class MathExecutor extends BaseExecutor {
    /**
     * Math nodes are pure (data-only), so execute() is not used
     */
    async execute(node) {
        return null;
    }

    /**
     * Evaluate mathematical operations
     */
    evaluateValue(node, pin) {
        switch (node.nodeKey) {
            case 'AddInt': {
                const a = this.evaluateInput(node, 'a_in');
                const b = this.evaluateInput(node, 'b_in');
                return Number(a) + Number(b);
            }

            case 'AddFloat': {
                const a = this.evaluateInput(node, 'a_in');
                const b = this.evaluateInput(node, 'b_in');
                return parseFloat(a) + parseFloat(b);
            }

            case 'SubtractFloat': {
                const a = this.evaluateInput(node, 'a_in');
                const b = this.evaluateInput(node, 'b_in');
                return parseFloat(a) - parseFloat(b);
            }

            case 'MultiplyFloat': {
                const a = this.evaluateInput(node, 'a_in');
                const b = this.evaluateInput(node, 'b_in');
                return parseFloat(a) * parseFloat(b);
            }

            case 'DivideFloat': {
                const a = this.evaluateInput(node, 'a_in');
                const b = this.evaluateInput(node, 'b_in');
                const divisor = parseFloat(b);
                return divisor !== 0 ? parseFloat(a) / divisor : 0;
            }

            
            case 'ClampInt': {
                const val = Number(this.evaluateInput(node, 'val_in'));
                const min = Number(this.evaluateInput(node, 'min_in'));
                const max = Number(this.evaluateInput(node, 'max_in'));
                return Math.min(Math.max(val, min), max);
            }

            case 'ClampFloat': {
                const val = parseFloat(this.evaluateInput(node, 'val_in'));
                const min = parseFloat(this.evaluateInput(node, 'min_in'));
                const max = parseFloat(this.evaluateInput(node, 'max_in'));
                return Math.min(Math.max(val, min), max);
            }

            case 'MinInt':
            case 'MinFloat': {
                const a = parseFloat(this.evaluateInput(node, 'a_in'));
                const b = parseFloat(this.evaluateInput(node, 'b_in'));
                return Math.min(a, b);
            }

            case 'MaxInt':
            case 'MaxFloat': {
                const a = parseFloat(this.evaluateInput(node, 'a_in'));
                const b = parseFloat(this.evaluateInput(node, 'b_in'));
                return Math.max(a, b);
            }

            case 'AbsInt':
            case 'AbsFloat': {
                const a = parseFloat(this.evaluateInput(node, 'a_in'));
                return Math.abs(a);
            }
default:
                return null;
        }
    }
}
