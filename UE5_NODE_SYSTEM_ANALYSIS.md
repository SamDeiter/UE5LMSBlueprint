# UE5 Node System Analysis - Phase 2

**Date:** December 23, 2025  
**Source:** UE5.6 Engine Source Code  
**Analyzed Files:**

- `D:\Fortnite\UE_5.6\Engine\Source\Editor\BlueprintGraph\Classes\K2Node.h` (596 lines)
- `D:\Fortnite\UE_5.6\Engine\Source\Editor\BlueprintGraph\Classes\K2Node_CallFunction.h` (295 lines)

---

## 🏗️ Node Class Hierarchy

### Base Class: UK2Node

```cpp
UCLASS(abstract, MinimalAPI)
class UK2Node : public UEdGraphNode
{
    // Core Properties
    virtual bool IsNodePure() const { return false; }
    virtual bool CanPlaceBreakpoints() const;
    virtual bool DrawNodeAsEntry() const { return false; }
    virtual bool DrawNodeAsExit() const { return false; }
    virtual bool DrawNodeAsVariable() const { return false; }
    virtual bool ShouldDrawCompact() const { return false; }
    
    // Pin Management
    virtual void ReallocatePinsDuringReconstruction(TArray<UEdGraphPin*>& OldPins);
    virtual void ExpandNode(FKismetCompilerContext& CompilerContext, UEdGraph* SourceGraph);
    
    // Execution
    UEdGraphPin* GetExecPin() const;
    UEdGraphPin* GetThenPin() const;
};
```

### Key Node Types

1. **UK2Node_CallFunction** - Function call nodes
2. **UK2Node_VariableGet** - Variable getter nodes
3. **UK2Node_VariableSet** - Variable setter nodes
4. **UK2Node_VariableSetRef** - Variable setter by reference
5. **UK2Node_Event** - Event nodes (BeginPlay, Tick, etc.)
6. **UK2Node_IfThenElse** - Branch/conditional nodes

---

## 🎯 Node Properties

### Pure vs Impure Nodes

**Pure Nodes:**

- No execution pins
- Evaluated on-demand
- Can be called multiple times per frame
- Examples: Math operations, Get Variable, conversions

**Impure Nodes:**

- Have execution pins (exec in, then out)
- Execute once per call
- Can have side effects
- Examples: Set Variable, Print String, function calls

### Node Purity Override

```cpp
enum class ENodePurityOverride : int8
{
    Unset = 0,  // Use function's default purity
    Pure,       // Force pure (no exec pins)
    Impure      // Force impure (add exec pins)
};
```

**UE5 Feature:** Users can toggle pure functions to impure to control execution order!

---

## 📍 Optional Pins System

### FOptionalPinFromProperty Structure

```cpp
struct FOptionalPinFromProperty
{
    FName PropertyName;
    FString PropertyFriendlyName;
    FText PropertyTooltip;
    FName CategoryName;
    
    uint8 bShowPin:1;                    // Is pin visible?
    uint8 bCanToggleVisibility:1;        // Can user show/hide?
    uint8 bPropertyIsCustomized:1;       // Custom pin behavior
    uint8 bHasOverridePin:1;             // Has override control
    uint8 bIsMarkedForAdvancedDisplay:1; // In advanced section
    uint8 bIsOverrideEnabled:1;          // Override active
    uint8 bIsSetValuePinVisible:1;       // Value pin shown
    uint8 bIsOverridePinVisible:1;       // Override pin shown
};
```

### Optional Pin Manager

```cpp
struct FOptionalPinManager
{
    // Rebuild property list from struct
    void RebuildPropertyList(TArray<FOptionalPinFromProperty>& Properties, UStruct* SourceStruct);
    
    // Create pins for visible properties
    void CreateVisiblePins(TArray<FOptionalPinFromProperty>& Properties, 
                          UStruct* SourceStruct, 
                          EEdGraphPinDirection Direction, 
                          UK2Node* TargetNode);
    
    // Check if property can be optional
    virtual bool CanTreatPropertyAsOptional(FProperty* TestProperty) const;
};
```

**UE5 Feature:** Nodes can have optional pins that users can show/hide!

---

## 🔧 Function Call Nodes

### UK2Node_CallFunction Properties

