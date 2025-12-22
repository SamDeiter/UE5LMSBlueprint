# Refactoring Roadmap - Complete Plan

**Created:** December 21, 2025, 11:15 PM  
**Based on:** DUPLICATION_REPORT.md, ARCHITECTURE_REFACTORING.md, CODE_AUDIT_PLAN.md  
**Total Estimated Time:** 15-20 hours across 6-8 sessions

---

## 🎯 Overview

We've completed **Phase 1 & 2** (Foundation). This roadmap covers **Phase 3-5** (Integration, Optimization, Polish).

---

## ✅ Already Refactored (This Session)

1. ✅ **MathNodes.js** - 58.7% → ~15% duplication (33% file size reduction)
2. ✅ **CollisionNodes.js** - 65.5% → ~10% duplication (44% file size reduction)
3. ✅ **BaseController** - Created for memory leak prevention
4. ✅ **PinTypeValidator** - Created for type safety
5. ✅ **NodeDefinitionValidator** - Created for schema validation

---

## 📊 Remaining Refactoring Targets

### 🔴 **Phase 3: High-Priority Node Files** (6-8 hours)

#### 1. CollectionNodes.js - 52.9% duplication (22 clones)

**Effort:** 1.5 hours  
**Impact:** High - Used frequently for arrays, sets, maps

**Patterns to extract:**

- Array operations (Add, Remove, Get, Length)
- Set operations (Add, Remove, Contains)
- Map operations (Add, Remove, Find, Keys, Values)

**PinFactory methods needed:**

```javascript
PF.arrayOp(operation, elementType)
PF.setOp(operation, elementType)
PF.mapOp(operation, keyType, valueType)
```

**Expected reduction:** 52.9% → ~15% (similar to MathNodes)

---

#### 2. CastingNodes.js - 38.7% duplication (2 clones)

**Effort:** 30 minutes  
**Impact:** Medium - Type conversions

**Patterns to extract:**

- Cast to type nodes (all follow same pattern)
- Type checking nodes

**PinFactory methods needed:**

```javascript
PF.castNode(targetType)
PF.typeCheckNode(type)
```

**Expected reduction:** 38.7% → ~5%

---

#### 3. InputNodes.js - 20.7% duplication (2 clones)

**Effort:** 1 hour  
**Impact:** Medium - User input handling

**Patterns to extract:**

- Key press nodes
- Mouse input nodes
- Touch input nodes
- Gamepad input nodes

**PinFactory methods needed:**

```javascript
PF.inputEventNode(inputType, eventType)
PF.axisInputNode(axisName)
```

**Expected reduction:** 20.7% → ~8%

---

#### 4. FlowControlNodes.js - 18.8% duplication (4 clones)

**Effort:** 1 hour  
**Impact:** High - Core control flow

**Patterns to extract:**

- Branch nodes (if/else)
- Loop nodes (for, while, foreach)
- Switch nodes
- Sequence nodes

**PinFactory methods needed:**

```javascript
PF.branchNode()
PF.loopNode(loopType)
PF.switchNode(caseCount)
```

**Expected reduction:** 18.8% → ~6%

---

#### 5. ActorNodes.js - 15.2% duplication (2 clones)

**Effort:** 45 minutes  
**Impact:** Medium - Actor manipulation

**Patterns to extract:**

- Spawn actor nodes
- Destroy actor nodes
- Get/Set actor property nodes

**PinFactory methods needed:**

```javascript
PF.actorPropertyNode(propertyName, propertyType)
PF.spawnNode(actorType)
```

**Expected reduction:** 15.2% → ~5%

---

#### 6. StringNodes.js - 8.4% duplication (2 clones)

**Effort:** 30 minutes  
**Impact:** Low - String operations

**Patterns to extract:**

- String concatenation
- String comparison
- String manipulation (split, join, replace)

**PinFactory methods needed:**

```javascript
PF.stringOp(operation)
PF.stringComparison(comparisonType)
```

**Expected reduction:** 8.4% → ~3%

---

#### 7. EventNodes.js - 7.7% duplication (2 clones)

**Effort:** 30 minutes  
**Impact:** Medium - Event handling

**Patterns to extract:**

- Event dispatcher nodes
- Event binding nodes
- Custom event nodes

**PinFactory methods needed:**

```javascript
PF.eventNode(eventName, params)
PF.dispatcherNode(eventName)
```

**Expected reduction:** 7.7% → ~3%

---

### 🟡 **Phase 4: Controller Refactoring** (4-6 hours)

#### 8. Migrate All Controllers to BaseController

**Effort:** 4-6 hours total  
**Impact:** Critical - Prevents memory leaks

**Controllers to migrate (in order):**

1. ✅ **VariableController** - 6.6% duplication (6 clones) - **NEXT SESSION**
   - Most-used controller
   - ~15 event listeners
   - Effort: 1 hour

2. **ComponentsController** - 6.1% duplication (3 clones)
   - Component tree management
   - ~10 event listeners
   - Effort: 45 minutes

3. **EventDispatcherController** - 12.2% duplication (5 clones)
   - Event dispatcher management
   - ~8 event listeners
   - Effort: 45 minutes

4. **FunctionsController** - 9.9% duplication (5 clones)
   - Function management
   - ~12 event listeners
   - Effort: 1 hour

5. **MacrosController** - 9.5% duplication (2 clones)
   - Macro management
   - ~8 event listeners
   - Effort: 45 minutes

6. **GraphController** - 5.3% duplication (5 clones)
   - Graph rendering and interaction
   - ~20 event listeners (drag/drop, pan, zoom)
   - Effort: 1.5 hours

7. **GraphsController** - 19.1% duplication (1 clone)
   - Multi-graph management
   - ~6 event listeners
   - Effort: 30 minutes

