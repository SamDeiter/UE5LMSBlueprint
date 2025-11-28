# Codebase Refactoring Plan

## 🎯 Objective
Improve maintainability, readability, and performance by modularizing large files and separating concerns.

## 📊 High-Priority Targets (Size > 30KB)

1.  **`style.css`** (59KB) - Monolithic styling.
2.  **`services/SimulationEngine.js`** (44KB) - Core execution logic.
3.  **`ui/VariableController.js`** (37KB) - Variable management UI.
4.  **`ui/NeedNodeModal.js`** (33KB) - Assessment modal logic.
5.  **`ui/DetailsController.js`** (32KB) - Details panel logic.

---

## 🛠️ Refactoring Strategies

### 1. CSS Refactoring (`style.css`)
**Strategy:** Domain-Specific Splitting
*   **`css/variables.css`**: Global design tokens.
*   **`css/reset.css`**: Base normalization.
*   **`css/layout.css`**: Grid and panel structure.
*   **`css/ui-elements.css`**: Reusable widgets (buttons, inputs).
*   **`css/graph.css`**: Canvas and SVG styles.
*   **`css/nodes.css`**: Node specific styling.
*   **`css/panels.css`**: Sidebar panel styling.

### 2. Simulation Engine (`SimulationEngine.js`)
**Strategy:** Strategy Pattern / Node Executors
*   **Current:** Massive `switch(node.nodeKey)` statement handling all node logic.
*   **Proposed:**
    *   Create `services/executors/` directory.
    *   Define an `Executor` interface.
    *   Implement specific executors: `FlowControlExecutor` (Branch, Sequence), `MathExecutor` (Add, Multiply), `VariableExecutor` (Get, Set).
    *   `SimulationEngine` delegates to `ExecutorRegistry` to find the right handler.
*   **Benefit:** Adding new nodes doesn't bloat the main engine file.

### 3. Variable Controller (`VariableController.js`)
**Strategy:** View-Model Separation
*   **Current:** Mixes DOM manipulation, event handling, and data logic.
*   **Proposed:**
    *   Extract `VariableRenderer.js`: Pure DOM generation for variable items.
    *   Extract `VariableManager.js`: Data operations (add, remove, rename, type change).
    *   `VariableController` becomes a thin coordinator.

### 4. Need Node Modal (`NeedNodeModal.js`)
**Strategy:** Data Extraction & Componentization
*   **Current:** Likely contains hardcoded criteria data and complex rendering logic.
*   **Proposed:**
    *   Extract data to `data/AssessmentCriteria.js` or similar.
    *   Split UI into `NeedNodeRenderer.js` and `NeedNodeLogic.js`.

### 5. Details Controller (`DetailsController.js`)
**Strategy:** Composition
*   **Current:** Handles details for Nodes, Variables, Graphs, etc., in one file.
*   **Proposed:**
    *   Create `ui/details/` directory.
    *   Implement `NodeDetailsStrategy`, `VariableDetailsStrategy`, `GraphDetailsStrategy`.
    *   `DetailsController` selects the strategy based on the selected object type.

## 📅 Execution Roadmap

1.  ✅ **Phase 1: CSS (COMPLETE)** - Split into 8 modular files. See `CSS_REFACTORING_PROGRESS.md`
2.  ✅ **Phase 2: Simulation Engine (COMPLETE)** - Refactored using Executor Pattern. See `PHASE2_COMPLETE.md`
3.  **Phase 3: UI Controllers (NEXT)** - Improve code quality and testability.
