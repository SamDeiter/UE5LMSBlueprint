"""
Comprehensive fix for all component issues - Fixed version
"""

print("=" * 60)
print("APPLYING ALL COMPONENT FIXES")
print("=" * 60)

# ============================================================================
# FIX 1: Add component deletion to app.js Delete key handler
# ============================================================================
print("\n[1/4] Updating app.js for component deletion...")
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_delete = """            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();

                let varToDelete = null;

                // --- PRIORITY 1: CHECK FOR VARIABLE DELETION ---
                varToDelete = BlueprintApp.details.currentVariable;

                if (!varToDelete) {
                    const activeEl = document.activeElement;
                    if (activeEl) {
                        const focusedVarEl = activeEl.closest('.tree-item[data-var-id]');
                        if (focusedVarEl) {
                            const varId = focusedVarEl.dataset.varId;
                            varToDelete = [...BlueprintApp.variables.variables.values()].find(v => v.id === varId);
                        }
                    }
                }

                if (varToDelete) {
                    BlueprintApp.variables.deleteVariable(varToDelete); // Triggers confirmation modal
                }
                // 2. Check for selected nodes/links
                else if (BlueprintApp.graph.selectedNodes.size > 0 || BlueprintApp.wiring.selectedLinks.size > 0) {
                    BlueprintApp.graph.deleteSelectedNodes();
                }
            }"""

new_delete = """            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();

                let varToDelete = null;

                // --- PRIORITY 1: CHECK FOR VARIABLE DELETION ---
                varToDelete = BlueprintApp.details.currentVariable;

                if (!varToDelete) {
                    const activeEl = document.activeElement;
                    if (activeEl) {
                        const focusedVarEl = activeEl.closest('.tree-item[data-var-id]');
                        if (focusedVarEl) {
                            const varId = focusedVarEl.dataset.varId;
                            varToDelete = [...BlueprintApp.variables.variables.values()].find(v => v.id === varId);
                        }
                    }
                }

                // --- PRIORITY 2: CHECK FOR COMPONENT DELETION ---
                let componentToDelete = null;
                if (!varToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {
                    componentToDelete = BlueprintApp.componentsController.selectedComponentId;
                }

                if (varToDelete) {
                    BlueprintApp.variables.deleteVariable(varToDelete); // Triggers confirmation modal
                }
                else if (componentToDelete) {
                    BlueprintApp.componentsController.deleteComponent(componentToDelete);
                }
                // 3. Check for selected nodes/links
                else if (BlueprintApp.graph.selectedNodes.size > 0 || BlueprintApp.wiring.selectedLinks.size > 0) {
                    BlueprintApp.graph.deleteSelectedNodes();
                }
            }"""

if old_delete in content:
    content = content.replace(old_delete, new_delete)
    print("✓ Added component deletion support to Delete key handler")
else:
    print("✗ Could not find Delete key handler in app.js")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

# ============================================================================
# FIX 2: Add drag support to ComponentsController
# ============================================================================
print("\n[2/4] Adding drag support to ComponentsController...")
with open('ui/ComponentsController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_comp_item = """                `;

                item.addEventListener('click', () => this.selectComponent(comp.id));"""

new_comp_item = """                `;

                // Make draggable - from Components panel, only creates Get node
                item.draggable = true;
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', `COMPONENT_GET:${comp.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                });

                item.addEventListener('click', () => this.selectComponent(comp.id));"""

if old_comp_item in content:
    content = content.replace(old_comp_item, new_comp_item)
    print("✓ Added drag support to Components panel items")
else:
    print("✗ Could not add drag support to ComponentsController")

with open('ui/ComponentsController.js', 'w', encoding='utf-8') as f:
    f.write(content)

# ============================================================================
# FIX 3: Update VariableController to always show Components subsection
# ============================================================================
print("\n[3/4] Updating VariableController to always show Components...")
with open('ui/VariableController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the components rendering to always show, with placeholder
old_comp_render = """        // Render component items
        if (this.app.components) {
            this.app.components.forEach(comp => {"""

new_comp_render = """        // Render component items
        if (this.app.components && this.app.components.size > 0) {
            this.app.components.forEach(comp => {"""

if old_comp_render in content:
    content = content.replace(old_comp_render, new_comp_render)
    print("✓ Updated Components check to include size")
    
    # Add placeholder for empty components
    old_end = """                componentsContent.appendChild(item);
            });
        }

        componentsSubsection.appendChild(componentsHeader);"""
    
    new_end = """                componentsContent.appendChild(item);
            });
        } else {
            // Show placeholder when no components
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'padding: 8px 12px; color: #666; font-size: 10px; font-style: italic;';
            placeholder.textContent = 'No components';
            componentsContent.appendChild(placeholder);
        }

        componentsSubsection.appendChild(componentsHeader);"""
    
    if old_end in content:
        content = content.replace(old_end, new_end)
        print("✓ Added placeholder for empty components")
    else:
        print("⚠ Could not add placeholder")
else:
    print("✗ Could not update Components rendering")

# Make header clickable
old_toggle = """        // Toggle collapse
        let compExpanded = true;
        leftGroup.addEventListener('click', () => {"""

new_toggle = """        // Toggle collapse - make entire header clickable
        let compExpanded = true;
        componentsHeader.addEventListener('click', () => {"""

if old_toggle in content:
    content = content.replace(old_toggle, new_toggle)
    print("✓ Made Components header fully clickable")

with open('ui/VariableController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n" + "=" * 60)
print("ALL FIXES APPLIED!")
print("=" * 60)
print("\nPlease reload the browser to test the changes.")
