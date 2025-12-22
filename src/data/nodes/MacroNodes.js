/**
 * MacroNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const MacroNodes = {
  MacroEntry: {
    title: "Inputs",
    type: "event-node",
    category: "Macro",
    icon: "fa-sign-in-alt",
    isSingleton: true,
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  MacroResult: {
    title: "Outputs",
    type: "flow-node",
    category: "Macro",
    icon: "fa-sign-out-alt",
    pins: [{ id: "exec_in", name: "Exec", type: "exec", dir: "in" }],
  },
};
