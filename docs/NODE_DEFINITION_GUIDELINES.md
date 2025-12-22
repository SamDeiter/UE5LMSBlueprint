# Node Definition Guidelines

This document captures common issues found during node development and provides correct patterns to avoid future problems.

---

## 1. Property Naming: Use `camelCase`

**Problem:** Properties like `default_value` or `options` won't work - the system expects `camelCase`.

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| `default_value: 0` | `defaultValue: 0` |
| `options: ["A", "B"]` | `enumValues: ["A", "B"]` |

**Example:**

```javascript
{
  id: "trace_channel",
  name: "Trace Channel",
  type: "enum",
  dir: "in",
  defaultValue: "Visibility",        // NOT default_value
  enumValues: ["Visibility", "Camera"] // NOT options
}
```

---

## 2. Connection-Only Pin Types

These pin types should **never** show input widgets - they only accept wire connections:

- `array`
- `object`
- `struct`
- `wildcard` (with `containerType: "array"`)
- `class`
- `interface`

**Array pins use `containerType`, not `type: "array"`:**

```javascript
{
  id: "actors_to_ignore",
  name: "Actors To Ignore",
  type: "object",           // Base type
  containerType: "array",   // Makes it an array
  dir: "in"
  // No defaultValue = connection-only
}
```

---

## 3. Splittable Struct Pins (Vector, Rotator, HitResult)

Pins of type `vector`, `rotator`, `transform`, or `hitresult` can be split via right-click.

**Define as simple pins - splitting is handled dynamically:**

```javascript
{
  id: "start",
  name: "Start",
  type: "vector",
  dir: "in",
  defaultValue: "(0,0,0)"  // Display format for vector
}
```

**Do NOT pre-define subPins** - they are created automatically when user splits.

---

## 4. Split Pin Row Layout

When a pin is split, each subPin takes its own row in the node layout. This is handled by the `flattenPins()` function in `Node.js`.

**Key behavior:**

- Split pins expand vertically, one subPin per row
- SubPins align with output pins (Start X ↔ Out Hit Blocking Hit)
- SubPins inherit `dir` from parent pin

---

## 5. Default Values by Type

| Type | Default Value Format |
|------|---------------------|
| `float` | `0.0` |
| `int` | `0` |
| `bool` | `false` or `true` |
| `string` | `""` |
| `vector` | `"(0,0,0)"` |
| `rotator` | `"(0,0,0)"` |
| `enum` | First enum value string |
| `color`/`linearcolor` | `"#RRGGBB"` |

---

## 6. Enum Pins

```javascript
{
  id: "draw_debug_type",
  name: "Draw Debug Type",
  type: "enum",
  dir: "in",
  defaultValue: "None",
  enumValues: ["None", "For One Frame", "For Duration", "Persistent"]
}
```

---

## 7. Complete Example: Line Trace By Channel

```javascript
LineTraceByChannel: {
  title: "Line Trace By Channel",
  type: "function-node",
  category: "Collision",
  pins: [
    { id: "exec_in", name: "", type: "exec", dir: "in" },
    { id: "exec_out", name: "", type: "exec", dir: "out" },
    // Splittable vectors
    { id: "start", name: "Start", type: "vector", dir: "in", defaultValue: "(0,0,0)" },
    { id: "end", name: "End", type: "vector", dir: "in", defaultValue: "(0,0,0)" },
    // Enum
    { id: "trace_channel", name: "Trace Channel", type: "enum", dir: "in",
      defaultValue: "Visibility", enumValues: ["Visibility", "Camera"] },
    // Bool
    { id: "trace_complex", name: "Trace Complex", type: "bool", dir: "in", 
      defaultValue: false },
    // Connection-only array
    { id: "actors_to_ignore", name: "Actors To Ignore", type: "object", 
      dir: "in", containerType: "array" },
    // Outputs
    { id: "out_hit", name: "Out Hit", type: "hitresult", dir: "out" },
    { id: "return_value", name: "Return Value", type: "bool", dir: "out" },
  ],
}
```

---

## Quick Checklist for New Nodes

- [ ] All properties use `camelCase` (defaultValue, enumValues)
- [ ] Array pins use `containerType: "array"`, not `type: "array"`
- [ ] Connection-only pins have no `defaultValue`
- [ ] Enum pins have both `defaultValue` and `enumValues`
- [ ] Vector/struct pins use string format like `"(0,0,0)"`
