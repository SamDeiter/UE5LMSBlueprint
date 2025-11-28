# Next Session: Advanced Debugging - "Step Out" & Breakpoints

## 🎯 Goal
Implement "Step Out" functionality and robust Breakpoint management to complete the core debugging experience.

## 📋 What We've Built (Previous Session)
- [x] **Step Into Logic**: The debugger can now dive into Function Calls and Macros, pausing at their Entry nodes.
- [x] **Call Stack UI**: A new panel displays the current execution hierarchy, allowing users to navigate between active graphs.
- [x] **Component Deletion Fixes**: Deleting components now correctly removes associated nodes from the graph.
- [x] **Visual Polish**: "Set Component" nodes now match the standard UE5 style.

## 📝 Implementation Steps

### 1. Step Out Logic
**Purpose**: Allow users to execute the rest of the current function/macro and pause immediately after returning to the caller.
**File**: `services/SimulationEngine.js`

1.  Implement `stepOut()` method.
2.  If `callStack` is empty, behave like "Resume".
3.  If `callStack` has frames:
    *   Set a flag (e.g., `stepOutDepth = callStack.length - 1`).
    *   Resume execution.
    *   In the execution loop, check if `callStack.length` drops to `stepOutDepth`.
    *   Pause execution.

### 2. Breakpoint Management
**Purpose**: Allow users to toggle breakpoints on nodes and have the simulation pause when hit.
**Files**: `graph/Node.js`, `services/SimulationEngine.js`

1.  **Toggle Logic**: Ensure `Node.toggleBreakpoint()` updates the visual state (red circle) and sets a flag on the node.
2.  **Hit Logic**: In `SimulationEngine.executeFlow` or `executeNodeLogic`, check if `currentNode.isBreakpoint` is true.
3.  **Pause**: If true, trigger `this.pause(currentNode)`.

### 3. Variable Watch Panel Refinement
**Purpose**: Improve the watch panel to show values for local variables in the current stack frame.

## ⏱️ Estimated Time: 1.5 hours
