/**
 * CollisionNodes - Refactored using PinFactory
 * Contains node definitions for collision and tracing operations.
 */
import { PinFactory as PF } from "../../utils/PinFactory.js";

export const CollisionNodes = {
  SphereTraceByChannel: {
    title: "Sphere Trace By Channel",
    type: "function-node",
    category: "Collision",
    executor: "Trace",
    icon: "fa-circle",
    pins: PF.traceNode([PF.floatIn("radius_in", "Radius", 32.0)]),
  },

  BoxTraceByChannel: {
    title: "Box Trace By Channel",
    type: "function-node",
    category: "Collision",
    executor: "Trace",
    icon: "fa-cube",
    pins: PF.traceNode([
      PF.vectorIn("half_size_in", "Half Size"),
      PF.rotatorIn("orientation_in", "Orientation"),
    ]),
  },

  LineTraceByChannel: {
    title: "Line Trace By Channel",
    type: "function-node",
    category: "Collision",
    icon: "trace",
    executor: "Trace",
    pins: PF.traceNode(), // No shape params needed for line trace
  },

  LineTraceByProfile: {
    title: "Line Trace By Profile",
    type: "function-node",
    category: "Collision",
    icon: "trace",
    executor: "Trace",
    pins: PF.traceNode(
      [], // No shape params
      {
        id: "profile_name",
        name: "Profile Name",
        type: "name",
        dir: "in",
        defaultValue: "BlockAll",
      }
    ),
  },

  CapsuleTraceByChannel: {
    title: "Capsule Trace By Channel",
    type: "function-node",
    category: "Collision",
    executor: "Trace",
    icon: "fa-capsules",
    pins: PF.traceNode([
      PF.floatIn("radius_in", "Radius", 32.0),
      PF.floatIn("half_height_in", "Half Height", 44.0),
    ]),
  },

  BreakHitResult: {
    title: "Break Hit Result",
    type: "pure-node",
    category: "Collision|Structs",
    icon: "break-struct",
    pins: [
      { id: "hit_result", name: "Hit Result", type: "hitresult", dir: "in" },
      PF.boolOut("blocking_hit", "Blocking Hit"),
      PF.boolOut("initial_overlap", "Initial Overlap"),
      PF.floatOut("time", "Time"),
      PF.floatOut("distance", "Distance"),
      PF.vectorOut("location", "Location"),
      PF.vectorOut("impact_point", "Impact Point"),
      PF.vectorOut("normal", "Normal"),
      PF.vectorOut("impact_normal", "Impact Normal"),
      { id: "phys_mat", name: "Phys Mat", type: "object", dir: "out" },
      { id: "hit_actor", name: "Hit Actor", type: "object", dir: "out" },
      {
        id: "hit_component",
        name: "Hit Component",
        type: "object",
        dir: "out",
      },
      { id: "hit_bone_name", name: "Hit Bone Name", type: "name", dir: "out" },
      PF.intOut("hit_item", "Hit Item"),
      PF.intOut("element_index", "Element Index"),
      PF.intOut("face_index", "Face Index"),
      PF.vectorOut("trace_start", "Trace Start"),
      PF.vectorOut("trace_end", "Trace End"),
    ],
  },
};
