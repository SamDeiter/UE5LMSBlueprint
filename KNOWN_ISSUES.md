# Known Issues

## Current Status: 2025-11-23

### HIGH PRIORITY

#### 1. Ghost Wire Not Disappearing When Closing Action Menu
**Status**: ✅ FIXED (2025-11-23)
**Severity**: High (UX Impact)  
**Description**: When dragging a wire from a pin and opening the action menu, clicking off the menu without selecting anything would leave the ghost wire visible.

**Root Cause**:
- Race condition in `ActionMenu.hide()` method
- `sourcePin` was being cleared AFTER calling `updateGhostWire()`
- `WiringController.updateGhostWire()` checked `this.app.actionMenu.sourcePin` before hiding, preventing the ghost wire from being hidden

**Solution**:
- Modified `ActionMenu.hide()` to clear `sourcePin` BEFORE attempting to hide ghost wire
- Added explicit `ghostWire.style.display = 'none'` to ensure it's hidden regardless of state
- Commit: [current session]

**Verification**: Tested and confirmed working - ghost wire now properly disappears when clicking off the action menu.

---

#### 2. Variables Section Missing from Action Menu
**Status**: Regression  
**Severity**: Medium  
**Description**: The "Variables" section that should appear at the top of the right-click action menu is missing.

**What We Know**:
- This was working before the recent session
- Likely related to changes in ActionMenu.js or variable controller
- May have been affected by the git restore operations

**Investigation Steps Taken**:
- None yet

**Next Steps**:
- Check ActionMenu.js for variable section rendering
- Verify VariableController is properly initialized
- Compare with previous working version

**Workaround**: Variables can still be accessed via the "My Blueprint" panel on the left.

---

#### 3. Missing Confirmation Modal for Variable Deletion
**Status**: Not Implemented  
**Severity**: Low  
**Description**: When attempting to delete a variable, the confirmation modal elements are missing from index.html, causing a null reference error.

**Error**:
```
VariableController.js:156 Uncaught TypeError: Cannot set properties of null (setting 'textContent')
```

**What We Know**:
- The modal HTML structure is missing from index.html
- VariableController.deleteVariable() expects these elements:
  - `#confirmation-modal`
  - `#confirmation-msg`
  - `#confirm-yes-btn`
  - `#confirm-no-btn`

**Fix Required**:
Add to index.html before closing `</body>` tag:
```html
<!-- Confirmation Modal -->
<div id="confirmation-modal" style="display: none;">
    <div class="modal-content" style="max-width: 400px; text-align: center;">
        <p id="confirmation-msg" style="margin-bottom: 20px; color: #fff;"></p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="confirm-yes-btn" class="btn-danger">Yes, Delete</button>
            <button id="confirm-no-btn">Cancel</button>
        </div>
    </div>
</div>
```

**Workaround**: Avoid deleting variables until modal is added.

---

### MEDIUM PRIORITY

#### 4. Code Duplication
**Status**: Identified  
**Severity**: Low (Code Quality)  
**Description**: Multiple areas of duplicated code exist throughout the codebase.

**Known Areas**:
- Pin rendering logic (appears in multiple node render methods)
- Graph coordinate transformation (scattered across controllers)
- Pin connection validation (duplicated in multiple places)

**Next Steps**: See CODE_QUALITY_PLAN.md Phase 3

---

#### 5. Missing JSDoc Documentation
**Status**: Identified  
**Severity**: Low (Code Quality)  
**Description**: Most classes and functions lack JSDoc comments.

**Priority Files**:
1. graph.js - Core classes
2. app.js - BlueprintApp class
3. ui.js - Controller classes
4. services.js - Service classes
5. utils.js - Utility functions

**Next Steps**: See CODE_QUALITY_PLAN.md Phase 3

---

### LOW PRIORITY

#### 6. Debug Console Logs
**Status**: Identified  
**Severity**: Very Low  
**Description**: Development console.log statements are present throughout the code.

**Next Steps**: Remove as part of code cleanup (see CODE_QUALITY_PLAN.md Phase 3)

---

## Fixed Issues (This Session)

### ✅ App Initialization Errors
**Fixed**: 2025-11-23  
**Description**: Critical syntax errors in app.js due to duplicated code blocks.  
**Solution**: Completely rewrote app.js to remove duplications.  
**Commit**: d0c746c

### ✅ Graph.js File Corruption
**Fixed**: 2025-11-23  
**Description**: graph.js became corrupted with missing GraphController class.  
**Solution**: Used `git restore graph.js` to recover clean version.

---

## Testing Checklist

Before marking any issue as resolved, verify:
- [ ] No console errors in browser
- [ ] All automated tests pass (`window.runTests()`)
- [ ] Manual testing of affected functionality
- [ ] No regressions in other areas
- [ ] Code committed to git

---

## Notes

- Always commit working code before attempting fixes
- Use `git restore <file>` to recover from file corruption
- Test in browser immediately after changes
- Keep this document updated as issues are discovered/resolved
