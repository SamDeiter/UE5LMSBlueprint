
import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles string manipulation nodes (Append, Len, Contains, etc.)
 */
export class StringExecutor extends BaseExecutor {
    /**
     * String nodes are pure (data-only), so execute() is not used
     */
    async execute(node) {
        return null;
    }

    /**
     * Evaluate string operations
     */
    evaluateValue(node, pin) {
        switch (node.nodeKey) {
            case 'Append': {
                const a = this.evaluateInput(node, 'a_in') || "";
                const b = this.evaluateInput(node, 'b_in') || "";
                return String(a) + String(b);
            }

            case 'Len': {
                const str = this.evaluateInput(node, 'str_in') || "";
                return String(str).length;
            }

            case 'Contains': {
                const str = this.evaluateInput(node, 'str_in') || "";
                const sub = this.evaluateInput(node, 'sub_in') || "";
                const useCase = this.evaluateInput(node, 'use_case_in');

                if (useCase) {
                    return String(str).includes(String(sub));
                } else {
                    return String(str).toLowerCase().includes(String(sub).toLowerCase());
                }
            }

            default:
                return null;
        }
    }
}
