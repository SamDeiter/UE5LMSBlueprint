# UE5 Execution & Debugging Analysis - Phase 4

**Date:** December 23, 2025  
**Source:** UE5.6 Engine Source Code  
**Analyzed Files:**

- `D:\Fortnite\UE_5.6\Engine\Source\Editor\UnrealEd\Public\Kismet2\KismetDebugUtilities.h` (505 lines)

---

## 🐛 Debugging System Overview

### Core Class: FKismetDebugUtilities

UE5's debugging system is comprehensive and provides:

1. **Breakpoints** - Pause execution at specific nodes
2. **Watch Pins** - Monitor pin values in real-time
3. **Step Debugging** - Step through execution (in/over/out)
4. **Call Stack** - Track execution path
5. **Property Inspection** - View variable values
6. **Execution Tracing** - Record execution history

---

## 🔴 Breakpoint System

### Breakpoint Structure

```cpp
struct FBlueprintBreakpoint
{
    UEdGraphNode* Node;          // Node where breakpoint is set
    bool bEnabled;               // Is breakpoint active?
    bool bStepOnce;              // Single-step breakpoint
    bool bStepOnce_WasPreviouslyDisabled;  // Restore state after step
    bool bStepOnce_RemoveAfterHit;         // Delete after hit
};
```

### Breakpoint Operations

```cpp
// Check if node can have breakpoint
static bool IsBreakpointValid(const FBlueprintBreakpoint& Breakpoint);

// Set breakpoint location
static void SetBreakpointLocation(FBlueprintBreakpoint& Breakpoint, UEdGraphNode* NewNode);

// Enable/disable breakpoint
static void SetBreakpointEnabled(FBlueprintBreakpoint& Breakpoint, bool bIsEnabled);

// Single-step breakpoint (auto-disable after hit)
static void SetBreakpointEnabledForSingleStep(FBlueprintBreakpoint& Breakpoint, bool bDeleteAfterStep);

// Create new breakpoint
static void CreateBreakpoint(const UBlueprint* Blueprint, UEdGraphNode* Node, bool bIsEnabled = true);

// Remove breakpoint
static void RemoveBreakpointFromNode(const UEdGraphNode* OwnerNode, const UBlueprint* OwnerBlueprint);

// Find breakpoint for node
static FBlueprintBreakpoint* FindBreakpointForNode(const UEdGraphNode* OwnerNode, const UBlueprint* OwnerBlueprint);

// Clear all breakpoints
static void ClearBreakpoints(const UBlueprint* Blueprint);
```

### Breakpoint Reload Methods

```cpp
enum class EBlueprintBreakpointReloadMethod
{
    RestoreAll,              // Keep all breakpoints and their state
    RestoreAllAndDisable,    // Keep all but disable them
    DiscardAll               // Remove all breakpoints
};
```

**UE5 Feature:** Breakpoints persist across reloads!

---

## 👁️ Watch Pin System

### Watch Pin Structure

```cpp
struct FBlueprintWatchedPin
{
    UEdGraphPin* Pin;                    // Pin being watched
    TArray<FName> PathToProperty;        // Path to sub-property (for structs)
};
```

### Watch Pin Operations

```cpp
// Check if pin can be watched
static bool CanWatchPin(const UBlueprint* Blueprint, const UEdGraphPin* Pin, 
                       const TArray<FName>& InPathToProperty = TArray<FName>());

// Check if pin is being watched
static bool IsPinBeingWatched(const UBlueprint* Blueprint, const UEdGraphPin* Pin, 
                              const TArray<FName>& InPathToProperty = TArray<FName>());

// Check if pin has any watches
static bool DoesPinHaveWatches(const UBlueprint* Blueprint, const UEdGraphPin* Pin);

// Toggle pin watch
static void TogglePinWatch(const UBlueprint* Blueprint, const UEdGraphPin* Pin);

// Add pin watch
static void AddPinWatch(const UBlueprint* Blueprint, FBlueprintWatchedPin&& WatchedPin);

// Remove pin watch
static bool RemovePinWatch(const UBlueprint* Blueprint, const UEdGraphPin* Pin, 
                          const TArray<FName>& InPathToProperty = TArray<FName>());

// Clear all watches
static void ClearPinWatches(const UBlueprint* Blueprint);
```

