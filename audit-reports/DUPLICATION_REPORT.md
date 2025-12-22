# Code Duplication Analysis Report

**Generated**: December 21, 2025  
**Tool**: jscpd (JavaScript Copy/Paste Detector)  
**Threshold**: Minimum 5 lines, 50 tokens

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Files Analyzed** | 97 |
| **Files with Duplication** | 28 |
| **Total Clones Found** | 152 |

---

## Top 10 Files by Duplication Percentage

| Rank | File | Duplication % | Clones | Duplicated Lines | Total Lines |
|------|------|---------------|--------|------------------|-------------|
| 1 | `data/nodes/CollisionNodes.js` | **65.5%** | 10 | 232 | 354 |
| 2 | `data/nodes/MathNodes.js` | **58.7%** | 54 | 438 | 746 |
| 3 | `data/nodes/CollectionNodes.js` | **52.9%** | 22 | 222 | 420 |
| 4 | `data/nodes/CastingNodes.js` | **38.7%** | 2 | 12 | 31 |
| 5 | `services/executors/CastExecutor.js` | **21.1%** | 2 | 12 | 57 |
| 6 | `data/nodes/InputNodes.js` | **20.7%** | 2 | 30 | 145 |
| 7 | `ui/GraphsController.js` | **19.1%** | 1 | 13 | 68 |
| 8 | `data/nodes/FlowControlNodes.js` | **18.8%** | 4 | 40 | 213 |
| 9 | `services/executors/MacroExecutor.js` | **16.0%** | 2 | 29 | 181 |
| 10 | `data/nodes/ActorNodes.js` | **15.2%** | 2 | 24 | 158 |

---

## Duplication by Category

### 🔴 Critical (>50% duplication)

- **`data/nodes/CollisionNodes.js`** - 65.5% (10 clones)
- **`data/nodes/MathNodes.js`** - 58.7% (54 clones)
- **`data/nodes/CollectionNodes.js`** - 52.9% (22 clones)

**Recommendation**: These files have severe duplication and should be refactored immediately using factory patterns or base classes.

### 🟡 High (20-50% duplication)

- **`data/nodes/CastingNodes.js`** - 38.7% (2 clones)
- **`services/executors/CastExecutor.js`** - 21.1% (2 clones)
- **`data/nodes/InputNodes.js`** - 20.7% (2 clones)

**Recommendation**: Extract common patterns into shared utilities or base classes.

### 🟢 Moderate (5-20% duplication)

- **`ui/GraphsController.js`** - 19.1% (1 clones)
- **`data/nodes/FlowControlNodes.js`** - 18.8% (4 clones)
- **`services/executors/MacroExecutor.js`** - 16.0% (2 clones)
- **`data/nodes/ActorNodes.js`** - 15.2% (2 clones)
- **`ui/EventDispatcherController.js`** - 12.2% (5 clones)
- **`ui/FunctionsController.js`** - 9.9% (5 clones)
- **`ui/MacrosController.js`** - 9.5% (2 clones)
- **`ui/ActionMenu.js`** - 9.4% (8 clones)
- **`data/nodes/StringNodes.js`** - 8.4% (2 clones)
- **`services/executors/FunctionExecutor.js`** - 8.2% (1 clones)
- **`data/nodes/EventNodes.js`** - 7.7% (2 clones)
- **`ui/VariableController.js`** - 6.6% (6 clones)
- **`graph/GraphSelection.js`** - 6.2% (1 clones)
- **`ui/ComponentsController.js`** - 6.1% (3 clones)
- **`services/executors/ActorExecutor.js`** - 5.8% (2 clones)
- **`graph/GraphController.js`** - 5.3% (5 clones)
- **`ui/TaskController.js`** - 5.2% (2 clones)
- **`services/executors/TraceExecutor.js`** - 4.2% (2 clones)
- **`utils.js`** - 4.0% (1 clones)
- **`graph/GraphInteraction.js`** - 3.9% (2 clones)
- **`services/SimulationEngine.js`** - 1.7% (1 clones)
- **`ui/DetailsRenderer.js`** - 1.6% (1 clones)

**Recommendation**: Review for quick wins, but lower priority.

---

## Refactoring Priorities

### Priority 1: Node Definition Files

The node definition files show extreme duplication due to repetitive pin definitions:

- `data/nodes/CollisionNodes.js` - 65.5%
- `data/nodes/MathNodes.js` - 58.7%
- `data/nodes/CollectionNodes.js` - 52.9%
- `data/nodes/CastingNodes.js` - 38.7%
- `data/nodes/InputNodes.js` - 20.7%
- `data/nodes/FlowControlNodes.js` - 18.8%
- `data/nodes/ActorNodes.js` - 15.2%
- `data/nodes/StringNodes.js` - 8.4%
- `data/nodes/EventNodes.js` - 7.7%

**Solution**: Create a `PinFactory` utility to generate common pin patterns:
```javascript
// utils/PinFactory.js
export class PinFactory {
  static execPins() {
    return [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
    ];
  }
  
  static vectorInput(id, name, defaultValue = "(0,0,0)") {
    return { id, name, type: "vector", dir: "in", defaultValue };
  }
  
  // ... more patterns
}
```

### Priority 2: Controller Files

- `ui/GraphsController.js` - 19.1%
- `ui/EventDispatcherController.js` - 12.2%
- `ui/FunctionsController.js` - 9.9%
- `ui/MacrosController.js` - 9.5%
- `ui/VariableController.js` - 6.6%

**Solution**: Create a `BaseController` class with common lifecycle methods:
```javascript
// ui/BaseController.js
export class BaseController {
  constructor(app) {
    this.app = app;
    this.listeners = [];
  }
  
  addListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }
  
  cleanup() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
  }
}
```

### Priority 3: Executor Files

- `services/executors/CastExecutor.js` - 21.1%
- `services/executors/MacroExecutor.js` - 16.0%
- `services/executors/FunctionExecutor.js` - 8.2%
- `services/executors/ActorExecutor.js` - 5.8%
- `services/executors/TraceExecutor.js` - 4.2%

**Solution**: Expand `BaseExecutor` with common execution patterns.

---

## Next Steps

1. **Create utility classes** (PinFactory, BaseController)
2. **Refactor MathNodes.js** (58.7% duplication - highest priority)
3. **Refactor CollisionNodes.js** (65.5% duplication)
4. **Refactor CollectionNodes.js** (52.9% duplication)
5. **Extract common controller patterns**
6. **Run jscpd again** to measure improvement

---

## Metrics Tracking

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| Files with >50% duplication | 3 | 0 | ⏳ |
| Files with >20% duplication | 6 | <5 | ⏳ |
| Total clones | 152 | <30 | ⏳ |

