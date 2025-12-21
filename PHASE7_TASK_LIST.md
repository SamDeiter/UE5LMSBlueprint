# UE5 Blueprint Editor: Detailed Implementation Task List (Phase 7+)

This document breaks down the "all of this" implementation requirements from the Technical Analysis into actionable developer tasks.

## 🟢 1. Visual Foundation (UE5 Semiotics)

- [x] **1.1 Standardize CSS Tokens**: Update `variables.css` with exact hex codes for all data types (Section 4.1 & 4.2 of Analysis).
- [x] **1.2 High-Fidelity Pins**: Implement Elongated Pentagon for exec pins and Circle+Beak for data pins in `UE5Renderer.js`.
- [x] **1.3 Breakpoint Parity**: Replace circular breakpoints with the UE5 Red Octagon in `UE5Renderer.js`.
- [x] **1.4 Event Header Icons**: Implement the complex composite SVG for Event node headers.
- [x] **1.5 Node "Glassmorphism"**: Update `nodes.css` to use `rgba(10, 10, 10, 0.85)` background with `backdrop-filter: blur(8px)` and `border-radius: 8px`.

## 🟡 2. Sidebar & Panel Logic (My Blueprint)

- [x] **2.1 Variable Pill Transformation**: Update `VariableController.js` to use `UE5Renderer.renderVariablePill` instead of legacy lozenges.
- [x] **2.2 Function Iconography**: Update `FunctionsController.js` to use the italicized 'f' icon with color coding (Blue=Impure, Green=Pure).
- [ ] **2.3 Visibility Toggles**: Implement the "Open/Closed Eye" icon system for variable and function visibility in the sidebar.
- [x] **2.4 Multi-Reference Support**: Ensure the "Grid" (Array), "Brackets" (Set), and "Map" icons are correctly rendered in the sidebar list.

## 🟠 3. Interaction & Workflow (Behavioral Parity)

- [ ] **3.1 Shortcut Chords**:
  - [ ] `B + Click` (Branch)
  - [ ] `S + Click` (Sequence)
  - [ ] `D + Click` (Delay)
  - [ ] `P + Click` (BeginPlay)
  - [ ] `C + Click` (Comment Box)
- [ ] **3.2 Context Menu Filtering**: Implement "Context Sensitive" logic in `ActionMenu.js` to filter nodes based on compatibility.
- [ ] **3.3 Find Results (Global Search)**: Implement `Ctrl+F` and `Ctrl+Shift+F` global search panel to index variables and function calls.

## 🔴 4. Debugging & Animation (Active State)

- [ ] **4.1 Live Wire Pulsing**: Implement hardware-accelerated SVG dash-array animation for wires during active simulation (orange pulse).
- [ ] **4.2 Watch Value Bubbles**: Implement the tooltip-style persistent data bubbles above pins during PIE.
- [ ] **4.3 Compile State Machine**: Implement the 3-state Compile button:
  - Yellow (?) for Dirty
  - Green (Check) for Success
  - Red (X) for Error

## 🧹 5. Refactor & Technical Debt

- [ ] **5.1 Eliminate Inline Styles**: Target `<50` total inline styles (Current: ~290). Primary targets: `PaletteController.js`, `VariableController.js`.
- [ ] **5.2 Constants Mapping**: Ensure all nodes use the `PIN_COLORS` constants from `Constants.js` instead of hardcoded strings.

---

**Next Action**: Implement the **Compile State Machine** (Dirty/Success/Error icons) and verify **Shortcut Chords**.
