/**
 * ActorNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const ActorNodes = {
  SetVisibility: {
    title: "Set Visibility",
    type: "function-node",
    category: "Rendering",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "target", name: "Target", type: "scenecomponent", dir: "in" },
      { id: "new_visibility", name: "New Visibility", type: "bool", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  GetWorldLocation: {
    title: "Get World Location",
    type: "pure-node",
    category: "Transformation",
    pins: [
      { id: "target", name: "Target", type: "scenecomponent", dir: "in" },
      { id: "location", name: "Return Value", type: "vector", dir: "out" },
    ],
  },
  SpawnActorFromClass: {
    title: "Spawn Actor from Class",
    type: "function-node",
    category: "Game|Actor",
    icon: "fa-cube",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "class", name: "Class", type: "class", dir: "in" },
      {
        id: "spawn_transform",
        name: "Spawn Transform",
        type: "transform",
        dir: "in",
      },
      {
        id: "collision_handling",
        name: "Collision Handling Override",
        type: "enum",
        dir: "in",
        defaultValue: "AlwaysSpawn",
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "return_value", name: "Return Value", type: "object", dir: "out" },
    ],
  },
  DestroyActor: {
    title: "Destroy Actor",
    type: "function-node",
    category: "Game|Actor",
    icon: "fa-bomb",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "target",
        name: "Target",
        type: "object",
        dir: "in",
        defaultValue: "Self",
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  GetActorLocation: {
    title: "Get Actor Location",
    type: "pure-node",
    category: "Game|Actor",
    icon: "fa-map-marker-alt",
    pins: [
      {
        id: "target",
        name: "Target",
        type: "object",
        dir: "in",
        defaultValue: "Self",
      },
      { id: "return_value", name: "Return Value", type: "vector", dir: "out" },
    ],
  },
  SetActorLocation: {
    title: "Set Actor Location",
    type: "function-node",
    category: "Game|Actor",
    icon: "fa-map-marker-alt",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "target",
        name: "Target",
        type: "object",
        dir: "in",
        defaultValue: "Self",
      },
      { id: "new_location", name: "New Location", type: "vector", dir: "in" },
      {
        id: "sweep",
        name: "Sweep",
        type: "bool",
        dir: "in",
        defaultValue: false,
      },
      {
        id: "teleport",
        name: "Teleport",
        type: "bool",
        dir: "in",
        defaultValue: false,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "return_value", name: "Return Value", type: "bool", dir: "out" },
    ],
  },
  GetActorRotation: {
    title: "Get Actor Rotation",
    type: "pure-node",
    category: "Game|Actor",
    icon: "fa-sync",
    pins: [
      {
        id: "target",
        name: "Target",
        type: "object",
        dir: "in",
        defaultValue: "Self",
      },
      { id: "return_value", name: "Return Value", type: "rotator", dir: "out" },
    ],
  },
  SetActorRotation: {
    title: "Set Actor Rotation",
    type: "function-node",
    category: "Game|Actor",
    icon: "fa-sync",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "target",
        name: "Target",
        type: "object",
        dir: "in",
        defaultValue: "Self",
      },
      { id: "new_rotation", name: "New Rotation", type: "rotator", dir: "in" },
      {
        id: "teleport",
        name: "Teleport",
        type: "bool",
        dir: "in",
        defaultValue: false,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "return_value", name: "Return Value", type: "bool", dir: "out" },
    ],
  },
};