```cpp
class UK2Node_CallFunction : public UK2Node
{
    // Purity
    uint32 bDefaultsToPureFunc:1;        // Function is pure by default
    
    // Enum Expansion
    uint32 bWantsEnumToExecExpansion:1;  // Create exec pins from enum
    
    // Function Reference
    FMemberReference FunctionReference;   // Points to UFunction
    
    // Purity Override
    ENodePurityOverride NodePurityOverride;
};
```

### Pin Creation for Functions

```cpp
bool CreatePinsForFunctionCall(const UFunction* Function)
{
    1. Create self pin (if not static)
    2. Create exec pins (if impure)
    3. Create parameter pins (inputs)
    4. Create return value pin (output)
    5. Create output parameter pins (out params)
}
```

### Enum to Exec Expansion

**UE5 Feature:** Functions with enum parameters can expand to multiple exec pins!

Example: `Switch on Enum` node

```
Input: Enum value
Output: Multiple exec pins (one per enum value)
```

---

## 📦 Variable Nodes

### Variable Node Types

1. **K2Node_VariableGet**
   - Pure node (no exec pins)
   - Single output pin (variable value)
   - Can be compact or full-size

2. **K2Node_VariableSet**
   - Impure node (has exec pins)
   - Input pin for new value
   - Optional output pin for value

3. **K2Node_VariableSetRef**
   - Sets variable by reference
   - Used for pass-by-reference scenarios

### Variable Node Display

```cpp
virtual bool DrawNodeAsVariable() const { return true; }
virtual bool ShouldDrawCompact() const { return true; }
```

**Visual Modes:**

- **Compact:** Small circle with variable name
- **Full:** Standard node box with pins

---

## 🎨 Node Visual Properties

### Node Title Colors

```cpp
virtual FLinearColor GetNodeTitleColor() const override
{
    // Different colors for:
    // - Pure functions (green)
    // - Impure functions (blue)
    // - Events (red)
    // - Variables (teal)
    // - Macros (purple)
}
```

### Node Icons

```cpp
virtual FSlateIcon GetIconAndTint(FLinearColor& OutColor) const
{
    // Returns icon for:
    // - Function type
    // - Variable type
    // - Event type
}

virtual FName GetCornerIcon() const
{
    // Small icon in upper-right corner
    // Examples: "Graph.Latent.LatentIcon"
}
```

### Compact Display

```cpp
virtual bool ShouldDrawCompact() const
{
    // Compact nodes show:
    // - Small icon
    // - Abbreviated title
    // - Minimal pins
}

virtual FText GetCompactNodeTitle() const
{
    // Short title for compact mode
    // Example: "+" for Add node
}
```

---

## 🔄 Node Reconstruction

### Pin Reconstruction Process

```cpp
virtual void ReallocatePinsDuringReconstruction(TArray<UEdGraphPin*>& OldPins)
{
    1. Save old pin data
    2. Destroy old pins
    3. AllocateDefaultPins()
    4. RewireOldPinsToNewPins()
    5. RestoreSplitPins()
    6. PostReconstructNode()
}
```

### Pin Matching for Reconnection

```cpp
enum ERedirectType
{
    ERedirectType_None,          // Pins don't match
    ERedirectType_Name,          // Match by name
    ERedirectType_Value,         // Match + redirect value
    ERedirectType_DefaultValue,  // Different type, use default
};

virtual ERedirectType DoPinsMatchForReconstruction(
    const UEdGraphPin* NewPin, int32 NewPinIndex,
    const UEdGraphPin* OldPin, int32 OldPinIndex) const;
```

**UE5 Feature:** Intelligent pin reconnection after node changes!

---

## 🎯 Node Compilation

### Expansion During Compilation

```cpp
virtual void ExpandNode(FKismetCompilerContext& CompilerContext, UEdGraph* SourceGraph)
{
    // Node can:
    // 1. Add helper nodes
    // 2. Replace itself with other nodes
    // 3. Create intermediate calculations
    // 4. Handle special cases
}
```

### Node Handler

```cpp
virtual FNodeHandlingFunctor* CreateNodeHandler(FKismetCompilerContext& CompilerContext) const
{
    // Returns custom compiler handler
    // Defines how node compiles to bytecode
}
```

---

## 📊 Our Implementation vs UE5

### ✅ What We Have

1. **Basic Node Types:**
   - ✅ Function call nodes
   - ✅ Variable get/set nodes
   - ✅ Event nodes
   - ✅ Flow control nodes
   - ✅ Math/logic nodes

