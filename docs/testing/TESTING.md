# Testing & File Size Management System

## Overview
This document describes the testing and file size monitoring system implemented to prevent breaking changes and file corruption.

## ✅ What Was Implemented

### 1. Unit Tests for ComponentsController
**Location:** `tests/ComponentsController.test.js`

**Tests Included:**
- ✅ Add Component
- ✅ Select Component
- ✅ Delete Component (programmatic)
- ✅ Update Node Library on Add
- ✅ Update Node Library on Delete
- ✅ Render Updates After Add
- ✅ Render Updates After Delete

**Status:** All 7 component tests passing ✅

### 2. File Size Monitor
**Location:** `scripts/file-size-monitor.js`

**Features:**
- Monitors all JavaScript files in the project
- Warns when files exceed thresholds:
  - ⚠️  WARNING: >500 lines
  - 🟠 CRITICAL: >800 lines  
  - 🔴 MAX: >1000 lines (build fails)
- Provides refactoring suggestions for oversized files
- Runs automatically before commits

**Current Status:**
- VariableController.js: 829 lines (CRITICAL - should be refactored soon)
- DetailsController.js: 631 lines (WARNING)
- GraphController.js: 552 lines (OK)
- All other files: Within acceptable limits

### 3. NPM Scripts
**Added to package.json:**

```bash
# Check file sizes
npm run check-sizes

# Run linting + file size checks
npm run validate

# Pre-commit hook (runs automatically)
npm run precommit
```

### 4. Test Integration
**Location:** `tests.js`

- Component tests integrated into main test suite
- Added `addTest()` alias for compatibility
- Tests can be run via browser console: `window.runTests()`

## 🎯 How to Use

### Running Tests
1. Open the application in browser (http://localhost:8080/)
2. Open browser console (F12)
3. Run: `window.runTests()`
4. View results in console

### Checking File Sizes
```bash
npm run check-sizes
```

### Before Committing
```bash
npm run validate
```
This will:
1. Run ESLint
2. Check file sizes
3. Fail if any files exceed 1000 lines

## 📊 Test Results (Current)

**Total Tests:** 24
**Passed:** 17 ✅
**Failed:** 7 ❌

**Component Tests:** 7/7 passing ✅

**Known Failing Tests:**
- Some older tests need updating for refactored GraphController methods
- These failures are in legacy tests, not new component tests

## 🔧 Preventing File Corruption

### Best Practices
1. **Monitor file sizes regularly:** Run `npm run check-sizes` weekly
2. **Refactor when files hit 500 lines:** Don't wait until they're huge
3. **Run tests before committing:** Use `npm run validate`
4. **Split large files:** Follow the suggestions from the file size monitor

### Refactoring Guidelines

**For Controllers (>500 lines):**
- Extract rendering logic → `*Renderer.js`
- Extract event handlers → `*EventHandler.js`
- Extract validation → `*Validator.js`

**For Utils (>500 lines):**
- Split by domain → `stringUtils.js`, `arrayUtils.js`, etc.

**For Any File:**
- Identify logical sections
- Extract repeated patterns
- Create focused, single-responsibility modules

## 🚨 Files Needing Attention

### Critical (>800 lines)
- **VariableController.js** (829 lines)
  - Suggested split:
    - `VariableController.js` - Core logic
    - `VariableRenderer.js` - Panel rendering
    - `VariableValidator.js` - Name validation, type checking

### Warning (>500 lines)
- **DetailsController.js** (631 lines)
  - Already has `DetailsRenderer.js` and `DetailsTypeSelector.js`
  - Consider extracting more rendering logic

- **GraphController.js** (552 lines)
  - Already split into:
    - `GraphInteraction.js`
    - `GraphRenderer.js`
    - `GraphSelection.js`
  - Currently well-organized ✅

## 📝 Adding New Tests

### For a New Feature
1. Create test file: `tests/[FeatureName].test.js`
2. Export `register[Feature]Tests(testRunner)` function
3. Import in `tests.js`
4. Call registration function in `registerTests()`

### Example
```javascript
// tests/MyFeature.test.js
export function registerMyFeatureTests(testRunner) {
    testRunner.addTest('My Feature: Does Something', (app) => {
        // Test code
        if (condition) throw new Error('Test failed');
        return true;
    });
}

// tests.js
import { registerMyFeatureTests } from './tests/MyFeature.test.js';

export const registerTests = (runner) => {
    registerMyFeatureTests(runner);
    // ... other tests
};
```

## 🎉 Benefits

1. **Prevents Breaking Changes:** Tests catch regressions immediately
2. **Prevents File Corruption:** Size monitoring catches files before they become unmanageable
3. **Improves Code Quality:** Forces refactoring at appropriate times
4. **Automated Checks:** Pre-commit hooks ensure quality before pushing
5. **Clear Feedback:** Console output shows exactly what's wrong

## 🔄 Next Steps

1. **Fix failing legacy tests:** Update for refactored GraphController
2. **Refactor VariableController:** Split into smaller modules (CRITICAL)
3. **Add more component tests:** Test modal interactions, edge cases
4. **Add integration tests:** Test component + graph interactions
5. **Set up CI/CD:** Run tests automatically on push

## 📚 Resources

- Test Runner: `tests.js`
- Component Tests: `tests/ComponentsController.test.js`
- File Monitor: `scripts/file-size-monitor.js`
- Package Scripts: `package.json`
