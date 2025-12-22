# Code Cleanliness Analysis & Dead Code Detection

**Purpose**: Identify unused code, variables, and functions to maintain a clean, maintainable codebase.  
**Date**: December 21, 2025

---

## 🎯 What is a "Clean Codebase"?

### Core Principles

1. **No Dead Code**
   - Every function is called
   - Every variable is used
   - Every import is necessary
   - Every file serves a purpose

2. **Clear Dependencies**
   - No circular dependencies
   - Explicit import/export chains
   - Minimal coupling between modules

3. **Consistent Patterns**
   - Similar problems solved similarly
   - Predictable file structure
   - Uniform naming conventions

4. **Self-Documenting**
   - Code explains itself
   - Comments explain "why", not "what"
   - Clear function/variable names

5. **Tested & Validated**
   - Critical paths have tests
   - Validation catches errors early
   - No silent failures

---

## 🔍 Detection Strategy

### Phase 1: Automated Analysis

#### Tool 1: ESLint Unused Variables

```bash
# Already running - check for unused vars
npm run lint
```

#### Tool 2: Dead Code Detection (Custom Script)

```python
# scripts/detect_dead_code.py
import os
import re
from pathlib import Path

def find_js_files(directory):
    """Find all JavaScript files"""
    return list(Path(directory).rglob('*.js'))

def extract_exports(file_path):
    """Extract all exports from a file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    exports = []
    
    # Named exports: export { Foo, Bar }
    exports.extend(re.findall(r'export\s+\{([^}]+)\}', content))
    
    # Direct exports: export function foo()
    exports.extend(re.findall(r'export\s+(?:function|class|const|let|var)\s+(\w+)', content))
    
    # Default export: export default Foo
    default = re.findall(r'export\s+default\s+(\w+)', content)
    if default:
        exports.append(f'default:{default[0]}')
    
    return exports

def extract_imports(file_path):
    """Extract all imports from a file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    imports = []
    
    # Named imports: import { Foo, Bar } from './file'
    named = re.findall(r'import\s+\{([^}]+)\}\s+from', content)
    for group in named:
        imports.extend([i.strip() for i in group.split(',')])
    
    # Default imports: import Foo from './file'
    imports.extend(re.findall(r'import\s+(\w+)\s+from', content))
    
    return imports

def find_unused_exports(src_dir):
    """Find exports that are never imported"""
    files = find_js_files(src_dir)
    
    all_exports = {}
    all_imports = set()
    
    for file in files:
        try:
            exports = extract_exports(file)
            if exports:
                all_exports[str(file)] = exports
            
            imports = extract_imports(file)
            all_imports.update(imports)
        except Exception as e:
            print(f"Error processing {file}: {e}")
    
    # Find unused exports
    unused = {}
    for file, exports in all_exports.items():
        unused_in_file = [e for e in exports if e not in all_imports]
        if unused_in_file:
            unused[file] = unused_in_file
    
    return unused

# Run analysis
unused = find_unused_exports('src')
print(f"Found {len(unused)} files with potentially unused exports")
for file, exports in unused.items():
    print(f"\n{file}:")
    for export in exports:
        print(f"  - {export}")
```

#### Tool 3: Unused Files Detection

```python
# scripts/detect_unused_files.py
import os
from pathlib import Path

def find_all_imports(src_dir):
    """Find all imported files"""
    imported_files = set()
    
    for file in Path(src_dir).rglob('*.js'):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find import statements
        imports = re.findall(r'from\s+["\']([^"\']+)["\']', content)
        for imp in imports:
            # Resolve relative imports
            if imp.startswith('.'):
                resolved = (file.parent / imp).resolve()
                imported_files.add(str(resolved))
    
    return imported_files

def find_unused_files(src_dir):
    """Find files that are never imported"""
    all_files = {str(f) for f in Path(src_dir).rglob('*.js')}
    imported_files = find_all_imports(src_dir)
    
    # Entry points that don't need to be imported
    entry_points = {'src/app.js', 'src/ui.js', 'src/services.js'}
    
    unused = all_files - imported_files - entry_points
    return unused
```

---

## 📊 Current State Analysis

### Known Issues (From Duplication Report)

1. **Potential Dead Code Locations**:
   - Old refactored files (if not deleted after extraction)
   - Commented-out code blocks
   - Unused utility functions
   - Legacy node definitions (if any)

2. **Suspicious Patterns**:
   - Files with 0% duplication might be unused
   - Very small files (<50 lines) might be candidates for consolidation
   - Files in `/tools` or `/docs` directories

