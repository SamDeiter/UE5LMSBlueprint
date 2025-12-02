# Repository Reorganization Plan

## Current Issues
- 61 files and 23 subdirectories in root
- Documentation files scattered in root instead of `docs/`
- Python scripts scattered in root instead of `scripts/` or `tools/`
- Backup files in root
- Lint/debug output files in root
- Duplicate CSS organization (`css/` vs `styles/` vs `style.css`)

## Proposed Structure

```
UE5LMSBlueprint-main/
├── src/                          # Source code
│   ├── app.js                    # Main application
│   ├── services.js
│   ├── ui.js
│   ├── utils.js
│   ├── tests.js
│   ├── config/                   # Configuration
│   ├── functions/                # Function definitions
│   ├── macros/                   # Macro definitions
│   ├── graph/                    # Graph logic
│   ├── services/                 # Service modules
│   ├── ui/                       # UI controllers
│   ├── utils/                    # Utility modules
│   └── registries/               # Registry modules
├── css/                          # All stylesheets
│   └── (consolidated CSS files)
├── assets/                       # Static assets
│   └── icons/
├── data/                         # Data files
├── tests/                        # Test files
├── scripts/                      # Build/utility scripts
│   ├── python/                   # Python scripts
│   │   ├── fixes/                # Fix scripts
│   │   ├── refactoring/          # Refactoring scripts
│   │   └── tools/                # Utility tools
│   └── shell/                    # Shell scripts
├── docs/                         # All documentation
│   ├── planning/                 # Planning documents
│   ├── status/                   # Status/progress docs
│   ├── testing/                  # Testing documentation
│   └── archive/                  # Completed/old docs
├── tools/                        # Development tools
├── .github/                      # GitHub configs
├── .vscode/                      # VS Code configs
├── .husky/                       # Git hooks
├── node_modules/                 # Dependencies
├── index.html                    # Entry point
├── package.json
├── package-lock.json
├── eslint.config.js
├── README.md
└── .gitignore
```

## Files to Move

### Documentation → docs/
**Planning docs → docs/planning/**
- CODEBASE_REFACTORING_PLAN.md
- CSS_REFACTORING_PLAN.md
- FUNCTIONS_MACROS_PLAN.md
- implementation_plan_components.md
- UE5_PARITY_GAP_ANALYSIS.md

**Status docs → docs/status/**
- NEXT_SESSION.md
- REFACTORING_STATUS.md
- CSS_REFACTORING_PROGRESS.md
- PHASE1_STATUS.md
- PHASE2_STATUS.md
- PHASE3_PROGRESS.md
- PHASE1_PROPERTIES_STATUS.md
- PHASE2_SIMULATION_ENGINE_REFACTORING.md

**Completed/Archive → docs/archive/**
- PHASE1_COMPLETE.md
- PHASE2_COMPLETE.md
- SESSION_SUMMARY_DELAY_NODE.md
- SPLIT_PIN_SUMMARY.md

**Testing → docs/testing/**
- DELAY_NODE_TESTING.md
- PHASE1_TESTING_CHECKLIST.md
- PHASE2_TESTING_CHECKLIST.md
- KNOWN_LIMITATIONS.md

**Keep in docs/ (already there)**
- task.md → docs/

### Python Scripts → scripts/python/
**Fix scripts → scripts/python/fixes/**
- fix_compact_node.py
- fix_duplicate.py
- fix_init.py
- fix_nested_serialization.py
- fix_node.py
- fix_node_definitions.py
- fix_node_syntax.py
- fix_syntax.py
- repair_utils.py

**Refactoring scripts → scripts/python/refactoring/**
- refactor_simulation_engine.py
- add_need_node.py
- enable_nested_split.py

**Tool scripts → scripts/python/tools/**
- cleanup_docs.py
- organize_docs.py
- check_utils.py
- scan_css.py
- split_css.py
- update_html.py

### Source Files → src/
- app.js → src/
- services.js → src/
- ui.js → src/
- utils.js → src/
- tests.js → src/
- debug_root.js → src/

### Backup/Temp Files → DELETE or archive
- app.js.backup
- app.js.merge-tests-backup
- eslint_report.json
- eslint_report2.json
- lint_output_2.txt
- lint_output_3.txt
- lint_output_4.txt

### CSS Consolidation
- Keep `css/` directory
- Move `style.css` → `css/legacy-style.css` (if still needed)
- Remove `styles/` if duplicate

## Implementation Steps

1. Create new directory structure
2. Move documentation files
3. Move Python scripts
4. Move source files to `src/`
5. Update `index.html` to reference new paths
6. Update any scripts that reference old paths
7. Delete backup/temp files
8. Test that application still works
9. Commit changes

## Path Updates Required

After moving files, these will need path updates:
- `index.html` - Update all `<script>` src paths
- Any scripts that reference other scripts
- Import statements in JS files
- Documentation that references file paths
