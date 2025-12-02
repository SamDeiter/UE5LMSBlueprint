# Known Limitations & Future Features

## Current Limitations

### 1. ❌ Struct/Object Pin Expansion (Split Struct Pin)
**Status**: Not Implemented  
**UE5 Feature**: "Split Struct Pin" / "Break Struct"

**Description:**
In Unreal Engine 5, you can right-click on pins of complex types (structs, objects, interfaces) and select "Split Struct Pin" to expand them into their component fields.

**Examples:**
- **Vector** → Expands to X, Y, Z pins
- **Rotator** → Expands to Pitch, Yaw, Roll pins
- **Transform** → Expands to Location, Rotation, Scale pins
- **Custom Structs** → Expands to all member fields
- **Object References** → Can be broken into component properties

**Current Behavior:**
- Vector, Rotator, and Transform types are handled as **single pins** with special input widgets
- The Details Panel shows X/Y/Z inputs for these types
- But you **cannot expand/split the pins** on the graph nodes themselves
- No "Split Struct Pin" context menu option exists

**Impact:**
- Users cannot connect individual components (e.g., just the X value of a Vector)
- Cannot use separate nodes to construct complex types from components
- Limits flexibility in graph construction

**Workaround:**
- Use the Details Panel to edit Vector/Rotator/Transform values
- Create custom "Break Vector" / "Make Vector" nodes (not yet implemented)

---

### 2. ❌ Make/Break Struct Nodes
**Status**: Not Implemented  
**Related To**: Pin Expansion

**Missing Nodes:**
- `Make Vector` - Construct a Vector from X, Y, Z inputs
- `Break Vector` - Split a Vector into X, Y, Z outputs
- `Make Rotator` - Construct a Rotator from Pitch, Yaw, Roll
- `Break Rotator` - Split a Rotator into components
- `Make Transform` - Construct from Location, Rotation, Scale
- `Break Transform` - Split Transform into components
- Custom struct make/break nodes

**Current Behavior:**
- These utility nodes don't exist in the node library
- Users cannot decompose or compose complex types programmatically

---

### 3. ❌ Custom Struct Definitions
**Status**: Not Implemented

**Description:**
- Cannot define custom struct types
- No struct editor/manager
- Only built-in types (Vector, Rotator, Transform) are supported

---

### 4. ❌ Interface Support
**Status**: Not Implemented

**Description:**
- Interface type exists in type selector but is non-functional
- Cannot define interfaces
- Cannot implement interfaces on Blueprints
- No interface casting or message passing

---

### 5. ❌ Variable Type Menu - Non-Functional Categories
**Status**: UI Placeholder Only  
**Location**: Details Panel → Variable Type Dropdown

**Description:**
The variable type selector menu shows three collapsed categories:
- **Structure**
- **Interface**  
- **Object Types**

**Current Behavior:**
- These categories are **visual placeholders only**
- They **cannot be expanded** (clicking does nothing)
- No actual types are available under these categories
- Only the "common types" (primitives) are selectable

**Code Location:**
`ui/DetailsTypeSelector.js` - `showTypeMenu()` method renders these as static, non-interactive elements:

```javascript
// B) Render Collapsible Categories (Visual Only for now, as per request focus)
const categories = ['Structure', 'Interface', 'Object Types'];
categories.forEach(cat => {
    const catRow = document.createElement('div');
    catRow.className = 'type-selector-section';
    catRow.innerHTML = `<i class="fas fa-caret-right"></i> <span>${cat}</span>`;
    listContainer.appendChild(catRow);
});
```

**Impact:**
- Cannot select struct types for variables
- Cannot select interface types
- Cannot select specific object reference types (Actor, Pawn, Character, etc.)
- Limits variable system to primitive types only

**Workaround:**
- Use the generic `object` type for object references
- No workaround for structs or interfaces

---

### 6. ❌ Enum Definitions
**Status**: Partially Implemented

