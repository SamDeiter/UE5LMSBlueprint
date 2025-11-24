"""
Fix two component issues:
1. Add drag support to Components panel (should only create Get node)
2. Make Components subsection in Variables panel clickable on the entire header
"""

# Fix 1: Add drag support to ComponentsController
with open('ui/ComponentsController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_render = """                item.innerHTML = `
                    <i class="fas ${iconClass}" style="margin-right: 8px; color: #ccc;"></i>
                    <span>${comp.name}</span>
                `;

                item.addEventListener('click', () => this.selectComponent(comp.id));
                this.listContainer.appendChild(item);"""

new_render = """                item.innerHTML = `
                    <i class="fas ${iconClass}" style="margin-right: 8px; color: #ccc;"></i>
                    <span>${comp.name}</span>
                `;

                // Make draggable - from Components panel, only creates Get node
                item.draggable = true;
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', `COMPONENT_GET:${comp.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                });

                item.addEventListener('click', () => this.selectComponent(comp.id));
                this.listContainer.appendChild(item);"""

if old_render in content:
    content = content.replace(old_render, new_render)
    print("✓ Added drag support to Components panel")
else:
    print("✗ Could not find render section in ComponentsController")

with open('ui/ComponentsController.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix 2: Update GraphInteraction to handle COMPONENT_GET (only creates Get node)
with open('graph/GraphInteraction.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handler before the existing COMPONENT: handler
old_component_drop = """        if (data.startsWith('COMPONENT:')) {
            const compId = data.split(':')[1];
            const comp = this.app.components.get(compId);
            if (!comp) return;
            
            // Check for modifier keys (like variables)
            let nodeKey = null;
            if (e.altKey) nodeKey = `SetComponent_${compId}`;
            else if (e.ctrlKey) nodeKey = `GetComponent_${compId}`;
            
            if (nodeKey) {
                this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
            } else {
                // Show action menu with Get/Set options
                this.app.actionMenu.show(e.clientX, e.clientY, null, null, comp);
            }
        }"""

new_component_drop = """        // COMPONENT_GET - From Components panel (top), only creates Get node
        if (data.startsWith('COMPONENT_GET:')) {
            const compId = data.substring('COMPONENT_GET:'.length);
            const nodeKey = `GetComponent_${compId}`;
            this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
            return;
        }
        
        // COMPONENT - From Variables panel, shows Get/Set menu
        if (data.startsWith('COMPONENT:')) {
            const compId = data.split(':')[1];
            const comp = this.app.components.get(compId);
            if (!comp) return;
            
            // Check for modifier keys (like variables)
            let nodeKey = null;
            if (e.altKey) nodeKey = `SetComponent_${compId}`;
            else if (e.ctrlKey) nodeKey = `GetComponent_${compId}`;
            
            if (nodeKey) {
                this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
            } else {
                // Show action menu with Get/Set options
                this.app.actionMenu.show(e.clientX, e.clientY, null, null, comp);
            }
        }"""

if old_component_drop in content:
    content = content.replace(old_component_drop, new_component_drop)
    print("✓ Updated GraphInteraction to handle COMPONENT_GET")
else:
    print("✗ Could not update GraphInteraction")

with open('graph/GraphInteraction.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix 3: Make Components header in Variables panel fully clickable
with open('ui/VariableController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and update the toggle collapse section
old_toggle = """        // Toggle collapse
        let compExpanded = true;
        leftGroup.addEventListener('click', () => {
            compExpanded = !compExpanded;
            componentsContent.style.display = compExpanded ? 'block' : 'none';
            compArrow.style.transform = compExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
        });"""

new_toggle = """        // Toggle collapse - make entire header clickable
        let compExpanded = true;
        componentsHeader.addEventListener('click', () => {
            compExpanded = !compExpanded;
            componentsContent.style.display = compExpanded ? 'block' : 'none';
            compArrow.style.transform = compExpanded ? 'rotate(0deg)' : 'rotate(-90deg)';
        });"""

if old_toggle in content:
    content = content.replace(old_toggle, new_toggle)
    print("✓ Made Components header fully clickable")
else:
    print("✗ Could not update Components header click handler")

with open('ui/VariableController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Component fixes applied!")
print("1. Components panel now supports drag (creates Get node only)")
print("2. Components subsection header in Variables is now fully clickable")