### Watch Text Results

```cpp
enum EWatchTextResult
{
    EWTR_Valid,          // Value retrieved successfully
    EWTR_NotInScope,     // Local variable not on stack
    EWTR_NoDebugObject,  // No debug object selected
    EWTR_NoProperty      // No property for pin
};

// Get watch value as text
static EWatchTextResult GetWatchText(FString& OutWatchText, UBlueprint* Blueprint, 
                                    UObject* ActiveObject, const UEdGraphPin* WatchPin);

// Get detailed debug info
static EWatchTextResult GetDebugInfo(TSharedPtr<FPropertyInstanceInfo>& OutDebugInfo, 
                                    UBlueprint* Blueprint, UObject* ActiveObject, 
                                    const UEdGraphPin* WatchPin);
```

**UE5 Feature:** Can watch sub-properties of structs using PathToProperty!

---

## 🪜 Step Debugging

### Step Commands

```cpp
// Step into next node (follow function calls)
static void RequestSingleStepIn();

// Step over next node (don't enter functions)
static void RequestStepOver();

// Step out of current function
static void RequestStepOut();

// Abort current execution
static void RequestAbortingExecution();

// Check if currently single-stepping
static bool IsSingleStepping();
```

### Execution State

```cpp
// Get current node being executed
static UEdGraphNode* GetCurrentInstruction();

// Get most recent breakpoint hit
static UEdGraphNode* GetMostRecentBreakpointHit();

// Get current debugging world
static UWorld* GetCurrentDebuggingWorld();
```

---

## 📚 Call Stack & Tracing

### Trace Sample Structure

```cpp
struct FKismetTraceSample
{
    TWeakObjectPtr<UObject> Context;      // Object context
    TWeakObjectPtr<UFunction> Function;   // Function being executed
    int32 Offset;                         // Bytecode offset
    double ObservationTime;               // When sample was taken
};

// Maximum trace samples
enum { MAX_TRACE_STACK_SAMPLES = 1024 };

// Get trace stack
static const TSimpleRingBuffer<FKismetTraceSample>& GetTraceStack();
```

**UE5 Feature:** Ring buffer stores last 1024 execution samples!

### Source Node Lookup

```cpp
// Find source node from bytecode location
static UEdGraphNode* FindSourceNodeForCodeLocation(const UObject* Object, 
                                                   const UFunction* Function, 
                                                   int32 DebugOpcodeOffset, 
                                                   bool bAllowImpreciseHit = false);

// Find class for node
static const UClass* FindClassForNode(const UObject* Object, const UFunction* Function);
```

---

## 🔍 Property Inspection

### Property Instance Info

```cpp
struct FPropertyInstanceInfo : TSharedFromThis<FPropertyInstanceInfo>
{
    FText Name;                          // Property name
    FText DisplayName;                   // User-friendly name
    FText Value;                         // Current value as text
    FText Type;                          // Property type
    TWeakObjectPtr<UObject> Object;      // Object if property is UObject
    TFieldPath<const FProperty> Property; // Property reference
    bool bIsInContainer;                 // Is in array/set/map
    int32 ContainerIndex;                // Index if in container
    
    // Get watch text for display
    FString GetWatchText() const;
    
    // Get children (for structs/objects)
    const TArray<TSharedPtr<FPropertyInstanceInfo>>& GetChildren();
    
    // Resolve path to sub-property
    TSharedPtr<FPropertyInstanceInfo> ResolvePathToProperty(const TArray<FName>& InPathToProperty);
};
```

### Property Lookup

