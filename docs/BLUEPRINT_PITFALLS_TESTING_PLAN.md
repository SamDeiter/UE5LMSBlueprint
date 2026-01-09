# Blueprint Pitfalls Testing Plan

## Executive Summary

This plan outlines how to implement testing scenarios for the "Top 100 Blueprint Pitfalls" to create educational assessments that verify students can identify, diagnose, and rectify production-critical errors.

---

## Phase 1: Logic Flow & Runtime Stability Tests

### 1.1 Accessed None / Null Reference Detection

**Pitfall:** Accessing properties on null object references

**Testing Scenarios:**

- [ ] Create nodes that reference destroyed actors
- [ ] Test BeginPlay timing race conditions
- [ ] Implement `Is Valid` node validation tests
- [ ] Create "Pending Kill" detection scenarios

**Implementation:**

```javascript
// Add to BlueprintValidator.js
export function detectNullReferenceRisks(graphData) {
    // Scan for nodes that access object properties
    // without preceding Is Valid checks
}
```

### 1.2 Cast Failure Handling

**Pitfall:** Unconnected "Cast Failed" execution pins

**Testing Scenarios:**

- [ ] Validate cast nodes have both pins connected
- [ ] Test cast to wrong type scenarios
- [ ] Silent failure detection in execution flow

**Implementation:**

```javascript
// Lint rule: Warn when Cast Failed pin is disconnected
function validateCastNodes(node) {
    if (node.nodeKey.startsWith('Cast_')) {
        const failedPin = node.pins.find(p => p.name === 'Cast Failed');
        if (failedPin && failedPin.links.length === 0) {
            return { warning: 'Cast Failed pin is unconnected' };
        }
    }
}
```

### 1.3 Latent Action Placement

**Pitfall:** Delay nodes inside Functions (not allowed)

**Testing Scenarios:**

- [ ] Prevent latent nodes in Function graphs
- [ ] Allow latent nodes in Event Graph and Macros
- [ ] Test Timeline recursion detection

**Implementation:**

```javascript
// Already partially implemented in LATENT_NODE_TYPES constant
// Expand to validate graph context
```

### 1.4 Sequence Node Timing

**Pitfall:** Assuming Sequence waits for latent actions

**Testing Scenarios:**

- [ ] Create race condition detection
- [ ] Validate variable initialization before use
- [ ] Test inter-branch dependencies

---

## Phase 2: Architecture & Dependency Tests

### 2.1 Hard Reference Detection

**Pitfall:** Dependency cascades from hard object references

**Testing Scenarios:**

- [ ] Implement reference graph visualization
- [ ] Detect circular dependency chains
- [ ] Calculate memory impact estimates
- [ ] Suggest Soft Reference alternatives

**Implementation:**

```javascript
// New module: DependencyAnalyzer.js
export class DependencyAnalyzer {
    buildDependencyGraph(blueprintAssets) {
        // Map Blueprint -> Referenced Blueprints
    }
    
    findCircularDependencies() {
        // Detect A->B->A cycles
    }
    
    calculateMemoryImpact(blueprintId) {
        // Estimate total memory including dependencies
    }
}
```

### 2.2 Cast vs Interface Education

**Pitfall:** Using Cast instead of Interfaces creates tight coupling

**Testing Scenarios:**

- [ ] Create assessment: "Refactor casts to interfaces"
- [ ] Implement Interface message silent failure warnings
- [ ] Add DoesImplementInterface validation

### 2.3 Inheritance vs Composition

**Pitfall:** Deep inheritance trees (God Class anti-pattern)

**Testing Scenarios:**

- [ ] Detect inheritance depth > 3
- [ ] Suggest Component-based alternatives
- [ ] Validate Component retrieval patterns

### 2.4 Struct Mutation Errors

**Pitfall:** Modifying struct copies instead of originals

**Testing Scenarios:**

- [ ] Detect Get -> Modify without Set pattern
- [ ] Validate SetArrayElement usage
- [ ] Test struct pass-by-value vs reference

---

## Phase 3: Performance Pitfall Detection

### 3.1 Event Tick Abuse

**Pitfall:** Heavy logic in Event Tick

**Testing Scenarios:**

- [ ] Count nodes connected to EventTick
- [ ] Flag line traces, UI updates in Tick
- [ ] Suggest event-driven alternatives
- [ ] Validate "Start With Tick Enabled" setting

**Implementation:**

```javascript
// Performance analyzer
export function analyzeTickUsage(graphData) {
    const tickNode = graphData.nodes.find(n => n.nodeKey === 'EventTick');
    if (!tickNode) return { score: 100, issues: [] };
    
    const connectedNodeCount = countConnectedNodes(tickNode);
    const heavyNodes = findHeavyNodes(tickNode); // LineTrace, etc.
    
    return {
        score: calculateScore(connectedNodeCount, heavyNodes),
        issues: generateSuggestions(heavyNodes)
    };
}
```

### 3.2 Construction Script Costs

**Pitfall:** Heavy logic in Construction Script

**Testing Scenarios:**

- [ ] Detect mesh generation in Construction Script
- [ ] Flag Dynamic Material Instance creation
- [ ] Validate editor-vs-runtime appropriate usage

