---
type: task
description: Clean up root directory by moving documentation files to the docs/ folder structure.
status: in-progress
---

# Root Directory Cleanup

## Objective
Organize the root directory by moving loose markdown files into the appropriate subdirectories within `docs/`.

## Plan
1.  **Map Files to Destinations**:
    *   **Status/Progress** -> `docs/status/`
    *   **Planning** -> `docs/planning/`
    *   **Testing** -> `docs/testing/`
    *   **Archive/Summaries** -> `docs/archive/`
2.  **Move Files**: Create and run a script to move the files.
3.  **Verify**: Ensure root is clean (except for config files and README).
4.  **Update References**: Update `REFACTORING_STATUS.md` (now in `docs/status/`) if needed.

## File Mapping

| File | Destination |
| :--- | :--- |
| `CODEBASE_REFACTORING_PLAN.md` | `docs/planning/` |
| `CSS_REFACTORING_PLAN.md` | `docs/planning/` |
| `CSS_REFACTORING_PROGRESS.md` | `docs/status/` |
| `DELAY_NODE_TESTING.md` | `docs/testing/` |
| `FUNCTIONS_MACROS_PLAN.md` | `docs/planning/` |
| `KNOWN_LIMITATIONS.md` | `docs/status/` |
| `NEXT_SESSION.md` | `docs/status/` (Merge/Overwrite) |
| `PHASE1_COMPLETE.md` | `docs/status/` |
| `PHASE1_PROPERTIES_STATUS.md` | `docs/status/` |
| `PHASE1_STATUS.md` | `docs/status/` |
| `PHASE1_TESTING_CHECKLIST.md` | `docs/testing/` |
| `PHASE2_COMPLETE.md` | `docs/status/` |
| `PHASE2_SIMULATION_ENGINE_REFACTORING.md` | `docs/planning/` |
| `PHASE2_STATUS.md` | `docs/status/` |
| `PHASE2_TESTING_CHECKLIST.md` | `docs/testing/` |
| `PHASE3_PROGRESS.md` | `docs/status/` |
| `REFACTORING_STATUS.md` | `docs/status/` |
| `SESSION_SUMMARY_DELAY_NODE.md` | `docs/archive/` |
| `SPLIT_PIN_SUMMARY.md` | `docs/archive/` |
| `TESTING_CHECKLIST.md` | `docs/testing/` |
| `UE5_PARITY_GAP_ANALYSIS.md` | `docs/planning/` |
| `implementation_plan_components.md` | `docs/planning/` |
| `task.md` | `docs/planning/` |

## Notes
- `MERGE_PLAN.md` was previously deleted but will be checked.
- `README.md` stays in root.