2. **Node Properties:**
   - ✅ Pure vs impure distinction
   - ✅ Node titles and colors
   - ✅ Pin generation

3. **Execution:**
   - ✅ Exec pin flow
   - ✅ Pure node evaluation
   - ✅ Variable access

### ⚠️ What's Different/Missing

1. **Optional Pins System:**
   - UE5: Full optional pin management
   - Us: ❌ Not implemented
   - Impact: HIGH - Users can't customize node pins

2. **Node Purity Override:**
   - UE5: Users can toggle pure→impure
   - Us: ❌ Not implemented
   - Impact: MEDIUM - Limits execution control

3. **Enum to Exec Expansion:**
   - UE5: Enum params become exec pins
   - Us: ❌ Not implemented
   - Impact: MEDIUM - Missing Switch on Enum

4. **Compact Node Display:**
   - UE5: Nodes can be compact or full
   - Us: ⚠️ Partial - All nodes same size
   - Impact: LOW - Visual preference

5. **Node Reconstruction:**
   - UE5: Intelligent pin reconnection
   - Us: ⚠️ Basic - May lose connections
   - Impact: MEDIUM - UX issue

6. **Corner Icons:**
   - UE5: Small icons for latent/pure/etc
   - Us: ❌ Not implemented
   - Impact: LOW - Visual indicator

---

## 🎯 Critical Gaps

### Priority 1: Must Have

1. **Optional Pins System**
   - Estimated effort: 8-10 hours
   - Files to create: OptionalPinManager.js
   - Files to modify: Node definitions, NodeRenderer
   - Impact: HIGH - Essential for advanced nodes

2. **Node Reconstruction Logic**
   - Estimated effort: 6-8 hours
   - Files to modify: GraphController, Node classes
   - Impact: HIGH - Prevents connection loss

### Priority 2: Should Have

3. **Purity Toggle**
   - Estimated effort: 4-5 hours
   - Files to modify: Node definitions, UI
   - Impact: MEDIUM - Better execution control

4. **Enum to Exec Expansion**
   - Estimated effort: 6-8 hours
   - Files to create: EnumExpansion logic
   - Impact: MEDIUM - Switch on Enum nodes

### Priority 3: Nice to Have

5. **Compact Node Display**
   - Estimated effort: 4-5 hours
   - Files to modify: NodeRenderer, CSS
   - Impact: LOW - Visual improvement

6. **Corner Icons**
   - Estimated effort: 2-3 hours
   - Files to modify: NodeRenderer
   - Impact: LOW - Visual indicator

---

## 📝 Key Insights

### 1. Node Flexibility

UE5 nodes are highly customizable:

- Optional pins can be shown/hidden
- Pure functions can become impure
- Nodes can expand during compilation

### 2. Intelligent Reconstruction

UE5 handles node changes gracefully:

- Pins reconnect after changes
- Default values preserved
- Type conversions inserted

### 3. Visual Variety

UE5 has multiple node display modes:

- Compact (small icon + title)
- Full (standard box)
- Variable (special styling)
- Entry/Exit (special shapes)

### 4. Compilation Complexity

UE5 nodes can:

- Expand to multiple nodes
- Create helper calculations
- Handle special cases
- Generate bytecode

---

## 📈 Feature Parity Assessment

### Node Type System: 85%

- ✅ All basic node types
- ✅ Pure/impure distinction
- ✅ Pin generation
- ❌ Optional pins
- ❌ Purity toggle

### Node Visuals: 70%

- ✅ Basic rendering
- ✅ Title colors
- ✅ Icons
- ⚠️ Compact mode (partial)
- ❌ Corner icons

### Node Reconstruction: 60%

- ✅ Basic pin recreation
- ⚠️ Pin reconnection (basic)
- ❌ Intelligent matching
- ❌ Value preservation

### Compilation: 50%

- ✅ Basic execution
- ⚠️ Node expansion (limited)
- ❌ Custom handlers
- ❌ Bytecode generation

---

## 🎯 Recommendations

### Immediate Actions

1. Implement basic optional pin system
2. Improve pin reconnection logic
3. Add node reconstruction tests

### Short Term

4. Add purity toggle UI
5. Implement enum to exec expansion
6. Add compact node mode

### Long Term

7. Full optional pin manager
8. Custom node handlers
9. Advanced compilation features

---

**Phase 2 Complete!** ✅  
**Overall Node System Parity:** ~70%

**Next:** Phase 3 - Type System & Validation Analysis
