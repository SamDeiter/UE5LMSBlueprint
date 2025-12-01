"""
Add debug logging to component deletion
"""

# This script has been consolidated into tools/ue5lms_tools.py

    content = f.read()

old_deletion = """                // --- PRIORITY 2: CHECK FOR COMPONENT DELETION ---
                let componentToDelete = null;
                if (!varToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {
                    componentToDelete = BlueprintApp.componentsController.selectedComponentId;
                }

                if (varToDelete) {
                    BlueprintApp.variables.deleteVariable(varToDelete); // Triggers confirmation modal
                }
                else if (componentToDelete) {
                    BlueprintApp.componentsController.deleteComponent(componentToDelete);
                }"""

new_deletion = """                // --- PRIORITY 2: CHECK FOR COMPONENT DELETION ---
                let componentToDelete = null;
                if (!varToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {
                    componentToDelete = BlueprintApp.componentsController.selectedComponentId;
                    console.log('[DEBUG] Component selected for deletion:', componentToDelete);
                }

                if (varToDelete) {
                    BlueprintApp.variables.deleteVariable(varToDelete); // Triggers confirmation modal
                }
                else if (componentToDelete) {
                    console.log('[DEBUG] Deleting component:', componentToDelete);
                    BlueprintApp.componentsController.deleteComponent(componentToDelete);
                }"""

if old_deletion in content:
    content = content.replace(old_deletion, new_deletion)
    print("✓ Added debug logging to component deletion")
else:
    print("✗ Could not find component deletion code")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Also add logging to selectComponent
with open('ui/ComponentsController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_select = """    selectComponent(id) {
        this.selectedComponentId = id;
        this.render();
        // Sync with My Blueprint selection if possible, or just update details
        // this.app.details.showComponentDetails(this.app.components.get(id));
    }"""

new_select = """    selectComponent(id) {
        console.log('[DEBUG] Component selected:', id);
        this.selectedComponentId = id;
        this.render();
        // Sync with My Blueprint selection if possible, or just update details
        // this.app.details.showComponentDetails(this.app.components.get(id));
    }"""

if old_select in content:
    content = content.replace(old_select, new_select)
    print("✓ Added debug logging to selectComponent")
else:
    print("✗ Could not find selectComponent method")

with open('ui/ComponentsController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDebug logging added. Reload browser and check console when:")
print("1. Clicking a component")
print("2. Pressing Delete key")
