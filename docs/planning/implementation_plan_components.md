# Implementation Plan - Component System & App Stability

## Problem
1. **App Initialization:** The application fails to load correctly because controllers are initialized in the wrong order, causing `undefined` errors when they try to access each other (e.g., `GraphController` accessing `app.wiring` before it exists).
2. **Component Connections:** Components added to the graph cannot be connected to other nodes. This is likely due to type mismatches (e.g., Component outputs `object` but nodes expect specific types) or a lack of compatible nodes.

## Proposed Changes

### 1. Fix Application Initialization (`app.js`)
Establish a strict initialization order where dependencies are satisfied before they are used.

**Order:**
1.  **Core Data Structures:** `app.components` (Map).
2.  **Low-Level Controllers:** `WiringController` (needs SVG), `GridController` (needs Canvas).
3.  **Data Controllers:** `VariableController`, `HistoryManager`.
4.  **Main Graph Controller:** `GraphController` (needs DOM, Wiring, Variables).
5.  **Service Controllers:** `Persistence` (needs History, Graph), `Compiler`, `SimulationEngine`.
6.  **UI Controllers:** `ComponentsController`, `PaletteController`, `DetailsController`, `ActionMenu`, `ContextMenu`, `TaskController`, `NeedNodeModal`.
7.  **Validators & Runners:** `TestRunner`, `BlueprintValidator`.
8.  **Finalize:** Bind Events, then call `persistence.load()`.

### 2. Enhance Component Type System (`GraphController.js`, `Utils.js`)
Enable a basic type hierarchy so specific components (e.g., `StaticMeshComponent`) can connect to pins expecting their parent types (e.g., `SceneComponent`, `Object`).

*   **Update `Utils.js`:** Add `isTypeCompatible(sourceType, targetType)`:
    *   Allow exact matches.
    *   Allow `exec` to `exec`.
    *   Allow specific component types to cast to `object`.
    *   (Future) Allow `StaticMeshComponent` -> `SceneComponent`.
*   **Update `GraphController.canConnect`:** Use `Utils.isTypeCompatible` instead of strict equality.

### 3. Update Component Node Definitions (`ComponentsController.js`)
*   Change component "Get" node output type from generic `'object'` to the specific component type (e.g., `'StaticMeshComponent'`).
*   Ensure "Set" node input type matches.

### 4. Add Compatible Nodes (`NodeDefinitions.js`)
Ensure there are nodes that accept these components so the user has something to connect *to*.
*   Add generic `Object` nodes: `IsValid`, `ToString`.
*   Add `SceneComponent` nodes: `SetVisibility`, `GetWorldLocation`, `SetWorldLocation`.
*   Ensure these nodes accept the types output by our components.

## Verification Plan

### Automated Tests
*   **App Init:** Verify `window.app.graph`, `window.app.wiring`, etc., are defined after load.
*   **Component Type:** Create a test that adds a Component, adds a `SetVisibility` node, and asserts they `canConnect`.

### Manual Verification
1.  Reload app -> No console errors.
2.  Add a Component (e.g., "MyMesh").
3.  Drag "MyMesh" into graph (Get Node).
4.  Drag off the output pin -> Verify Action Menu shows relevant nodes (e.g., "Set Visibility").
5.  Connect to "Set Visibility" -> Verify link is created.
