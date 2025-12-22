/**
 * InputNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const InputNodes = {
  EnhancedInputAction: {
    title: "Enhanced Input Action",
    type: "event-node",
    category: "Input",
    executor: "Input",
    icon: "fa-gamepad",
    pins: [
      { id: "started_out", name: "Started", type: "exec", dir: "out" },
      { id: "triggered_out", name: "Triggered", type: "exec", dir: "out" },
      { id: "ongoing_out", name: "Ongoing", type: "exec", dir: "out" },
      { id: "canceled_out", name: "Canceled", type: "exec", dir: "out" },
      { id: "completed_out", name: "Completed", type: "exec", dir: "out" },
      {
        id: "action_value_out",
        name: "Action Value",
        type: "vector",
        dir: "out",
      },
      {
        id: "elapsed_time_out",
        name: "Elapsed Seconds",
        type: "float",
        dir: "out",
      },
      {
        id: "triggered_time_out",
        name: "Triggered Seconds",
        type: "float",
        dir: "out",
      },
    ],
    customData: {
      inputAction: "IA_Move",
    },
  },
  AddMappingContext: {
    title: "Add Mapping Context",
    type: "function-node",
    category: "Input",
    executor: "Input",
    icon: "fa-plus-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "player_controller_in",
        name: "Player Controller",
        type: "object",
        dir: "in",
      },
      {
        id: "mapping_context_in",
        name: "Mapping Context",
        type: "object",
        dir: "in",
      },
      {
        id: "priority_in",
        name: "Priority",
        type: "int",
        dir: "in",
        defaultValue: 0,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  RemoveMappingContext: {
    title: "Remove Mapping Context",
    type: "function-node",
    category: "Input",
    executor: "Input",
    icon: "fa-minus-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "player_controller_in",
        name: "Player Controller",
        type: "object",
        dir: "in",
      },
      {
        id: "mapping_context_in",
        name: "Mapping Context",
        type: "object",
        dir: "in",
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  GetInputActionValue: {
    title: "Get Input Action Value",
    type: "pure-node",
    category: "Input",
    executor: "Input",
    icon: "fa-keyboard",
    pins: [
      {
        id: "action_in",
        name: "Action",
        type: "string",
        dir: "in",
        defaultValue: "IA_Move",
      },
      { id: "value_out", name: "Action Value", type: "vector", dir: "out" },
      { id: "triggered_out", name: "Is Triggered", type: "bool", dir: "out" },
    ],
  },
  IsInputKeyDown: {
    title: "Is Input Key Down",
    type: "pure-node",
    category: "Input",
    executor: "Input",
    icon: "fa-keyboard",
    pins: [
      {
        id: "key_in",
        name: "Key",
        type: "name",
        dir: "in",
        defaultValue: "SpaceBar",
      },
      { id: "is_down_out", name: "Return Value", type: "bool", dir: "out" },
    ],
  },
  GetInputAxisValue: {
    title: "Get Input Axis Value",
    type: "pure-node",
    category: "Input",
    executor: "Input",
    icon: "fa-arrows-alt",
    pins: [
      {
        id: "axis_in",
        name: "Axis Name",
        type: "name",
        dir: "in",
        defaultValue: "MoveForward",
      },
      { id: "value_out", name: "Return Value", type: "float", dir: "out" },
    ],
  },
};
