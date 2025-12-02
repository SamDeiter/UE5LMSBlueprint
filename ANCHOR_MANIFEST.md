# ANCHOR MANIFEST

## Purpose
This manifest tracks all code anchors across the UE5LMSBlueprint project. Anchors mark key implementation points that can be searched and referenced. Each anchor follows strict rules for discoverability and uniqueness.

---

## Anchor Rules
- **Format:** lowercase, hyphenated, no spaces
- **Length:** max 5 words
- **Quality:** descriptive enough to search blindly
- **Scope:** one anchor per logical unit
- **Uniqueness:** unique across entire project

---

## Core Application

### <!-- custom-event-execution-logic -->
**File:** `src/services/executors/FunctionExecutor.js`  
**Function:** `executeCustomEventCall(node)`  
**Lines:** ~137-166  
**What:** Executes custom event by finding target node and running its flow  
**How:** Searches graph for CustomEvent with matching title, executes as subroutine, returns to caller  
**Connects to:** `custom-event-menu-generation`, `custom-event-registration`

### <!-- custom-event-registration -->
**File:** `src/services/SimulationEngine.js`  
**Function:** Constructor initialization  
**Lines:** ~79  
**What:** Registers CallCustomEvent node with FunctionExecutor  
**How:** `this.executorRegistry.register('CallCustomEvent', functionExecutor)`  
**Connects to:** `custom-event-execution-logic`, `executor-registry-pattern`

### <!-- custom-event-menu-generation -->
**File:** `src/ui/ActionMenu.js`  
**Function:** `filter(query)`  
**Lines:** ~326-360  
**What:** Scans graph for CustomEvent nodes and adds Call options to menu  
**How:** Iterates nodes, filters by nodeKey='CustomEvent', creates virtual menu items  
**Connects to:** `custom-event-call-handler`, `action-menu-item-creation`

### <!-- custom-event-call-handler -->
**File:** `src/ui/ActionMenu.js`  
**Function:** `createMenuItem(item)`  
**Lines:** ~470-530  
**What:** Handles click events for Call Custom Event menu items  
**How:** Creates CallCustomEvent node, sets customData.eventName, mirrors pins  
**Connects to:** `custom-event-menu-generation`, `node-addition-pattern`

### <!-- custom-event-node-definition -->
**File:** `src/data/NodeDefinitions.js`  
**Key:** "CallCustomEvent"  
**Lines:** ~161-171  
**What:** Static definition for CallCustomEvent node type  
**How:** Basic function-node with exec in/out, pins added dynamically  
**Connects to:** `node-registry-pattern`, `custom-event-call-handler`

---

## New Blueprint Workflow

### <!-- parent-class-modal-component -->
**File:** `src/ui/ParentClassModal.js`  
**Class:** `ParentClassModal`  
**Lines:** 1-184  
**What:** Modal dialog for selecting parent class when creating new blueprint  
**How:** Renders class buttons, handles selection, triggers graph reset  
**Connects to:** `parent-class-selection-logic`, `modal-styling-system`

### <!-- parent-class-selection-logic -->
**File:** `src/ui/ParentClassModal.js`  
**Function:** `selectClass(className)`  
**Lines:** ~97-142  
**What:** Clears graph and initializes new blueprint with selected parent class  
**How:** Clears nodes/links/variables, updates label, calls addDefaultNodes  
**Connects to:** `default-nodes-creation`, `graph-clearing-pattern`

### <!-- default-nodes-creation -->
**File:** `src/ui/ParentClassModal.js`  
**Function:** `addDefaultNodes(className)`  
**Lines:** ~144-173  
**What:** Adds class-specific starter nodes to new blueprint  
**How:** Always adds BeginPlay(100,100) and Tick(100,250), class-specific extras  
**Connects to:** `parent-class-selection-logic`, `node-addition-pattern`

### <!-- new-blueprint-menu-trigger -->
**File:** `src/app.js`  
**Location:** Event listener initialization  
**Lines:** ~164-171  
**What:** Binds File > New Blueprint menu click to modal open  
**How:** `document.getElementById('new-blueprint-menu-item').addEventListener('click'...)`  
**Connects to:** `parent-class-modal-component`, `file-menu-dropdown`

