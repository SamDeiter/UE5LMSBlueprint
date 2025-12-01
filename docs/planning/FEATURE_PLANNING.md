# Feature Planning Roadmap

## 🎯 Goal
Create a clear, staged roadmap for extending the UE5 Blueprint editor while keeping the current stability and test coverage strong. Align development with the new **Need Node** testing framework, SCORM 1.3 (Totara) score reporting, component drag‑in behavior fixes, and variable styling improvements.

---

## 📦 Short‑Term (Next 1‑2 weeks)
1. **Complete testing suite**
   - Finish unit tests for `GraphController` default‑node logic and component deselection.
   - Add UI tests for wiring, default node auto‑population, and persistence round‑trip.
   - Integrate tests into CI.
2. **Need Node & SCORM integration**
   - Implement `NeedNode` class and UI palette entry.
   - Add `ScormClient` wrapper for Totara SCORM 1.3 reporting.
   - Verify score calculation and 80 % pass rule.
3. **Component drag‑in fix**
   - Ensure components show output pins like other nodes when dragged into the graph.
   - Update `ComponentsController` rendering to include output circle indicator.
4. **Variable styling alignment**
   - Refine variable node UI to match UE5 appearance (icons, type colors, container icons).
   - Ensure correct data‑type representation and editability flags.
5. **Polish UI/UX**
   - Refine component panel hover/selection visuals.
   - Add tooltip documentation for each node type.
6. **Bug‑fix backlog**
   - Resolve remaining lint warnings.
   - Verify that `handleDragOver` and other event bindings are stable.

---

## 🗂️ Medium‑Term (1‑4 weeks)
1. **Node Library Expansion**
   - Add common UE5 nodes: `Branch`, `Delay`, `ForLoop`, `Timeline`.
   - Provide a **Node Registry** UI for searching/adding nodes.
2. **Advanced Wiring Features**
   - Implement **wire snapping** and **auto‑routing** for cleaner diagrams.
   - Add **wire deletion** via `Delete` key when a wire is selected.
3. **Blueprint Functions & Macros**
   - UI for creating custom functions and macros.
   - Persist them alongside the main graph.
4. **Performance Optimizations**
   - Virtualize node rendering for large graphs.
   - Debounce expensive redraws.

---

## 🚀 Long‑Term (1‑3 months)
1. **Full UE5 Feature Parity**
   - Support **Event Dispatchers**, **Interfaces**, and **Blueprintable Classes**.
   - Implement **Blueprint debugging** (breakpoints, step‑through).
2. **Collaboration**
   - Real‑time multi‑user editing via WebSockets.
   - Conflict resolution and version history.
3. **Export/Import**
   - Export to UE5 `.uasset` compatible JSON.
   - Import existing UE5 Blueprint files.
4. **Theming & Accessibility**
   - Dark/Light themes, high‑contrast mode.
   - Keyboard‑only navigation for accessibility compliance.

---

## 🧪 Testing Strategy
- **Unit Tests** for core logic (`GraphController`, `WiringController`, `ComponentsController`).
- **Integration/UI Tests** (Playwright) covering node creation, wiring, default‑node auto‑load, component selection/deselection, and persistence.
- **SCORM Reporting Tests** to validate score submission to Totara.
- **CI Pipeline** runs lint, unit, and UI tests on every PR.
- **Coverage Goal**: ≥ 85 % for core modules.

---

## ⚠️ Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep – adding many nodes at once | Regression bugs, slower releases | Prioritize a **node backlog** and ship in small batches with full test coverage. |
| Performance degradation on large graphs | UI becomes sluggish | Implement virtual scrolling early (medium‑term) and profile rendering paths. |
| Complex UI interactions (drag‑and‑drop) | Flaky UI tests | Use deterministic test data and mock mouse events; keep UI tests isolated. |

---

## 📅 Milestones
| Milestone | Target Date |
|-----------|-------------|
| Complete test suite & CI integration | 2025‑12‑02 |
| Need Node & SCORM reporting ready | 2025‑12‑09 |
| Component drag‑in fix & variable styling | 2025‑12‑15 |
| Node Library v1 (Branch, Delay, ForLoop) | 2025‑12‑15 |
| Wire snapping & auto‑routing | 2025‑12‑30 |
| Functions & Macros UI | 2026‑01‑15 |
| First UE5 parity release | 2026‑02‑28 |

---

