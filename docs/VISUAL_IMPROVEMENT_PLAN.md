# Visual Improvement Plan (UE5 Fidelity)

## Overview
The goal is to make the editor look as close to Unreal Engine 5 as possible.

## 1. Node Styling (`graph/Node.js`, `style.css`)

### Header Colors
*   **Events** (BeginPlay, etc.): Red (`#A61A1A` gradient).
*   **Functions** (Call Function): Blue (`#1A5DA6` gradient).
*   **Pure Functions** (Math, Getters): Green (`#30A61A` gradient) or sometimes compact without header.
*   **Macros**: Light Gray / White (`#888888`).
*   **Variables (Set/Get)**:
    *   Get: Compact, pill shape.
    *   Set: Standard node with header.
*   **Construction Script**: Orange/Brown.

### Shapes & Borders
*   **Rounded Corners**: UE5 nodes have slightly rounded corners (approx 4px).
*   **Gloss/Bevel**: Add a subtle top inner shadow or gradient to simulate the 3D-ish flat look of UE5.
*   **Selection Outline**: Bright orange/yellow outline when selected.

## 2. Pin Styling

### Shapes
*   **Exec**: Arrow shape (Triangle pointing right).
*   **Data (Single)**: Circle.
    *   Empty: Disconnected.
    *   Filled: Connected.
*   **Data (Array)**: 3x3 Grid icon.
*   **Delegate**: Square.

### Colors (Standard UE Colors)
*   **Exec**: White.
*   **Boolean**: Red (`#920101`).
*   **Integer**: Cyan/Green (`#1EFA96`).
*   **Float**: Light Green (`#35D64D`).
*   **String**: Magenta (`#F800D6`).
*   **Vector**: Gold/Yellow (`#FFC800`).
*   **Rotator**: Purple (`#9999FF`).
*   **Transform**: Orange (`#FF6600`).
*   **Object**: Blue (`#00A6FF`).
*   **Class**: Purple/Pink.

## 3. Wire Styling (`graph/WiringController.js`)
*   **Bezier Curves**: Ensure smooth cubic bezier curves.
*   **Thickness**:
    *   Exec: Thicker (3px).
    *   Data: Thinner (2px).
*   **Colors**: Match pin colors.

## 4. UI Panels (`style.css`)
*   **Dark Theme**: Ensure background is `#1A1A1A` or `#262626`.
*   **Panel Headers**: Darker gray with subtle borders.
*   **Fonts**: Use `Inter` or `Roboto`, small sizes (9px-11px for labels).

## Action Plan
1.  [ ] Update `Node.js` `render()` to support variable header colors based on `nodeDef.type` or `category`.
2.  [ ] Refine CSS for `.node-header` to use gradients.
3.  [ ] Update Pin rendering to use SVG icons for shapes (Exec arrow, Array grid).
4.  [ ] Audit all pin colors in `style.css`.
