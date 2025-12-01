# Debugging & Tick System Plan

This document outlines the strategy for implementing **Tick** (per-frame execution) and enhancing **Debug Features** (breakpoints, watch values, visual flow).

---

## 1. Tick System (`Event Tick`)

### Concept
`Event Tick` fires every frame. In a web environment, this maps to `requestAnimationFrame`. The `SimulationEngine` must transition from a purely event-driven model (run once on click) to a continuous loop model when Tick is active.

### Implementation Strategy
1.  **Node Definition**:
    *   `EventTick`: Output `Exec`, `DeltaSeconds` (Float).
2.  **Simulation Loop**:
    *   Modify `SimulationEngine.run()`:
        *   If `EventTick` exists, start a `requestAnimationFrame` loop.
        *   Calculate `DeltaSeconds` (time since last frame).
        *   Call `executeFlow(tickNode)` every frame.
    *   **Performance**: Limit execution time per frame to prevent freezing the UI.

### Test Plan
*   **Test 1: Tick Execution**
    *   **Setup**: `Event Tick` -> `PrintString "Tick"`.
    *   **Expectation**: "Tick" prints continuously while simulation is running.
*   **Test 2: Delta Time**
    *   **Setup**: `Event Tick` -> `PrintString (DeltaSeconds)`.
    *   **Expectation**: Prints small float values (approx 0.016 for 60fps).

---

## 2. Debug Features

### Concept
Debugging tools allow users to inspect the graph state at runtime.

### Feature 1: Visual Execution Flow (Wire Lighting)
*   **Current**: No visual feedback on wires.
*   **Plan**:
    *   When `executeFlow` traverses a link, highlight the wire (SVG stroke color change) for a short duration (e.g., 200ms).
    *   Use CSS transitions for a "pulse" effect.

### Feature 2: Breakpoints
*   **Concept**: Pause execution at a specific node.
*   **Implementation**:
    *   Right-click node -> "Toggle Breakpoint" (Visual indicator: Red circle).
    *   In `executeFlow`:
        *   Check `node.hasBreakpoint`.
        *   If true, set `this.isPaused = true` and stop the loop.
        *   Show "Resume" and "Step" buttons in Toolbar.

### Feature 3: Watch Values
*   **Concept**: See the value of a pin in real-time.
*   **Implementation**:
    *   Right-click pin -> "Watch Value".
    *   Create a floating UI bubble attached to the pin.
    *   Update the bubble text whenever `evaluateInput` or `evaluateNodeValue` is called for that pin.

### Test Plan
*   **Test 1: Breakpoint Pause**
    *   **Setup**: Add Breakpoint to `PrintString`. Run Simulation.
    *   **Expectation**: Simulation starts, but "PrintString" does NOT execute. UI shows "Paused".
*   **Test 2: Resume**
    *   **Setup**: Click "Resume".
    *   **Expectation**: "PrintString" executes.
*   **Test 3: Watch Value**
    *   **Setup**: Watch `DeltaSeconds` on Tick.
    *   **Expectation**: Floating bubble updates numbers rapidly.

---

## Summary of Required Engine Changes

1.  **Game Loop**: Implement `requestAnimationFrame` loop in `SimulationEngine`.
2.  **Pause/Resume State**: Add `isPaused` state and controls.
3.  **Visual Feedback**: Add methods to `WiringController` to highlight wires temporarily.
4.  **Debug UI**: Create `DebugController` to manage breakpoints and watch bubbles.
