# Task: Modularize Node.js

**Status**: In Progress
**Priority**: High
**Objective**: Refactor the monolithic `src/graph/Node.js` (1044 lines) into smaller, single-responsibility modules to improve maintainability and readability.

## 1. Analysis

`Node.js` currently handles:

- **State Management**: `id`, `title`, `pins`, `data`.
- **DOM Rendering**: `render()`, `renderCompactNode()`, `renderRerouteNode()`.
- **Widget Factory**: `createInputWidget()`, `createVectorWidget()`, `createColorWidget()`.
- **Interaction Logic**: `toggleBreakpoint()`, `toggleAdvanced()`.

## 2. Target Architecture

We will split `Node.js` into the following structure:

```text
src/graph/
├── Node.js                (Orchestrator/Model)
└── node/
    ├── NodeRenderer.js    (Main DOM structure)
    └── NodeWidgets.js     (Input widgets: Vector, Color, Checkbox)
```

> **Note**: `Reroute` logic is small enough to stay in `NodeRenderer` for now, or be its own small helper if needed.

## 3. Implementation Steps

### Step 1: Create `src/graph/node/` Directory

- Ensure directory exists.

### Step 2: Extract `NodeWidgets.js`

- **Move**: `createInputWidget`, `createVectorWidget`, `createEnumWidget`, `createObjectSelection`, `createColorWidget`, `createClassWidget`.
- **Export**: `NodeWidgets` static class or helper functions.
- **Refactor**: Update `Node.js` to call `NodeWidgets.create...`.

### Step 3: Extract `NodeRenderer.js`

- **Move**: `render`, `renderCompactNode`, `renderRerouteNode`, `updateRerouteVisuals`, `createPinDot`, `renderPin`, `renderCommentNode`, `getHeaderColor`.
- **Refactor**: Update `Node.js` to delegate rendering to `NodeRenderer`.
- **Dependencies**: Pass the `Node` instance to the renderer methods.

### Step 4: Cleanup `Node.js`

- Retain: `constructor`, `refreshPinCache`, `findPinById`, `toggleBreakpoint`, `onPropertyChanged`, `serializePin`.
- Import: `NodeRenderer`, `NodeWidgets`.

## 4. Verification

- **Load Graph**: Ensure existing graphs load correctly.
- **Interact**: Test dragging, wiring, and property changing.
- **Widgets**: Verify Vector, Color, and Boolean widgets work in the Details panel and on the node.
