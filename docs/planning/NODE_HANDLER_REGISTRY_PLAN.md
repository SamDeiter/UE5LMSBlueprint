# Node Handler Registry Refactoring Plan

## Objective
Refactor the `SimulationEngine` and `ExecutorRegistry` to support a scalable, metadata-driven approach for registering node executors. This will eliminate the need to manually register every new node in `SimulationEngine.js` and facilitate the expansion of the node library.

## Current State vs. Desired State

### Current State
- **Manual Registration**: `SimulationEngine.js` contains a massive list of `this.executorRegistry.register('NodeKey', executorInstance)` calls.
- **Coupling**: Adding a node requires editing both `NodeDefinitions.js` and `SimulationEngine.js`.
- **Monolithic Executors**: `MathExecutor` handles integers, floats, vectors, rotators, and trigonometry.

### Desired State
- **Metadata-Driven**: `NodeDefinitions.js` entries include an `executor` property (e.g., `executor: "Math"`).
- **Auto-Discovery**: `SimulationEngine` iterates through definitions and automatically registers the correct executor.
- **Specialized Executors**: Dedicated executors for complex types (Vector, Rotator, Transform) to keep code clean.

## Implementation Steps

### Phase 1: Preparation & Extraction
1.  **Create New Executors**:
    -   Create `src/services/executors/VectorExecutor.js` (for Vector/Rotator/Transform operations).
    -   Move vector/rotator/transform logic from `MathExecutor` to `VectorExecutor`.
2.  **Update `ExecutorRegistry`**:
    -   Add a method `getExecutorByName(name)` or expose the map of instantiated executors.

### Phase 2: Metadata Update
1.  **Update `NodeDefinitions.js`**:
    -   Add `executor: "Name"` to all static node definitions.
    -   Examples:
        -   `AddInt` -> `executor: "Math"`
        -   `MakeVector` -> `executor: "Vector"`
        -   `Branch` -> `executor: "FlowControl"`
        -   `PrintString` -> `executor: "Print"`

### Phase 3: Engine Refactoring
1.  **Refactor `SimulationEngine.initializeExecutors`**:
    -   Instantiate all available executors into a map: `{'Math': new MathExecutor(this), 'Vector': new VectorExecutor(this), ...}`.
    -   Iterate over `Object.keys(NodeDefinitions)`.
    -   For each node, read `def.executor`.
    -   If found, call `this.executorRegistry.register(nodeKey, executorInstance)`.
    -   **Fallback**: Keep the existing regex-based registration for dynamic nodes (`Get_*`, `Set_*`, `Call_*`).

## Detailed Changes

### 1. New `VectorExecutor.js`
Will handle:
-   `MakeVector`, `BreakVector`
-   `MakeRotator`, `BreakRotator`
-   `MakeTransform`, `BreakTransform`
-   `AddVector`, `SubtractVector`, `MultiplyVectorFloat`, etc.
-   `GetActorLocation`, `SetActorLocation` (Wait, these might stay in ActorExecutor or move here? *Decision: Keep Actor-specifics in ActorExecutor, but pure math in VectorExecutor*)

### 2. `NodeDefinitions.js` Schema
```javascript
"AddInt": {
    title: "Add (Integer)",
    type: "pure-node",
    category: "Math|Integer",
    executor: "Math", // <--- NEW FIELD
    pins: [...]
}
```

### 3. `SimulationEngine.js` Logic
```javascript
initializeExecutors() {
    // 1. Instantiate Executors
    const executors = {
        'Event': new EventExecutor(this),
        'FlowControl': new FlowControlExecutor(this),
        'Math': new MathExecutor(this),
        'Vector': new VectorExecutor(this),
        'Variable': new VariableExecutor(this),
        // ...
    };

    // 2. Auto-Register Static Nodes
    for (const [key, def] of Object.entries(NodeDefinitions)) {
        if (def.executor && executors[def.executor]) {
            this.executorRegistry.register(key, executors[def.executor]);
        }
    }

    // 3. Register Dynamic Patterns (Keep existing)
    this.executorRegistry.registerPattern(/^Get_/, executors['Variable']);
    // ...
}
```

## Benefits
-   **Scalability**: Adding a new node only requires adding it to `NodeDefinitions.js` with the correct `executor` tag.
-   **Maintainability**: `SimulationEngine.js` stops growing linearly with the node count.
-   **Organization**: Math logic is split from Vector/Transform logic.

## Risk Assessment
-   **Regression**: Moving logic from `MathExecutor` to `VectorExecutor` requires careful testing of existing vector nodes.
-   **Missing Metadata**: If we forget to add `executor` to a node definition, it won't run.
    -   *Mitigation*: Add a startup check/log warning for nodes in `NodeDefinitions` that have no registered executor.

## Next Steps
1.  Approve this plan.
2.  Execute Phase 1 (Extract VectorExecutor).
3.  Execute Phase 2 (Update Definitions).
4.  Execute Phase 3 (Refactor Engine).
