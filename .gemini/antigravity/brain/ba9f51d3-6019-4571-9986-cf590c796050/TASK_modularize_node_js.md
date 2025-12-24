# Task: Modularize Node.js

## Context

`Node.js` has grown to over 1000 lines and contains mixed responsibilities:

- Core Data/State Management
- DOM Rendering (HTML generation)
- Logic/Behavior (Tick, Execution)
- Interaction Styling (Classes, Colors)

This violates the Single Responsibility Principle and makes maintenance difficult.

## Plan

### 1. Extract Rendering Logic

Create `src/graph/renderer/NodeRenderer.js`.

- Move `render()`, `renderCompactNode()`, `renderRerouteNode()`, `renderCommentNode()`.
- Move `renderPin()`, `createPinDot()`, `createInputWidget()`, `createClassWidget()`.
- **Goal**: `Node.js` should delegate to `NodeRenderer` for all DOM creation.

### 2. Extract Pin Logic (Optional but recommended)

Ensure `Pin.js` handles more of its own UI generation if possible, or keep it in `NodeRenderer`. Settle on `NodeRenderer` handling the overall structure.

### 3. Simplify Node.js

`Node.js` should retain:

- Constructor (State initialization)
- `serialize()` / `getPinsData()`
- `refreshPinCache()`
- Properties (`x`, `y`, `id`, `inputs`, `outputs`)

### 4. Implementation Steps

1. **Create `NodeRenderer.js`**: Copy rendering methods.
2. **Refactor `Node.js`**:
    - Import `NodeRenderer`.
    - Replace `this.render()` body with `return NodeRenderer.render(this);`.
3. **Test**: Verified node rendering, wiring, and distinct types (Compact, Reroute, Comment).

## File Structure Proposal

```
src/
  graph/
    input/
      NodeInputWidgets.js (Input, Checkbox, ColorPicker code)
    renderer/
      NodeRenderer.js (Main DOM construction)
    Node.js (Logic & State)
```

## Risks

- `this` context binding in event listeners created during render.
- Circular dependencies if Renderer needs to call Node methods that call Renderer.
- **Mitigation**: Pass `node` instance to static Renderer methods.
