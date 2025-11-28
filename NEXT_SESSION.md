# Next Session: Make/Break Vector Nodes

## 🎯 Goal
Implement Make Vector and Break Vector nodes to allow users to construct and deconstruct vectors programmatically.

## 📋 What We'll Build

### 1. Make Vector Node
**Purpose**: Combine X, Y, Z inputs into a Vector output

**Node Definition**:
```javascript
"MakeVector": {
    title: "Make Vector",
    category: "Math|Vector",
    type: "pure-node",
    icon: "fa-plus",
    pins: [
        { id: "x_in", name: "X", type: "float", dir: "in", defaultValue: 0 },
        { id: "y_in", name: "Y", type: "float", dir: "in", defaultValue: 0 },
        { id: "z_in", name: "Z", type: "float", dir: "in", defaultValue: 0 },
        { id: "vec_out", name: "Return Value", type: "vector", dir: "out" }
    ]
}
```

### 2. Break Vector Node
**Purpose**: Split a Vector into X, Y, Z outputs

**Node Definition**:
```javascript
"BreakVector": {
    title: "Break Vector",
    category: "Math|Vector",
    type: "pure-node",
    icon: "fa-minus",
    pins: [
        { id: "vec_in", name: "Vector", type: "vector", dir: "in" },
        { id: "x_out", name: "X", type: "float", dir: "out" },
        { id: "y_out", name: "Y", type: "float", dir: "out" },
        { id: "z_out", name: "Z", type: "float", dir: "out" }
    ]
}
```

### 3. Similar Nodes to Add
- Make Rotator / Break Rotator
- Make Transform / Break Transform

---

## 📝 Implementation Steps

### Step 1: Add Node Definitions (15 min)
**File**: `data/NodeDefinitions.js`

1. Find the "Math|Vector" category
2. Add MakeVector and BreakVector definitions
3. Add MakeRotator and BreakRotator
4. Add MakeTransform and BreakTransform

### Step 2: Add Execution Logic (30 min)
**File**: `services/SimulationEngine.js`

Add cases in `evaluateNodeValue()`:

```javascript
case 'MakeVector': {
    const x = this.evaluatePin(node, 'x_in') || 0;
    const y = this.evaluatePin(node, 'y_in') || 0;
    const z = this.evaluatePin(node, 'z_in') || 0;
    return `(${x},${y},${z})`;
}

case 'BreakVector': {
    const vecStr = this.evaluatePin(node, 'vec_in') || '(0,0,0)';
    const parsed = Utils.parseVector(vecStr);
    
    if (pinId.endsWith('x_out')) return parsed.x;
    if (pinId.endsWith('y_out')) return parsed.y;
    if (pinId.endsWith('z_out')) return parsed.z;
    return 0;
}
```

### Step 3: Add Utility Function (10 min)
**File**: `utils.js`

Add if not exists:
```javascript
static parseVector(value) {
    const str = String(value).replace(/[()]/g, '').trim();
    const parts = str.split(',').map(p => parseFloat(p.trim()) || 0);
    return {
        x: parts[0] || 0,
        y: parts[1] || 0,
        z: parts[2] || 0
    };
}
```

### Step 4: Test (15 min)
1. Open the app
2. Search for "Make Vector" in the action menu
3. Add the node to the graph
4. Connect float values to X, Y, Z inputs
5. Connect output to a Print String or variable
6. Run simulation and verify output

---

## ✅ Success Criteria

- [ ] Make Vector node appears in action menu
- [ ] Break Vector node appears in action menu
- [ ] Can connect float inputs to Make Vector
- [ ] Can connect Vector output to other nodes
- [ ] Break Vector correctly splits a vector
- [ ] Simulation executes without errors
- [ ] Similar nodes work for Rotator and Transform

---

## 🐛 Potential Issues to Watch For

1. **Vector format**: Ensure format is `(x,y,z)` with parentheses
2. **Type compatibility**: Vector pins should only connect to vector pins
3. **Null handling**: Handle missing/invalid inputs gracefully
4. **Pure node behavior**: These should be pure (no exec pins)

---

## 📚 Files to Modify

1. `data/NodeDefinitions.js` - Add 6 new node definitions
2. `services/SimulationEngine.js` - Add execution logic
3. `utils.js` - Verify parseVector exists (might already be there)

---

## ⏱️ Estimated Time: 1-2 hours

**Breakdown**:
- Node definitions: 15 min
- Execution logic: 30 min
- Utility functions: 10 min
- Testing: 15 min
- Rotator/Transform nodes: 30 min
- Bug fixes: 15 min buffer

---

## 🎉 What You'll Have After

Users will be able to:
- ✅ Construct vectors from individual X, Y, Z values
- ✅ Extract X, Y, Z components from vectors
- ✅ Do the same for Rotators and Transforms
- ✅ Build more complex mathematical operations
- ✅ Have a more complete UE5-like experience

---

**Ready to go for next session!** 🚀

See you next time!
