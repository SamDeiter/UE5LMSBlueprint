# UE5 Blueprint Editor - Project Structure

## 📁 Directory Organization

```
UE5LMSBlueprint-main/
├── 📂 docs/                    # All documentation
│   ├── CODE_QUALITY_PLAN.md
│   ├── SESSION_SUMMARY.md
│   ├── KNOWN_ISSUES.md
│   └── ... (debug and planning docs)
│
├── 📂 graph/                   # Core graph classes
│   ├── index.js               # Barrel export (Pin, Node, GraphController, WiringController)
│   ├── Pin.js
│   ├── Node.js
│   ├── GraphController.js
│   └── WiringController.js
│
├── 📂 ui/                      # UI controllers
│   ├── ActionMenu.js
│   ├── ContextMenu.js
│   ├── DetailsController.js
│   ├── DetailsRenderer.js
│   ├── LayoutController.js
│   ├── PaletteController.js
│   ├── TaskController.js
│   ├── VariableController.js
│   └── ui-helpers.js          # UI utility functions
│
├── 📂 services/                # Service layer
│   └── TaskManager.js
│
├── 📂 utils/                   # Utility modules
│   └── validator.js
│
├── 📂 registries/              # Registries
│   └── NodeRegistry.js
│
├── 📂 data/                    # Data definitions
│   └── nodes/                  # Modular node definitions
│       ├── index.js            # Node definitions barrel export
│       ├── ActorNodes.js
│       ├── CastingNodes.js
│       ├── CollisionNodes.js
│       ├── EventNodes.js
│       ├── FlowControlNodes.js
│       ├── FunctionNodes.js
│       ├── InputNodes.js
│       ├── MathNodes.js
│       ├── StringNodes.js
│       ├── UtilityNodes.js
│       └── VariableNodes.js
│
├── 📂 assets/                  # Static assets
├── 📂 icons/                   # Icon files
├── 📂 scripts/                 # Build/utility scripts
│
├── 📄 app.js                   # Main application entry point
├── 📄 services.js              # Service exports (Compiler, Persistence, etc.)
├── 📄 ui.js                    # UI controller exports
├── 📄 utils.js                 # General utilities
├── 📄 tests.js                 # Test suite
├── 📄 index.html               # Main HTML file
├── 📄 style.css                # Stylesheet
│
├── 📄 package.json             # NPM dependencies
├── 📄 eslint.config.js         # ESLint configuration
└── 📄 .git/hooks/pre-commit    # Pre-commit hook (syntax + lint checks)
```

## 🎯 Key Principles

1. **Documentation in `docs/`** - All markdown files documenting the project
2. **Graph Core in `graph/`** - Core data models and controllers
3. **UI Layer in `ui/`** - All UI-related controllers and helpers
4. **Services in `services/`** - Business logic and managers
5. **Utils in `utils/`** - Shared utility functions and validators
6. **Clean Root** - Only essential entry points in root directory

## 🔄 Import Paths

### From Root (`app.js`)

```javascript
import { GraphController } from './graph/index.js';
import { TaskManager } from './services/TaskManager.js';
import { BlueprintValidator } from './utils/validator.js';
```

### From UI Folder (`ui/*.js`)

```javascript
import { Pin } from '../graph/index.js';
import { createCollapsibleHeader } from './ui-helpers.js';
```

### From Services Folder (`services/*.js`)

```javascript
import { BlueprintValidator } from '../utils/validator.js';
```

## ✅ Quality Assurance

- **ESLint** configured and running clean
- **Pre-commit hook** validates syntax and linting before commits
- **Git tag** `v1.0-stable` marks stable baseline

## 🤖 For AI Agents

**Important:** Before working on this project, please read:

1. **[AGENTS.md](AGENTS.md)** - Complete developer guide
   - Project structure and patterns
   - Development workflows
   - Token optimization strategies
   - Common issues and solutions
   - User preferences (Python, Git, SCORM)

2. **[ANCHOR_MANIFEST.md](ANCHOR_MANIFEST.md)** - Code reference system
   - 42 searchable code anchors
   - Quick reference to implementations
   - Function locations and connections
   - Search with: `git grep "anchor-name"`

**Quick Start for Agents:**

```bash
# Find implementation details
git grep "custom-event-execution-logic"  # From ANCHOR_MANIFEST.md

# Reference in prompts
"Check AGENTS.md for the development patterns"
"Use anchor manifest to find parent-class-selection-logic"
```

---

## 📝 Next Steps

See `docs/CODE_QUALITY_PLAN.md` for the complete quality improvement roadmap.
