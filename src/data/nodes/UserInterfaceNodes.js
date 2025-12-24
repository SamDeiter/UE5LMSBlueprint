/**
 * UserInterfaceNodes - Node definitions for UI related functions
 */
export const UserInterfaceNodes = {
  CreateWidget: {
    title: "Create Widget",
    type: "function-node",
    category: "User Interface",
    icon: "fa-window-maximize",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "class", name: "Class", type: "class", dir: "in" },
      {
        id: "owning_player",
        name: "Owning Player",
        type: "object",
        dir: "in",
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "return_value", name: "Return Value", type: "object", dir: "out" },
    ],
  },
  AddToViewport: {
    title: "Add to Viewport",
    type: "function-node",
    category: "User Interface",
    icon: "fa-desktop",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "target", name: "Target", type: "object", dir: "in" },
      {
        id: "z_order",
        name: "ZOrder",
        type: "int",
        dir: "in",
        defaultValue: 0,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  RemoveFromParent: {
    title: "Remove from Parent",
    type: "function-node",
    category: "User Interface",
    icon: "fa-times-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "target", name: "Target", type: "object", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
};