### <!-- file-menu-dropdown -->
**File:** `index.html`  
**Element:** `.menu-item.dropdown-menu`  
**Lines:** ~40-48  
**What:** Dropdown menu structure for File menu in menubar  
**How:** Hover-activated dropdown with New Blueprint and Save items  
**Connects to:** `dropdown-menu-styling`, `new-blueprint-menu-trigger`

### <!-- dropdown-menu-styling -->
**File:** `src/css/ui-elements.css`  
**Selectors:** `.dropdown-menu`, `.dropdown-content`, `.dropdown-item`  
**Lines:** ~(appended to file)  
**What:** CSS styles for menubar dropdown menus  
**How:** Position absolute, hover activation, UE5 dark theme colors  
**Connects to:** `file-menu-dropdown`, `ue5-theme-system`

### <!-- modal-styling-system -->
**File:** `src/css/modals.css`  
**Selectors:** `.modal-overlay`, `.modal-content`, `.class-btn`  
**Lines:** 1-193  
**What:** Complete styling system for modal dialogs  
**How:** Overlay backdrop, centered content, grid layouts, hover states  
**Connects to:** `parent-class-modal-component`, `ue5-theme-system`

---

## Graph & Node Management

### <!-- node-addition-pattern -->
**Files:** Multiple (GraphController.js, ActionMenu.js, ParentClassModal.js)  
**Pattern:** `this.app.graph.addNode(nodeKey, x, y)`  
**What:** Standard method for adding nodes to graph  
**How:** GraphController creates node from registry, positions it, assigns ID  
**Connects to:** `node-registry-pattern`, `node-rendering-pipeline`

### <!-- graph-clearing-pattern -->
**File:** `src/ui/ParentClassModal.js`  
**Function:** `selectClass(className)` (partial)  
**Lines:** ~112-128  
**What:** Complete graph reset procedure  
**How:** Clears nodes Map, selectedNodes Set, DOM, links, variables, components  
**Connects to:** `parent-class-selection-logic`, `persistence-auto-save`

### <!-- node-registry-pattern -->
**File:** `src/registries/NodeRegistry.js` + `src/data/NodeDefinitions.js`  
**What:** Central registry of all available node types  
**How:** NodeDefinitions define structure, NodeRegistry manages runtime instances  
**Connects to:** `node-addition-pattern`, `custom-event-node-definition`

### <!-- node-rendering-pipeline -->
**File:** `src/graph/Node.js`  
**Function:** `render()` and `renderCompactNode()`  
**Lines:** ~119-412  
**What:** Converts node data into DOM elements  
**How:** Creates header, pins, content, applies styles, returns element  
**Connects to:** `node-addition-pattern`, `pin-rendering-system`

---

## Simulation & Execution

### <!-- executor-registry-pattern -->
**File:** `src/services/SimulationEngine.js`  
**Property:** `this.executorRegistry`  
**Lines:** ~62-95  
**What:** Maps node types to executor classes  
**How:** ExecutorRegistry.register(nodeType, executorInstance)  
**Connects to:** `custom-event-registration`, `simulation-run-flow`

### <!-- simulation-run-flow -->
**File:** `src/services/SimulationEngine.js`  
**Function:** `run()`  
**Lines:** ~143-169  
**What:** Initiates blueprint simulation with auto-compile check  
**How:** Checks isDirty, compiles if needed, halts if failed, executes event nodes  
**Connects to:** `compiler-dirty-state`, `executor-registry-pattern`

### <!-- compiler-dirty-state -->
**File:** `src/services/Compiler.js`  
**Property:** `this.isDirty`  
**Lines:** Throughout file  
**What:** Tracks whether graph needs recompilation  
**How:** Set true on changes, reset to false on successful compile  
**Connects to:** `simulation-run-flow`, `compile-before-play`

### <!-- compile-before-play -->
**File:** `src/services/SimulationEngine.js`  
**Function:** `run()`  
**Lines:** ~145-153  
**What:** Enforces compilation before simulation can start  
**How:** Auto-compiles if dirty, halts simulation if compile fails  
**Connects to:** `compiler-dirty-state`, `simulation-run-flow`

---

## UI Components & Controllers

