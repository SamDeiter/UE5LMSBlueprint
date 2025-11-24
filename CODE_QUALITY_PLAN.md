# Code Quality & Regression Prevention Plan

## Current Status
✅ **Application is now loading** - `app.js` has been restored and cleaned
✅ **Git repository active** - Changes are being tracked
⚠️ **Minor issue**: Ghost wire disappears when dragging off pins (needs investigation)

---

## Phase 1: Immediate Stabilization (Priority: HIGH)

### 1.1 Commit Current Working State
- [x] Commit cleaned `app.js`
- [ ] Test all core functionality manually
- [ ] Document any known issues in GitHub Issues or a KNOWN_ISSUES.md file
- [ ] Create a stable baseline commit with tag `v1.0-stable`

### 1.2 Set Up Pre-commit Hooks
**Purpose**: Prevent syntax errors from being committed

Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Run syntax check on JavaScript files
for file in $(git diff --cached --name-only --diff-filter=ACM | grep '\.js$'); do
    node --check "$file"
    if [ $# -ne 0 ]; then
        echo "Syntax error in $file"
        exit 1
    fi
done
```

### 1.3 Add ESLint Configuration
**Purpose**: Catch common errors and enforce code style

Install: `npm install --save-dev eslint`

Create `.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-undef": "error",
    "no-duplicate-imports": "error"
  }
}
```

---

## Phase 2: Testing Infrastructure (Priority: HIGH)

### 2.1 Expand Automated Tests
**Current**: Basic tests exist in `tests.js`
**Goal**: Achieve 80%+ coverage of critical paths

**Test Categories to Add**:
1. **Unit Tests** (per file):
   - `graph.js`: Pin, Node, WiringController, GraphController
   - `ui.js`: Each controller separately
   - `services.js`: Each service separately

2. **Integration Tests**:
   - Node creation → wiring → deletion flow
   - Variable creation → usage in nodes → deletion
   - Save → load → verify state
   - Undo → redo operations

3. **Regression Tests** (for bugs we've fixed):
   - Ghost wire visibility during wiring
   - Pin literal values persistence
   - Node duplication with custom pins
   - Variable node updates

### 2.2 Set Up Continuous Testing
**Options**:
- **Simple**: Add `npm test` to run before commits
- **Advanced**: Set up GitHub Actions for automated testing on push

Create `.github/workflows/test.yml`:
```yaml
name: Run Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
```

---

## Phase 3: Code Cleanup & Deduplication (Priority: MEDIUM)

### 3.1 Identify Duplicated Code
**Known areas**:
1. Pin rendering logic (appears in multiple node render methods)
2. Graph coordinate transformation (scattered across controllers)
3. Pin connection validation (duplicated in multiple places)

**Action Plan**:
```
1. Search for duplicate code patterns:
   - Similar function implementations
   - Repeated DOM manipulation
   - Duplicated validation logic

2. Extract to utility functions:
   - Create `utils/PinRenderer.js`
   - Create `utils/CoordinateTransform.js`
   - Create `utils/ConnectionValidator.js`

3. Refactor incrementally:
   - One utility at a time
   - Test after each refactor
   - Commit after each successful refactor
```

### 3.2 Remove Debug Code
**Search for and remove**:
- `console.log()` statements (except critical errors)
- Development marker comments (`// TODO`, `// FIXME`, `// HACK`)
- Commented-out code blocks
- Unused imports

**Tool**: Use ESLint rule `no-console: "warn"` to flag console statements

### 3.3 Add JSDoc Documentation
**Priority files** (in order):
1. `graph.js` - Core classes (Pin, Node, GraphController, WiringController)
2. `app.js` - BlueprintApp class
3. `ui.js` - All controller classes
4. `services.js` - All service classes
5. `utils.js` - All utility functions

**Template**:
```javascript
/**
 * Description of what this class/function does
 * @class ClassName
 * @param {Type} paramName - Description
 * @returns {Type} Description
 * @example
 * const instance = new ClassName(param);
 */
```

---

## Phase 4: Architecture Improvements (Priority: LOW)

### 4.1 Separate Concerns
**Current issues**:
- Large monolithic files (`graph.js` is 1600+ lines)
- Mixed responsibilities (rendering + logic + state management)

