/**
 * NodeDefinitionFactory - Helper to reduce boilerplate in node definitions.
 */
export const NodeFactory = {
  // --- Pin Creators ---
  pin: (id, name, type, dir = "in", extra = {}) => ({
    id,
    name,
    type,
    dir,
    ...extra,
  }),

  execIn: (name = "") => ({ id: "exec_in", name, type: "exec", dir: "in" }),
  execOut: (name = "") => ({ id: "exec_out", name, type: "exec", dir: "out" }),

  // --- Node Creators ---

  /**
   * Creates a standard Flow/Function node with Exec pins.
   */
  flowNode: ({
    title,
    category,
    executor,
    icon,
    inputs = [],
    outputs = [],
    description = "",
    headerColor,
    type = "flow-node", // Can be 'function-node'
    execInName = "",
    execOutName = "",
  }) => ({
    title,
    type,
    category,
    executor,
    icon,
    headerColor,
    description,
    pins: [
      NodeFactory.execIn(execInName),
      ...inputs,
      NodeFactory.execOut(execOutName),
      ...outputs,
    ],
  }),

  /**
   * Creates a Pure node (no Exec pins).
   */
  pureNode: ({
    title,
    category,
    executor,
    icon,
    inputs = [],
    outputs = [],
    description = "",
    headerColor,
  }) => ({
    title,
    type: "pure-node",
    category,
    executor,
    icon,
    headerColor,
    description,
    pins: [...inputs, ...outputs],
  }),

  // --- Domain Specific Helpers ---

  /**
   * Creates a container input pin (Array/Set/Map)
   */
  containerIn: (containerType, name = "Target", isRef = true) => ({
    id: `${containerType}_in`,
    name: `${name} ${
      containerType.charAt(0).toUpperCase() + containerType.slice(1)
    }`,
    type: "wildcard",
    dir: "in",
    containerType,
    isRef,
  }),
};
