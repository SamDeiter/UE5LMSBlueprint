# Need Node Validation System Implementation Plan

## 🎯 Objective
Replace the placeholder validation logic in `SimulationEngine.js` with a robust, configuration-driven validation system. This will allow "Need Nodes" to actually verify student work by checking for specific graph structures, variable values, and component configurations.

## 📋 Phase 1: Validation Schema & Library (Backend)
**Goal**: Create a flexible system to define and check rules.

1.  **Define Validator Types**:
    *   `NODE_EXISTS`: Check if a node of a specific type exists.
    *   `PIN_CONNECTED`: Check if a specific pin on a node is connected.
    *   `VARIABLE_VALUE`: Check if a variable has a specific default value.
    *   `COMPONENT_EXISTS`: Check if a component is added.
    *   `EXECUTION_PATH`: (Advanced) Check if execution flows from Node A to Node B.

2.  **Create `GraphValidator` Class**:
    *   Implement `validate(graph, criteria)` method.
    *   Implement specific check methods for each validator type.
    *   *File*: `services/GraphValidator.js`

3.  **Update `SimulationEngine`**:
    *   Import `GraphValidator`.
    *   Replace `validateCriterion` with `GraphValidator.validate`.

## 🎨 Phase 2: Need Node Modal Enhancement (Frontend)
**Goal**: Allow users to configure specific validation rules in the UI.

1.  **Update `NeedNode` Data Structure**:
    *   Change `criteria` from simple strings to objects: `{ id, type, params, description }`.

2.  **Refine Need Node Modal**:
    *   Add a "Rule Type" dropdown (e.g., "Check Node", "Check Variable").
    *   Add dynamic parameter fields based on the selected type (e.g., "Node Class", "Pin Name").
    *   Keep the "Description" field for user-friendly text.

## 🧪 Phase 3: Testing & Verification
**Goal**: Ensure the system accurately passes/fails based on graph state.

1.  **Unit Tests**:
    *   Test `GraphValidator` with mock graphs.
    *   Verify all validator types (Node, Pin, Variable, Component).

2.  **Integration Tests**:
    *   Create a "Pass" graph and a "Fail" graph.
    *   Run `SimulationEngine` and verify SCORM reporting matches expected results.

## 📅 Timeline
*   **Day 1**: Implement `GraphValidator` and basic types.
*   **Day 2**: Update Need Node Modal UI.
*   **Day 3**: Integration and Testing.
