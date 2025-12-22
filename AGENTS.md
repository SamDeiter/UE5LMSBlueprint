# AGENTS.md - AI Agent Development Guide

## 📋 Project Overview

**UE5LMSBlueprint** is a web-based replica of Unreal Engine 5's Blueprint Visual Scripting system, designed to run in Learning Management Systems (LMS) using SCORM 1.2. This educational tool allows students to learn visual programming concepts through an authentic UE5-like interface.

**Key Technologies:**

- Vanilla JavaScript (ES6 modules)
- HTML5/CSS3
- No external frameworks (except Font Awesome for icons)
- SCORM 1.2 compatibility required

## 🎯 User Requirements

### Critical Rules (MUST FOLLOW)

1. **Always use Python for file edits** - The user prefers Python scripts over direct file manipulation
2. **Backup to Git frequently** - Commit changes often
3. **Windows 11 environment** - All paths and commands must work on Windows
4. **SCORM 1.2 compatible** - All code must work in an LMS environment
5. **Never delete root folders** - Be extremely careful with deletion operations

### User's GitHub

- Repository: <https://github.com/SamDeiter/UE5LMSBlueprint>
- Location: `C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint`

## 📁 Project Structure

```
UE5LMSBlueprint/
├── index.html              # Main entry point
├── ROADMAP.md             # Master project roadmap (single source of truth)
├── CODE_AUDIT_PLAN.md     # Code reuse and instancing audit plan
├── src/
│   ├── app.js             # Application initialization
│   ├── ui.js              # UI module aggregator
│   ├── services.js        # Service module aggregator
│   ├── graph/             # Graph rendering & interaction
│   │   ├── GraphController.js
│   │   ├── Node.js
│   │   ├── Pin.js
│   │   └── WiringController.js
│   ├── ui/                # UI Controllers
│   │   ├── ActionMenu.js
│   │   ├── DetailsController.js
│   │   ├── ClassDefaultsRenderer.js  # Extracted from DetailsController
│   │   ├── VariableController.js
│   │   ├── FunctionsController.js
│   │   ├── ParentClassModal.js
│   │   └── ...
│   ├── services/          # Core services
│   │   ├── SimulationEngine.js
│   │   ├── Compiler.js
│   │   ├── Persistence.js
│   │   └── executors/
│   ├── data/              # Static data (MODULAR)
│   │   ├── nodes/         # Node definitions split by category
│   │   │   ├── index.js           # Aggregator
│   │   │   ├── ActorNodes.js      # Actor manipulation
│   │   │   ├── CollisionNodes.js  # Trace & collision
│   │   │   ├── EventNodes.js      # Event nodes
│   │   │   ├── FlowControlNodes.js
│   │   │   ├── InputNodes.js      # Enhanced Input
│   │   │   ├── MathNodes.js
│   │   │   └── ... (14 total category files)
│   │   └── AssessmentTasks.js
│   ├── css/               # Modular CSS files
│   │   ├── variables.css  # Design tokens
│   │   ├── ui-elements.css # Utility classes
│   │   └── ...
│   └── utils/             # Utility functions
├── scripts/               # Python refactoring scripts
│   └── refactor_details_controller.py
├── docs/                  # Documentation
│   ├── planning/          # Development plans
│   ├── testing/           # Test scenarios
│   └── guides/            # User guides
└── assets/                # Icons, images
```

## 🔧 Development Patterns

### Making File Changes

**ALWAYS use Python for file modifications:**

```python
# Example: Modifying a file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Make changes
content = content.replace(old_text, new_text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
```

### Adding New Nodes

1. **Add definition to the appropriate category file in `src/data/nodes/`:**
   - Choose the correct category file (e.g., `CollisionNodes.js`, `MathNodes.js`)
   - Follow existing patterns in that file

```javascript
export const CollisionNodes = {
  NodeKey: {
    title: "Node Title",
    type: "function-node", // or "event-node", "pure-node"
    category: "Collision",
    icon: "fa-icon-name",
    executor: "Trace", // Optional: specify executor
    pins: [
      { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
      { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
    ]
  },
  // ... other nodes
};
```

1. **The node is automatically exported** via `src/data/nodes/index.js`

1. **Register executor in `src/services/SimulationEngine.js` if needed:**

