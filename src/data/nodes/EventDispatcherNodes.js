/**
 * EventDispatcherNodes.js - Node definitions for Event Dispatcher graphs
 * Provides Call and Bind nodes for user-created dispatchers
 */
export const EventDispatcherNodes = {
  // Static example nodes - actual dispatcher nodes are dynamically registered
  // via EventDispatcherController when the user creates dispatchers

  /**
   * Example: Call [DispatcherName]
   * Triggers all bound events when executed
   */
  CallDispatcher_Example: {
    title: "Call Example",
    type: "function-node",
    category: "Event Dispatchers",
    executor: "EventDispatcher",
    icon: "fa-bolt",
    pins: [
      { id: "exec_in", name: "", type: "exec", dir: "in" },
      // Dynamic: parameters from dispatcher definition go here
      { id: "exec_out", name: "", type: "exec", dir: "out" },
    ],
    customData: {
      dispatcherId: null, // Populated at registration
    },
  },

  /**
   * Example: Bind Event to [DispatcherName]
   * Binds a callback to fire when the dispatcher is called
   */
  BindToDispatcher_Example: {
    title: "Bind Event to Example",
    type: "function-node",
    category: "Event Dispatchers",
    executor: "EventDispatcher",
    icon: "fa-link",
    pins: [
      { id: "exec_in", name: "", type: "exec", dir: "in" },
      { id: "event_in", name: "Event", type: "delegate", dir: "in" },
      { id: "exec_out", name: "", type: "exec", dir: "out" },
    ],
    customData: {
      dispatcherId: null,
    },
  },

  /**
   * Example: Unbind Event from [DispatcherName]
   */
  UnbindFromDispatcher_Example: {
    title: "Unbind Event from Example",
    type: "function-node",
    category: "Event Dispatchers",
    executor: "EventDispatcher",
    icon: "fa-unlink",
    pins: [
      { id: "exec_in", name: "", type: "exec", dir: "in" },
      { id: "event_in", name: "Event", type: "delegate", dir: "in" },
      { id: "exec_out", name: "", type: "exec", dir: "out" },
    ],
    customData: {
      dispatcherId: null,
    },
  },
};
