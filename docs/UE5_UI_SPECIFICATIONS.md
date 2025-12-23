# UE5 UI/UX Specifications - Phase 5

**Date:** December 23, 2025  
**Source:** UE5.6 Engine Source Code  
**Analyzed Files:**

- `D:\Fortnite\UE_5.6\Engine\Source\Editor\GraphEditor\Private\SGraphNode.cpp`
- `D:\Fortnite\UE_5.6\Engine\Source\Editor\GraphEditor\Private\KismetNodes\SGraphNodeK2Base.cpp`
- `D:\Fortnite\UE_5.6\Engine\Source\Editor\EditorStyle\Private\StarshipStyle.cpp`

---

## 🎨 Node Visual Styling

### Node Body Brush

```cpp
// From StarshipStyle.cpp line 3881
Set("Graph.Node.Body", new BOX_BRUSH("/Graph/RegularNode_body", 
    FMargin(16.f/64.f, 25.f/64.f, 16.f/64.f, 16.f/64.f)));
```

**Brush Margins:**

- Left: 16/64 = 0.25 (25%)
- Top: 25/64 = 0.390625 (~39%)
- Right: 16/64 = 0.25 (25%)
- Bottom: 16/64 = 0.25 (25%)

**UE5 Spec:** Node body uses 9-slice scaling with specific margins for rounded corners.

---

## 🎨 Node Colors

### Title Bar Colors (from SGraphNode.cpp)

```cpp
FSlateColor GetNodeTitleColor() const
{
    FLinearColor ReturnTitleColor = GraphNode->IsDeprecated() 
        ? FLinearColor::Red 
        : GetNodeObj()->GetNodeTitleColor();
    
    // Disabled state
    if (!GraphNode->IsNodeEnabled() || 
        GraphNode->IsDisplayAsDisabledForced() || 
        GraphNode->IsNodeUnrelated()) {
        ReturnTitleColor *= FLinearColor(0.5f, 0.5f, 0.5f, 0.4f);
    }
    else {
        ReturnTitleColor.A = FadeCurve.GetLerp();
    }
    return ReturnTitleColor;
}
```

**Disabled Node Multiplier:**

- RGB: 0.5 (50% darker)
- Alpha: 0.4 (60% transparent)

### Body Colors

```cpp
FSlateColor GetNodeBodyColor() const
{
    FLinearColor ReturnBodyColor = GraphNode->GetNodeBodyTintColor();
    
    if (!GraphNode->IsNodeEnabled() || 
        GraphNode->IsDisplayAsDisabledForced() || 
        GraphNode->IsNodeUnrelated()) {
        ReturnBodyColor *= FLinearColor(1.0f, 1.0f, 1.0f, 0.5f);
    }
    return ReturnBodyColor;
}
```

**Disabled Body Multiplier:**

- RGB: 1.0 (no change)
- Alpha: 0.5 (50% transparent)

### Icon Colors

```cpp
FSlateColor GetNodeTitleIconColor() const
{
    FLinearColor ReturnIconColor = IconColor;
    
    if (!GraphNode->IsNodeEnabled() || 
        GraphNode->IsDisplayAsDisabledForced() || 
        GraphNode->IsNodeUnrelated()) {
        ReturnIconColor *= FLinearColor(1.0f, 1.0f, 1.0f, 0.3f);
    }
    return ReturnIconColor;
}
```

**Disabled Icon Multiplier:**

- RGB: 1.0 (no change)
- Alpha: 0.3 (70% transparent)

---

## 📏 Node Padding & Spacing

### Minimum & Maximum Padding (from SGraphNodeK2Base.cpp)

```cpp
static float MinNodePadding = 55.f;      // Minimum horizontal padding
static float MaxNodePadding = 180.0f;    // Maximum horizontal padding

// Dynamic padding based on title length
float PaddingIncrementSize = ...;
PinPaddingRight = FMath::Clamp(
    MinNodePadding + ((float)HeadTitleLength * PaddingIncrementSize), 
    MinNodePadding, 
    MaxNodePadding
);
```

**UE5 Spec:**

