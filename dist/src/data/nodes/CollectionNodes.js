/**
 * CollectionNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
import { NodeFactory as F } from "./NodeDefinitionFactory.js";

export const CollectionNodes = {
  // ============================================================================
  // ARRAY NODES
  // ============================================================================

  Array_Add: F.flowNode({
    title: "ADD (Array)",
    type: "function-node",
    category: "Utilities|Array",
    icon: "fa-plus-square",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("array", "Target", true),
      F.pin("item_in", "New Item", "wildcard"),
    ],
    outputs: [F.pin("index_out", "Output Index", "int", "out")],
  }),

  Array_RemoveIndex: F.flowNode({
    title: "Remove Index",
    type: "function-node",
    category: "Utilities|Array",
    icon: "fa-minus-square",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("array", "Target", true),
      F.pin("index_in", "Index", "int"),
    ],
  }),

  Array_RemoveItem: F.flowNode({
    title: "Remove Item",
    type: "function-node",
    category: "Utilities|Array",
    icon: "fa-minus-square",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("array", "Target", true),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("removed_out", "Removed", "bool", "out")],
  }),

  Array_Get: F.pureNode({
    title: "GET (Array)",
    category: "Utilities|Array",
    icon: "fa-th",
    inputs: [
      F.containerIn("array", "Target", false),
      F.pin("index_in", "Index", "int"),
    ],
    outputs: [F.pin("item_out", "Item", "wildcard", "out")],
  }),

  Array_SetElem: F.flowNode({
    title: "Set Array Elem",
    type: "function-node",
    category: "Utilities|Array",
    icon: "fa-edit",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("array", "Target", true),
      F.pin("index_in", "Index", "int"),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("size_change_out", "Size to Fit", "bool", "out")],
  }),

  Array_Length: F.pureNode({
    title: "Length",
    category: "Utilities|Array",
    icon: "fa-ruler-horizontal",
    inputs: [F.containerIn("array", "Target", false)],
    outputs: [F.pin("length_out", "Length", "int", "out")],
  }),

  Array_Clear: F.flowNode({
    title: "Clear",
    type: "function-node",
    category: "Utilities|Array",
    icon: "fa-trash-alt",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [F.containerIn("array", "Target", true)],
  }),

  Array_Contains: F.pureNode({
    title: "Contains",
    category: "Utilities|Array",
    icon: "fa-search",
    inputs: [
      F.containerIn("array", "Target", false),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("found_out", "Found", "bool", "out")],
  }),

  Array_Find: F.pureNode({
    title: "Find Item",
    category: "Utilities|Array",
    icon: "fa-search-location",
    inputs: [
      F.containerIn("array", "Target", false),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("index_out", "Index", "int", "out")],
  }),

  // ============================================================================
  // SET NODES
  // ============================================================================

  Set_Add: F.flowNode({
    title: "ADD (Set)",
    type: "function-node",
    category: "Utilities|Set",
    icon: "fa-plus-circle",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("set", "Target", true),
      F.pin("item_in", "New Item", "wildcard"),
    ],
    outputs: [F.pin("added_out", "Added", "bool", "out")],
  }),

  Set_Remove: F.flowNode({
    title: "Remove (Set)",
    type: "function-node",
    category: "Utilities|Set",
    icon: "fa-minus-circle",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("set", "Target", true),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("removed_out", "Removed", "bool", "out")],
  }),

  Set_Contains: F.pureNode({
    title: "Contains (Set)",
    category: "Utilities|Set",
    icon: "fa-search",
    inputs: [
      F.containerIn("set", "Target", false),
      F.pin("item_in", "Item", "wildcard"),
    ],
    outputs: [F.pin("found_out", "Found", "bool", "out")],
  }),

  Set_Clear: F.flowNode({
    title: "Clear (Set)",
    type: "function-node",
    category: "Utilities|Set",
    icon: "fa-trash-alt",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [F.containerIn("set", "Target", true)],
  }),

  Set_Length: F.pureNode({
    title: "Length (Set)",
    category: "Utilities|Set",
    icon: "fa-ruler-horizontal",
    inputs: [F.containerIn("set", "Target", false)],
    outputs: [F.pin("length_out", "Length", "int", "out")],
  }),

  Set_ToArray: F.pureNode({
    title: "To Array (Set)",
    category: "Utilities|Set",
    icon: "fa-list",
    inputs: [F.containerIn("set", "Target", false)],
    outputs: [
      F.pin("array_out", "Array", "wildcard", "out", {
        containerType: "array",
      }),
    ],
  }),

  // ============================================================================
  // MAP NODES
  // ============================================================================

  Map_Add: F.flowNode({
    title: "ADD (Map)",
    type: "function-node",
    category: "Utilities|Map",
    icon: "fa-plus-square",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("map", "Target", true),
      F.pin("key_in", "Key", "wildcard"),
      F.pin("value_in", "Value", "wildcard"),
    ],
    outputs: [F.pin("added_out", "Added", "bool", "out")],
  }),

  Map_Remove: F.flowNode({
    title: "Remove (Map)",
    type: "function-node",
    category: "Utilities|Map",
    icon: "fa-minus-square",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [
      F.containerIn("map", "Target", true),
      F.pin("key_in", "Key", "wildcard"),
    ],
    outputs: [F.pin("removed_out", "Removed", "bool", "out")],
  }),

  Map_Find: F.pureNode({
    title: "Find (Map)",
    category: "Utilities|Map",
    icon: "fa-search",
    inputs: [
      F.containerIn("map", "Target", false),
      F.pin("key_in", "Key", "wildcard"),
    ],
    outputs: [
      F.pin("value_out", "Value", "wildcard", "out"),
      F.pin("found_out", "Found", "bool", "out"),
    ],
  }),

  Map_Clear: F.flowNode({
    title: "Clear (Map)",
    type: "function-node",
    category: "Utilities|Map",
    icon: "fa-trash-alt",
    execInName: "Exec",
    execOutName: "Exec",
    inputs: [F.containerIn("map", "Target", true)],
  }),

  Map_Length: F.pureNode({
    title: "Length (Map)",
    category: "Utilities|Map",
    icon: "fa-ruler-horizontal",
    inputs: [F.containerIn("map", "Target", false)],
    outputs: [F.pin("length_out", "Length", "int", "out")],
  }),

  Map_Keys: F.pureNode({
    title: "Keys (Map)",
    category: "Utilities|Map",
    icon: "fa-key",
    inputs: [F.containerIn("map", "Target", false)],
    outputs: [
      F.pin("keys_out", "Keys", "wildcard", "out", { containerType: "array" }),
    ],
  }),

  Map_Values: F.pureNode({
    title: "Values (Map)",
    category: "Utilities|Map",
    icon: "fa-list-ul",
    inputs: [F.containerIn("map", "Target", false)],
    outputs: [
      F.pin("values_out", "Values", "wildcard", "out", {
        containerType: "array",
      }),
    ],
  }),
};
