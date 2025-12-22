# Architectural Refactoring Analysis - Scalability & Maintainability

**Purpose**: Identify architectural improvements to prevent breakage and improve performance as the project grows.  
**Date**: December 21, 2025  
**Focus**: Beyond code duplication - structural improvements for long-term health

---

## 🎯 Critical Areas for Improvement

### 1. **Node Registration System** (High Priority)

**Current Issue**: Manual registration in `SimulationEngine.js`

```javascript
// Every new node requires manual registration
this.executorRegistry.register('NodeKey', executor);
```

**Problem**:

- Easy to forget registration when adding new nodes
- No compile-time safety
- Breaks silently at runtime

**Solution**: Auto-registration via convention

```javascript
// src/services/ExecutorRegistry.js (enhanced)
export class ExecutorRegistry {
  constructor() {
    this.executors = new Map();
    this.autoRegisterFromNodeDefinitions();
  }
  
  autoRegisterFromNodeDefinitions() {
    // Automatically map node types to executors based on 'executor' field
    Object.entries(NodeDefinitions).forEach(([key, def]) => {
      if (def.executor && !this.executors.has(key)) {
        const executor = this.getExecutorByName(def.executor);
        if (executor) {
          this.register(key, executor);
        } else {
          console.warn(`No executor found for ${key}: ${def.executor}`);
        }
      }
    });
  }
}
```

**Impact**:

- ✅ Prevents "unknown node type" errors
- ✅ Self-documenting (executor is in node definition)
- ✅ Faster development (no manual registration)

---

### 2. **Event Listener Memory Leaks** (High Priority)

**Current Issue**: Controllers manually manage listeners

```javascript
// Scattered across multiple controllers
element.addEventListener('click', handler);
// Often forgotten: element.removeEventListener('click', handler);
```

**Problem**:

- Memory leaks when switching graphs/contexts
- No centralized cleanup
- Hard to debug performance issues

**Solution**: BaseController with automatic cleanup

```javascript
// src/ui/BaseController.js
export class BaseController {
  constructor(app) {
    this.app = app;
    this.listeners = [];
    this.timers = [];
  }
  
  addListener(element, event, handler, options) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }
  
  setTimeout(callback, delay) {
    const id = setTimeout(callback, delay);
    this.timers.push(id);
    return id;
  }
  
  setInterval(callback, delay) {
    const id = setInterval(callback, delay);
    this.timers.push(id);
    return id;
  }
  
  cleanup() {
    // Auto-cleanup all listeners
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    
    // Auto-cleanup all timers
    this.timers.forEach(id => {
      clearTimeout(id);
      clearInterval(id);
    });
    
    this.listeners = [];
    this.timers = [];
  }
}
```

**Migration Path**:

1. Create BaseController
2. Migrate VariableController first (has 6 clones in duplication report)
3. Migrate other controllers incrementally

**Impact**:

- ✅ Prevents memory leaks
- ✅ Improves performance over time
- ✅ Reduces duplication (12.2% in EventDispatcherController)

---

### 3. **Pin Type Validation** (Medium Priority)

**Current Issue**: No validation of pin connections

```javascript
// Can connect incompatible types at runtime
// No type checking until execution
```

**Problem**:

- Runtime errors instead of connection-time errors
- Confusing for users
- Hard to debug

**Solution**: Type compatibility matrix

```javascript
// src/utils/PinTypeValidator.js
export class PinTypeValidator {
  static compatibilityMatrix = {
    'float': ['float', 'int', 'byte'],
    'int': ['int', 'byte'],
    'vector': ['vector'],
    'exec': ['exec'],
    // ... complete matrix
  };
  
  static canConnect(sourceType, targetType) {
    if (sourceType === targetType) return true;
    return this.compatibilityMatrix[sourceType]?.includes(targetType) || false;
  }
  
  static getConversionNode(sourceType, targetType) {
    // Return conversion node if implicit conversion is possible
    if (sourceType === 'int' && targetType === 'float') {
      return 'Conv_IntToFloat';
    }
    return null;
  }
}
```

**Impact**:

- ✅ Better UX (immediate feedback)
- ✅ Fewer runtime errors
- ✅ Enables auto-conversion suggestions

---

### 4. **State Management** (Medium Priority)

**Current Issue**: Global state scattered across controllers

```javascript
// State is everywhere
this.app.variables
this.app.components
this.app.functions
// No single source of truth
```

**Problem**:

- Hard to track state changes
- Difficult to implement undo/redo
- Challenging to debug

**Solution**: Centralized state manager with pub/sub

```javascript
// src/services/StateManager.js
export class StateManager {
  constructor() {
    this.state = {
      variables: [],
      components: [],
      functions: [],
      graphs: {},
      // ... all state
    };
    this.subscribers = new Map();
    this.history = [];
  }
  
  setState(path, value) {
    const oldValue = this.getState(path);
    this.setStateInternal(path, value);
    this.history.push({ path, oldValue, newValue: value });
    this.notify(path, value);
  }
  
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, []);
    }
    this.subscribers.get(path).push(callback);
  }
  
  undo() {
    const lastChange = this.history.pop();
    if (lastChange) {
      this.setStateInternal(lastChange.path, lastChange.oldValue);
      this.notify(lastChange.path, lastChange.oldValue);
    }
  }
}
```

