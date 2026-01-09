import { BaseExecutor } from "./BaseExecutor.js";

/**
 * Handles Array, Set, and Map collection operations
 */
export class CollectionExecutor extends BaseExecutor {
  async execute(node) {
    // Initialize tempValues if needed
    if (!node.tempValues) node.tempValues = {};

    switch (node.nodeKey) {
      // ============ ARRAY ============
      case "Array_Add": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const item = this.evaluateInput(node, "item_in");
        arr.push(item);
        node.tempValues.index_out = arr.length - 1;
        return "exec_out";
      }
      case "Array_RemoveIndex": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const index = parseInt(this.evaluateInput(node, "index_in")) || 0;
        if (index >= 0 && index < arr.length) arr.splice(index, 1);
        return "exec_out";
      }
      case "Array_RemoveItem": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const item = this.evaluateInput(node, "item_in");
        const idx = arr.indexOf(item);
        node.tempValues.removed_out = idx !== -1;
        if (idx !== -1) arr.splice(idx, 1);
        return "exec_out";
      }
      case "Array_SetElem": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const index = parseInt(this.evaluateInput(node, "index_in")) || 0;
        const item = this.evaluateInput(node, "item_in");
        node.tempValues.size_change_out = index >= arr.length;
        arr[index] = item;
        return "exec_out";
      }
      case "Array_Clear": {
        const arr = this.evaluateInput(node, "array_in") || [];
        arr.length = 0;
        return "exec_out";
      }

      // ============ SET ============
      case "Set_Add": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        const item = this.evaluateInput(node, "item_in");
        const sizeBefore = set.size;
        set.add(item);
        node.tempValues.added_out = set.size > sizeBefore;
        return "exec_out";
      }
      case "Set_Remove": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        const item = this.evaluateInput(node, "item_in");
        node.tempValues.removed_out = set.delete(item);
        return "exec_out";
      }
      case "Set_Clear": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        set.clear();
        return "exec_out";
      }

      // ============ MAP ============
      case "Map_Add": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        const key = this.evaluateInput(node, "key_in");
        const value = this.evaluateInput(node, "value_in");
        node.tempValues.added_out = !map.has(key);
        map.set(key, value);
        return "exec_out";
      }
      case "Map_Remove": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        const key = this.evaluateInput(node, "key_in");
        node.tempValues.removed_out = map.delete(key);
        return "exec_out";
      }
      case "Map_Clear": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        map.clear();
        return "exec_out";
      }

      default:
        return null;
    }
  }

  evaluateValue(node, pin) {
    switch (node.nodeKey) {
      // ============ ARRAY PURE ============
      case "Array_Get": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const index = parseInt(this.evaluateInput(node, "index_in")) || 0;
        return arr[index];
      }
      case "Array_Length": {
        const arr = this.evaluateInput(node, "array_in") || [];
        return arr.length;
      }
      case "Array_Contains": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const item = this.evaluateInput(node, "item_in");
        return arr.includes(item);
      }
      case "Array_Find": {
        const arr = this.evaluateInput(node, "array_in") || [];
        const item = this.evaluateInput(node, "item_in");
        return arr.indexOf(item);
      }

      // ============ SET PURE ============
      case "Set_Contains": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        const item = this.evaluateInput(node, "item_in");
        return set.has(item);
      }
      case "Set_Length": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        return set.size;
      }
      case "Set_ToArray": {
        const set = this.evaluateInput(node, "set_in") || new Set();
        return Array.from(set);
      }

      // ============ MAP PURE ============
      case "Map_Find": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        const key = this.evaluateInput(node, "key_in");
        const pinId = pin.id.split("-").pop();
        if (pinId === "value_out") return map.get(key);
        if (pinId === "found_out") return map.has(key);
        return map.get(key);
      }
      case "Map_Length": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        return map.size;
      }
      case "Map_Keys": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        return Array.from(map.keys());
      }
      case "Map_Values": {
        const map = this.evaluateInput(node, "map_in") || new Map();
        return Array.from(map.values());
      }

      // Temp values from execute()
      default:
        if (node.tempValues) {
          const pinId = pin.id.split("-").pop();
          if (node.tempValues[pinId] !== undefined) {
            return node.tempValues[pinId];
          }
        }
        return null;
    }
  }
}