```javascript
this.executorRegistry.register('NodeKey', appropriateExecutor);
```

1. **Implement execution logic in the appropriate executor**

### Adding New UI Components

1. Create component in `src/ui/ComponentName.js`
2. Export from `src/ui.js`
3. Import and instantiate in `src/app.js`
4. Add CSS to appropriate file in `src/css/`

### CSS Architecture

- `variables.css` - CSS custom properties
- `reset.css` - CSS reset
- `layout.css` - Grid layout
- `ui-elements.css` - Buttons, inputs
- `nodes.css` - Node styling
- `graph.css` - Graph canvas
- `panels.css` - Side panels
- `modals.css` - Modal dialogs

**Always match UE5's dark theme aesthetic:**

- Background: `#0d0d0d` to `#1a1a1a`
- Text: `#ccc` to `#eee`
- Accents: `#0078d7` (blue)
- Borders: `#333`

## 🎮 Key Systems

### Simulation Engine

- **Location:** `src/services/SimulationEngine.js`
- **Purpose:** Executes blueprint nodes during "Play" mode
- **Executors:**
  - `EventExecutor` - Handles event nodes
  - `FunctionExecutor` - Handles functions and custom events
  - `FlowControlExecutor` - Handles branches, loops
  - `MathExecutor` - Handles math operations
  - `VariableExecutor` - Handles Get/Set nodes

### Compiler

- **Location:** `src/services/Compiler.js`
- **Purpose:** Validates graph before simulation
- **Sets `isDirty` flag when changes need compilation**

### Persistence

- **Location:** `src/services/Persistence.js`
- **Saves to:** `localStorage`
- **Auto-saves** when changes are made
- **Serializes:** Nodes, links, variables, components, functions

### Graph System

- **Nodes** are instances created from `NodeDefinitions`
- **Pins** connect nodes (exec or data flow)
- **Links** stored in `WiringController`
- **Rendering** handled by `GraphController`

## 🧪 Testing

### Test Tasks Location

- **File:** `src/data/AssessmentTasks.js`
- **Levels:** 1-5 (Fundamentals to Advanced)
- **Format:** Requirements-based validation

### Testing Scenarios

- **Location:** `docs/testing/`
- Key files:
  - `DEBUGGING_TEST_PLAN.md` - Breakpoint & stepping tests
  - `TESTING_CHECKLIST.md` - Feature verification
  - `KNOWN_LIMITATIONS.md` - Current limitations

### Running Tests

```javascript
// In browser console:
runTests()              // Run all tests
validateTask()          // Validate current task
setTask('task_id')      // Load specific task
```

## 🐛 Common Issues & Solutions

### Issue: "Unknown node type" error

**Solution:** Register the node in `SimulationEngine.js`:

```javascript
this.executorRegistry.register('NodeKey', executor);
```

### Issue: Custom Event name doesn't change

**Solution:** Ensure `DetailsController.showCustomEventDetails()` updates both `node.title` and the DOM element.

### Issue: Breakpoints not persisting

**Solution:** Ensure `isBreakpoint` is included in `Persistence.serializeNodes()`.

### Issue: Graph must be compiled before play

**Solution:** Check `compiler.isDirty` in `SimulationEngine.run()` and auto-compile if needed.

## 📝 Code Style Guidelines

1. **Use ES6 modules** - `import`/`export` syntax
2. **Use template literals** for HTML generation
3. **Camel case** for variables and functions
4. **Pascal case** for classes
5. **Comment complex logic** - Especially simulation/execution code
6. **Avoid global state** - Use `BlueprintApp` singleton
7. **Event delegation** - Attach listeners to parent elements when possible

## 🔄 Git Workflow

```bash
# Frequent commits preferred
git add .
git commit -m "Description of changes"
git push origin main
```

**Commit message format:**

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests

## 🚀 Development Server

```bash
npm run serve
# Runs on http://localhost:8080
```

**Browser:** Check console for errors
**Auto-reload:** Not available, refresh browser after changes

## 📚 Key Documentation Files

- `docs/planning/task.md` - Current development tasks
- `docs/planning/implementation_plan.md` - Detailed implementation steps
- `docs/testing/DEBUGGING_TEST_PLAN.md` - Testing procedures
- `docs/guides/TASK_GUIDE.md` - Task system guide
- `README.md` - Project overview

