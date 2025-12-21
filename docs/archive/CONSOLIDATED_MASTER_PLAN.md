# UE5 Blueprint Editor: Consolidated Master Plan (v2.6)

## 📌 Executive Summary

This document is the definitive technical roadmap for the UE5 Blueprint Editor replica. It synthesizes the **Phase 7: Technical Debt Refactor** with exhaustive **UE5 Interface & Workflow Mechanics** derived from professional architectural analysis. The goal is a frame-perfect reproduction of the UE5 "Visual Paradigm of Logic."

---

## 🏛️ 1. Interface Shell & Spatial Layout

**Goal**: Replicate the "Content-over-Chrome" philosophy of the UE5 UI overhaul.

- **1.1 Global Command Structure (Menu Bar)**
  - **File**: Save, Open Asset (Global Picker), Save All, Reparent, Diff.
  - **Edit**: Undo/Redo stack, Find Results (Ctrl+F).
  - **Window**: Multi-panel manager for restoring "My Blueprint", "Details", "Compiler Results".
- **1.2 The Workflow Toolbar (Left-to-Right sequence)**
  - `Compile` (Gear icon with dynamic state badges: Yellow ?, Green check, Red X).
  - `Save` (Floppy icon).
  - `Browse` (Sync to Content Browser).
  - `Find` (Binoculars/Search icon).
  - `Class Settings` (Meta-properties context).
  - `Class Defaults` (Archetype initialization context).
  - `Simulation Cluster` (Play, Simulate, Stop, Eject/Possess).
  - `Debug Object Dropdown` (Instance selection for live-wire visualization).

---

## 🎨 2. Visual Ontology & Semiotics

**Goal**: Implement the "Color Theory of Logic" with precise variable indicators and pin geometry.

- **2.1 Variable Anatomy (The "Pill" Aesthetic)**
  - Replace legacy variable lozenges with refined UE5 "pill" shapes.
  - **Container Indicators**:
    - **Single**: Standard pill.
    - **Array**: 3x3 Grid/Block icon.
    - **Set**: Bracketed/Cluster icon.
    - **Map**: Mapping arrow icon.
- **2.2 Pin & Wire Heuristics**
  - **Execution Pins**: Pentagon (`M2 3 L8 3 L13 9 L8 15 L2 15 Z`).
  - **Data Pins**: Circle + Beak (`r=4.5`, `M11 3.5 L16 7 L11 10.5 Z`).
  - **Pass-by-Reference**: Diamond-shaped data pins.
  - **Active Wires**: Thick, glowing orange pulsing dash effect during PIE.
- **2.3 Node Header Taxonomy**
  - **Event (Red)**: Entry points, no exec-in.
  - **Function (Blue)**: Italicized 'f' icon (Blue for Impure, Green for Pure).
  - **Macro (Grey)**: "Collapsed Graph" symbol.
  - **Variable Set (Red-tint)** | **Variable Get (Green-tint)**.

---

## ⚙️ 3. Workflow Mechanics & Interaction

**Goal**: Match the "Traffic Laws" and high-frequency interaction chords.

- **3.1 Shortcut Chords (Chorded Creation)**
  - `B + Click` -> Branch | `S + Click` -> Sequence | `D + Click` -> Delay.
  - `C` -> Comment Box | `F9` -> Toggle Breakpoint | `Home/F` -> Focus.
- **3.2 Context-Sensitive Heuristics**
  - "Smart" Action Menu filtering based on pin-out types.
  - Implicit conversion node injection (e.g., Integer64 or Float to String).
- **3.3 The "My Blueprint" Panel Hierarchy**
  - **Graphs** (Event Graph, Construction Script).
  - **Functions** (Italicized 'f' icons with access specifiers: Open/Closed Eye).
  - **Variables** (Typed pill icons).
  - **Event Dispatchers** (Broadcasting/Delegate signal icon).

---

## 🛠️ 4. Technical Implementation Strategy

1. **[SVG Foundation]** Expand `UE5Renderer.js` to handle all container types and italicized 'f' icons.
2. **[CSS Migration]** Complete Phase 7 Refactor; map all hex codes from Table 1 and Section 2.3 to `variables.css`.
3. **[Behavior]** Implement the "Live Wire" pulse logic in `WiringController.js` linked to simulation state.
4. **[Panel]** Refactor `MyBlueprintController.js` and `DetailsController.js` to support the new "Eye" visibility indicators and class/default toggles.

---

**Milestone Success**:

- All toolbar buttons present and functional.
- Pins and Wires match the 2.1 - 2.3 visual specifications exactly.
- <50 inline styles in the codebase.
- "Find Results" (Ctrl+F) operational across the graph.