**Proposed structure**:
```
src/
├── core/
│   ├── Pin.js
│   ├── Node.js
│   └── Link.js
├── controllers/
│   ├── GraphController.js
│   ├── WiringController.js
│   └── ...
├── renderers/
│   ├── NodeRenderer.js
│   ├── PinRenderer.js
│   └── WireRenderer.js
├── services/
│   ├── Persistence.js
│   ├── Compiler.js
│   └── ...
└── utils/
    ├── CoordinateUtils.js
    ├── ValidationUtils.js
    └── ...
```

### 4.2 Implement State Management
**Goal**: Centralize state to prevent inconsistencies

**Options**:
- Simple: Event-driven architecture with EventEmitter
- Advanced: State management library (Redux, MobX)

### 4.3 Add TypeScript (Optional)
**Benefits**:
- Catch type errors at compile time
- Better IDE autocomplete
- Self-documenting code

**Migration path**:
1. Rename `.js` → `.ts` one file at a time
2. Add type annotations incrementally
3. Use `// @ts-check` in JS files as intermediate step

---

## Phase 5: Development Workflow (Priority: MEDIUM)

### 5.1 Branching Strategy
```
main (stable, production-ready)
  ↓
develop (integration branch)
  ↓
feature/* (individual features)
bugfix/* (bug fixes)
```

**Rules**:
- Never commit directly to `main`
- All changes go through `develop` first
- Create feature branches for new work
- Merge only after tests pass

### 5.2 Code Review Checklist
Before merging any changes:
- [ ] All tests pass
- [ ] No console errors in browser
- [ ] Code follows style guide
- [ ] JSDoc comments added
- [ ] No duplicate code introduced
- [ ] Manual testing completed

### 5.3 Release Process
1. Tag stable versions: `git tag v1.0.0`
2. Create release notes documenting changes
3. Test thoroughly before tagging
4. Keep changelog updated

---

## Phase 6: Monitoring & Maintenance (Priority: LOW)

### 6.1 Error Tracking
**Add to `app.js`**:
```javascript
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    // Optional: Send to error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
```

### 6.2 Performance Monitoring
**Add metrics for**:
- Node rendering time
- Wire drawing time
- Save/load performance
- Memory usage

### 6.3 Regular Maintenance
**Monthly tasks**:
- Review and close stale issues
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review and refactor oldest code

---

## Implementation Timeline

### Week 1: Stabilization
- [x] Commit current state
- [x] Set up pre-commit hooks
- [x] Add ESLint
- [x] Fix ghost wire issue
- [x] Tag stable baseline (v1.0-stable)
- [ ] Manual testing of all features
- [ ] Clean up depot/desktop

### Week 2: Testing
- [ ] Expand test coverage to 50%
- [ ] Add regression tests
- [ ] Set up CI/CD (optional)

### Week 3: Cleanup
- [ ] Remove debug code
- [ ] Add JSDoc to core files
- [ ] Identify and extract duplicated code

### Week 4: Documentation
- [ ] Complete JSDoc for all files
- [ ] Create developer guide
- [ ] Document architecture decisions

### Ongoing
- [ ] Code reviews for all changes
- [ ] Regular refactoring sessions
- [ ] Monitor for new issues

---

## Quick Wins (Do These First)

1. **Add `.eslintrc.json`** - Catches errors immediately
2. **Set up pre-commit hook** - Prevents bad commits
3. **Tag current stable version** - Easy rollback point
4. **Create CONTRIBUTING.md** - Guidelines for future changes
5. **Add more tests to `tests.js`** - Catch regressions early

---

## Success Metrics

- **Zero syntax errors** in committed code
- **80%+ test coverage** for critical paths
- **No duplicate code blocks** > 10 lines
- **All public APIs documented** with JSDoc
- **< 5 open bugs** at any time
- **Clean git history** with meaningful commits

---

## Notes

- This plan is flexible - adjust priorities based on immediate needs
- Focus on preventing the issues we just encountered (file corruption, syntax errors)
- Incremental improvements are better than large rewrites
- Always commit working code before major refactors
