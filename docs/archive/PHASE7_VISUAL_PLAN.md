# Implementation Plan: UE5 Blueprint Pixel-Perfect Visual Overhaul

This plan outlines the steps required to implement the specific visual and behavioral requirements for the UE5 Blueprint Editor replica, ensuring 1:1 parity with the provided reference images and technical specifications.

---

## 📖 Global Standards & Architecture

**Standard Source**: [UE5 Blueprint Node Architecture Reference](./UE5_BLUEPRINT_ARCH_REF.md)

This project adheres to the Kismet Virtual Machine ontology. All nodes must follow the categorization, naming, and behavioral standards defined in the technical reference.

---

## 🏗 Phase 1: Foundation (CSS & Variables)

**Goal**: Establish the "Golden Source of Truth" for all visual tokens.

- **Step 1.1: Standardize Color Palette**  
  Update `src/css/variables.css` with the exact hex codes provided:
  - `--ue5-pin-float`: `#96E804`
  - `--ue5-pin-string`: `#e60088`
  - `--ue5-header-red`: `linear-gradient(to bottom, #7a1515, #500a0a)`
  - `--ue5-header-blue`: `linear-gradient(to bottom, #1d4d65, #123040)`
  - `--ue5-input-bg`: `#050505`
  - `--ue5-hazard-yellow`: `#8a7800`

- **Step 1.2: Establish Global Typography & Canvas**  
  Update `src/css/reset.css` or `index.css`:
  - Set global font-family to `'Segoe UI', Tahoma, sans-serif`.
  - Implement the infinite grid background on the `.canvas` element using CSS gradients (`#1a1a1a` base).

---

## 🎨 Phase 2: Core Components (Pins & Icons)

**Goal**: Implement the exact SVG paths for icons and pins to replace generic shapes.

- **Step 2.1: Execution Pins (Diamond/Pentagon)**  
  Update `Pin.js` to use the provided path for the elongated pentagon:
  - `M2 3 L8 3 L13 9 L8 15 L2 15 Z`
  - Implement hollow (black fill) for unconnected and solid white for connected.

- **Step 2.2: Data Pins (Circle w/ Beak)**  
  Update data pin rendering in `Pin.js`:
  - Main circle: `r=4.5`.
  - Beak arrow path: `M11 3.5 L16 7 L11 10.5 Z`.

- **Step 2.3: Complex Event Icon**  
  Implement the composite SVG in `Node.js` for Event headers:
  - Hollow diamond + Left-half white fill.
  - Cutout arrow overlay path: `M7 8 H12 V4 L22 12 L12 20 V16 H7 Z`.

---

## 🏛 Phase 3: Node Architecture (Body & Headers)

**Goal**: Apply the distinctive UE5 glassmorphism and header details.

- **Step 3.1: Node Body Styling**  
  Update `src/css/nodes.css`:
  - `background: rgba(10, 10, 10, 0.85)`
  - `backdrop-filter: blur(4px)`
  - `border-radius: 8px`
  - `box-shadow: 0 4px 10px rgba(0,0,0,0.5)`

- **Step 3.2: Header Refinement**  
  - Apply the specific gradients to `.header.red` and `.header.blue`.
  - Add the `2px` bottom border (`#a31c1c` for red, `#2e6e8e` for blue).
  - Add the **Breakpoint Indicator** (black square with thick red border) for Event nodes.

- **Step 3.3: "Print String" Advanced Footer**  
  - Implement the expandable hazard stripe footer.
  - Add the "Development Only" text with the central expansion arrow.
  - Link the visibility of advanced pins to the toggle state of this arrow.

---

## ⚙️ Phase 4: Behavioral Logic (Wires & Inputs)

**Goal**: Ensure the math matches the visuals for a seamless experience.

- **Step 4.1: Refined Wire Anchoring & Pulse Overlay**  
  Update `Graph.js` / `Connection.js` connection logic:
  - Shift terminals to the **exact tip** of the SVG pin shapes.
  - **Dynamic Pulse Overlay**: Implement the `wire-pulse` layering in `WiringController.js` to create the glowing "spheres" effect during simulation, matching UE5 PIE parity.

- **Step 4.2: Bezier Math Optimization**  
  Implement the specific curvature constraints:
  - `Control Point X Offset = Math.abs(endX - startX) * 0.5`.
  - Add the logic for "clean backward loops" when the destination node is to the left of the start node.

- **Step 4.3: Auto-Resizing Widgets**  
  - Implement the "hidden span" measurement utility to resize input fields dynamically while typing.
  - Replace native checkboxes with the custom `14x14px` div and blue tick logic.

---

## ✅ Phase 5: Verification & Testing

**Goal**: Confirm 1:1 visual match with reference imagery.

- **Visual Match**: Verify header text shadows and font rendering.
- **Behavioral Check**: Ensure wires redraw smoothly during node dragging.
- **Input Check**: Verify checkboxes and text inputs behave as described in the prompt.