**Impact**:

- ✅ Enables undo/redo
- ✅ Better debugging (state history)
- ✅ Easier testing

---

### 5. **Node Definition Validation** (Low Priority, High Value)

**Current Issue**: No validation of node definitions

```javascript
// Typos in pin IDs cause runtime errors
{ id: "exec_in", name: "Exec", type: "exec", dir: "in" }
// What if someone types "exce_in"?
```

**Solution**: Schema validation at startup

```javascript
// src/utils/NodeDefinitionValidator.js
export class NodeDefinitionValidator {
  static validateAll(definitions) {
    const errors = [];
    
    Object.entries(definitions).forEach(([key, def]) => {
      // Validate required fields
      if (!def.title) errors.push(`${key}: missing title`);
      if (!def.type) errors.push(`${key}: missing type`);
      if (!def.pins) errors.push(`${key}: missing pins`);
      
      // Validate pins
      def.pins?.forEach((pin, idx) => {
        if (!pin.id) errors.push(`${key}.pins[${idx}]: missing id`);
        if (!pin.type) errors.push(`${key}.pins[${idx}]: missing type`);
        if (!pin.dir) errors.push(`${key}.pins[${idx}]: missing dir`);
        if (!['in', 'out'].includes(pin.dir)) {
          errors.push(`${key}.pins[${idx}]: invalid dir "${pin.dir}"`);
        }
      });
      
      // Check for duplicate pin IDs
      const pinIds = def.pins?.map(p => p.id) || [];
      const duplicates = pinIds.filter((id, idx) => pinIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        errors.push(`${key}: duplicate pin IDs: ${duplicates.join(', ')}`);
      }
    });
    
    if (errors.length > 0) {
      console.error('Node Definition Validation Errors:', errors);
      throw new Error(`${errors.length} validation errors found`);
    }
  }
}
```

**Impact**:

- ✅ Catch errors at startup, not runtime
- ✅ Faster debugging
- ✅ Prevents typos

---

### 6. **Performance Monitoring** (Low Priority)

**Current Issue**: No visibility into performance bottlenecks

**Solution**: Simple performance profiler

```javascript
// src/utils/PerformanceMonitor.js
export class PerformanceMonitor {
  static timings = new Map();
  
  static start(label) {
    this.timings.set(label, performance.now());
  }
  
  static end(label) {
    const start = this.timings.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`[PERF] ${label}: ${duration.toFixed(2)}ms`);
      this.timings.delete(label);
      return duration;
    }
  }
  
  static measure(label, fn) {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }
}

// Usage:
PerformanceMonitor.measure('loadGraph', () => {
  this.loadState(savedState);
});
```

**Impact**:

- ✅ Identify slow operations
- ✅ Optimize critical paths
- ✅ Track performance regressions

---

## 📊 Priority Matrix

| Refactoring | Impact | Effort | Priority | Prevents Breakage |
|-------------|--------|--------|----------|-------------------|
| **BaseController** | High | Medium | 🔴 **1** | ✅ Yes (memory leaks) |
| **Auto Node Registration** | High | Low | 🔴 **2** | ✅ Yes (missing executors) |
| **Pin Type Validation** | Medium | Medium | 🟡 **3** | ✅ Yes (type errors) |
| **State Manager** | High | High | 🟡 **4** | ⚠️ Partial |
| **Node Validation** | Medium | Low | 🟢 **5** | ✅ Yes (typos) |
| **Performance Monitor** | Low | Low | 🟢 **6** | ❌ No |

---

## 🚀 Recommended Implementation Order

### Phase 1: Quick Wins (1-2 sessions)

1. **Node Definition Validator** - Run at startup, catch errors early
2. **Auto Node Registration** - Eliminate manual registration

### Phase 2: Foundation (2-3 sessions)

3. **BaseController** - Start with VariableController migration
4. **Pin Type Validation** - Improve connection UX

### Phase 3: Advanced (3-4 sessions)

5. **State Manager** - Enable undo/redo, better debugging
6. **Performance Monitor** - Track and optimize

---

## 🎯 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Manual node registrations | ~60 | 0 | Count in SimulationEngine.js |
| Memory leaks per session | Unknown | 0 | Chrome DevTools Memory Profiler |
| Runtime type errors | Unknown | <5/month | Error tracking |
| Startup validation errors | 0 (undetected) | All caught | Console errors |
| Avg graph load time | Unknown | <100ms | PerformanceMonitor |

---

## 📝 Next Steps

1. **Implement Node Validation** (30 min) - Immediate safety net
2. **Create BaseController** (1-2 hours) - Foundation for cleanup
3. **Migrate VariableController** (1 hour) - Prove the pattern
4. **Auto-register nodes** (30 min) - Eliminate manual work

Would you like me to start with **Node Definition Validation** or **BaseController**?