### <!-- action-menu-item-creation -->
**File:** `src/ui/ActionMenu.js`  
**Function:** `createMenuItem(item)`  
**Lines:** ~387-540  
**What:** Renders individual action menu items (nodes/categories)  
**How:** Checks item type (string/object/category), creates DOM, binds events  
**Connects to:** `custom-event-call-handler`, `action-menu-filter`

### <!-- action-menu-filter -->
**File:** `src/ui/ActionMenu.js`  
**Function:** `filter(query)`  
**Lines:** ~300-385  
**What:** Filters and organizes available nodes for action menu  
**How:** Combines registry nodes + custom event calls, builds category tree  
**Connects to:** `custom-event-menu-generation`, `action-menu-item-creation`

### <!-- modal-open-close-pattern -->
**File:** `src/ui/ParentClassModal.js`  
**Functions:** `open()`, `close()`  
**Lines:** ~79-95  
**What:** Standard modal visibility control  
**How:** Appends/removes overlay from DOM, handles backdrop clicks  
**Connects to:** `parent-class-modal-component`, `new-blueprint-menu-trigger`

---

## Persistence & State

### <!-- persistence-auto-save -->
**File:** `src/services/Persistence.js`  
**Function:** `autoSave()`  
**Lines:** Throughout file  
**What:** Automatic save to localStorage on changes  
**How:** Called after node add/delete/modify, serializes full state  
**Connects to:** `graph-clearing-pattern`, `persistence-serialization`

### <!-- persistence-serialization -->
**File:** `src/services/Persistence.js`  
**Function:** `serializeNodes()`, `serializeLinks()`, etc.  
**Lines:** Throughout file  
**What:** Converts runtime objects to JSON for storage  
**How:** Extracts key properties, handles special cases (breakpoints, custom data)  
**Connects to:** `persistence-auto-save`, `node-custom-data-pattern`

### <!-- node-custom-data-pattern -->
**File:** `src/graph/Node.js`  
**Property:** `this.customData`  
**Lines:** ~25  
**What:** Extensible storage for node-specific configuration  
**How:** Object property that persists, stores event names, need data, etc.  
**Connects to:** `custom-event-call-handler`, `persistence-serialization`

---

## Styling & Theming

