# Code Reuse and Instancing Audit Plan

> **Purpose**: Identify duplicate code patterns, opportunities for abstraction, and improve maintainability through better code reuse.  
> **Created**: 2025-12-21  
> **Status**: Planning Phase

---

## 🎯 Audit Objectives

1. **Identify Code Duplication** - Find repeated patterns across files
2. **Extract Reusable Utilities** - Create shared helper functions
3. **Establish Base Classes** - Abstract common patterns into parent classes
4. **Improve Instancing** - Use factory patterns where appropriate
5. **Reduce Technical Debt** - Consolidate scattered logic

---

## 📋 Audit Scope

### Phase 1: Pattern Detection (Automated)

**Tools to Use:**

- `jscpd` (JavaScript Copy/Paste Detector)
- Custom grep patterns for common anti-patterns
- ESLint complexity metrics

**Target Areas:**

- [ ] Node rendering logic (`src/graph/Node.js`, `src/utils/UE5Renderer.js`)
- [ ] Pin handling across node definitions
- [ ] Modal dialogs (ActionMenu, NeedNodeModal, ParentClassModal, etc.)
- [ ] Controller classes (GraphController, DetailsController, etc.)
- [ ] Persistence logic (save/load patterns)

### Phase 2: Manual Code Review

**Focus Areas:**

#### A. Node Definition Patterns

- [ ] **Pin creation boilerplate** - Do all 14 category files repeat similar pin structures?
- [ ] **Executor patterns** - Can trace nodes share a common executor base?
- [ ] **Default value handling** - Is there duplication in how defaults are applied?

#### B. UI Component Patterns

- [ ] **Modal lifecycle** - Do all modals follow the same show/hide/cleanup pattern?
- [ ] **Event listener setup** - Are listeners attached/removed consistently?
- [ ] **DOM manipulation** - Can we extract common patterns?

#### C. Controller Patterns

- [ ] **Initialization sequences** - Do controllers share common setup logic?
- [ ] **State management** - Is there a consistent pattern we can abstract?
- [ ] **Event handling** - Can we create a base Controller class?

#### D. Data Transformation

- [ ] **Type conversions** - Are there repeated parsing/serialization patterns?
- [ ] **Validation logic** - Can we centralize validation rules?
- [ ] **Error handling** - Is error handling consistent?

### Phase 3: Refactoring Opportunities

**Potential Extractions:**

1. **BaseController.js** - Common controller lifecycle methods
2. **BaseModal.js** - Shared modal behavior
3. **PinFactory.js** - Centralized pin creation logic
4. **NodeExecutorBase.js** - Common execution patterns
5. **ValidationUtils.js** - Centralized validation
6. **DOMHelpers.js** - Common DOM manipulation patterns

---

## 🔍 Detection Scripts

### Script 1: Find Duplicate Code Blocks

```bash
# Install jscpd if not present
npm install -g jscpd

# Run duplicate detection
jscpd src/ --min-lines 5 --min-tokens 50 --format markdown --output ./audit-reports/
```

### Script 2: Find Repeated Patterns

```python
# scripts/find_code_patterns.py
import os
import re
from collections import Counter

patterns = {
    'modal_show': r'\.classList\.(add|remove)\(["\']d-none["\']\)',
    'event_listener': r'addEventListener\(["\'](\w+)["\'],',
    'null_check': r'if\s*\(\s*!\s*\w+\s*\)',
    'pin_creation': r'\{\s*id:\s*["\'][\w_]+["\']\s*,\s*name:',
}

# Scan all JS files and count pattern occurrences
# Output: Top 20 most repeated patterns
```

### Script 3: Complexity Analysis

```bash
# Find files with high cyclomatic complexity
npx eslint src/ --format json | jq '.[] | select(.messages[].ruleId == "complexity")'
```

---

## 📊 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Duplicate code blocks | TBD | <10 | ⏳ |
| Average file complexity | TBD | <15 | ⏳ |
| Shared utility coverage | TBD | >60% | ⏳ |
| Base class usage | 0 | 3+ | ⏳ |

---

## 🚀 Implementation Strategy

### Step 1: Run Detection Scripts

- Execute jscpd analysis
- Run custom pattern detection
- Generate complexity report

### Step 2: Prioritize Findings

- Rank duplicates by impact (frequency × lines)
- Identify "quick wins" (easy extractions)
- Flag high-risk refactors (complex dependencies)

### Step 3: Create Extraction Plan

- Design base classes and utilities
- Write unit tests for extracted code
- Plan migration path for existing code

### Step 4: Execute Refactoring

- Extract utilities one at a time
- Verify with ESLint after each change
- Test functionality after each extraction

### Step 5: Document Patterns

- Update developer guidelines
- Create code examples
- Document new base classes

---

## 📅 Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Detection | 1 session | ⏳ Not Started |
| Phase 2: Review | 1-2 sessions | ⏳ Not Started |
| Phase 3: Refactoring | 2-3 sessions | ⏳ Not Started |
| Phase 4: Testing | 1 session | ⏳ Not Started |

---

## 🔗 Related Documents

- `ROADMAP.md` - Overall project plan
- `AGENTS.md` - Development standards
- `.gemini/antigravity/knowledge/ue5_blueprint_editor_system/` - Architecture KI

---

## 📝 Notes

- **Safety First**: All refactoring must preserve existing functionality
- **Test Coverage**: Add tests before extracting shared code
- **Git Discipline**: Commit after each successful extraction
- **Incremental Approach**: Small, focused changes over big rewrites
