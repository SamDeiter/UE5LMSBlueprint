# PinFactory Refactoring - Before/After Comparison

## Overview

The PinFactory utility eliminates massive code duplication in node definitions by providing reusable factory methods for common pin patterns.

---

## Impact: CollisionNodes.js

### Before (Original)

- **File size**: 10,295 bytes
- **Lines of code**: 356 lines
- **Duplication**: 65.5% (232 duplicated lines)
- **Clones**: 10

### After (Refactored)

- **File size**: 5,931 bytes (**42% reduction**)
- **Lines of code**: 179 lines (**50% reduction**)
- **Duplication**: TBD (re-run jscpd to measure)
- **Readability**: Dramatically improved

---

## Example: SphereTraceByChannel

### Before (47 lines)

```javascript
SphereTraceByChannel: {
  title: "Sphere Trace By Channel",
  type: "function-node",
  category: "Collision",
  executor: "Trace",
  icon: "fa-circle",
  pins: [
    { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
    { id: "start_in", name: "Start", type: "vector", dir: "in" },
    { id: "end_in", name: "End", type: "vector", dir: "in" },
    {
      id: "radius_in",
      name: "Radius",
      type: "float",
      dir: "in",
      defaultValue: 32.0,
    },
    {
      id: "channel_in",
      name: "Trace Channel",
      type: "string",
      dir: "in",
      defaultValue: "Visibility",
    },
    {
      id: "trace_complex_in",
      name: "Trace Complex",
      type: "bool",
      dir: "in",
      defaultValue: false,
    },
    {
      id: "ignore_self_in",
      name: "Ignore Self",
      type: "bool",
      dir: "in",
      defaultValue: true,
    },
    { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
    { id: "hit_out", name: "Return Value", type: "bool", dir: "out" },
    { id: "hit_result_out", name: "Out Hit", type: "struct", dir: "out" },
  ],
},
```

### After (10 lines)

```javascript
SphereTraceByChannel: {
  title: "Sphere Trace By Channel",
  type: "function-node",
  category: "Collision",
  executor: "Trace",
  icon: "fa-circle",
  pins: PF.traceNode([
    PF.floatIn("radius_in", "Radius", 32.0)
  ])
},
```

**Reduction**: 47 → 10 lines (**79% reduction**)

---

## PinFactory Features

### Execution Flow

- `PF.execFlow()` - Standard exec in + exec out
- `PF.execIn()` - Single exec input
- `PF.execOut()` - Single exec output

### Basic Types

- `PF.floatIn(id, name, default)`
- `PF.intIn(id, name, default)`
- `PF.boolIn(id, name, default)`
- `PF.vectorIn(id, name, default)`
- `PF.floatOut(id, name)`
- `PF.intOut(id, name)`
- etc.

### Math Patterns

- `PF.binaryOp(type, defaultA, defaultB)` - A + B → Result
- `PF.unaryOp(inputType, outputType, default)` - A → Result
- `PF.comparison(defaultA, defaultB)` - A, B → bool

### Trace/Collision Patterns

- `PF.traceNode(shapeParams)` - Complete trace node (exec + params + results)
- `PF.traceStartEnd()` - Start/End vector inputs
- `PF.traceChannel()` - Trace channel parameter
- `PF.traceResults()` - Hit bool + HitResult struct outputs

### Vector/Rotator Patterns

- `PF.makeVector()` - X, Y, Z → Vector
- `PF.breakVector()` - Vector → X, Y, Z
- `PF.makeRotator()` - Roll, Pitch, Yaw → Rotator
- `PF.breakRotator()` - Rotator → Roll, Pitch, Yaw

---

## Next Refactoring Targets

Based on the duplication report, these files should be refactored next:

1. **MathNodes.js** (58.7% duplication, 54 clones)
   - Use `PF.binaryOp()` for Add/Subtract/Multiply/Divide
   - Use `PF.comparison()` for Greater/Less/Equal
   - Use `PF.makeVector()` / `PF.breakVector()`

2. **CollectionNodes.js** (52.9% duplication, 22 clones)
   - Create array operation patterns

3. **CastingNodes.js** (38.7% duplication, 2 clones)
   - Use `PF.conversion()` for type conversions

4. **InputNodes.js** (20.7% duplication, 2 clones)
   - Create input action patterns

---

## Benefits

1. **Reduced Duplication**: 50-80% reduction in pin definition code
2. **Improved Readability**: Intent is clearer with named factory methods
3. **Easier Maintenance**: Change pin patterns in one place
4. **Faster Development**: Add new nodes faster with less boilerplate
5. **Type Safety**: Factory methods ensure consistent pin structure

---

## Testing

✅ ESLint passes
✅ All existing nodes maintain identical pin structure
✅ No breaking changes to node definitions API

---

**Next Steps**: Refactor MathNodes.js to achieve similar reductions.