8. **TaskController** - 5.2% duplication (2 clones)
   - Task/assessment management
   - ~5 event listeners
   - Effort: 30 minutes

**Expected benefits:**

- ✅ Zero memory leaks
- ✅ Consistent cleanup pattern
- ✅ Easier debugging
- ✅ Reduced duplication in all controllers

---

### 🟢 **Phase 5: Executor Refactoring** (2-3 hours)

#### 9. Create BaseExecutor Class

**Effort:** 2-3 hours  
**Impact:** Medium - Cleaner execution logic

**Executors with duplication:**

- CastExecutor.js - 21.1% (2 clones)
- MacroExecutor.js - 16.0% (2 clones)
- FunctionExecutor.js - 8.2% (1 clone)
- ActorExecutor.js - 5.8% (2 clones)
- TraceExecutor.js - 4.2% (2 clones)

**Common patterns to extract:**

- Pin value retrieval
- Output value setting
- Error handling
- Execution context management

**BaseExecutor structure:**

```javascript
export class BaseExecutor {
  getPinValue(node, pinId) { /* ... */ }
  setPinValue(node, pinId, value) { /* ... */ }
  handleError(node, error) { /* ... */ }
  execute(node, context) { /* override in subclass */ }
}
```

---

### 🔵 **Phase 6: UI Component Refactoring** (2-3 hours)

#### 10. Create BaseModal Class

**Effort:** 1.5 hours  
**Impact:** Medium - Cleaner modal code

**Modals to refactor:**

- ActionMenu.js - 9.4% duplication (8 clones)
- NeedNodeModal.js
- ParentClassModal.js
- ConfirmationModal.js

**Common patterns:**

- Show/hide logic
- Position calculation
- Event listener setup/cleanup
- Focus management
- Escape key handling

**BaseModal structure:**

```javascript
export class BaseModal extends BaseController {
  show(position) { /* ... */ }
  hide() { /* ... */ }
  setPosition(x, y) { /* ... */ }
  handleEscape() { /* ... */ }
}
```

---

#### 11. Extract DOMHelpers Utility

**Effort:** 1 hour  
**Impact:** Low - Code organization

**Common DOM patterns to extract:**

- Element creation with classes
- Event delegation
- Class toggling
- Attribute setting
- Query selector shortcuts

**DOMHelpers structure:**

```javascript
export class DOMHelpers {
  static create(tag, classes, attrs) { /* ... */ }
  static toggle(element, className) { /* ... */ }
  static delegate(parent, selector, event, handler) { /* ... */ }
}
```

---

## 📅 Recommended Session Plan

### Session 1 (2.5 hours) - **NEXT SESSION**

1. ✅ Integrate PinTypeValidator (1 hour)
2. ✅ Migrate VariableController (1 hour)
3. ✅ Auto Node Registration (30 min)

### Session 2 (2.5 hours) - Node Files Part 1

1. Refactor CollectionNodes.js (1.5 hours)
2. Refactor CastingNodes.js (30 min)
3. Refactor StringNodes.js (30 min)

### Session 3 (2.5 hours) - Node Files Part 2

1. Refactor InputNodes.js (1 hour)
2. Refactor FlowControlNodes.js (1 hour)
3. Refactor EventNodes.js (30 min)

### Session 4 (2.5 hours) - Controllers Part 1

1. Migrate ComponentsController (45 min)
2. Migrate EventDispatcherController (45 min)
3. Migrate FunctionsController (1 hour)

### Session 5 (2.5 hours) - Controllers Part 2

1. Migrate MacrosController (45 min)
2. Migrate GraphsController (30 min)
3. Migrate TaskController (30 min)
4. Migrate GraphController (45 min)

### Session 6 (2.5 hours) - Executors

1. Create BaseExecutor (1 hour)
2. Migrate CastExecutor (30 min)
3. Migrate MacroExecutor (30 min)
4. Migrate FunctionExecutor (30 min)

### Session 7 (2 hours) - UI Components

1. Create BaseModal (1 hour)
2. Migrate ActionMenu (30 min)
3. Extract DOMHelpers (30 min)

### Session 8 (1 hour) - Polish & Testing

1. Final testing (30 min)
2. Documentation updates (30 min)

---

## 📊 Expected Final Results

### Code Metrics

- **Total Duplication:** 28 files → ~8 files
- **Average Duplication:** 15% → ~5%
- **Lines of Code:** -500 to -800 lines (estimated)
- **File Size Reduction:** 25-35% across refactored files

### Quality Improvements

- ✅ Zero memory leaks (all controllers use BaseController)
- ✅ Type-safe connections (PinTypeValidator integrated)
- ✅ Automatic node registration (no manual work)
- ✅ Consistent patterns across all files
- ✅ Easier to add new nodes/features
- ✅ Better testability

### Maintainability

- ✅ Single source of truth for common patterns
- ✅ Easier onboarding for new developers
- ✅ Faster feature development
- ✅ Fewer bugs from copy-paste errors

---

## 🎯 Success Criteria

After completing all phases:

- [ ] All node files use PinFactory
- [ ] All controllers extend BaseController
- [ ] All executors extend BaseExecutor
- [ ] All modals extend BaseModal
- [ ] Code duplication < 5% average
- [ ] Zero ESLint errors
- [ ] Zero memory leaks
- [ ] All tests passing
- [ ] Documentation complete

---

## 💡 Quick Wins (If Short on Time)

If you only have 1-2 sessions, prioritize these for maximum impact:

1. **CollectionNodes.js** (1.5 hours) - 52.9% → ~15%
2. **VariableController** (1 hour) - Prevents memory leaks
3. **CastingNodes.js** (30 min) - 38.7% → ~5%

**Total:** 3 hours for ~40% of the value

---

**Ready to tackle this systematically! 🚀**
