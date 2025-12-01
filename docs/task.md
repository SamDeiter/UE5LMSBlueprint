# Task List

## Phase 2: Make/Break Struct Nodes ✅ COMPLETE

- [x] Implement Vector/Rotator/Transform Node Definitions
- [x] Implement Execution Logic
- [x] Implement Utility Functions
- [x] Add Auto-Conversion Nodes
- [x] Context Menu Enhancements
    - [x] Right-click variable → Get/Set + Make/Break options
    - [x] Right-click Get/Set node → Make/Break options
    - [x] Drag from struct pin → Suggested Break node
    - [x] Double-click wire → Insert Break node inline

## Phase 2.1: Split Struct Pin Feature ✅ COMPLETE

- [x] Understand Split Struct Pin Requirements
- [x] Implement Split Struct Pin
    - [x] Add "Split Struct Pin" context menu option
    - [x] Modify Pin class to support split state
    - [x] Update Node rendering for expanded sub-pins
    - [x] Handle wiring to/from split pins
    - [x] Add "Recombine" option
    - [x] **Support nested splitting** (Transform → Location → X/Y/Z)
    - [x] Fix Get variable nodes (compact rendering)
    - [x] Recursive serialization for nested splits
- [x] Testing & Verification (Added Test 7 to Checklist)

## Phase 3: Refactoring for Modularity 🔄 IN PROGRESS

### Priority 0: Extract Hard-Coded Values ✅ COMPLETE
- [x] Create config/ directory structure
- [x] Extract DOM IDs to DOMElements.js
- [x] Extract UI constants to UIConstants.js
- [x] Extract node defaults to NodeDefaults.js
- [x] Update imports across all files

### Priority 1: Node Handler Registry
- [ ] Create NodeHandler system
- [ ] Extract Vector/Rotator/Transform handlers
- [ ] Update SimulationEngine

### Priority 2: Renderer Extraction
- [ ] Create renderer system
- [ ] Extract Node renderers

### Priority 3: Menu Refactoring
- [ ] Extract menu classes

### Priority 4: Folder Reorganization
- [ ] Reorganize graph/ structure

## Phase 4: Functions and Macros 📋 IN PROGRESS

### Phase 4.1: Blueprint Functions
- [x] Data Layer (FunctionDefinition, FunctionRegistry)
- [x] Functions Panel UI
- [x] Function Graph Editor
- [x] Function Call Nodes
- [x] Execution Support
- [ ] Advanced Features (overloading, access specifiers)

### Phase 4.2: Macros
- [x] Data Layer (MacroDefinition, MacroRegistry)
- [x] Macros Panel UI
- [x] Macro Graph Editor
- [x] Macro Expansion/Collapse
- [x] Execution Support

### Phase 4.3: Advanced Features
- [x] Function/Macro Libraries (Basic Implementation)
- [ ] Interface Implementation
- [ ] Function Overriding
- [x] Debugging Support (Breakpoints, Step Over, Pause/Resume)

**See `FUNCTIONS_MACROS_PLAN.md` for detailed implementation plan**
