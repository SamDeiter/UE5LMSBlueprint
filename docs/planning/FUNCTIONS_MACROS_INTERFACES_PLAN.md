# Functions, Macros, and Interfaces Implementation Plan

This document outlines the strategy for implementing reusable logic containers: **Functions**, **Macros**, and **Blueprint Interfaces**.

## 1. Functions

### Concept
Functions are self-contained graphs with a specific entry and exit point. They have their own local variable scope (though for this MVP, we might share the global scope initially or implement a simple local scope).

### Existing State
*   `VariableController.js` has UI to add/list functions.
*   `app.js` needs to initialize `this.functions = new Map()`.

### Implementation Steps
1.  **Data Model**:
    *   Ensure `BlueprintApp.functions` stores: `{ name, inputs: [], outputs: [], graph: { nodes, links }, localVariables }`.
2.  **Graph Switching**:
    *   Update `GraphController` to support rendering a specific function's graph.
    *   Currently `switchGraph` handles `EventGraph` vs `ConstructionScript`. It needs to handle dynamic function names.
3.  **Entry/Exit Nodes**:
    *   `FunctionEntry`: Created automatically when a function is made. Has output pins matching `inputs`.
    *   `FunctionResult`: Created automatically. Has input pins matching `outputs`.
4.  **Call Node**:
    *   `CallFunction` node: When placed in the EventGraph, it looks up the function definition to generate pins.
    *   **Execution**: In `SimulationEngine`, when `CallFunction` is hit:
        *   Push current execution context (node, graph) to a stack.
        *   Jump to `FunctionEntry` of the target function.
        *   Run until `FunctionResult`.
        *   Pop stack and resume at `CallFunction` output.

## 2. Macros

### Concept
Macros are collapsed graphs expanded at compile time. They support multiple execution inputs/outputs and latent nodes (delays), which functions typically don't (in UE5).

### Implementation Steps
1.  **Data Model**:
    *   `BlueprintApp.macros` map.
2.  **Graph Switching**:
    *   Similar to functions, allow editing the macro graph.
3.  **Inputs/Outputs**:
    *   Unlike functions, Macros use `MacroInput` and `MacroOutput` nodes that can have *Execution* pins.
4.  **Execution**:
    *   **Simulation**: Treat them like functions for the MVP (Call stack).
    *   **True Macro Behavior (Advanced)**: In a real compiler, we would inline the nodes. For our JS interpreter, a "Call Macro" node that jumps to the macro graph is sufficient.

## 3. Blueprint Interfaces (BPI)

### Concept
Interfaces define a contract (list of functions) without implementation. Blueprints "implement" interfaces to handle these messages.

### Implementation Steps
1.  **Data Model**:
    *   `BlueprintApp.interfaces` (Map of Interface Definitions).
    *   `BlueprintApp.implementedInterfaces` (List of interfaces this BP implements).
2.  **UI**:
    *   "Interfaces" section in "My Blueprint" or a separate "Class Settings" panel.
    *   "Add Interface" button.
3.  **Implementation Logic**:
    *   When an interface is added, auto-generate Function stubs (Graphs) for each interface function.
    *   These appear in the "Functions" list (read-only signature, editable graph).
4.  **Message Node**:
    *   `InterfaceMessage` node: Calls a function on a target object.
    *   **Execution**:
        *   Check if `Target` implements the interface.
        *   If yes, execute the corresponding function.
        *   If no, do nothing (silent fail).

## Summary of Work
1.  **Core**: Initialize `functions`, `macros`, `interfaces` in `BlueprintApp`.
2.  **UI**: Complete the "My Blueprint" panel to support Interfaces.
3.  **Graph**: Refactor `GraphController` to handle switching between multiple graph data sources (Main, Construction, Function X, Macro Y).
4.  **Nodes**: Create `FunctionEntry`, `FunctionResult`, `MacroInput`, `MacroOutput`.
5.  **Engine**: Implement the Call Stack in `SimulationEngine`.
