# Functions & Macros Implementation Plan

## Overview
Functions and Macros allow users to create reusable logic within their Blueprints. They are essential for organizing complex graphs.

## 1. Functions

### Data Model
*   **Storage**: `BlueprintApp.functions` (Map).
*   **Structure**:
    ```javascript
    {
        id: "func-123",
        name: "MyFunction",
        inputs: [ { name: "InParam", type: "int" } ],
        outputs: [ { name: "OutParam", type: "bool" } ],
        graph: { nodes: [], links: [] }, // Separate graph state
        localVariables: [] // Functions have their own scope
    }
    ```

### Graph Integration
*   **Entry Node**: `FunctionEntry` node. Automatically created. Contains output pins matching the function's inputs.
*   **Return Node**: `FunctionResult` node. Contains input pins matching the function's outputs.
*   **Call Node**: When dragged into another graph, it creates a `CallFunction` node with matching pins.

### UI
*   **My Blueprint Panel**: Add "Functions" section.
*   **Graph Switching**: Double-clicking a function switches the view to that function's graph.
*   **Details Panel**: When a function is selected in the sidebar, show Input/Output configuration (add/remove parameters).

## 2. Macros

### Data Model
*   **Storage**: `BlueprintApp.macros` (Map).
*   **Structure**: Similar to functions but without `localVariables`.

### Compilation
*   **Expansion**: Unlike functions which are "called", macros are "expanded" (inlined) during compilation. The compiler replaces the Macro node with the macro's internal graph.

## Implementation Steps

### Phase 1: Data Structures & UI
1.  [ ] Add `functions` and `macros` maps to `BlueprintApp`.
2.  [ ] Update `Persistence` to save/load them.
3.  [ ] Update `VariableController` (My Blueprint) to list Functions and Macros.
4.  [ ] Implement "Add Function" / "Add Macro" buttons.

### Phase 2: Graph Context
5.  [ ] Update `switchGraph` to handle function/macro graphs (not just EventGraph/ConstructionScript).
6.  [ ] Create `FunctionEntry` and `FunctionResult` node definitions.

### Phase 3: Interaction
7.  [ ] Implement parameter editing in Details Panel.
8.  [ ] Implement `CallFunction` node rendering (dynamic pins based on function signature).
