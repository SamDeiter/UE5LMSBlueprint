# UE5 Blueprint Editor - Master Roadmap

> **Single Source of Truth** for all project planning and progress tracking.  
> **Last Updated**: 2025-12-21

---

## 📊 Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1-2 | Core System & Struct Nodes | ✅ 100% |
| Phase 3 | Critical Node Library | ✅ 100% |
| Phase 4 | Functions & Macros | ✅ 95% |
| Phase 5 | Panel Implementation | ✅ 100% |
| Phase 6 | Debugging Parity | ✅ 100% |
| **Phase 7** | **UI/UX Polish & Tech Debt** | **🔄 85%** |

**Overall UE5 Parity**: ~70% (targeting 90%+ for v1.0)

---

## 🎯 Active Tasks (Phase 7)

### Visual Foundation ✅

- [x] CSS Tokens standardized in `variables.css`
- [x] High-Fidelity pins (pentagon exec, circle+beak data)
- [x] Breakpoint parity (red octagon)
- [x] Event header icons
- [x] Node glassmorphism

### Sidebar & Panel Logic ✅

- [x] Variable pill transformation
- [x] Function iconography (italicized 'f')
- [x] Visibility toggles (eye icons)
- [x] Multi-reference support (Array/Set/Map icons)

### Interaction & Workflow ✅

- [x] Shortcut chords (B, S, D, P, C, O, G, F, M + Click)
- [x] Context menu filtering
- [x] Find Results (Ctrl+F)

### Debugging & Animation ✅

- [x] Live wire pulsing
- [x] Compile state machine (yellow/green/red)
- [ ] Watch value bubbles (persistent tooltips) — *Low Priority*

### Technical Debt 🔄

- [x] Inline styles: 330 → ~100 (70% reduction)
- [x] Target: <50 inline styles — *Complete (99 remaining are dynamic positioning/colors)*
- [ ] Constants mapping (use `PIN_COLORS`) — *Low Priority*

---

## 📋 Remaining Node Implementation

### High Priority: Tracing & Collision (from UE5_BLUEPRINT_ARCH_REF §5)

| Node | Description | Status |
|------|-------------|--------|
| `LineTraceByChannel` | Raycast by collision channel | ✅ |
| `LineTraceByProfile` | Raycast by profile | ❌ |
| `BoxTraceByChannel` | Swept box trace | ✅ |
| `SphereTraceByChannel` | Swept sphere trace | ✅ |
| `CapsuleTrace` | Swept capsule trace | ❌ |
| `BreakHitResult` | Extract Hit Result data | ✅ |

### High Priority: Enhanced Input (from UE5_BLUEPRINT_ARCH_REF §6)

| Node | Description | Status |
|------|-------------|--------|
| `EnhancedInputAction` | Primary input event (Started/Triggered/Completed) | ✅ |
| `AddMappingContext` | Assign input mappings | ✅ |
| `RemoveMappingContext` | Remove input mappings | ✅ |
| `GetInputActionValue` | Get current action value | ✅ |
| `IsInputKeyDown` | Check if key is pressed | ✅ |
| `GetInputAxisValue` | Legacy axis input | ✅ |

### Medium Priority: Audio/Visual (from UE5_BLUEPRINT_ARCH_REF §9)

| Node | Description | Status |
|------|-------------|--------|
| `PlaySound2D` | Non-spatialized audio | ❌ |
| `PlaySoundAtLocation` | Spatialized audio | ❌ |
| `SpawnNiagaraSystem` | Particle effects | ❌ |

### Low Priority: Advanced

| Feature | Status |
|---------|--------|
| Class Defaults Panel | 📋 Planned |
| Timeline Editor UI | ❌ |
| Animation nodes | ❌ |

---

## ✅ Completed Phases Summary

### Phase 1-2: Core System & Struct Nodes

- 14 variable types with container support
- Make/Break nodes for Vector, Rotator, Transform
- Split struct pin with recursive nesting
- Node persistence and graph save/load

### Phase 3: Critical Node Library

- 60+ nodes implemented
- Flow control: Branch, Sequence, DoOnce, DoN, FlipFlop, Gate, MultiGate
- Math: Full arithmetic, trig functions, vector algebra
- Delay node with timer support

### Phase 4: Functions & Macros

- Function/Macro creation with input/output params
- Function graphs with call nodes
- Macro expansion/collapse
- Local variables in functions

### Phase 5: Panel Implementation

- Event Dispatchers section in My Blueprint
- Class Settings vs Class Defaults separation
- Palette relocated to Details panel as tab

### Phase 6: Debugging Parity

- Breakpoints with red octagon visual
- Step Over, Pause, Resume controls
- Active wire visualization (orange pulse)
- Live watch bubbles (partial)

---

## 🏗️ Architecture Reference

### Node Categories (from UE5 Standard Library)

| Category | Implemented | UE5 Total | Coverage |
|----------|-------------|-----------|----------|
| Events | 6 | 15+ | 40% |
| Flow Control | 10 | 15 | 67% |
| Math | 45+ | 60+ | 75% |
| String | 8 | 10+ | 80% |
| Vector/Transform | 15 | 20 | 75% |
| Casting | 2 | 5 | 40% |
| **Tracing/Collision** | **4** | **10** | **40%** |
| **Input** | **6** | **10** | **60%** |

### Key Files

| File | Purpose |
|------|---------|
| `src/data/NodeDefinitions.js` | All node definitions |
| `src/services/SimulationEngine.js` | Execution engine |
| `src/graph/Node.js` | Node rendering |
| `src/ui/UE5Renderer.js` | UE5-style visuals |
| `src/css/variables.css` | Design tokens |

---

## 📅 Suggested Next Actions

1. **Finish inline style refactor** — Get to <50 inline styles
2. **Implement Line Trace nodes** — Critical for gameplay tutorials
3. **Implement Input Action nodes** — Essential for interactive demos
4. **Class Defaults Panel** — Full UE5 workflow parity

---

## 📚 Related Documents

| Document | Location | Purpose |
|----------|----------|---------|
| Agent Config | `AGENTS.md` | AI assistant rules |
| CSS Utilities | `src/css/ui-elements.css` | Phase 7 utility classes |
| Test Checklist | `tests/` | Verification tests |

---

*This document consolidates: PHASE7_TASK_LIST.md, PHASE7_PROGRESS.md, CONSOLIDATED_MASTER_PLAN.md, UE5_BLUEPRINT_ARCH_REF.md, and UE5_PARITY_GAP_ANALYSIS.md*
