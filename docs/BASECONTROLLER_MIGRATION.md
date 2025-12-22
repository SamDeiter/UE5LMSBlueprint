# BaseController Migration Guide

## Overview

`BaseController` provides automatic cleanup of event listeners and timers to prevent memory leaks. This guide shows how to migrate existing controllers to use `BaseController`.

## Quick Start

### Before (Memory Leak Risk)

```javascript
export class MyController {
  constructor(app) {
    this.app = app;
    this.button = document.getElementById('my-button');
    
    // ❌ Event listener never gets cleaned up!
    this.button.addEventListener('click', this.handleClick.bind(this));
    
    // ❌ Interval never gets cleared!
    setInterval(() => this.update(), 1000);
  }
  
  handleClick() {
    console.log('Clicked!');
  }
}
```

### After (Memory Safe)

```javascript
import { BaseController } from './BaseController.js';

export class MyController extends BaseController {
  constructor(app) {
    super(app);  // ✅ Initialize BaseController
    this.init();
  }
  
  init() {
    this.button = document.getElementById('my-button');
    
    // ✅ Automatically tracked for cleanup
    this.addListener(this.button, 'click', this.handleClick.bind(this));
    
    // ✅ Automatically tracked for cleanup
    this.addInterval(() => this.update(), 1000);
  }
  
  handleClick() {
    console.log('Clicked!');
  }
  
  cleanup() {
    super.cleanup();  // ✅ Removes all listeners and timers
    console.log('MyController cleaned up');
  }
}
```

## Migration Steps

### Step 1: Import and Extend BaseController

```javascript
// Add import
import { BaseController } from './BaseController.js';

// Change class declaration
export class MyController extends BaseController {
  constructor(app) {
    super(app);  // Call parent constructor
    // ... rest of your code
  }
}
```

### Step 2: Replace addEventListener with addListener

**Find:**

```javascript
element.addEventListener('click', handler);
element.addEventListener('keydown', handler, options);
```

**Replace with:**

```javascript
this.addListener(element, 'click', handler);
this.addListener(element, 'keydown', handler, options);
```

### Step 3: Replace setTimeout/setInterval

**Find:**

```javascript
setTimeout(() => this.doSomething(), 1000);
setInterval(() => this.update(), 1000);
```

**Replace with:**

```javascript
this.addTimeout(() => this.doSomething(), 1000);
this.addInterval(() => this.update(), 1000);
```

### Step 4: Add cleanup() Method

```javascript
cleanup() {
  super.cleanup();  // IMPORTANT: Call parent cleanup
  
  // Add any custom cleanup here
  this.myCustomResource = null;
}
```

## Real-World Example: VariableController

### Current Code (Lines 24-31)

```javascript
// Bind create events
if (this.createBtn) {
  this.createBtn.addEventListener("click", this.addVariable.bind(this));
}
if (this.nameInput) {
  this.nameInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") this.addVariable();
  });
}
```

### Migrated Code

```javascript
// Bind create events
if (this.createBtn) {
  this.addListener(this.createBtn, "click", this.addVariable.bind(this));
}
if (this.nameInput) {
  this.addListener(this.nameInput, "keyup", (e) => {
    if (e.key === "Enter") this.addVariable();
  });
}
```

## Advanced Features

### Multiple Listeners on Same Element

```javascript
this.addListeners(button, {
  'click': this.handleClick.bind(this),
  'mouseenter': this.handleHover.bind(this),
  'mouseleave': this.handleLeave.bind(this)
});
```

### Manual Cleanup

```javascript
// Remove specific listener
this.removeListener(element, 'click', handler);

// Clear specific timer
const timerId = this.addTimeout(() => {}, 1000);
this.clearTimeout(timerId);
```

### Debugging

```javascript
// Get statistics about tracked resources
const stats = this.getStats();
console.log(`Tracking ${stats.listeners} listeners, ${stats.timers} timers`);
```

## Controllers to Migrate

### Priority 1 (High Memory Leak Risk)

- ✅ **BaseController** - Created
- ⏳ **VariableController** - Has ~15 event listeners
- ⏳ **ComponentsController** - Has ~10 event listeners
- ⏳ **GraphController** - Has drag/drop listeners
- ⏳ **WiringController** - Has canvas listeners

### Priority 2 (Medium Risk)

- ⏳ **PaletteController** - Has search/filter listeners
- ⏳ **DetailsController** - Has form input listeners
- ⏳ **ToolbarController** - Has button listeners

### Priority 3 (Low Risk)

- ⏳ **CompilerController** - Minimal listeners
- ⏳ **PersistenceController** - Auto-save timer

## Testing Checklist

After migrating a controller:

- [ ] All existing functionality still works
- [ ] No console errors
- [ ] Event listeners respond correctly
- [ ] Timers/intervals execute as expected
- [ ] Call `cleanup()` and verify no memory leaks
- [ ] Check `getStats()` shows correct listener count

## Common Pitfalls

### ❌ Forgetting super.cleanup()

```javascript
cleanup() {
  // ❌ Missing super.cleanup()!
  this.myResource = null;
}
```

### ✅ Correct

```javascript
cleanup() {
  super.cleanup();  // ✅ Always call parent first
  this.myResource = null;
}
```

### ❌ Not binding event handlers

```javascript
this.addListener(button, 'click', this.handleClick);  // ❌ 'this' will be wrong!
```

### ✅ Correct

```javascript
this.addListener(button, 'click', this.handleClick.bind(this));  // ✅ Correct 'this'
```

## Benefits

✅ **Prevents Memory Leaks** - Automatic cleanup of all listeners and timers  
✅ **Easier Debugging** - Track all resources with `getStats()`  
✅ **Consistent Pattern** - All controllers use the same cleanup mechanism  
✅ **Less Boilerplate** - No need to manually track listeners  
✅ **Safer Refactoring** - Cleanup is automatic, can't forget to remove listeners  

## Next Steps

1. Migrate `VariableController` (highest priority)
2. Migrate `ComponentsController`
3. Migrate remaining controllers
4. Add cleanup calls to app shutdown logic
5. Test for memory leaks with Chrome DevTools

---

**Created:** 2025-12-21  
**Status:** Ready for implementation  
**Impact:** Prevents memory leaks across entire application
