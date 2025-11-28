# Phase 2: SimulationEngine.js Refactoring Plan

## 🎯 Objective
Refactor the monolithic `SimulationEngine.js` (44KB, 1068 lines) using the **Strategy Pattern** to improve maintainability and extensibility.

## 📊 Current Issues
- **Massive `executeNodeLogic()` method** (lines 393-766, ~373 lines)
- **Huge switch statement** handling all node types
- **Hard to extend**: Adding new nodes requires modifying the core engine
- **Mixed concerns**: Flow control, math, variables, functions, macros all in one place
- **Difficult to test**: Can't test individual node executors in isolation

## 🛠️ Refactoring Strategy: Strategy Pattern with Executors

### Architecture Overview
```
SimulationEngine
    ↓
ExecutorRegistry (maps nodeKey → Executor)
    ↓
Individual Executors (one per node category)
```

### Directory Structure
```
services/
├── SimulationEngine.js (refactored, delegates to executors)
├── executors/
│   ├── ExecutorRegistry.js (central registry)
│   ├── BaseExecutor.js (interface/base class)
│   ├── EventExecutor.js (EventBeginPlay, EventTick)
│   ├── FlowControlExecutor.js (Branch, Sequence)
│   ├── MathExecutor.js (AddInt, AddFloat, SubtractFloat, etc.)
│   ├── VariableExecutor.js (Get_*, Set_*)
│   ├── FunctionExecutor.js (Func_*, FunctionEntry, FunctionResult)
│   ├── MacroExecutor.js (Macro_*, MacroEntry, MacroResult)
│   ├── CastExecutor.js (CastTo_*)
│   ├── TimelineExecutor.js (Timeline)
│   ├── PrintExecutor.js (PrintString)
│   └── NeedNodeExecutor.js (NeedNode)
```

## 📋 Implementation Steps

### Step 1: Create Base Infrastructure
1. **Create `services/executors/` directory**
2. **Create `BaseExecutor.js`** - Abstract base class with interface:
   ```javascript
   class BaseExecutor {
       constructor(engine) { this.engine = engine; }
       
       // Returns the next pin ID to follow, or null
       async execute(node) { 
           throw new Error('Must implement execute()'); 
       }
       
       // For pure nodes, returns the computed value
       evaluateValue(node, pin) { 
           throw new Error('Must implement evaluateValue()'); 
       }
   }
   ```

3. **Create `ExecutorRegistry.js`** - Central registry:
   ```javascript
   class ExecutorRegistry {
       constructor(engine) {
           this.engine = engine;
           this.executors = new Map();
           this.patternExecutors = []; // For pattern matching (Get_*, Set_*, etc.)
       }
       
       register(nodeKey, executor) { ... }
       registerPattern(pattern, executor) { ... }
       getExecutor(nodeKey) { ... }
   }
   ```

### Step 2: Create Individual Executors
Extract logic from `executeNodeLogic()` switch statement into dedicated executors:

#### 2.1 EventExecutor
- Handles: `EventBeginPlay`, `EventTick`, `FunctionEntry`, `MacroEntry`
- Logic: Pass-through nodes (lines 555-558)

#### 2.2 FlowControlExecutor
- Handles: `Branch`
- Logic: Conditional branching (lines 630-633)

#### 2.3 MathExecutor
- Handles: `AddInt`, `AddFloat`, `SubtractFloat`, etc.
- Logic: Math operations (currently in `evaluateNodeValue`, lines 869-883)

#### 2.4 VariableExecutor
- Handles: `Get_*`, `Set_*` (pattern matching)
- Logic: Variable access (lines 694-714 for Set, 843-859 for Get)

#### 2.5 FunctionExecutor
- Handles: `Func_*`, `FunctionEntry`, `FunctionResult`
- Logic: Function calls and returns (lines 396-468, 600-622)

#### 2.6 MacroExecutor
- Handles: `Macro_*`, `MacroEntry`, `MacroResult`
- Logic: Macro expansion (lines 472-552, 560-598)

#### 2.7 CastExecutor
- Handles: `CastTo_*` (pattern matching)
- Logic: Type casting (lines 673-691, 886-896)

#### 2.8 TimelineExecutor
- Handles: `Timeline`
- Logic: Timeline control (lines 635-669)

#### 2.9 PrintExecutor
- Handles: `PrintString`
- Logic: Console output (lines 624-628)

#### 2.10 NeedNodeExecutor
- Handles: `NeedNode`
- Logic: Assessment evaluation (lines 717-764)

### Step 3: Refactor SimulationEngine
1. **Add ExecutorRegistry** to constructor
2. **Replace `executeNodeLogic()`** with delegation:
   ```javascript
   async executeNodeLogic(node) {
       const executor = this.executorRegistry.getExecutor(node.nodeKey);
       if (executor) {
           return await executor.execute(node);
       }
       this.log(`Unknown node type: ${node.nodeKey}`, 'error');
       return null;
   }
   ```

3. **Replace `evaluateNodeValue()`** with delegation:
   ```javascript
   evaluateNodeValue(node, pin) {
       const executor = this.executorRegistry.getExecutor(node.nodeKey);
       if (executor && executor.evaluateValue) {
           return executor.evaluateValue(node, pin);
       }
       return null;
   }
   ```

### Step 4: Testing & Validation
1. Run existing tests to ensure no regressions
2. Test each node type individually
3. Verify function calls and macro expansion still work
4. Check NeedNode assessment functionality

### Step 5: Cleanup
1. Remove old switch statement code
2. Update imports in `SimulationEngine.js`
3. Create git checkpoint

## 📈 Expected Benefits
- **Extensibility**: Add new nodes by creating new executors, no core changes
- **Maintainability**: Each executor is ~50-100 lines instead of 1000+ line switch
- **Testability**: Test executors in isolation
- **Clarity**: Clear separation of concerns
- **Performance**: No change (same logic, better organization)

## 🔄 Migration Strategy
1. Create executors one at a time
2. Test each executor before moving to the next
3. Keep old code until all executors are working
4. Switch over atomically
5. Delete old code after verification

## 📅 Estimated Effort
- Step 1 (Infrastructure): 30 minutes
- Step 2 (Executors): 2-3 hours (10 executors × 15-20 min each)
- Step 3 (Refactor Engine): 30 minutes
- Step 4 (Testing): 1 hour
- **Total: ~4-5 hours**

## ✅ Success Criteria
- [ ] All existing tests pass
- [ ] SimulationEngine.js reduced from 1068 to ~500 lines
- [ ] 10+ executor files created
- [ ] No functional regressions
- [ ] Code is more maintainable and extensible
