"""
Add more detailed debug logging to track component deletion lifecycle
"""

with open('ui/ComponentsController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_delete = """    deleteComponent(id) {
        if (!id) return;
        if (this.app.components.has(id)) {
            const comp = this.app.components.get(id);
            if (window.confirm(`Delete component '${comp.name}'?`)) {
                this.app.components.delete(id);
                if (this.selectedComponentId === id) {
                    this.selectedComponentId = null;
                }
                this.render();
                this.updateNodeLibrary();
                if (this.app.variables) this.app.variables.renderPanel();
                this.app.persistence.autoSave();
            }
        }
    }"""

new_delete = """    deleteComponent(id) {
        if (!id) return;
        console.log('[DEBUG] deleteComponent called with id:', id);
        console.log('[DEBUG] Components before delete:', this.app.components.size);
        if (this.app.components.has(id)) {
            const comp = this.app.components.get(id);
            if (window.confirm(`Delete component '${comp.name}'?`)) {
                this.app.components.delete(id);
                console.log('[DEBUG] Deleted from map. Components after delete:', this.app.components.size);
                if (this.selectedComponentId === id) {
                    this.selectedComponentId = null;
                }
                this.render();
                this.updateNodeLibrary();
                if (this.app.variables) this.app.variables.renderPanel();
                console.log('[DEBUG] About to call autoSave');
                this.app.persistence.autoSave();
                console.log('[DEBUG] autoSave complete. Components count:', this.app.components.size);
            }
        }
    }"""

if old_delete in content:
    content = content.replace(old_delete, new_delete)
    print("✓ Added detailed debug logging to deleteComponent")
else:
    print("✗ Could not find deleteComponent method")

with open('ui/ComponentsController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nReload browser and try deleting a component.")
print("Watch console for component count before/after deletion.")
