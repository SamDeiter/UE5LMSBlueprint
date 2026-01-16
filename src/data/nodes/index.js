import { AudioVisualNodes } from "./AudioVisualNodes.js";
/**
 * NodeDefinitions Index - Aggregates all node category modules
 * Auto-generated from split_node_definitions.py
 */

import { ActorNodes } from "./ActorNodes.js";
import { AssessmentNodes } from "./AssessmentNodes.js";
import { CastingNodes } from "./CastingNodes.js";
import { CollectionNodes } from "./CollectionNodes.js";
import { CollisionNodes } from "./CollisionNodes.js";
import { EventNodes } from "./EventNodes.js";
import { FlowControlNodes } from "./FlowControlNodes.js";
import { FunctionNodes } from "./FunctionNodes.js";
import { InputNodes } from "./InputNodes.js";
import { MacroNodes } from "./MacroNodes.js";
import { MathNodes } from "./MathNodes.js";
import { StringNodes } from "./StringNodes.js";
import { UtilityNodes } from "./UtilityNodes.js";
import { VariableNodes } from "./VariableNodes.js";

import { UserInterfaceNodes } from "./UserInterfaceNodes.js";
import { DataTableNodes } from "./DataTableNodes.js";
import { EventDispatcherNodes } from "./EventDispatcherNodes.js";

// Aggregate all node definitions
export const NodeDefinitions = {
  ...ActorNodes,
  ...AssessmentNodes,
  ...CastingNodes,
  ...CollectionNodes,
  ...CollisionNodes,
  ...EventNodes,
  ...FlowControlNodes,
  ...FunctionNodes,
  ...InputNodes,
  ...MacroNodes,
  ...MathNodes,
  ...StringNodes,
  ...UtilityNodes,
  ...VariableNodes,
  ...AudioVisualNodes,
  ...UserInterfaceNodes,
  ...DataTableNodes,
  ...EventDispatcherNodes,

  // Force-include missing nodes to bypass stale file cache issues
  EventAnyDamage: {
    title: "Event Any Damage",
    type: "event-node",
    category: "Events",
    executor: "Event",
    icon: "fa-heart-broken",
    pins: [
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      { id: "damage_out", name: "Damage", type: "float", dir: "out" },
      {
        id: "instigator_out",
        name: "Instigated By",
        type: "object",
        dir: "out",
      },
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
  ApplyDamage: {
    title: "Apply Damage",
    type: "function-node",
    category: "Game|Damage",
    icon: "fa-tint",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "damaged_actor", name: "Damaged Actor", type: "object", dir: "in" },
      {
        id: "base_damage",
        name: "Base Damage",
        type: "float",
        dir: "in",
        defaultValue: 10.0,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
  GetAllActorsOfClass: {
    title: "Get All Actors of Class",
    type: "function-node",
    category: "Game|Actor",
    icon: "fa-users",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "class", name: "Actor Class", type: "class", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
      {
        id: "out_actors",
        name: "Out Actors",
        type: "object",
        dir: "out",
        containerType: "array",
      },
    ],
  },
  GetPlayerCharacter: {
    title: "Get Player Character",
    type: "pure-node",
    category: "Game|Player",
    icon: "fa-user",
    pins: [
      {
        id: "index",
        name: "Player Index",
        type: "int",
        dir: "in",
        defaultValue: 0,
      },
      { id: "return_value", name: "Return Value", type: "object", dir: "out" },
    ],
  },
  IsValid: {
    title: "Is Valid",
    type: "flow-node",
    category: "Flow Control",
    icon: "fa-question-circle",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "input_object", name: "Input Object", type: "object", dir: "in" },
      { id: "is_valid", name: "Is Valid", type: "exec", dir: "out" },
      { id: "is_not_valid", name: "Is Not Valid", type: "exec", dir: "out" },
    ],
  },
  SetHealth: {
    title: "Set Health",
    type: "variable-node",
    category: "Variables|Health",
    icon: "fa-heart",
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      {
        id: "val_in",
        name: "Health",
        type: "float",
        dir: "in",
        defaultValue: 100.0,
      },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    ],
  },
};