- Min padding: **55px**
- Max padding: **180px**
- Padding scales with title length

---

## 📐 Detailed Layout Specifications

### Variable Node Margins (from SGraphNodeK2Var.cpp)

```cpp
FMargin TitleMargin = FMargin(0.0f, 8.0f);           // Title: 0px left/right, 8px top/bottom
FMargin ContentAreaMargin = FMargin(0.0f, 4.0f);     // Content: 0px left/right, 4px top/bottom

// For compact variable nodes
TitleMargin = FMargin(12.0f, VerticalTitleMargin);   // 12px horizontal

// For full variable nodes
TitleMargin = FMargin(12.0f, VerticalTitleMargin, 32.0f, 2.0f);  // 12px left, 32px right, 2px bottom
```

### Button & Control Padding

```cpp
.Padding(FMargin(2, 0))      // Buttons: 2px horizontal
.Padding(FMargin(5.0f, 1.0f)) // Controls: 5px horizontal, 1px vertical
```

### Composite Node Padding

```cpp
.Padding(FMargin(10.0f, 5.0f, 30.0f, 3.0f))  // Composite title: 10/5/30/3px
.Padding(FMargin(0.0f, 5.0f))                // Composite content: 0/5px
.Padding(FMargin(0.0f, 3.0f))                // Composite inner: 0/3px
```

### Tooltip Padding

```cpp
.TextMargin(FMargin(11.0f))  // Tooltip text: 11px all sides
```

### Node Overlay Padding

```cpp
.Padding(FMargin(0, 3))  // Node overlay: 0px horizontal, 3px vertical
```

### Title Text Wrapping

```cpp
.WrapTextAt(128.0f)  // Compact node title wraps at 128px
```

---

## 🎨 Error & Warning Colors

### Error Reporting (from SGraphNode.cpp lines 744-777)

```cpp
void UpdateErrorInfo()
{
    if (GraphNode->bHasCompilerMessage) {
        if (GraphNode->ErrorType <= EMessageSeverity::Error) {
            ErrorMsg = TEXT("ERROR!");
            ErrorColor = FAppStyle::GetColor("ErrorReporting.BackgroundColor");
        }
        else if (GraphNode->ErrorType <= EMessageSeverity::Warning) {
            ErrorMsg = TEXT("WARNING!");
            ErrorColor = FAppStyle::GetColor("ErrorReporting.WarningBackgroundColor");
        }
        else {
            ErrorMsg = TEXT("NOTE");
            ErrorColor = FAppStyle::GetColor("InfoReporting.BackgroundColor");
        }
    }
    else if (!GraphNode->NodeUpgradeMessage.IsEmpty()) {
        ErrorMsg = TEXT("UPGRADE NOTE");
        ErrorColor = FAppStyle::GetColor("InfoReporting.BackgroundColor");
    }
}
```

**Error Types:**

- **Error:** `ErrorReporting.BackgroundColor` (red)
- **Warning:** `ErrorReporting.WarningBackgroundColor` (yellow)
- **Note:** `InfoReporting.BackgroundColor` (blue)
- **Upgrade:** `InfoReporting.BackgroundColor` (blue)

---

## 📐 Multi-Line Title Padding

### Grid Snap Alignment (from SNodeTitle.cpp lines 161-180)

```cpp
// Pad multi-line titles to snap grid
if (Lines.Num() > 1) {
    const int32 EstimatedExtraHeight = (Lines.Num() - 1) * 14;  // 14px per line
    
    const int32 SnapSize = (int32)SNodePanel::GetSnapGridSize();
    const int32 PadSize = SnapSize - (EstimatedExtraHeight % SnapSize);
    
    if (PadSize < SnapSize) {
        VerticalBox->AddSlot()
        [
            SNew(SSpacer)
            .Size(FVector2D(1.0f, PadSize))
        ];
    }
}
```

**UE5 Spec:**

- Each extra line adds ~14px height
- Padding added to align to snap grid
- Ensures pins line up across nodes

---

## 🎨 Pin Visual Specifications

### Pin Brushes (from Phase 1 analysis)

