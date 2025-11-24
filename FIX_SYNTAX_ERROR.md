# Fix Syntax Error in graph.js

## The Problem
There is an extra closing brace `}` at line 39 that is closing the `GraphController` class too early.

## The Fix

**Open `graph.js` and go to line 39.**

**Change this:**
```javascript
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
    }
}


    initEvents() {
```

**To this (remove the `}`):**
```javascript
        this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
        this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
    }


    initEvents() {
```

## Why This Happened
When deleting the `WiringController` class, it looks like the closing brace for `GraphController`'s constructor got mixed up or an extra brace was added.

## Next Steps
1. Delete the `}` at line 39
2. Save `graph.js`
3. Reload the browser
4. **Test the Ghost Wire!**
