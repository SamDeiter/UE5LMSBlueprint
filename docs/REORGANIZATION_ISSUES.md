# Repository Reorganization - Known Issues

**Date:** December 1, 2025  
**Status:** ⚠️ Needs Fixes

## Reorganization Completed

### What Was Successfully Moved:
- ✅ All source code → `src/`
- ✅ All documentation → `docs/`
- ✅ All Python scripts → `scripts/python/`
- ✅ Test files → `src/tests/`
- ✅ Data files → `src/data/`
- ✅ Cleaned up backup/temp files
- ✅ Updated `index.html` paths

### Directory Structure:
```
Root: 9 files + 14 subdirectories (down from 61 files + 23 subdirectories)
```

## Current Issues After Reorganization

### 1. **Execution Pins Not Visible** ⚠️
- **Symptom**: Nodes are missing their execution pins (white triangular connectors)
- **Likely Cause**: CSS is loading correctly, but pins may not be rendering
- **Status**: Under investigation
- **CSS Verified**: `css/nodes.css` contains correct `.pin-dot.exec-pin` styles
- **Variables Verified**: `css/variables.css` contains `--color-exec: #FFFFFF`

### 2. **Cannot Change Graphs** ⚠️
- **Symptom**: Unable to switch between graphs after opening macros/functions
- **Likely Cause**: GraphSwitcher may have path issues or event binding problems
- **Status**: Needs investigation

### 3. **Construction Script Missing** ⚠️
- **Symptom**: Construction script graph not appearing
- **Likely Cause**: May be related to graph switching issue
- **Status**: Needs investigation

### 4. **Palette List Not Scrollable** ⚠️
- **Symptom**: Cannot scroll the palette list
- **Likely Cause**: CSS overflow issue or layout problem
- **Status**: Needs CSS fix

## Potential Root Causes

### Import Path Issues
All JavaScript files use relative imports (e.g., `./graph/index.js`). Since we moved everything together into `src/`, the relative paths should still work. However, there may be some edge cases.

### Files to Check:
1. `src/app.js` - Main entry point
2. `src/graph/GraphSwitcher.js` - Graph switching logic
3. `src/ui/PaletteController.js` - Palette scrolling
4. `src/graph/Node.js` - Pin rendering

## Recommended Next Steps

### Immediate Actions:
1. **Check Browser Console** - Look for any import errors or missing modules
2. **Verify All Imports** - Ensure no hardcoded absolute paths exist
3. **Test Basic Functionality** - Create a simple node to verify rendering
4. **Fix CSS Issues** - Address palette scrolling

### Investigation Priority:
1. **High**: Execution pins not visible (affects core functionality)
2. **High**: Cannot change graphs (blocks workflow)
3. **Medium**: Construction script missing
4. **Low**: Palette scrolling (workaround: use search)

## Rollback Option

If issues persist, you can rollback using Git:
```bash
git reset --hard HEAD~1
```

This will undo the reorganization and restore the previous structure.

## Testing Checklist

- [ ] Execution pins visible on all node types
- [ ] Can switch between EventGraph, ConstructionScript, Functions, Macros
- [ ] Construction script appears in graph list
- [ ] Palette list scrolls correctly
- [ ] Can create and connect nodes
- [ ] Can save and load blueprints
- [ ] Simulation engine works
- [ ] All UI panels functional

## Notes

The reorganization itself was successful in terms of file movement. The issues appear to be runtime problems that need debugging. The cleaner structure will make maintenance easier once these issues are resolved.

---

**Server Running**: http://localhost:8080  
**Last Updated**: December 1, 2025, 9:33 AM