```cpp
// Standard pins
"Graph.Pin.Connected"
"Graph.Pin.Disconnected"

// Variant A style
"Graph.Pin.Connected_VarA"
"Graph.Pin.Disconnected_VarA"

// Array pins
"Graph.ArrayPin.Connected"
"Graph.ArrayPin.Disconnected"

// Reference pins
"Graph.RefPin.Connected"
"Graph.RefPin.Disconnected"

// Delegate pins
"Graph.DelegatePin.Connected"
"Graph.DelegatePin.Disconnected"

// Background
"Graph.Pin.Background"
"Graph.Pin.BackgroundHovered"
```

---

## 🎨 Debug Overlay Colors

### Breakpoint & Debug Colors (from SGraphNodeK2Base.cpp)

```cpp
const FLinearColor BreakpointHitColor(0.7f, 0.0f, 0.0f);     // Dark red
const FLinearColor LatentBubbleColor(1.f, 0.5f, 0.25f);      // Orange
const FLinearColor TimelineBubbleColor(0.7f, 0.5f, 0.5f);    // Pink-gray
const FLinearColor PinnedWatchColor(0.35f, 0.25f, 0.25f);   // Dark brown
```

**Debug Overlay Brushes:**

- `Kismet.DebuggerOverlay.Breakpoint.EnabledAndValid`
- `Kismet.DebuggerOverlay.Breakpoint.EnabledAndInvalid`
- `Kismet.DebuggerOverlay.Breakpoint.Disabled`
- `Kismet.DebuggerOverlay.InstructionPointer`
- `Kismet.DebuggerOverlay.InstructionPointerBreakpoint`

### Instruction Pointer Positioning

```cpp
float Overlap = 10.f;
IPOverlayInfo.OverlayOffset.X = (WidgetSize.X/2.f) - (IPOverlayInfo.Brush->ImageSize.X/2.f);
IPOverlayInfo.OverlayOffset.Y = (Overlap - IPOverlayInfo.Brush->ImageSize.Y);
IPOverlayInfo.AnimationEnvelope = FVector2f(0.f, 10.f);  // 10px animation range
```

### Corner Icon Positioning

```cpp
// Timeline autoplay/loop icons
const float Padding = 2.5f;
IPOverlayInfo.OverlayOffset.X = WidgetSize.X - IPOverlayInfo.Brush->ImageSize.X - Padding;
IPOverlayInfo.OverlayOffset.Y = Padding;

// Corner icon (latent, pure, etc.)
IPOverlayInfo.OverlayOffset.X = (WidgetSize.X - (IPOverlayInfo.Brush->ImageSize.X/2.f)) - 3.f;
IPOverlayInfo.OverlayOffset.Y = (IPOverlayInfo.Brush->ImageSize.Y/-2.f) + 2.f;
```

---

## 🎨 Node State Colors

### Deprecated Nodes

```cpp
FLinearColor ReturnTitleColor = GraphNode->IsDeprecated() 
    ? FLinearColor::Red 
    : GetNodeObj()->GetNodeTitleColor();
```

**Deprecated:** Red title bar

### Disabled Nodes

**Title:** `Color * (0.5, 0.5, 0.5, 0.4)`  
**Body:** `Color * (1.0, 1.0, 1.0, 0.5)`  
**Icon:** `Color * (1.0, 1.0, 1.0, 0.3)`

### Unrelated Nodes (during search)

Same as disabled nodes

---

## 📊 Our Implementation vs UE5

### ✅ What We Have

1. **Basic Node Rendering:**
   - ✅ Node boxes
   - ✅ Title bars
   - ✅ Pin rendering
   - ✅ Basic colors

2. **Node States:**
   - ✅ Selected state
   - ✅ Hover state
   - ⚠️ Disabled state (partial)

### ⚠️ What's Different/Missing

1. **9-Slice Scaling:**
   - UE5: BOX_BRUSH with specific margins
   - Us: ⚠️ Simple border-radius
   - Impact: MEDIUM - Visual polish

2. **Dynamic Padding:**
   - UE5: 55-180px based on title length
   - Us: ❌ Fixed padding
   - Impact: LOW - Visual optimization

