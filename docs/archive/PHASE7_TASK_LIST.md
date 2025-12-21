# UE5 Blueprint Editor: Detailed Implementation Task List (Phase 7+)

This document breaks down the "all of this" implementation requirements from the Technical Analysis into actionable developer tasks.

## 🟢 1. Visual Foundation (UE5 Semiotics)

- [x] **1.1 Standardize CSS Tokens**: Update `variables.css` with exact hex codes for all data types (Section 4.1 & 4.2 of Analysis).
- [x] **1.2 High-Fidelity Pins**: Implement Elongated Pentagon for exec pins and Circle+Beak for data pins in `UE5Renderer.js`.
- [x] **1.3 Breakpoint Parity**: Replace circular breakpoints with the UE5 Red Octagon in `UE5Renderer.js`.
- [x] **1.4 Event Header Icons**: Implement the complex composite SVG for Event node headers.
- [x] **1.5 Node "Glassmorphism"**: Update `nodes.css` to use `rgba(10, 10, 10, 0.85)` background with `backdrop-filter: blur(8px)` and `border-radius: 8px`.

## 🟢 2. Sidebar & Panel Logic (My Blueprint)

- [x] **2.1 Variable Pill Transformation**: Update `VariableController.js` to use `UE5Renderer.renderVariablePill` instead of legacy lozenges.
- [x] **2.2 Function Iconography**: Update `FunctionsController.js` to use the italicized 'f' icon with color coding (Blue=Impure, Green=Pure).
- [x] **2.3 Visibility Toggles**: Implement the "Open/Closed Eye" icon system for variable and function visibility in the sidebar.
- [x] **2.4 Multi-Reference Support**: Ensure the "Grid" (Array), "Brackets" (Set), and "Map" icons are correctly rendered in the sidebar list.

## 🟢 3. Interaction & Workflow (Behavioral Parity)

- [x] **3.1 Shortcut Chords** *(implemented in GraphInteraction.js)*:
  - [x] `B + Click` (Branch)
  - [x] `S + Click` (Sequence)
  - [x] `D + Click` (Delay)
  - [x] `P + Click` (BeginPlay)
  - [x] `C + Click` (Comment Box)
  - [x] Plus extras: `O` (DoOnce), `G` (Gate), `F` (ForEachLoop), `M` (MultiGate)
- [x] **3.2 Context Menu Filtering**: Context Sensitive checkbox exists in ActionMenu with isContextSensitive toggle.
- [x] **3.3 Find Results (Global Search)**: `Ctrl+F` implemented via SearchController.js and LayoutController.js.

## 🟢 4. Debugging & Animation (Active State)

- [x] **4.1 Live Wire Pulsing**: Implemented via `setWireActive()` and `.wire-pulse` class in WiringController.js.
- [ ] **4.2 Watch Value Bubbles**: Partial - context menu has "Watch this value" but no persistent tooltips above pins.
- [x] **4.3 Compile State Machine** *(implemented in Compiler.js + UE5Renderer.renderCompileIcon)*:
  - [x] Yellow (?) for Dirty
  - [x] Green (Check) for Success
  - [x] Red (X) for Error

## 🟡 5. Refactor & Technical Debt

- [/] **5.1 Eliminate Inline Styles**: Target `<50` total inline styles (Current: ~123, down from 328). Most remaining are dynamic positioning/sizing which are acceptable.
- [ ] **5.2 Constants Mapping**: Ensure all nodes use the `PIN_COLORS` constants from `Constants.js` instead of hardcoded strings.

---

## Remaining Work Summary

| Task | Priority | Effort |
|------|----------|--------|
| **2.3 Visibility Toggles** (Eye icons) | Medium | ~2 hours |
| **4.2 Watch Value Bubbles** (Persistent tooltips) | Low | ~3 hours |
| **5.2 Constants Mapping** | Low | ~1 hour |

**Next Action**: Implement **Visibility Toggles** (Eye icons for variables/functions) to complete Section 2.
