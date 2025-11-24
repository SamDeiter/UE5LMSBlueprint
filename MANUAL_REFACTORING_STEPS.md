# Manual Refactoring Instructions for graph.js

## What We've Done So Far

✅ Created `graph/` directory  
✅ Extracted `Pin` class to `graph/Pin.js`  
✅ Extracted `Node` class to `graph/Node.js`  
✅ Verified both files have no syntax errors

## What You Need to Do (Manual Steps)

### Step 1: Update graph.js imports

**Open `graph.js` in your editor**

**Find these lines (lines 1-10):**
```javascript
/**
 * Core Graph Logic: Pin, Node, WiringController, GraphController.
 * This file manages the data model, rendering, and all user interactions 
 * (pan, zoom, drag, selection, wiring).
 */
import { Utils } from './utils.js';
import { nodeRegistry } from './registries/NodeRegistry.js';
import { Pin } from './graph/Pin.js';

// --- CORE DATA MODEL CLASSES ---
```

**Replace with:**
```javascript
/**
 * Core Graph Logic: Pin, Node, WiringController, GraphController.
 * This file manages the data model, rendering, and all user interactions 
 * (pan, zoom, drag, selection, wiring).
 */
import { Utils } from './utils.js';
import { nodeRegistry } from './registries/NodeRegistry.js';
import { Pin } from './graph/Pin.js';
import { Node } from './graph/Node.js';

// --- CORE DATA MODEL CLASSES ---
```

### Step 2: Delete the Node class definition

**Find and DELETE the entire Node class** (approx lines 16-500).
It starts with:
```javascript
/**
 * Represents a single node in the graph canvas.
 */
class Node {
```

And ends with:
```javascript
    getPinsData() {
        // ...
    }
}
```

**Make sure you delete the closing brace `}` of the class!**

### Step 3: Save and Test

1. Save `graph.js`
2. Check syntax: `node --check graph.js`
3. Reload the browser (Ctrl+Shift+R)
4. Verify the application loads without errors
5. Try adding a node to the graph

### Step 4: Commit

```bash
git add graph/Node.js
git add graph.js
git commit -m "refactor: Extract Node class to graph/Node.js"
```

## Next Steps

After this works, we will extract:
- `WiringController` -> `graph/WiringController.js`
- `GraphController` -> `graph/GraphController.js`
