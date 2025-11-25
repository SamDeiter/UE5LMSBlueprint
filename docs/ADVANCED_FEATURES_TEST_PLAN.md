# Advanced Features Test & Implementation Plan

This document outlines the strategy for implementing and testing advanced Blueprint features: **Casting**, **Timers**, and **Timelines**. These features introduce time-based execution and type safety concepts that require updates to the `SimulationEngine`.

---

## 1. Casting Nodes (`Cast To...`)

### Concept
In Unreal Engine, casting checks if an object is of a specific class. Since our web-based replica doesn't have a full class system, we will simulate this using a `_className` or `type` property on Object variables.

### Implementation Strategy
1.  **Node Definition**:
    *   Create a generic `CastTo` node template.
    *   Pins: `Object` (Input), `Exec` (Input), `Exec` (Output - Success), `Cast Failed` (Output - Exec), `As [Type]` (Output - Object).
2.  **Simulation Logic**:
    *   In `SimulationEngine`, when encountering a `CastTo` node:
        *   Read the input Object.
        *   Check if `object._className` matches the node's target type.
        *   If Match: Fire `Exec` (Success) and pass the object through.
        *   If Mismatch: Fire `Cast Failed` and output `null`.

### Test Plan
*   **Test 1: Cast Success**
    *   **Setup**: Create an Object variable with type `MyActor`. Connect it to `Cast To MyActor`.
    *   **Expectation**: The standard `Exec` pin fires. The `As MyActor` pin returns the object.
*   **Test 2: Cast Failure**
    *   **Setup**: Create an Object variable with type `MyPawn`. Connect it to `Cast To MyActor`.
    *   **Expectation**: The `Cast Failed` pin fires. The `As MyActor` pin returns `null`.
*   **Test 3: Null Input**
    *   **Setup**: Connect a `null` object to `Cast To...`.
    *   **Expectation**: `Cast Failed` fires.

---

## 2. Timer Nodes (`Set Timer by Event`)

### Concept
Timers allow executing logic asynchronously after a delay. This requires the `SimulationEngine` to break out of its synchronous execution loop and handle scheduled tasks.

### Implementation Strategy
1.  **Node Definition**:
    *   `SetTimerByEvent`: Inputs `Event` (Delegate), `Time` (Float), `Looping` (Bool). Output `TimerHandle`.
    *   `ClearAndInvalidateTimer`: Input `TimerHandle`.
2.  **Simulation Logic**:
    *   Add a `TimerManager` to `SimulationEngine`.
    *   When `SetTimer` is called, register a callback with `setTimeout` (or a simulated frame loop).
    *   **Critical**: The `SimulationEngine` must support re-entry. Currently, `executeFlow` runs until completion. Timers start a *new* flow execution at a later time.

### Test Plan
*   **Test 1: Single Shot Timer**
    *   **Setup**: `BeginPlay` -> `SetTimerByEvent` (Time: 1s) -> `CustomEvent` -> `PrintString "Timer Fired"`.
    *   **Expectation**: "Timer Fired" appears in the log approx. 1 second after start.
*   **Test 2: Looping Timer**
    *   **Setup**: Same as above, with `Looping` = true.
    *   **Expectation**: "Timer Fired" appears multiple times (e.g., at 1s, 2s, 3s).
*   **Test 3: Clear Timer**
    *   **Setup**: Start a looping timer. After 2.5s, call `ClearTimer`.
    *   **Expectation**: "Timer Fired" appears twice, then stops.

---

## 3. Timeline Nodes

### Concept
Timelines are complex nodes that update values over time (ticks). They function like a localized `Tick` event with curves.

### Implementation Strategy (MVP)
1.  **Node Definition**:
    *   `Timeline`: Inputs `Play`, `Stop`, `Reverse`. Outputs `Update` (Exec), `Finished` (Exec), `FloatTrack` (Float).
2.  **Simulation Logic**:
    *   Requires a "Tick" system. The `SimulationEngine` needs to run a `requestAnimationFrame` loop if active Timelines exist.
    *   On every frame, update the Timeline's internal time.
    *   Calculate the new value (Linear interpolation for MVP).
    *   Fire the `Update` execution pin.

### Test Plan
*   **Test 1: Play Timeline**
    *   **Setup**: `BeginPlay` -> `Timeline.Play`. `Timeline.Update` -> `PrintString(Value)`.
    *   **Expectation**: A stream of logs showing increasing values (0.0 to 1.0) over the duration.
*   **Test 2: Finished Event**
    *   **Setup**: Connect `Timeline.Finished` -> `PrintString "Done"`.
    *   **Expectation**: "Done" prints exactly once when the timeline completes.
*   **Test 3: Stop/Reverse**
    *   **Setup**: Play timeline, wait 0.5s, then `Stop` or `Reverse`.
    *   **Expectation**: Values stop updating or start decreasing.

---

## Summary of Required Engine Changes

1.  **Object Typing**: Add `_className` metadata to Object variables.
2.  **Async Execution**: Refactor `SimulationEngine` to support multiple concurrent execution flows (for Timers/Timelines).
3.  **Tick Loop**: Implement a global heartbeat/tick loop in `SimulationEngine` to drive Timelines and latent actions.
