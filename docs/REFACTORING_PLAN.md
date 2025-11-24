# Refactoring Plan: Split graph.js

## Current State
`graph.js` is **1670 lines** and contains 4 major classes:
- `Pin` class (~100 lines)
- `Node` class (~400 lines)
- `WiringController` class (~230 lines)
- `GraphController` class (~900 lines)

**Problem**: File is too large, causing corruption during edits.

## Proposed Structure

```
graph/
├── Pin.js              (~100 lines)
├── Node.js             (~400 lines)
├── WiringController.js (~230 lines)
└── GraphController.js  (~900 lines)
```

Then update `graph.js` to just re-export everything:
```javascript
export { Pin } from './graph/Pin.js';
export { Node } from './graph/Node.js';
export { WiringController } from './graph/WiringController.js';
export { GraphController } from './graph/GraphController.js';
```

This way, existing imports don't break!

## Step-by-Step Migration

### Step 1: Create Directory
```bash
mkdir graph
```

### Step 2: Extract Pin Class
**File**: `graph/Pin.js`
- Copy lines 1-100 from graph.js (the Pin class)
- Add necessary imports at the top
- Export the Pin class

### Step 3: Extract Node Class
**File**: `graph/Node.js`
- Copy lines 101-500 from graph.js (the Node class)
- Add imports: `import { Pin } from './Pin.js';`
- Import Utils, nodeRegistry
- Export the Node class

### Step 4: Extract WiringController
**File**: `graph/WiringController.js`
- Copy lines 501-730 from graph.js
- Add imports for Pin, Node, Utils
- Export WiringController

### Step 5: Extract GraphController
**File**: `graph/GraphController.js`
- Copy lines 731-1670 from graph.js
- Add imports for Node, WiringController, nodeRegistry, Utils
- Export GraphController

### Step 6: Update graph.js
Replace entire contents with re-exports:
```javascript
export { Pin } from './graph/Pin.js';
export { Node } from './graph/Node.js';
export { WiringController } from './graph/WiringController.js';
export { GraphController } from './graph/GraphController.js';
```

### Step 7: Test
- Reload the application
- Verify no import errors
- Test core functionality

### Step 8: Commit
```bash
git add graph/
git add graph.js
git commit -m "refactor: Split graph.js into modular files"
```

## Benefits

1. **Prevents Corruption** - Smaller files are easier to edit safely
2. **Better Organization** - Each class in its own file
3. **Easier to Navigate** - Find code faster
4. **Parallel Development** - Multiple people can work on different classes
5. **Better Git Diffs** - Changes are isolated to specific files

## Risks & Mitigation

**Risk**: Breaking imports  
**Mitigation**: Keep graph.js as a re-export file, so existing imports still work

**Risk**: Circular dependencies  
**Mitigation**: Pin → Node → WiringController → GraphController is already a clean dependency chain

## Timeline

- **Manual approach**: 30-45 minutes (safer, you do it in your editor)
- **Automated approach**: 10 minutes (riskier, I do it with tools)

## Recommendation

**I recommend YOU do this manually** in your code editor:
1. Create the `graph/` directory
2. Copy/paste each class into its own file
3. Add the necessary imports
4. Update graph.js to re-export
5. Test
6. Commit

This way you have full control and can verify each step works before moving on.

Would you like me to:
- **A)** Create detailed copy/paste instructions for you to do manually?
- **B)** Attempt to do it automatically (risky given the corruption issues)?
- **C)** Create the new files but leave graph.js intact so you can migrate gradually?