---

## 🧹 Cleanup Checklist

### Immediate Actions

- [ ] Run ESLint and fix all "unused variable" warnings
- [ ] Run dead code detection scripts
- [ ] Review files in `/tools` and `/docs` for relevance
- [ ] Check for commented-out code blocks
- [ ] Verify all imports are used

### File-Level Review

- [ ] **Config Files**: Are all config files actively used?
  - `config/NodeDefaults.js`
  - `config/DOMElements.js`
  - `config/Constants.js`

- [ ] **Utility Files**: Are all utilities imported somewhere?
  - `src/utils/validator.js`
  - `src/utils/guid.js`
  - `src/utils/UE5Renderer.js`

- [ ] **Test Files**: Are tests up to date?
  - Remove obsolete test files
  - Update tests for refactored code

- [ ] **Documentation**: Is documentation current?
  - Remove outdated planning docs
  - Archive completed task files

### Code-Level Review

- [ ] **Unused Functions**: Search for functions never called
- [ ] **Unused Variables**: ESLint will catch these
- [ ] **Unused Imports**: ESLint will catch these
- [ ] **Dead Branches**: if/else blocks that never execute
- [ ] **Commented Code**: Remove or document why it's kept

---

## 🎯 Clean Codebase Standards

### File Organization

```
src/
├── app.js                 # Entry point (must exist)
├── ui.js                  # UI module aggregator (must exist)
├── services.js            # Services aggregator (must exist)
├── graph/                 # Graph-related code
│   ├── GraphController.js # Main controller
│   ├── Node.js           # Node rendering
│   └── ...               # All files imported by GraphController
├── ui/                    # UI controllers
│   ├── VariableController.js
│   └── ...               # All files imported by ui.js
├── services/              # Core services
│   ├── SimulationEngine.js
│   └── ...               # All files imported by services.js
├── data/                  # Static data
│   └── nodes/            # Node definitions (modular)
├── utils/                 # Utilities (all must be imported)
└── tests/                 # Tests (can be standalone)
```

### Import/Export Rules

1. **Every file must be imported** (except entry points and tests)
2. **Every export must be used** (except public APIs)
3. **No circular dependencies**
4. **Explicit imports** (no `import *`)

### Code Quality Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| ESLint warnings | 0 | TBD | ⏳ |
| Unused exports | <5 | TBD | ⏳ |
| Unused files | 0 | TBD | ⏳ |
| Code coverage | >60% | Unknown | ⏳ |
| Cyclomatic complexity | <15 | TBD | ⏳ |

---

## 🚀 Cleanup Plan

### Phase 1: Detection (30 min)

1. Run ESLint and collect all warnings
2. Run dead code detection scripts
3. Generate unused files report
4. Create prioritized cleanup list

### Phase 2: Safe Removals (1 hour)

1. Remove commented-out code
2. Remove unused imports (ESLint --fix)
3. Remove unused variables (ESLint --fix)
4. Archive old documentation

### Phase 3: File Cleanup (1-2 hours)

1. Remove unused utility files
2. Consolidate small related files
3. Remove duplicate functionality
4. Update imports after removals

### Phase 4: Verification (30 min)

1. Run full test suite
2. Manual browser testing
3. Verify no regressions
4. Commit cleanup changes

---

## 🔧 Automated Cleanup Tools

### ESLint Auto-Fix

```bash
npm run lint:fix
```

### Remove Unused Imports (Custom)

```python
# scripts/remove_unused_imports.py
# Analyzes each file and removes imports that aren't used
```

### Dead Code Removal (Manual)

- Review detection report
- Manually verify each item
- Remove with git tracking

---

## 📝 Maintenance Guidelines

### Before Adding New Code

1. Check if similar functionality exists
2. Use existing utilities when possible
3. Follow established patterns

### Before Committing

1. Run `npm run lint:fix`
2. Remove commented code
3. Update imports
4. Verify tests pass

### Monthly Cleanup

1. Run dead code detection
2. Review and remove unused code
3. Update documentation
4. Archive completed tasks

---

## ✅ Success Criteria

A clean codebase has:

- ✅ Zero ESLint warnings
- ✅ Zero unused exports
- ✅ Zero unused files
- ✅ All imports are necessary
- ✅ No commented-out code
- ✅ Clear dependency graph
- ✅ Up-to-date documentation

---

**Next Step**: Run detection scripts and generate cleanup report?
