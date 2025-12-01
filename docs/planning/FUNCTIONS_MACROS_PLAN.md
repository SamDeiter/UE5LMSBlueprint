# Implementation Plan: Functions & Macros Refinement

## 🎯 Objective
Refine the implementation of Functions and Macros to align with Unreal Engine 5 standards, ensuring correct behavior, visual representation, and feature set.

## 📚 References
*   [Functions in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/functions-in-unreal-engine)
*   [Macros in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/macros-in-unreal-engine)

## 🛠️ Tasks

### 1. Functions Refinement
**Goal:** Ensure Functions behave as encapsulated, reusable logic blocks with proper scoping and execution flow.

*   **Pure vs Impure Functions:**
    *   [ ] **Data Model:** Add `isPure` flag to `FunctionDefinition`.
    *   [ ] **Visuals:**
        *   **Impure:** Blue header, Exec input/output pins.
        *   **Pure:** Green header, NO Exec pins.
    *   [ ] **Execution:** Pure functions are evaluated on demand (when their data outputs are read), not via execution flow.
*   **Local Variables:**
    *   [ ] **UI:** Add "Local Variables" section to the My Blueprint panel when a Function graph is active.
    *   [ ] **Scoping:** Ensure local variables are ONLY accessible within that function instance.
    *   [ ] **Persistence:** Local variables reset on every function call.
*   **Access Specifiers:**
    *   [ ] **UI:** Add dropdown in Function Details panel for `Public`, `Private`, `Protected`.
    *   [ ] **Logic:** (Optional for MVP) Restrict where functions can be called from based on specifier.
*   **Inputs & Outputs:**
    *   [ ] **UI:** Improve the Details panel for adding/removing/ordering parameters.
    *   [ ] **Graph:** Auto-update the `FunctionEntry` and `FunctionResult` nodes when definition changes.

### 2. Macros Refinement
**Goal:** Ensure Macros behave as collapsed graphs that expand inline during compilation/execution.

*   **Execution Flow:**
    *   [ ] **Multiple Exec Inputs/Outputs:** Support defining multiple execution pins (e.g., `Then 0`, `Then 1`) to allow flow control macros (like `FlipFlop`, `Sequence`).
    *   [ ] **Expansion Logic:** Verify that macros are "expanded" at runtime (or effectively treated as such), meaning they share the context of the graph they are placed in (unlike functions which have their own stack frame). *Correction: Macros in UE don't have local variables, but they execute in the context of the caller.*
*   **Wildcards (Advanced):**
    *   [ ] **Wildcard Pins:** Allow creating pins that adapt their type based on the first connection (e.g., for generic math macros).

### 3. UI/UX Improvements
*   **Graph Context Switching:**
    *   [ ] Clearer indication of which graph is active (Breadcrumbs: `Main > MyFunction`).
    *   [ ] "Go to Definition" double-click behavior.
*   **My Blueprint Panel:**
    *   [ ] Distinct sections for Functions, Macros, Variables, and Event Dispatchers.
    *   [ ] Context-sensitive visibility (e.g., Local Variables only show inside a Function).

## 📅 Execution Strategy

1.  **Phase 1: Data Model & UI** - Update definitions and sidebar UI to support new properties (Pure, Access, Local Vars).
2.  **Phase 2: Graph Logic** - Update `GraphController` to render Pure vs Impure nodes correctly and handle parameter updates.
3.  **Phase 3: Runtime Support** - Update `SimulationEngine` to handle Pure function evaluation and Macro flow control.
