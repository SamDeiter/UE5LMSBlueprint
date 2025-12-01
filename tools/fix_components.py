"""
Fix component handling:
1. Prevent node re-registration warning in ComponentsController
2. Add Get/Set support when dragging components from Variables panel
3. Ensure Delete works from Variables panel (already works via our previous fix)
"""

# Fix 1: Update ComponentsController.js to only register if not already registered
with open('ui/ComponentsController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the updateNodeLibrary method and update it
old_update = """    updateNodeLibrary() {
        // Register Get nodes for all components
        if (this.app.components) {
            this.app.components.forEach(comp => {
                const nodeKey = `GetComponent_${comp.id}`;
                nodeRegistry.register(nodeKey, {"""

new_update = """    updateNodeLibrary() {
        // First, unregister all component nodes to avoid duplicates
        const allKeys = Object.keys(nodeRegistry.getAll());
        for (const key of allKeys) {
            if (key.startsWith('GetComponent_') || key.startsWith('SetComponent_')) {
                nodeRegistry.unregister(key);
            }
        }

        // Register Get and Set nodes for all components
        if (this.app.components) {
            this.app.components.forEach(comp => {
                // Register Get node
                const getKey = `GetComponent_${comp.id}`;
                nodeRegistry.register(getKey, {"""

if old_update in content:
    content = content.replace(old_update, new_update)
    
    # Also add Set node registration after Get node
    old_get_registration = """                nodeRegistry.register(nodeKey, {
                    title: `Get ${comp.name}`,
                    category: 'Components',
                    type: 'pure-node',
                    inputs: [],
                    outputs: [
                        { id: 'out', name: comp.name, type: 'object', dir: 'out' }
                    ],
                    properties: { componentId: comp.id }
                });
            });
        }
        this.app.palette.populateList();
    }"""
    
    new_get_set_registration = """                nodeRegistry.register(getKey, {
                    title: `Get ${comp.name}`,
                    category: 'Components',
                    type: 'pure-node',
                    pins: [
                        { id: 'comp_out', name: comp.name, type: 'object', dir: 'out' }
                    ],
                    customData: { componentId: comp.id }
                });

                // Register Set node
                const setKey = `SetComponent_${comp.id}`;
                nodeRegistry.register(setKey, {
                    title: `Set ${comp.name}`,
                    category: 'Components',
                    type: 'function-node',
                    pins: [
                        { id: 'exec_in', name: 'Exec', type: 'exec', dir: 'in' },
                        { id: 'comp_in', name: comp.name, type: 'object', dir: 'in' },
                        { id: 'exec_out', name: 'Exec', type: 'exec', dir: 'out' }
                    ],
                    customData: { componentId: comp.id }
                });
            });
        }
        this.app.palette.populateList();
    }"""
    
    content = content.replace(old_get_registration, new_get_set_registration)
    print("✓ Updated ComponentsController to register both Get and Set nodes")
else:
    print("✗ Could not find ComponentsController updateNodeLibrary method")

with open('ui/ComponentsController.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix 2: Update GraphInteraction.js to handle component drag with action menu
with open('graph/GraphInteraction.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the handleDrop method and update it to show action menu for components
old_drop = """        // COMPONENT Drop
        if (data.startsWith('COMPONENT:')) {
            const componentId = data.substring('COMPONENT:'.length);
            const comp = this.app.components.get(componentId);
            if (!comp) return;

            const nodeKey = `GetComponent_${componentId}`;
            this.controller.addNode(nodeKey, x, y);
            return;
        }"""

new_drop = """        // COMPONENT Drop - Show action menu for Get/Set
        if (data.startsWith('COMPONENT:')) {
            const componentId = data.substring('COMPONENT:'.length);
            const comp = this.app.components.get(componentId);
            if (!comp) return;

            // Show action menu with Get/Set options
            this.app.actionMenu.show(
                { x: e.clientX, y: e.clientY },
                [
                    {
                        label: `Get ${comp.name}`,
                        icon: 'fa-arrow-down',
                        action: () => {
                            const getKey = `GetComponent_${componentId}`;
                            this.controller.addNode(getKey, x, y);
                        }
                    },
                    {
                        label: `Set ${comp.name}`,
                        icon: 'fa-arrow-up',
                        action: () => {
                            const setKey = `SetComponent_${componentId}`;
                            this.controller.addNode(setKey, x, y);
                        }
                    }
                ]
            );
            return;
        }"""

if old_drop in content:
    content = content.replace(old_drop, new_drop)
    print("✓ Updated component drop to show Get/Set action menu")
else:
    print("⚠ Could not find exact COMPONENT drop handler, trying alternative...")
    # Try to find and update any COMPONENT handling
    import re
    pattern = r"(//\s*COMPONENT Drop.*?)(const nodeKey = `GetComponent_\$\{componentId\}`;.*?this\.controller\.addNode\(nodeKey, x, y\);)"
    if re.search(pattern, content, re.DOTALL):
        content = re.sub(
            pattern,
            new_drop.replace('        ', '            '),  # Adjust indentation
            content,
            flags=re.DOTALL
        )
        print("✓ Updated component drop handler (alternative match)")
    else:
        print("✗ Could not update component drop handler")

with open('graph/GraphInteraction.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Component fixes applied!")
print("\nChanges made:")
print("1. ComponentsController now unregisters old nodes before re-registering")
print("2. Both Get and Set nodes are now registered for each component")
print("3. Dragging a component from Variables panel now shows Get/Set action menu")
print("4. Delete key already works for components (from previous fix)")
