# Manual Refactoring Instructions for graph.js

## What We've Done So Far

✅ Created `graph/` directory  
✅ Created `graph/Pin.js` with the Pin class extracted  
✅ Verified Pin.js has no syntax errors

## What You Need to Do (Manual Steps)

### Step 1: Update graph.js imports

**Open `graph.js` in your editor**

**Find these lines (lines 1-9):**
```javascript
/**
 * Core Graph Logic: Pin, Node, WiringController, GraphController.
 * This file manages the data model, rendering, and all user interactions 
 * (pan, zoom, drag, selection, wiring).
 */
import { Utils } from './utils.js';
import { nodeRegistry } from './registries/NodeRegistry.js';

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

// --- CORE DATA MODEL CLASSES ---
```

### Step 2: Delete the Pin class definition

**Find and DELETE lines 11-47** (the entire Pin class):
```javascript
/**
 * Represents a single data pin on a node.
 */
class Pin {
    constructor(node, pinData) {
        this.id = pinData.id.includes(node.id) ? pinData.id : `${node.id}-${pinData.id}`;
        this.node = node;
        this.name = pinData.name;
        this.type = (pinData.type || '').toLowerCase(); // Safe lowercasing
        this.dir = pinData.dir;
        this.element = null;
        this.links = [];
        this.containerType = pinData.containerType || 'single';
        this.defaultValue = pinData.defaultValue !== undefined ? pinData.defaultValue : this.getDefaultValue();
        this.isCustom = pinData.isCustom || false;
    }

    getDefaultValue() {
        switch (this.type) {
            case 'bool': return false;
            case 'int':
            case 'int64':
            case 'byte': return 0;
            case 'float': return 0.0;
            default: return '';
        }
    }

    isConnected() { return this.links.length > 0; }

    getMaxLinks() {
        if (this.dir === 'in' && this.type !== 'exec') {
            return 1;
        }
        return Infinity;
    }
}
```

### Step 3: Save and Test

1. Save `graph.js`
2. Check syntax: `node --check graph.js`
3. Reload the browser (Ctrl+Shift+R)
4. Verify the application loads without errors

### Step 4: Commit

```bash
git add graph/Pin.js
git add graph.js
git commit -m "refactor: Extract Pin class to graph/Pin.js"
```

## If It Works

We can continue with the other classes:
- Next: Extract Node class to `graph/Node.js`
- Then: Extract WiringController to `graph/WiringController.js`
- Finally: Extract GraphController to `graph/GraphController.js`

## If It Doesn't Work

Run `git restore graph.js` and let me know what error you see.

---

**Why Manual?**  
My file editing tool keeps corrupting graph.js because it's too large. Manual editing in your code editor is safer and gives you full control.