**Current State:**
- Enum type exists and can be selected
- Default value is `0` (first enum value)
- But **cannot define custom enums**
- No enum editor
- No dropdown to select enum values

**Missing:**
- Enum definition UI
- Enum value dropdown in Details Panel
- Enum literal nodes

---

## 🎯 Proposed Implementation Plan

### Phase 2A: Make/Break Nodes (High Priority)
1. Add `Make Vector` node to NodeDefinitions
2. Add `Break Vector` node to NodeDefinitions
3. Implement similar nodes for Rotator and Transform
4. Add to SimulationEngine execution logic

### Phase 2B: Split Struct Pin (Medium Priority)
1. Add context menu option "Split Struct Pin" for complex types
2. Implement pin expansion logic in Node class
3. Update rendering to show expanded pins
4. Handle wire connections to sub-pins
5. Add "Recombine" option to collapse pins

### Phase 2C: Custom Structs (Low Priority)
1. Create Struct Manager UI
2. Add struct definition editor
3. Implement struct type registration
4. Auto-generate Make/Break nodes for custom structs

### Phase 2D: Enum Editor (Low Priority)
1. Create Enum Manager UI
2. Add enum definition editor
3. Implement enum value dropdown in Details Panel
4. Add enum literal nodes

---

## 📝 Implementation Notes

### Split Struct Pin Technical Approach:

```javascript
// Pseudo-code for pin expansion
class Pin {
    expand() {
        if (!this.canExpand()) return;
        
        this.isExpanded = true;
        this.subPins = this.generateSubPins();
        
        // Update node rendering
        this.node.refreshPins();
    }
    
    canExpand() {
        return ['vector', 'rotator', 'transform', 'struct'].includes(this.type);
    }
    
    generateSubPins() {
        switch(this.type) {
            case 'vector':
                return [
                    { id: `${this.id}_x`, name: 'X', type: 'float' },
                    { id: `${this.id}_y`, name: 'Y', type: 'float' },
                    { id: `${this.id}_z`, name: 'Z', type: 'float' }
                ];
            case 'rotator':
                return [
                    { id: `${this.id}_pitch`, name: 'Pitch', type: 'float' },
                    { id: `${this.id}_yaw`, name: 'Yaw', type: 'float' },
                    { id: `${this.id}_roll`, name: 'Roll', type: 'float' }
                ];
            // ... etc
        }
    }
}
```

### Make/Break Node Definitions:

```javascript
// Example: Make Vector
"MakeVector": {
    title: "Make Vector",
    category: "Math|Vector",
    type: "pure-node",
    icon: "fa-plus",
    pins: [
        { id: "x_in", name: "X", type: "float", dir: "in", defaultValue: 0 },
        { id: "y_in", name: "Y", type: "float", dir: "in", defaultValue: 0 },
        { id: "z_in", name: "Z", type: "float", dir: "in", defaultValue: 0 },
        { id: "vec_out", name: "Vector", type: "vector", dir: "out" }
    ]
}

// Example: Break Vector
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

---

## 🐛 Related Issues

- [ ] #001 - Implement Split Struct Pin feature
- [ ] #002 - Add Make/Break Vector nodes
- [ ] #003 - Add Make/Break Rotator nodes
- [ ] #004 - Add Make/Break Transform nodes
- [ ] #005 - Create Struct Manager UI
- [ ] #006 - Create Enum Manager UI
- [ ] #007 - Implement Interface support

---

## 📚 References

- [UE5 Documentation: Split Struct Pin](https://docs.unrealengine.com/5.0/en-US/BlueprintAPI/)
- [UE5 Documentation: Make/Break Nodes](https://docs.unrealengine.com/5.0/en-US/BlueprintAPI/)

---

**Last Updated**: 2025-11-26  
**Phase 1 Status**: ✅ Complete  
**Phase 2 Status**: 📋 Planning
