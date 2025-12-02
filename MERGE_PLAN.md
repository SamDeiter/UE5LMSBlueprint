# Merge and Restoration Plan

## Objective
Merge the `fix/ui-restoration` branch into `main` to apply critical UI fixes (Drag & Drop, Palette Scroll, Persistence, PrintString) while managing potential conflicts with recent updates on `main`.

## Current State
- **Branch**: `fix/ui-restoration`
- **Status**: Verified working (Drag/Drop, PrintString, Persistence).
- **Divergence**: `main` has received updates (likely from a desktop sync) that introduced a `src/` directory structure and potentially other changes.

## Potential Conflicts & Overwrites
1.  **Directory Structure**:
    - `fix/ui-restoration` uses `ui/` and `services/` at the project root.
    - `main` appears to have introduced `src/ui/` and potentially other `src/` paths.
    - **Resolution**: We will prioritize the currently working structure (`ui/` at root) to ensure the application remains functional. We will accept the `src/` directory from `main` but may need to delete it or consolidate it in a future refactor if it causes duplication.

2.  **File Overwrites**:
    - `services/SimulationEngine.js`: Modified to initialize `ExecutorRegistry`. We must keep this change.
    - `services/HistoryManager.js`: Modified to persist Functions/Macros. We must keep this change.
    - `ui/FunctionsController.js` & `ui/MacrosController.js`: Added `loadState`. We must keep these changes.
    - `graph/GraphInteraction.js`: Fixed drag/drop logic. We must keep this change.
    - `data/NodeDefinitions.js`: Added Macro nodes. We must keep this change.

## Cleanup Plan
The following temporary files will be deleted before merging:
- `fix_restrictions_and_scroll.py`
- `fix_split_context.py`
- `fix_tabs_robust.py`
- `refine_css.py`
- `restrict_nodes.py`
- `update_arrow_css.py`
- `update_css_and_tabs.py`
- `fix_macro_nodes.py` (if present)
- `fix_persistence.py` (if present)
- `fix_add_icon.py` (if present)
- `fix_sim_engine.py` (if present)

## Execution Steps
1.  **Cleanup**: Delete temporary scripts.
2.  **Merge**: Merge `main` into `fix/ui-restoration` to resolve conflicts locally.
    - Command: `git merge main`
    - Strategy: If conflicts occur in the critical files listed above, we will accept "Current Change" (from `fix/ui-restoration`).
3.  **Verify**: Ensure `npm run serve` still works and features are intact.
4.  **Push**: Push `fix/ui-restoration` and then update `main`.

## Post-Merge Action Items
- Review the `src/` directory introduced by `main` and determine if a migration to `src/` is required.
- Consolidate duplicate files if any exist (e.g., `ui/` vs `src/ui/`).