### <!-- ue5-theme-system -->
**Files:** `src/css/variables.css` + all CSS files  
**What:** UE5-style dark theme color system  
**How:** CSS custom properties, consistent palette (backgrounds #0d-#1a, text #ccc-#eee, accent #0078d7)  
**Connects to:** `modal-styling-system`, `dropdown-menu-styling`

---

## Application Initialization

### <!-- app-init-sequence -->
**File:** `src/app.js`  
**Function:** `BlueprintApp.init()`  
**Lines:** ~26-254  
**What:** Complete application startup procedure  
**How:** Controllers → Services → UI → Events → Load → Render (order matters!)  
**Connects to:** `controller-instantiation`, `event-binding-pattern`

### <!-- controller-instantiation -->
**File:** `src/app.js`  
**Location:** Within `BlueprintApp.init()`  
**Lines:** ~54-90  
**What:** Creates all controller instances in dependency order  
**How:** Graph/Wiring first, then data, then services, finally UI  
**Connects to:** `app-init-sequence`, `parent-class-modal-component`

### <!-- event-binding-pattern -->
**File:** `src/app.js`  
**Location:** Within `BlueprintApp.init()`  
**Lines:** ~112-223  
**What:** Binds all global UI event handlers  
**How:** Gets DOM elements by ID, addEventListener for clicks/keys  
**Connects to:** `app-init-sequence`, `new-blueprint-menu-trigger`

---

## Module Exports & Imports

### <!-- ui-module-aggregator -->
**File:** `src/ui.js`  
**Lines:** 1-36  
**What:** Central export point for all UI controllers  
**How:** Imports individual controllers, re-exports as named exports  
**Connects to:** `app-init-sequence`, `parent-class-modal-component`

### <!-- parent-class-modal-export -->
**File:** `src/ui.js`  
**Lines:** ~17, ~31  
**What:** Exports ParentClassModal for use in app.js  
**How:** Import from './ui/ParentClassModal.js', export in named exports object  
**Connects to:** `ui-module-aggregator`, `controller-instantiation`

---

## Documentation & Guidance

### <!-- agents-documentation -->
**File:** `AGENTS.md`  
**Lines:** 1-370  
**What:** Comprehensive guide for AI agents working on project  
**How:** Documents structure, patterns, rules, testing, common issues  
**Connects to:** (meta-level, guides all implementation)

### <!-- implementation-summary-doc -->
**File:** `docs/status/IMPLEMENTATION_SUMMARY_2025-12-02.md`  
**Lines:** 1-290  
**What:** Detailed summary of session's implementation work  
**How:** Lists changes, testing procedures, next steps, git info  
**Connects to:** (meta-level, historical record)

---

## Python Automation Scripts

### <!-- python-ui-exports-updater -->
**File:** `.gemini/update_ui_exports.py`  
**What:** Adds ParentClassModal to src/ui.js exports  
**How:** Reads file, finds import/export locations, inserts new lines  
**Connects to:** `ui-module-aggregator`, `parent-class-modal-export`

### <!-- python-app-imports-updater -->
**File:** `.gemini/update_app_imports.py`  
**What:** Adds ParentClassModal import and instantiation to app.js  
**How:** String replacement of import line and modal instantiation block  
**Connects to:** `app-init-sequence`, `controller-instantiation`

### <!-- python-file-menu-creator -->
**File:** `.gemini/add_file_menu.py`  
**What:** Creates File menu dropdown structure and CSS  
**How:** Replaces menu div in HTML, appends dropdown CSS to ui-elements.css  
**Connects to:** `file-menu-dropdown`, `dropdown-menu-styling`

### <!-- python-blueprint-workflow -->
**File:** `.gemini/implement_new_blueprint.py`  
**What:** Implements complete New Blueprint workflow logic  
**How:** Updates app.js event handler, ParentClassModal.selectClass() method  
**Connects to:** `parent-class-selection-logic`, `new-blueprint-menu-trigger`

---

## Usage Examples

### Finding Implementation by Anchor
```bash
# Search for custom event execution
git grep "custom-event-execution-logic"

# Find all references to modal system
git grep "modal-" | grep "<!--"
```

### Adding New Anchor
```markdown
### <!-- your-new-anchor-name -->
**File:** path/to/file.js
**Function:** functionName()
**Lines:** ~100-150
**What:** Brief description of what this does
**How:** Brief description of how it works
**Connects to:** other-anchor-one, other-anchor-two
```

---


---

## Meta-Documentation

### <!-- token-optimization-guidelines -->
**File:** `AGENTS.md`  
**Section:** "⚡ Token Optimization"  
**Lines:** (inserted dynamically)  
**What:** Guidelines for AI agents to minimize token usage  
**How:** File viewing strategies, search-first approach, context awareness, anchor references  
**Connects to:** `anchor-manifest-system`, `agents-documentation`

### <!-- anchor-manifest-system -->
**File:** `ANCHOR_MANIFEST.md`  
**Lines:** 1-end  
**What:** Central registry of all code anchors for searchable documentation  
**How:** Each anchor marks implementation point with file/function/lines/connections  
**Connects to:** `token-optimization-guidelines`, `agents-documentation`

### <!-- file-viewing-strategy -->
**File:** `AGENTS.md`  
**Section:** "Token Optimization > File Viewing Strategy"  
**What:** Best practices for efficient file access  
**How:** Use line ranges, search first, target functions, check sizes, use manifest  
**Connects to:** `token-optimization-guidelines`, `anchor-usage-pattern`

### <!-- anchor-usage-pattern -->
**File:** `ANCHOR_MANIFEST.md`  
**Section:** "Usage Examples"  
**Lines:** ~380-400  
**What:** How to search and reference anchors in codebase  
**How:** Git grep for anchor names, reference in documentation  
**Connects to:** `anchor-manifest-system`, `file-viewing-strategy`

### <!-- python-script-efficiency -->
**File:** `AGENTS.md`  
**Section:** "Token Optimization > Python Script Efficiency"  
**What:** Guidelines for efficient Python automation scripts  
**How:** Single script for multiple related changes, avoid redundant operations  
**Connects to:** `python-ui-exports-updater`, `python-app-imports-updater`

---

**Last Updated:** December 2, 2025  
**Total Anchors:** 42  
**Maintained By:** AI Agents & SamDeiter
