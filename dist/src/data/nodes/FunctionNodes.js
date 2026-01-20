/**
 * FunctionNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const FunctionNodes = {
  FunctionEntry: {
    title: "Function Entry",
    type: "event-node",
    category: "Function",
    executor: "Function",
    icon: "f",
    isSingleton: true,
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  FunctionResult: {
    title: "Return Node",
    type: "flow-node",
    category: "Function",
    executor: "Function",
    icon: "fa-sign-out-alt",
    pins: [{ id: "exec_in", name: "Exec", type: "exec", dir: "in" }],
  },
};