### 3.3 Physics & Collision

**Pitfall:** Complex collision on dynamic objects

**Testing Scenarios:**

- [ ] Validate collision complexity settings
- [ ] Detect overlapping spawn locations
- [ ] Flag missing CCD on fast projectiles

---

## Phase 4: Networking Validation

### 4.1 Authority Checking

**Pitfall:** Client-side logic for server-authoritative actions

**Testing Scenarios:**

- [ ] Validate Server/Client execution context
- [ ] Detect missing "Switch Has Authority"
- [ ] Flag direct state modification on clients

**Implementation:**

```javascript
// Network-aware node categories
const SERVER_ONLY_ACTIONS = [
    'AddHealth', 'RemoveHealth', 
    'AddItem', 'RemoveItem',
    'SpawnActor', 'DestroyActor'
];

function validateNetworkAuthority(node, graphContext) {
    if (SERVER_ONLY_ACTIONS.includes(node.nodeKey)) {
        if (!hasAuthorityCheck(node)) {
            return { error: 'Server-only action without authority check' };
        }
    }
}
```

### 4.2 RPC Ownership

**Pitfall:** Server RPC on unowned actors

**Testing Scenarios:**

- [ ] Validate RPC placement (PlayerController, Pawn)
- [ ] Detect RPCs on world actors
- [ ] Test ownership chain

### 4.3 Replication vs Multicast

**Pitfall:** Using Multicast for persistent state

**Testing Scenarios:**

- [ ] Distinguish transient FX from persistent state
- [ ] Validate RepNotify usage
- [ ] Flag Multicast for state changes

---

## Phase 5: Animation & Control Rig

### 5.1 Thread Safety

**Pitfall:** Non-thread-safe access in Anim Blueprint

**Testing Scenarios:**

- [ ] Flag direct Pawn access in Anim Graph
- [ ] Validate Thread Safe Update usage
- [ ] Test variable hoisting patterns

### 5.2 State Machine Optimization

**Pitfall:** Heavy logic in Transition Rules

**Testing Scenarios:**

- [ ] Detect line traces in transitions
- [ ] Validate "Fast Path" compatibility
- [ ] Suggest boolean-only transitions

---

## Phase 6: World Building & PCG

### 6.1 World Partition

**Pitfall:** Manual streaming conflicts

**Testing Scenarios:**

- [ ] Detect legacy LoadStreamLevel usage
- [ ] Validate Data Layer assignments
- [ ] Test collision-ready patterns

### 6.2 Loading & Collisions

**Pitfall:** Falling through world on spawn

**Testing Scenarios:**

- [ ] Implement loading screen patterns
- [ ] Validate async collision checks
- [ ] Test teleportation safety

---

## Phase 7: UI/Audio/Save Systems

### 7.1 UI Anchoring

**Pitfall:** UI breaks on different resolutions

**Testing Scenarios:**

- [ ] Validate anchor settings
- [ ] Test responsive layouts
- [ ] Multi-resolution preview

### 7.2 Audio Concurrency

**Pitfall:** Sound overflow from rapid fire

**Testing Scenarios:**

- [ ] Validate concurrency limits
- [ ] Test voice pooling
- [ ] Flag unlimited sound spawning

### 7.3 Save Game Serialization

**Pitfall:** Saving object pointers instead of data

**Testing Scenarios:**

- [ ] Detect actor reference in SaveGame
- [ ] Validate struct serialization
- [ ] Test load/reconstruct patterns

---

## Implementation Priority

### High Priority (Implement First)

1. **Null Reference Detection** - Most common crash
2. **Cast Failure Validation** - Silent bugs
3. **Latent Action Placement** - Compilation errors
4. **Event Tick Analysis** - Performance

### Medium Priority

5. Hard Reference Detection
2. Struct Mutation Validation
3. Network Authority Checks
4. Construction Script Analysis

### Lower Priority (Future)

9. Animation Thread Safety
2. World Partition Validation
3. UI Anchor Checking
4. Save System Validation

---

## Test Suite Structure

```
src/tests/
├── pitfalls/
│   ├── LogicFlow.test.js         # Phase 1
│   ├── Architecture.test.js      # Phase 2
│   ├── Performance.test.js       # Phase 3
│   ├── Networking.test.js        # Phase 4
│   ├── Animation.test.js         # Phase 5
│   ├── WorldBuilding.test.js     # Phase 6
│   └── Systems.test.js           # Phase 7
├── validators/
│   ├── NullReferenceValidator.js
│   ├── CastValidator.js
│   ├── TickUsageAnalyzer.js
│   ├── DependencyAnalyzer.js
│   └── NetworkAuthorityValidator.js
```

---

## Assessment Integration

Each pitfall category becomes an **assessment module** in the LMS:

1. **Identification Quiz** - Can student spot the error?
2. **Debug Scenario** - Given broken graph, fix it
3. **Prevention Check** - Build feature avoiding pitfall
4. **Code Review** - Review peer graph for issues

---

## Next Steps

1. [ ] Review this plan
2. [ ] Prioritize which validators to implement first
3. [ ] Create test graphs with intentional errors
4. [ ] Build automated validation pipeline
5. [ ] Integrate with SCORM assessment system