## 🎯 Current Development Focus

As of December 21, 2025:

**Phase 7: UI/UX Polish & Tech Debt** - ✅ 95% Complete

- [x] CSS refactoring (330 → 99 inline styles)
- [x] NodeDefinitions modularization (14 category files)
- [x] DetailsController extraction (ClassDefaultsRenderer)
- [x] All high-priority trace nodes implemented
- [x] Enhanced Input system complete
- [ ] Code reuse and instancing audit (NEW)

**Next Priorities:**

1. **Code Audit** - Identify duplication and refactoring opportunities
2. **Audio/Visual Nodes** - PlaySound2D, SpawnNiagaraSystem
3. **Timeline Editor UI** - Advanced feature
4. **v1.0 Release Preparation** - Documentation and testing

## ⚡ Token Optimization

AI agents should be mindful of token usage when working on this project. Follow these guidelines:

### File Viewing Strategy

- **Don't view entire large files** - Use line ranges when possible
- **Use search first** - `grep_search` or `codebase_search` before `view_file`
- **Target specific functions** - `view_code_item` for specific functions/classes
- **Check file size** - Use `list_dir` to see file sizes before viewing
- **Use ANCHOR_MANIFEST.md** - Reference anchors instead of re-reading code

### Efficient Information Gathering

```python
# ❌ BAD: View entire 1000-line file
view_file("large_file.js")

# ✅ GOOD: Search for specific function first
grep_search("functionName", "large_file.js")
# Then view only the relevant lines
view_file("large_file.js", StartLine=100, EndLine=150)

# ✅ BEST: Use anchor manifest
# Read ANCHOR_MANIFEST.md to find:
# <!-- custom-event-execution-logic -->
# File: src/services/executors/FunctionExecutor.js
# Lines: ~137-166
view_file("src/services/executors/FunctionExecutor.js", StartLine=137, EndLine=166)
```

### Context Awareness

- **Read checkpoint summaries** - They contain crucial context, don't re-request
- **Reference conversation history** - Recent edits are documented
- **Use AGENTS.md** - This file has patterns and solutions
- **Check ANCHOR_MANIFEST.md** - Find code locations without searching

### Response Efficiency

- **Be concise but complete** - Don't repeat obvious information
- **Use code blocks** - More efficient than prose explanations
- **Summarize changes** - Bullet points > paragraphs
- **Don't over-explain** - User knows the codebase context

### Python Script Efficiency

```python
# ✅ GOOD: Single script does multiple related changes
# Update imports AND instantiation in one script

# ❌ BAD: Multiple scripts for same file
# Script 1: Update imports
# Script 2: Update instantiation
# Script 3: Update exports
```

### When NOT to Optimize

- **Critical decisions** - Explain thoroughly
- **Complex debugging** - Show full context
- **New patterns** - Document completely
- **User questions** - Answer completely

### Token Budget Awareness

- This project runs in contexts with ~200k token budgets
- Large file views (1000+ lines) cost ~2-3k tokens
- Checkpoint reads cost ~15-20k tokens
- ANCHOR_MANIFEST.md costs ~5k tokens (but provides 37 anchor references)
- Use the manifest to avoid re-reading code

---

## 💡 Tips for AI Agents

1. **Read checkpoint summaries carefully** - They contain crucial context
2. **Check conversation history** - Recent edits and blockers are documented
3. **Test in browser** - Always verify changes work
4. **Use Python for edits** - User's very strong preference
5. **Commit frequently** - User wants git backups often
6. **Match UE5 aesthetics** - Premium, dark theme always
7. **SCORM compatible** - No external dependencies that won't work in LMS
8. **Windows paths** - Use backslashes or raw strings in Python

## 🔗 Useful Links

- [Unreal Engine Documentation](https://docs.unrealengine.com/)
- [Blueprint Visual Scripting](https://docs.unrealengine.com/5.0/en-US/blueprints-visual-scripting-in-unreal-engine/)
- [SCORM 1.2 Specification](https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/)

---

**Last Updated:** December 21, 2025
**Maintained by:** AI Agents & SamDeiter
