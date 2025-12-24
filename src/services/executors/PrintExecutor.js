import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles PrintString node for console output
 * Automatically converts any input type to string (matches UE5 behavior)
 */
export class PrintExecutor extends BaseExecutor {
  async execute(node) {
    if (node.nodeKey === "PrintString") {
      const rawValue = this.evaluateInput(node, "str_in");
      const strVal = this.convertToString(rawValue);
      this.log(`Print: ${strVal}`);
    }
    return null;
  }
}
