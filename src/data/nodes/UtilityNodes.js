/**
 * UtilityNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const UtilityNodes = {
  Comment: {
    title: "Comment",
    type: "comment-node",
    category: "Utilities",
    icon: "fa-comment",
    pins: [],
  },
  Timeline: {
    title: "Timeline",
    type: "flow-node",
    category: "Utilities|Time",
    executor: "Timeline",
    icon: "fa-clock",
    pins: [
      // Input exec pins (UE5 exact names)
      { id: "play_in", name: "Play", type: "exec", dir: "in" },
      {
        id: "play_from_start_in",
        name: "Play from Start",
        type: "exec",
        dir: "in",
      },
      { id: "stop_in", name: "Stop", type: "exec", dir: "in" },
      { id: "reverse_in", name: "Reverse", type: "exec", dir: "in" },
      {
        id: "reverse_from_end_in",
        name: "Reverse from End",
        type: "exec",
        dir: "in",
      },
      { id: "set_new_time_in", name: "Set New Time", type: "exec", dir: "in" },
      // Input data pin
      {
        id: "new_time_in",
        name: "New Time",
        type: "float",
        dir: "in",
        defaultValue: 0.0,
      },
      // Output exec pins
      { id: "update_out", name: "Update", type: "exec", dir: "out" },
      { id: "finished_out", name: "Finished", type: "exec", dir: "out" },
      // Output data pins
      {
        id: "direction_out",
        name: "Direction",
        type: "byte",
        dir: "out",
        defaultValue: 0,
      },
    ],
    customData: {
      length: 5.0,
      loop: false,
    },
  },
  Delay: {
    title: "Delay",
    type: "flow-node",
    category: "Utilities|Time",
    executor: "Timeline",
    icon: "fa-hourglass-half",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "duration_in",
        name: "Duration",
        type: "float",
        dir: "in",
        defaultValue: 1.0,
      },
      { id: "exec_out", name: "Completed", type: "exec", dir: "out" },
    ],
  },
  SetTimerByEvent: {
    title: "Set Timer by Event",
    type: "function-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-stopwatch",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "name_in",
        name: "Timer Name",
        type: "string",
        dir: "in",
        defaultValue: "MyTimer",
      },
      {
        id: "time_in",
        name: "Time",
        type: "float",
        dir: "in",
        defaultValue: 1.0,
      },
      {
        id: "looping_in",
        name: "Looping",
        type: "bool",
        dir: "in",
        defaultValue: false,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  ClearTimer: {
    title: "Clear Timer",
    type: "function-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-stop-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "name_in",
        name: "Timer Name",
        type: "string",
        dir: "in",
        defaultValue: "MyTimer",
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  IsTimerActive: {
    title: "Is Timer Active",
    type: "pure-node",
    category: "Utilities|Time",
    executor: "Timer",
    icon: "fa-question-circle",
    pins: [
      {
        id: "name_in",
        name: "Timer Name",
        type: "string",
        dir: "in",
        defaultValue: "MyTimer",
      },
      { id: "is_active_out", name: "Is Active", type: "bool", dir: "out" },
    ],
  },
};