```cpp
// Find property for pin
static FProperty* FindClassPropertyForPin(UBlueprint* Blueprint, const UEdGraphPin* Pin);

// Find property for node
static FProperty* FindClassPropertyForNode(UBlueprint* Blueprint, const UEdGraphNode* Node);

// Check if debugging data available
static bool HasDebuggingData(const UBlueprint* Blueprint);

// Check if pin value can be inspected
static bool CanInspectPinValue(const UEdGraphPin* Pin);
```

---

## 🎮 Debugging Workflow

### 1. Set Breakpoints

```cpp
// User clicks on node to add breakpoint
FKismetDebugUtilities::CreateBreakpoint(Blueprint, Node, true);

// Breakpoint is installed in bytecode
SetBreakpointInternal(Breakpoint, true);
```

### 2. Start Play-In-Editor (PIE)

```cpp
// Notify debugger of game start
NotifyDebuggerOfStartOfGameFrame(CurrentWorld);

// Execution begins...
```

### 3. Hit Breakpoint

```cpp
// Script exception handler called
OnScriptException(ActiveObject, StackFrame, Info);

// Check break conditions
CheckBreakConditions(NodeStoppedAt, bHitBreakpoint, BreakpointOffset, InOutBreakExecution);

// Attempt to break execution
AttemptToBreakExecution(BlueprintObj, ActiveObject, StackFrame, Info, NodeStoppedAt, DebugOpcodeOffset);

// Update breakpoint state
UpdateBreakpointStateWhenHit(OwnerNode, OwnerBlueprint);
```

### 4. Inspect Values

```cpp
// Get watch text for pins
GetWatchText(OutWatchText, Blueprint, ActiveObject, WatchPin);

// Get detailed debug info
GetDebugInfo(OutDebugInfo, Blueprint, ActiveObject, WatchPin);

// Display in UI as tooltip/bubble
```

### 5. Step Through Code

```cpp
// User presses F10 (step over)
RequestStepOver();

// Or F11 (step into)
RequestSingleStepIn();

// Or Shift+F11 (step out)
RequestStepOut();

// Execution continues to next node
```

### 6. End Execution

```cpp
// Script execution completes
EndOfScriptExecution(BlueprintContext);

// Notify debugger of game end
NotifyDebuggerOfEndOfGameFrame(CurrentWorld);
```

---

## 📊 Our Implementation vs UE5

### ✅ What We Have

1. **Basic Execution:**
   - ✅ Node execution
   - ✅ Exec pin flow
   - ✅ Variable values
   - ✅ Print output

2. **Simple Debugging:**
   - ✅ Console logging
   - ✅ Watch value bubbles (basic)
   - ✅ Execution highlighting

### ⚠️ What's Different/Missing

1. **Breakpoint System:**
   - UE5: Full breakpoint management
   - Us: ❌ Not implemented
   - Impact: **CRITICAL** - Essential for debugging

2. **Step Debugging:**
   - UE5: Step in/over/out
   - Us: ⚠️ Basic step (no in/over/out distinction)
   - Impact: **HIGH** - Limited debugging control

3. **Watch Pins:**
   - UE5: Persistent watch list with sub-properties
   - Us: ⚠️ Temporary tooltips only
   - Impact: **HIGH** - Can't monitor multiple values

4. **Call Stack:**
   - UE5: Full call stack with 1024 samples
   - Us: ❌ Not implemented
   - Impact: **MEDIUM** - Hard to trace execution

5. **Property Inspection:**
   - UE5: Deep property tree with children
   - Us: ⚠️ Basic value display
   - Impact: **MEDIUM** - Can't inspect complex objects

6. **Breakpoint Persistence:**
   - UE5: Breakpoints saved across sessions
   - Us: ❌ Not implemented
   - Impact: **LOW** - Convenience feature

7. **Execution Tracing:**
   - UE5: Ring buffer of 1024 samples
   - Us: ❌ Not implemented
   - Impact: **LOW** - Advanced debugging

