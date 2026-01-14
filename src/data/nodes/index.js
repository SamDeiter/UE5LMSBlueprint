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
};
