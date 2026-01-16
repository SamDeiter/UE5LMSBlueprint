/**
 * CastingNodes - Auto-generated from NodeDefinitions.js
 * Contains node definitions for this category.
 */
export const CastingNodes = {
  CastTo_Character: {
    title: "Cast To Character",
    type: "cast-node",
    category: "Casting",
    icon: "fa-cube",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "object_in", name: "Object", type: "object", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "cast_failed", name: "Cast Failed", type: "exec", dir: "out" },
      { id: "as_character", name: "As Character", type: "object", dir: "out" },
    ],
  },
  CastTo_Pawn: {
    title: "Cast To Pawn",
    type: "cast-node",
    category: "Casting",
    icon: "fa-chess-pawn",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "object_in", name: "Object", type: "object", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "cast_failed", name: "Cast Failed", type: "exec", dir: "out" },
      { id: "as_pawn", name: "As Pawn", type: "object", dir: "out" },
    ],
  },
  Cast_BP_Enemy: {
    title: "Cast to BP_Enemy",
    type: "cast-node",
    category: "Casting",
    icon: "fa-user-ninja",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "object_in", name: "Object", type: "object", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "cast_failed", name: "Cast Failed", type: "exec", dir: "out" },
      { id: "as_enemy", name: "As BP_Enemy", type: "object", dir: "out" },
    ],
  },
};
