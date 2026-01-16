/**
 * EventNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const EventNodes = {
  ConstructionScript: {
    title: "Construction Script",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-tools",
    isSingleton: true,
    hidden: false,
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventBeginPlay: {
    title: "Event BeginPlay",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-play",
    isSingleton: true, // Marks this node as unique in the graph
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventTick: {
    title: "Event Tick",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-clock",
    isSingleton: true, // Marks this node as unique in the graph
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "delta_seconds_out",
        name: "Delta Seconds",
        type: "float",
        dir: "out",
      },
    ],
  },
  CustomEvent: {
    title: "Custom Event",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-bolt",
    isRenameable: true, // User can rename the event
    allowAddPin: true, // User can add data output pins
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      // User-defined output pins are added dynamically
    ],
  },
  CallCustomEvent: {
    title: "Call Custom Event",
    type: "function-node",
    category: "Events",
    executor: "Function",
    icon: "f",
    allowAddPin: true, // User can add data input pins (must match CustomEvent)
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      // User-defined input pins are added dynamically
    ],
  },
  EventActorBeginOverlap: {
    title: "Event ActorBeginOverlap",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-door-open",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
    ],
  },
  EventOnClicked: {
    title: "Event OnClicked",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-mouse-pointer",
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventOnReleased: {
    title: "Event OnReleased",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-mouse-pointer",
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventActorEndOverlap: {
    title: "Event ActorEndOverlap",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-door-closed",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
    ],
  },
  EventOnTakeAnyDamage: {
    title: "Event On Take Any Damage",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-heart-broken",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "damage_out", name: "Damage", type: "float", dir: "out" },
      {
        id: "damage_type_out",
        name: "Damage Type",
        type: "object",
        dir: "out",
      },
      {
        id: "instigator_out",
        name: "Instigated By",
        type: "object",
        dir: "out",
      },
      { id: "causer_out", name: "Damage Causer", type: "object", dir: "out" },
    ],
  },
  EventOnTakePointDamage: {
    title: "Event On Take Point Damage",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-crosshairs",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "damage_out", name: "Damage", type: "float", dir: "out" },
      {
        id: "instigator_out",
        name: "Instigated By",
        type: "object",
        dir: "out",
      },
      {
        id: "hit_location_out",
        name: "Hit Location",
        type: "vector",
        dir: "out",
      },
    ],
  },
  EventOnTakeRadialDamage: {
    title: "Event On Take Radial Damage",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-bullseye",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "damage_out", name: "Damage Received", type: "float", dir: "out" },
      {
        id: "instigator_out",
        name: "Instigated By",
        type: "object",
        dir: "out",
      },
      { id: "origin_out", name: "Origin", type: "vector", dir: "out" },
    ],
  },
  EventOnActorHit: {
    title: "Event On Actor Hit",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-car-crash",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "self_actor_out", name: "Self Actor", type: "object", dir: "out" },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
      {
        id: "normal_impulse_out",
        name: "Normal Impulse",
        type: "vector",
        dir: "out",
      },
    ],
  },
  EventOnBeginCursorOver: {
    title: "Event Begin Cursor Over",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-hand-pointer",
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventOnEndCursorOver: {
    title: "Event End Cursor Over",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-hand-pointer",
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventOnInputTouchBegin: {
    title: "Event Input Touch Begin",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-hand-point-up",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "finger_index_out", name: "Finger Index", type: "int", dir: "out" },
    ],
  },
  EventOnInputTouchEnd: {
    title: "Event Input Touch End",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-hand-point-up",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "finger_index_out", name: "Finger Index", type: "int", dir: "out" },
    ],
  },
  EventOnDestroyed: {
    title: "Event Destroyed",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-bomb",
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  EventOnEndPlay: {
    title: "Event End Play",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-stop",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "end_play_reason_out",
        name: "End Play Reason",
        type: "int",
        dir: "out",
      },
    ],
  },
  // --- Pawn/Controller Events ---
  EventOnPossess: {
    title: "Event On Possess",
    type: "event-node",
    category: "Events|Pawn",
    executor: "Event",
    icon: "fa-user-check",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "new_controller_out",
        name: "New Controller",
        type: "object",
        dir: "out",
      },
    ],
  },
  EventOnUnpossess: {
    title: "Event On Unpossess",
    type: "event-node",
    category: "Events|Pawn",
    executor: "Event",
    icon: "fa-user-minus",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "old_controller_out",
        name: "Old Controller",
        type: "object",
        dir: "out",
      },
    ],
  },
  // --- Component Events ---
  EventOnComponentHit: {
    title: "Event Component Hit",
    type: "event-node",
    category: "Events|Components",
    executor: "Event",
    icon: "fa-hand-rock",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "hit_component_out",
        name: "Hit Component",
        type: "object",
        dir: "out",
      },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
      { id: "other_comp_out", name: "Other Comp", type: "object", dir: "out" },
      {
        id: "normal_impulse_out",
        name: "Normal Impulse",
        type: "vector",
        dir: "out",
      },
      { id: "hit_out", name: "Hit", type: "object", dir: "out" },
    ],
  },
  EventOnComponentBeginOverlap: {
    title: "Event Component Begin Overlap",
    type: "event-node",
    category: "Events|Components",
    executor: "Event",
    icon: "fa-compress-arrows-alt",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "overlapped_component_out",
        name: "Overlapped Component",
        type: "object",
        dir: "out",
      },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
      { id: "other_comp_out", name: "Other Comp", type: "object", dir: "out" },
      {
        id: "other_body_index_out",
        name: "Other Body Index",
        type: "int",
        dir: "out",
      },
      { id: "from_sweep_out", name: "From Sweep", type: "bool", dir: "out" },
      {
        id: "sweep_result_out",
        name: "Sweep Result",
        type: "object",
        dir: "out",
      },
    ],
  },
  EventOnComponentEndOverlap: {
    title: "Event Component End Overlap",
    type: "event-node",
    category: "Events|Components",
    executor: "Event",
    icon: "fa-expand-arrows-alt",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "overlapped_component_out",
        name: "Overlapped Component",
        type: "object",
        dir: "out",
      },
      {
        id: "other_actor_out",
        name: "Other Actor",
        type: "object",
        dir: "out",
      },
      { id: "other_comp_out", name: "Other Comp", type: "object", dir: "out" },
      {
        id: "other_body_index_out",
        name: "Other Body Index",
        type: "int",
        dir: "out",
      },
    ],
  },
  // --- Replication Events ---
  EventOnRep: {
    title: "OnRep Notify",
    type: "event-node",
    category: "Events|Replication",
    executor: "Event",
    icon: "fa-sync",
    isRenameable: true,
    pins: [{ id: "exec_out", name: "Exec", type: "exec", dir: "out" }],
  },
  // --- Input Events ---
  EventInputAction: {
    title: "Input Action",
    type: "event-node",
    category: "Events|Input",
    executor: "Event",
    icon: "fa-gamepad",
    isRenameable: true,
    pins: [
      { id: "pressed_out", name: "Pressed", type: "exec", dir: "out" },
      { id: "released_out", name: "Released", type: "exec", dir: "out" },
      { id: "key_out", name: "Key", type: "name", dir: "out" },
    ],
  },
  EventInputAxis: {
    title: "Input Axis",
    type: "event-node",
    category: "Events|Input",
    executor: "Event",
    icon: "fa-arrows-alt",
    isRenameable: true,
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "axis_value_out", name: "Axis Value", type: "float", dir: "out" },
    ],
  },
  // --- Event Dispatchers (Delegates) ---
  EventDispatcherEvent: {
    title: "Event Dispatcher",
    type: "event-node",
    category: "Events|Dispatchers",
    executor: "Event",
    icon: "fa-broadcast-tower",
    isRenameable: true,
    allowAddPin: true, // User can add data output pins
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      // Signature pins added dynamically by user
    ],
  },
  CallEventDispatcher: {
    title: "Call",
    type: "function-node",
    category: "Events|Dispatchers",
    executor: "DispatcherCall",
    icon: "fa-bullhorn",
    isRenameable: true,
    allowAddPin: true, // User can add data input pins to match signature
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      // Signature pins added dynamically by user
    ],
  },
  BindEventDispatcher: {
    title: "Bind Event",
    type: "function-node",
    category: "Events|Dispatchers",
    executor: "DispatcherBind",
    icon: "fa-link",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "event_in", name: "Event", type: "object", dir: "in" },
    ],
  },
  UnbindEventDispatcher: {
    title: "Unbind Event",
    type: "function-node",
    category: "Events|Dispatchers",
    executor: "DispatcherUnbind",
    icon: "fa-unlink",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "event_in", name: "Event", type: "object", dir: "in" },
    ],
  },
  UnbindAllEventDispatchers: {
    title: "Unbind All",
    type: "function-node",
    category: "Events|Dispatchers",
    executor: "DispatcherUnbindAll",
    icon: "fa-times-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
};