---

## 🎯 Critical Gaps

### Priority 1: Must Have (Educational Use)

1. **Breakpoint System**
   - Estimated effort: 10-12 hours
   - Files to create: BreakpointManager.js, Breakpoint UI
   - Files to modify: SimulationEngine, NodeRenderer
   - Impact: **CRITICAL** - Core debugging feature

2. **Improved Step Debugging**
   - Estimated effort: 6-8 hours
   - Files to modify: SimulationEngine, DebugController
   - Features: Step in/over/out distinction
   - Impact: **HIGH** - Better execution control

3. **Persistent Watch Pins**
   - Estimated effort: 6-8 hours
   - Files to create: WatchPinManager.js
   - Files to modify: UI panels, NodeRenderer
   - Impact: **HIGH** - Monitor multiple values

### Priority 2: Should Have

4. **Call Stack View**
   - Estimated effort: 4-5 hours
   - Files to create: CallStackPanel.js
   - Impact: **MEDIUM** - Trace execution path

5. **Property Tree Inspection**
   - Estimated effort: 5-6 hours
   - Files to modify: Watch value display
   - Impact: **MEDIUM** - Inspect complex objects

### Priority 3: Nice to Have

6. **Breakpoint Persistence**
   - Estimated effort: 3-4 hours
   - Files to modify: Persistence.js
   - Impact: **LOW** - Convenience

7. **Execution Tracing**
   - Estimated effort: 6-8 hours
   - Files to create: ExecutionTracer.js
   - Impact: **LOW** - Advanced feature

---

## 📈 Feature Parity Assessment

### Breakpoint System: 20%

- ❌ No breakpoint UI
- ❌ No breakpoint management
- ❌ No breakpoint persistence
- ⚠️ Can pause execution (basic)

### Step Debugging: 40%

- ✅ Basic step execution
- ❌ No step in/over/out
- ❌ No step controls UI
- ⚠️ Execution highlighting

### Watch System: 50%

- ✅ Watch value bubbles
- ⚠️ Temporary only (not persistent)
- ❌ No watch list panel
- ❌ No sub-property watching

### Call Stack: 10%

- ⚠️ Basic execution tracking
- ❌ No call stack view
- ❌ No execution history
- ❌ No trace buffer

### Property Inspection: 45%

- ✅ Basic value display
- ⚠️ Simple types only
- ❌ No property tree
- ❌ No deep inspection

---

## 🎯 Recommendations

### Immediate Actions

1. Implement basic breakpoint system
2. Add breakpoint UI (click node edge)
3. Improve step debugging controls

### Short Term

4. Add persistent watch pin list
5. Implement call stack panel
6. Add property tree inspection

### Long Term

7. Breakpoint persistence
8. Execution tracing
9. Advanced debugging features

---

## 💡 Key Insights

### 1. Breakpoints are Bytecode-Level

UE5 installs breakpoints directly in compiled bytecode:

- Breakpoints survive node reconstruction
- Can be set on macro source nodes
- Validated against generated code

### 2. Watch Pins Support Paths

Can watch sub-properties using `PathToProperty`:

- `MyStruct.X` - Watch X component of vector
- `MyArray[0].Name` - Watch array element property
- Hierarchical property inspection

### 3. Step Debugging is Sophisticated

Three distinct step modes:

- **Step In:** Follow into function calls
- **Step Over:** Execute function without entering
- **Step Out:** Return to calling function

### 4. Execution Tracing is Circular

Ring buffer of 1024 samples:

- Oldest samples overwritten
- Provides execution history
- Used for call stack reconstruction

### 5. Debug Info is Cached

Property inspection caches results:

- Avoids repeated lookups
- Hierarchical structure
- Lazy child population

---

**Phase 4 Complete!** ✅  
**Overall Debugging System Parity:** ~35%

**Next:** Phase 5 - UI/UX Specifications Analysis