3. **Multi-Line Title Alignment:**
   - UE5: Snap grid alignment with spacers
   - Us: ❌ Not implemented
   - Impact: LOW - Edge case

4. **Disabled State Styling:**
   - UE5: Specific multipliers for title/body/icon
   - Us: ⚠️ Basic opacity only
   - Impact: MEDIUM - Visual feedback

5. **Error Badge Styling:**
   - UE5: Color-coded error/warning/note badges
   - Us: ⚠️ Basic error display
   - Impact: MEDIUM - User feedback

6. **Pin Style Variants:**
   - UE5: Different brushes for array/ref/delegate
   - Us: ❌ Single pin style
   - Impact: HIGH - Type distinction

---

## 🎯 Critical Gaps

### Priority 1: Visual Distinction

1. **Pin Style Variants** (4-5 hours)
   - Array pins: Square bracket overlay
   - Reference pins: Diamond shape
   - Delegate pins: Event icon
   - Impact: **HIGH** - Type clarity

2. **Disabled Node Styling** (2-3 hours)
   - Title: 50% darker, 40% alpha
   - Body: 50% alpha
   - Icon: 30% alpha
   - Impact: **MEDIUM** - Visual feedback

### Priority 2: Polish

3. **Error Badge Colors** (2-3 hours)
   - Red for errors
   - Yellow for warnings
   - Blue for notes
   - Impact: **MEDIUM** - User feedback

4. **Dynamic Padding** (3-4 hours)
   - Scale padding with title length
   - Min 55px, max 180px
   - Impact: **LOW** - Visual optimization

---

## 📈 Feature Parity Assessment

### Visual Styling: 70%

- ✅ Basic node rendering
- ✅ Title bar colors
- ✅ Pin colors
- ⚠️ Disabled states (partial)
- ❌ Pin style variants

### Layout & Spacing: 65%

- ✅ Basic layout
- ✅ Pin spacing
- ❌ Dynamic padding
- ❌ Multi-line alignment

### State Feedback: 60%

- ✅ Selection
- ✅ Hover
- ⚠️ Disabled (partial)
- ⚠️ Error badges (basic)

---

## 🎯 Recommendations

### Immediate Actions

1. Add pin style variants (array/ref/delegate)
2. Improve disabled node styling
3. Enhance error badge colors

### Short Term

4. Implement dynamic padding
5. Add multi-line title alignment
6. Improve 9-slice scaling

---

## 💡 Key Insights

### 1. UE5 Uses Precise Multipliers

Not arbitrary opacity values:

- Disabled title: `(0.5, 0.5, 0.5, 0.4)`
- Disabled body: `(1.0, 1.0, 1.0, 0.5)`
- Disabled icon: `(1.0, 1.0, 1.0, 0.3)`

### 2. Padding is Dynamic

Scales from 55px to 180px based on title length to prevent text cramping.

### 3. Multi-Line Titles Snap to Grid

Ensures pins align across nodes even with different title heights.

### 4. Pin Styles Indicate Type

Different visual styles for arrays, references, and delegates improve clarity.

### 5. Error Colors are Standardized

Uses FAppStyle color scheme for consistency across editor.

---

**Phase 5 Complete!** ✅  
**Overall UI/UX Parity:** ~65%

---

## 🎯 Final Overall Assessment

| Phase | System | Parity |
|-------|--------|--------|
| 1 | Graph System | 78% |
| 2 | Node System | 70% |
| 3 | Type System | 70% |
| 4 | Debugging | 35% |
| 5 | UI/UX | 65% |

### **Final Overall Parity: ~64%**

**Strongest Areas:**

- Graph rendering & connections (78%)
- Node types & structure (70%)
- Type validation (70%)

**Weakest Areas:**

- Debugging system (35%)
- UI polish & styling (65%)

**Top Priority Improvements:**

1. Breakpoint system (Phase 4)
2. Pass-by-reference pins (Phase 1)
3. Pin style variants (Phase 5)
4. Step debugging (Phase 4)
5. Optional pins (Phase 2)
