# Debug Code Cleanup & Future Node Implementation Plan

## Debug Code to Clean (Optional)

The following `console.log` statements are currently in the codebase. Most are useful for debugging and can be kept or removed based on preference:

### Keep (Useful for Testing/Debugging):
- **tests.js** (lines 13, 21, 32) - Test runner output, essential for test visibility
- **utils/validator.js** (line 60) - Validation output, useful for task validation

### Consider Removing (Development Debug Logs):

#### ui/VariableController.js
- Line 204: `console.log('[updateVariableProperty] Called for:', ...)` 

#### ui/DetailsController.js
- Line 315: `console.log('[Container Type Menu] Callback triggered...')`
- Line 443: `console.log('[addArrayElement] Called with varId:', varId)`
- Line 452: `console.log('[addArrayElement] Variable found:', ...)`
- Line 469: `console.log('[addArrayElement] Adding element...')`
- Line 494: `console.log('[addMapElement] Called with varId:', varId)`
- Line 497: `console.log('[addMapElement] Variable found:', ...)`
- Line 515: `console.log('[addMapElement] Adding map entry...')`

#### graph/WiringController.js
- Line 208: `console.log('[WiringController] Prevented hiding - action menu is open...')`
- Line 211: `console.log('[WiringController] Hiding ghost wire...')`
- Line 216: `console.log('[WiringController] Showing ghost wire for pin:', ...)`

### Recommendation
  - Output: Delta Seconds (float, light blue)
- Visual: Red event header
- Test: Verify delta time pin provides value

### Phase 2: Timeline Nodes (Medium Priority)

**Timeline Node**
- Complex node with internal track editor
- Features:
  - Multiple float/vector/color tracks
  - Play/Stop/Reverse/Set Position functions
  - Update, Finished, Reversed output execution pins
  - Track output pins (one per track)
- Visual: Cyan/aqua color scheme
- Implementation complexity: HIGH
  - Needs custom rendering for timeline editor UI
  - Requires curve data structures
  - Animation playback system

**Add Timeline** (Function)
- Simpler entry point to create timeline
- Opens timeline editor modal
- Lower priority - implement basic timeline first

### Phase 3: Flow Control Nodes (Medium Priority)

**Sequence Node**
- Multiple sequential execution outputs
- Pins:
  - Input: Exec
  - Outputs: Then 0, Then 1, Then 2, ... (expandable)
- Visual: Standard node
- Test: Verify execution order

**Multi-Gate**
- Routes execution to different outputs
- Modes: Loop, Random, etc.
- Implementation: Similar to Branch but with N outputs

**For Loop**
- Standard programming for loop
- Pins: First Index, Last Index, Loop Body, Completed
- Test: Verify iteration count

**For Each Loop**
- Iterates over arrays
- Pins: Array input, Loop Body, Array Element output, Array Index output

### Phase 4: Math & Utility Nodes (Low Priority)

**Lerp (Linear Interpolation)**
- Inputs: A (float), B (float), Alpha (float)
- Output: Return Value (float)
- Common use case for animations

**Random Float/Int**
- Generate random numbers
- Useful for gameplay variety

**Format Text**
- String formatting node
- Inputs: Format string, multiple value inputs
- Output: Formatted text

### Phase 5: Advanced Features (Future)

**Custom Events**
- User-defined events within blueprint
- Can be called from other parts of graph
- Implementation: Needs event registry system

**Functions**
- Reusable subgraphs
- Local variables, inputs, outputs
- Implementation: Complex - requires function graph system

**Macros**
- Similar to functions but collapsed nodes
- Implementation: Medium complexity

---

## Testing Strategy for New Nodes

For each new node type, create tests that verify:

1. **Node Creation**: `app.graph.addNode('NodeKey', x, y)` succeeds
2. **Pin Configuration**: Correct pins with right types and directions
3. **Default Values**: Pins have appropriate default literal values
4. **Visual Rendering**: Node renders without errors
5. **Connections**: Can wire to appropriate other nodes
6. **Execution** (if applicable): Node executes correctly in simulation
7. **Persistence**: Node saves and loads correctly
8. **Duplication**: Node can be duplicated with all state preserved

### Test Template:
```javascript
runner.register('Add [NodeName] Node', (app) => {
    const node = app.graph.addNode('[NodeKey]', 100, 100);
    assert(node !== null, "[NodeName] node should be created");
    assert(node.nodeKey === '[NodeKey]', "Node key should match");
    
5. **Document**:
   - Update README or create node documentation
   - Add usage examples if complex

6. **Commit**:
   - Git commit with descriptive message
   - Tag if it's a significant feature milestone

---

## Priority Order

**Next 3 Nodes to Implement:**
1. **Construction Script** - High value, relatively simple
2. **Sequence Node** - Useful for flow control, medium complexity
3. **Lerp Node** - Common utility, easy to implement

**After that:**
4. Event Tick
5. Timeline (save for larger feature sprint)
