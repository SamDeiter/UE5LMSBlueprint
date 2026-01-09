# Code Cleanup Plan

## 1. DOM Helper Utility ✅

Created `src/utils/DOMHelper.js` with:

- `el(tag, attrs, children)` - Create elements
- `icon(class)` - Create FontAwesome icons
- `iconButton(icon, text, onClick)` - Button with icon
- `sectionHeader(title, expanded, onToggle)` - Collapsible headers

## 2. File Split Plan

### VariableController.js (820 lines) → 4 files

- `VariableController.js` - Core logic (add, delete, rename) ~200 lines
- `VariableRenderer.js` - DOM rendering ~300 lines
- `VariableDragDrop.js` - Drag/drop handling ~150 lines
- `VariableContextMenu.js` - Right-click menu ~100 lines

### GraphInteraction.js (804 lines) → 3 files

- `GraphInteraction.js` - Core (selection, zoom, pan) ~300 lines
- `NodeDragHandler.js` - Node dragging ~250 lines
- `WireDragHandler.js` - Wire dragging/connection ~250 lines

### GraphController.js (779 lines) → 3 files

- `GraphController.js` - Core (addNode, deleteNode) ~300 lines
- `GraphSerializer.js` - Save/load logic ~200 lines
- `GraphClipboard.js` - Copy/paste/duplicate ~200 lines

### Node.js (729 lines) → 3 files

- `Node.js` - Core properties ~200 lines
- `NodeRenderer.js` - DOM rendering ~300 lines
- `NodePinManager.js` - Pin operations ~200 lines

## 3. Migration Order

1. VariableController (biggest file)
2. GraphController
3. GraphInteraction
4. Node.js

## 4. Success Metrics

- No file > 400 lines
- 48 tests still pass after each split
