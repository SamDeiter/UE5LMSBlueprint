# CSS Refactoring Plan

## 🎯 Objective
Reduce the size and complexity of `style.css` (currently ~3000 lines) to improve maintainability, readability, and load times.

## 📊 Current State Analysis
*   **Size:** ~3000 lines.
*   **Structure:** Single monolithic file containing global resets, layout, UI components, graph rendering, and node specific styles.
*   **Issues:**
    *   Hard to navigate.
    *   Potential for style conflicts.
    *   Difficult to track dependencies.

## 🛠️ Refactoring Strategy

### 1. Modularization (Split Strategy)
Break the monolithic file into smaller, domain-specific CSS files.

*   **`css/variables.css`**: Global CSS variables (colors, fonts, sizes).
*   **`css/reset.css`**: Global resets, scrollbar styling, basic typography.
*   **`css/layout.css`**: Main app grid, panels, resizers, toolbar structure.
*   **`css/ui-elements.css`**: Reusable widgets (buttons, inputs, checkboxes, context menus).
*   **`css/graph.css`**: Graph editor canvas, SVG styles, connection wires.
*   **`css/nodes.css`**: Node styling, pins, headers, compact nodes, set nodes.
*   **`css/panels.css`**: Specific styles for Components, Variables, and Details panels.

### 2. Optimization
*   **Consolidate Variables:** Ensure all colors and common dimensions use CSS variables defined in `variables.css`.
*   **Remove Redundancy:** Identify and merge duplicate style declarations.
*   **Scoped Styles:** Use specific class names to avoid global namespace pollution (already mostly done with prefixes like `.ue5-`, but can be tightened).

### 3. Implementation Steps
1.  **Create Directory:** Create a `css/` folder.
2.  **Extract Variables:** Move `:root` definitions to `css/variables.css`.
3.  **Extract Modules:** Systematically move sections from `style.css` to their respective new files.
4.  **Update `index.html`:** Replace the single `<link href="style.css">` with links to the new files (or use a CSS import strategy if preferred, though multiple links is better for parallel loading in HTTP/2).
    *   *Alternative:* Use a simple build step or just multiple `<link>` tags for now to avoid build complexity.

## 📅 Execution Plan
1.  **Setup:** Create folder structure.
2.  **Migration:** Move code chunk by chunk.
3.  **Verification:** Check visual regression after each move.
4.  **Cleanup:** Delete original `style.css` once empty.
