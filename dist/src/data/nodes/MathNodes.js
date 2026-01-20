/**
 * MathNodes - Refactored using PinFactory
 * Contains node definitions for mathematical operations.
 *
 * Refactored from 748 lines to ~250 lines (67% reduction)
 * Using PinFactory patterns for binary/unary operations
 */
import { PinFactory as PF } from "../../utils/PinFactory.js";

export const MathNodes = {
  // ============================================================================
  // TYPE CONVERSIONS
  // ============================================================================

  Conv_IntToFloat: {
    title: "To Float (Int)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Conversion",
    icon: "●",
    pins: PF.conversion("int", "float"),
  },

  Conv_ByteToInt: {
    title: "To Int (Byte)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "●",
    pins: PF.conversion("byte", "int"),
  },

  // ============================================================================
  // INTEGER OPERATIONS
  // ============================================================================

  AddInt: {
    title: "Add (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "fa-plus",
    pins: PF.binaryOp("int", 0, 0),
  },

  SubtractInt: {
    title: "Subtract (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "-",
    pins: PF.binaryOp("int", 0, 0),
  },

  MultiplyInt: {
    title: "Multiply (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "×",
    pins: PF.binaryOp("int", 0, 0),
  },

  DivideInt: {
    title: "Divide (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "÷",
    pins: PF.binaryOp("int", 1, 1),
  },

  // ============================================================================
  // FLOAT OPERATIONS
  // ============================================================================

  AddFloat: {
    title: "Add (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "+",
    pins: PF.binaryOp("float", 0.0, 0.0),
  },

  SubtractFloat: {
    title: "Subtract (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "-",
    pins: PF.binaryOp("float", 0.0, 1.0),
  },

  MultiplyFloat: {
    title: "Multiply (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "×",
    pins: PF.binaryOp("float", 1.0, 1.0),
  },

  DivideFloat: {
    title: "Divide (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "÷",
    pins: PF.binaryOp("float", 1.0, 1.0),
  },

  // ============================================================================
  // BOOLEAN OPERATIONS
  // ============================================================================

  OR: {
    title: "OR",
    type: "pure-node",
    category: "Math|Boolean",
    executor: "Math",
    icon: "∨",
    pins: PF.binaryOp("bool", false, false),
  },

  AND: {
    title: "AND",
    type: "pure-node",
    category: "Math|Boolean",
    executor: "Math",
    icon: "∧",
    pins: PF.binaryOp("bool", false, false),
  },

  NOT: {
    title: "NOT",
    type: "pure-node",
    category: "Math|Boolean",
    executor: "Math",
    icon: "¬",
    pins: PF.unaryOp("bool", "bool", false),
  },

  // ============================================================================
  // COMPARISON OPERATIONS
  // ============================================================================

  Greater: {
    title: "> (Greater)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: ">",
    pins: PF.comparison(0.0, 0.0),
  },

  GreaterEqual: {
    title: ">= (Greater or Equal)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: "≥",
    pins: PF.comparison(0.0, 0.0),
  },

  Less: {
    title: "< (Less)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: "<",
    pins: PF.comparison(0.0, 0.0),
  },

  LessEqual: {
    title: "<= (Less or Equal)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: "≤",
    pins: PF.comparison(0.0, 0.0),
  },

  EqualEqual: {
    title: "== (Equal)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: "=",
    pins: PF.comparison(0.0, 0.0),
  },

  NotEqual: {
    title: "!= (Not Equal)",
    type: "pure-node",
    category: "Math|Comparison",
    executor: "Math",
    icon: "≠",
    pins: PF.comparison(0.0, 0.0),
  },

  // ============================================================================
  // VECTOR/ROTATOR OPERATIONS
  // ============================================================================

  MakeVector: {
    title: "Make Vector",
    category: "Math|Vector",
    executor: "Vector",
    type: "pure-node",
    icon: "fa-plus",
    pins: PF.makeVector(),
  },

  BreakVector: {
    title: "Break Vector",
    category: "Math|Vector",
    executor: "Vector",
    type: "pure-node",
    icon: "fa-minus",
    pins: PF.breakVector(),
  },

  MakeRotator: {
    title: "Make Rotator",
    category: "Math|Rotator",
    executor: "Vector",
    type: "pure-node",
    icon: "fa-sync",
    pins: PF.makeRotator(),
  },

  BreakRotator: {
    title: "Break Rotator",
    category: "Math|Rotator",
    executor: "Vector",
    type: "pure-node",
    icon: "fa-sync",
    pins: PF.breakRotator(),
  },

  BreakTransform: {
    title: "Break Transform",
    category: "Math|Transform",
    executor: "Vector",
    type: "pure-node",
    icon: "fa-cube",
    pins: [
      { id: "trans_in", name: "Transform", type: "transform", dir: "in" },
      PF.vectorOut("loc_out", "Location"),
      PF.rotatorOut("rot_out", "Rotation"),
      PF.vectorOut("scale_out", "Scale"),
    ],
  },

  // ============================================================================
  // CLAMP/MIN/MAX OPERATIONS
  // ============================================================================

  ClampInt: {
    title: "Clamp (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "f",
    pins: PF.clamp("int", 0, 0, 10),
  },

  ClampFloat: {
    title: "Clamp (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.clamp("float", 0.0, 0.0, 1.0),
  },

  MinInt: {
    title: "Min (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "f",
    pins: PF.binaryOp("int", 0, 0),
  },

  MaxInt: {
    title: "Max (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "f",
    pins: PF.binaryOp("int", 0, 0),
  },

  MinFloat: {
    title: "Min (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.binaryOp("float", 0.0, 0.0),
  },

  MaxFloat: {
    title: "Max (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.binaryOp("float", 0.0, 0.0),
  },

  AbsInt: {
    title: "Abs (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math",
    icon: "f",
    pins: PF.unaryOp("int", "int", 0),
  },

  AbsFloat: {
    title: "Abs (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.unaryOp("float", "float", 0.0),
  },

  Lerp: {
    title: "Lerp (Float)",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: [
      PF.floatIn("a_in", "A", 0.0),
      PF.floatIn("b_in", "B", 1.0),
      PF.floatIn("alpha_in", "Alpha", 0.0),
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  // ============================================================================
  // RANDOM OPERATIONS
  // ============================================================================

  RandomFloat: {
    title: "Random Float",
    type: "pure-node",
    category: "Math|Random",
    icon: "f",
    pins: [PF.floatOut("ret_out", "Return Value")],
  },

  RandomFloatInRange: {
    title: "Random Float in Range",
    type: "pure-node",
    category: "Math|Random",
    icon: "f",
    pins: [
      PF.floatIn("min_in", "Min", 0.0),
      PF.floatIn("max_in", "Max", 1.0),
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  RandomInt: {
    title: "Random Integer",
    type: "pure-node",
    category: "Math|Random",
    icon: "f",
    pins: [PF.intIn("max_in", "Max", 10), PF.intOut("ret_out", "Return Value")],
  },

  RandomIntInRange: {
    title: "Random Integer in Range",
    type: "pure-node",
    category: "Math|Random",
    icon: "f",
    pins: [
      PF.intIn("min_in", "Min", 0),
      PF.intIn("max_in", "Max", 10),
      PF.intOut("ret_out", "Return Value"),
    ],
  },

  RandomBool: {
    title: "Random Bool",
    type: "pure-node",
    category: "Math|Random",
    icon: "f",
    pins: [
      PF.floatIn("weight_in", "True Weight", 0.5),
      PF.boolOut("ret_out", "Return Value"),
    ],
  },

  // ============================================================================
  // VECTOR MATH OPERATIONS
  // ============================================================================

  AddVector: {
    title: "Add (Vector)",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-plus",
    pins: PF.binaryOp("vector", undefined, undefined),
  },

  SubtractVector: {
    title: "Subtract (Vector)",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-minus",
    pins: PF.binaryOp("vector", undefined, undefined),
  },

  MultiplyVectorFloat: {
    title: "Multiply (Vector * Float)",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-times",
    pins: [
      { id: "a_in", name: "A", type: "vector", dir: "in" },
      PF.floatIn("b_in", "B", 1.0),
      PF.vectorOut("ret_out", "Return Value"),
    ],
  },

  DivideVectorFloat: {
    title: "Divide (Vector / Float)",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-divide",
    pins: [
      { id: "a_in", name: "A", type: "vector", dir: "in" },
      PF.floatIn("b_in", "B", 1.0),
      PF.vectorOut("ret_out", "Return Value"),
    ],
  },

  DotProduct: {
    title: "Dot Product",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-circle",
    pins: [
      { id: "a_in", name: "A", type: "vector", dir: "in" },
      { id: "b_in", name: "B", type: "vector", dir: "in" },
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  CrossProduct: {
    title: "Cross Product",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-times",
    pins: PF.binaryOp("vector", undefined, undefined),
  },

  VectorLength: {
    title: "Vector Length",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-ruler-horizontal",
    pins: [
      { id: "a_in", name: "A", type: "vector", dir: "in" },
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  VectorDistance: {
    title: "Vector Distance",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-ruler",
    pins: [
      { id: "a_in", name: "A", type: "vector", dir: "in" },
      { id: "b_in", name: "B", type: "vector", dir: "in" },
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  NormalizeVector: {
    title: "Normalize",
    type: "pure-node",
    category: "Math|Vector",
    executor: "Vector",
    icon: "fa-arrow-right",
    pins: PF.unaryOp("vector", "vector", undefined),
  },

  // ============================================================================
  // TRIGONOMETRY OPERATIONS
  // ============================================================================

  Sin: {
    title: "Sin (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Cos: {
    title: "Cos (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Tan: {
    title: "Tan (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Asin: {
    title: "Asin (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Acos: {
    title: "Acos (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Atan: {
    title: "Atan (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Atan2: {
    title: "Atan2 (Degrees)",
    type: "pure-node",
    category: "Math|Trig",
    icon: "f",
    pins: [
      PF.floatIn("y_in", "Y", undefined),
      PF.floatIn("x_in", "X", undefined),
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  Sqrt: {
    title: "Sqrt",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "√",
    pins: PF.unaryOp("float", "float", undefined),
  },

  Power: {
    title: "Power",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "^",
    pins: [
      PF.floatIn("base_in", "Base", undefined),
      PF.floatIn("exp_in", "Exp", undefined),
      PF.floatOut("ret_out", "Return Value"),
    ],
  },

  Round: {
    title: "Round",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.unaryOp("float", "int", undefined),
  },

  Floor: {
    title: "Floor",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.unaryOp("float", "int", undefined),
  },

  Ceil: {
    title: "Ceil",
    type: "pure-node",
    category: "Math|Float",
    executor: "Math",
    icon: "f",
    pins: PF.unaryOp("float", "int", undefined),
  },
};
