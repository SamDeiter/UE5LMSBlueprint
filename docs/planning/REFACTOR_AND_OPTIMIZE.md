---
description: Comprehensive plan for refactoring and optimizing the UE5LMSBlueprint codebase.
---

# Refactor and Optimize Code Implementation Plan

## 1. Objective
Refactor the codebase to improve performance, modularity, and maintainability. This involves identifying and extracting hard-coded values, splitting large files into smaller, focused modules, and optimizing performance-critical sections (rendering, interaction).

## 2. Current Status
- **Recent Fixes**: Resolved critical UI initialization bugs, fixed `GraphInteraction` binding issues, and restored missing tabs for Event Graph/Construction Script.
- **Initial Optimizations**:
    - Centralized some DOM element IDs in `DOMElements.js`.
    - Implemented `requestAnimationFrame` for `GraphInteraction` mouse moves.
    - Refactored `DetailsController` to use `DocumentFragment` for batched DOM updates.
    - Extracted `DRAG_DATA_PREFIXES` to `Constants.js`.

## 3. Refactoring Goals

### A. Remove Hard-coded Values
- **Goal**: Eliminate magic strings and numbers scattered throughout the code.
- **Targets**:
    - `GraphController.js`: Zoom limits, grid sizes, default node positions.
    - `Node.js`: Node dimensions, pin colors (verify `Constants.js` usage), default values.
    - `WiringController.js`: Wire curvature, snap distances.
- **Action**: Move these to `src/config/Constants.js` or `src/config/Config.js`.

### B. Increase Modularity
- **Goal**: Break down monolithic controllers into smaller, single-responsibility classes.
- **Targets**:
    - `GraphController.js`: Currently handles too much (initialization, rendering, event delegation).
        - *Split*: Extract `GraphRenderer` (pure rendering logic) and `GraphState` (state management).
    - `GraphInteraction.js`: Handles all user input.
        - *Split*: Separate `SelectionManager`, `DragDropHandler`, and `NavigationHandler`.
    - `App.js`: Main entry point is getting large.
        - *Split*: Ensure initialization logic is cleaner, possibly move event binding to a `InputManager`.

### C. Optimize Performance
- **Goal**: Ensure 60fps performance during interaction (dragging, zooming) and fast load times.
- **Targets**:
    - **Node Rendering**:
        - *Optimization*: Implement "virtualization" or "culling" to only render nodes within the viewport.
        - *Optimization*: Cache node dimensions to avoid `getBoundingClientRect` calls during layout updates.
    - **Wire Rendering**:
        - *Optimization*: Optimize SVG path updates. Ensure we aren't redrawing all wires when only one moves.
    - **Event Listeners**:
        - *Optimization*: Use event delegation more aggressively where possible (already mostly done, but review).

### D. Code Quality & Standards
- **Goal**: Adhere to consistent style and linting rules.
- **Action**: Run `eslint` regularly and fix reported issues. Ensure JSDoc comments are present for all public methods.

## 4. Implementation Steps

### Phase 1: Configuration & Constants (Immediate)
1.  [ ] Audit `GraphController.js` and `WiringController.js` for magic numbers.
2.  [ ] Move identified values to `Constants.js`.
3.  [ ] Verify no regressions in rendering or interaction.

### Phase 2: Modularity - Graph Controller (High Priority)
1.  [ ] Analyze `GraphController.js`.
2.  [ ] Extract `GraphRenderer` class to handle `renderAllNodes`, `drawAllWires` (delegating to WiringController), and `updateTransform`.
3.  [ ] Update `GraphController` to use `GraphRenderer`.

### Phase 3: Performance - Rendering (Medium Priority)
1.  [ ] Implement viewport culling in `GraphRenderer`.
    -   Calculate visible bounds based on pan/zoom.
    -   Only append/update DOM elements for nodes intersecting bounds.
2.  [ ] Profile drag operations with many nodes (50+).

### Phase 4: Modularity - Interaction (Low Priority)
1.  [ ] Refactor `GraphInteraction.js`.
2.  [ ] Extract `SelectionManager` to handle selection state and logic.
3.  [ ] Extract `NavigationHandler` to handle panning/zooming.

## 5. Verification Plan
- **Manual Testing**:
    - Verify Drag & Drop of all node types.
    - Verify Panning and Zooming smoothness.
    - Verify Wiring (connecting, disconnecting).
    - Verify Tab switching (Event Graph <-> Construction Script).
- **Automated Testing**:
    - Run existing tests: `npm test` (or browser-based runner).
    - Add unit tests for new modules (`GraphRenderer`, `SelectionManager`).
