
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

            case 'Split': {
                const str = this.evaluateInput(node, 'str_in') || "";
                const delimiter = this.evaluateInput(node, 'delimiter_in') || " ";
                // UE5 Split returns LeftS and RightS (first occurrence)
                // If delimiter not found, LeftS = str, RightS = ""
                const index = String(str).indexOf(String(delimiter));

                if (index === -1) {
                    // Delimiter not found
                    if (pin.name === 'LeftS') return str;
                    if (pin.name === 'RightS') return "";
                    return false; // Return Value (bool)
                }

                if (pin.name === 'LeftS') return String(str).substring(0, index);
                if (pin.name === 'RightS') return String(str).substring(index + String(delimiter).length);
                return true; // Return Value (bool)
            }

            case 'Replace': {
                const source = this.evaluateInput(node, 'source_in') || "";
                const from = this.evaluateInput(node, 'from_in') || "";
                const to = this.evaluateInput(node, 'to_in') || "";
                const ignoreCase = this.evaluateInput(node, 'ignore_case_in');

                if (!from) return source;

                if (ignoreCase) {
                    // Case insensitive replace all
                    const regex = new RegExp(this.escapeRegExp(from), 'gi');
                    return String(source).replace(regex, String(to));
                } else {
                    // Case sensitive replace all
                    return String(source).split(String(from)).join(String(to));
                }
            }

            case 'ToUpper': {
                const str = this.evaluateInput(node, 'str_in') || "";
                return String(str).toUpperCase();
            }

            case 'ToLower': {
                const str = this.evaluateInput(node, 'str_in') || "";
                return String(str).toLowerCase();
            }

            default:
                return null;
        }
    }


    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}
