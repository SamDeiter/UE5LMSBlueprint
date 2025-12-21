"""
Phase 5: Wire up EventDispatcherController
Updates ui.js, app.js, and removes duplicate Event Dispatchers from VariableController
"""
import re

# 1. Update ui.js to export EventDispatcherController
ui_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui.js"

with open(ui_path, 'r', encoding='utf-8') as f:
    ui_content = f.read()

# Add export for EventDispatcherController
if 'EventDispatcherController' not in ui_content:
    # Find existing exports and add ours
    old_export = "export { DebuggerController } from './ui/DebuggerController.js';"
    new_export = """export { DebuggerController } from './ui/DebuggerController.js';
export { EventDispatcherController } from './ui/EventDispatcherController.js';"""
    
    if old_export in ui_content:
        ui_content = ui_content.replace(old_export, new_export)
        print("✅ Added EventDispatcherController export to ui.js")
    else:
        # Try a different pattern - add at end
        ui_content = ui_content.rstrip() + "\nexport { EventDispatcherController } from './ui/EventDispatcherController.js';\n"
        print("✅ Appended EventDispatcherController export to ui.js")

with open(ui_path, 'w', encoding='utf-8') as f:
    f.write(ui_content)

# 2. Update app.js - add import and initialization
app_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\app.js"

with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

# Add to import
old_import = "import { VariableController, PaletteController, ActionMenu, ContextMenu, DetailsController, LayoutController, TaskController, ComponentsController, NeedNodeModal, ParentClassModal, FunctionsController, MacrosController, LocalVariablesController, DebuggerController, GraphsController } from './ui.js';"
new_import = "import { VariableController, PaletteController, ActionMenu, ContextMenu, DetailsController, LayoutController, TaskController, ComponentsController, NeedNodeModal, ParentClassModal, FunctionsController, MacrosController, LocalVariablesController, DebuggerController, GraphsController, EventDispatcherController } from './ui.js';"

if 'EventDispatcherController' not in app_content:
    app_content = app_content.replace(old_import, new_import)
    print("✅ Added EventDispatcherController to app.js import")

# Add initialization after VariableController
old_init = "BlueprintApp.variables = new VariableController(BlueprintApp);"
new_init = """BlueprintApp.variables = new VariableController(BlueprintApp);
        BlueprintApp.eventDispatchers = new EventDispatcherController(BlueprintApp);"""

if 'BlueprintApp.eventDispatchers' not in app_content:
    app_content = app_content.replace(old_init, new_init)
    print("✅ Added EventDispatcherController initialization to app.js")

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)

# 3. Remove Event Dispatchers section from VariableController
var_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\VariableController.js"

with open(var_path, 'r', encoding='utf-8') as f:
    var_content = f.read()

# Remove the Event Dispatchers section (lines 654-656)
old_event_section = """        // 5. EVENT DISPATCHERS
        const eventSection = createSection('Event Dispatchers', 'section-events', () => { /* TODO: Add Event Dispatcher */ });
        this.listContainer.appendChild(eventSection.section);"""

if old_event_section in var_content:
    var_content = var_content.replace(old_event_section, "")
    print("✅ Removed Event Dispatchers section from VariableController.renderPanel()")

with open(var_path, 'w', encoding='utf-8') as f:
    f.write(var_content)

print("\n🎉 Phase 5: EventDispatcherController wired up successfully!")
