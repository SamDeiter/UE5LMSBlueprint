import os

# Fix 1: Implement function deletion in FunctionsController.js
functions_path = 'src/ui/FunctionsController.js'
with open(functions_path, 'r', encoding='utf-8') as f:
    functions_content = f.read()

# Replace the TODO delete callback with actual implementation
old_delete = "{ label: 'Delete', callback: () => { /* TODO */ } },"
new_delete = "{ label: 'Delete', callback: () => this.deleteFunction(func) },"

if old_delete in functions_content:
    functions_content = functions_content.replace(old_delete, new_delete)
    
    # Add the deleteFunction method before the showContextMenu method
    insert_point = "    showContextMenu(e, func) {"
    delete_method = """    deleteFunction(func) {
        if (!confirm(`Delete function '${func.name}'? This will remove all CallFunction nodes.`)) {
            return;
        }

        // 1. Remove all CallFunction nodes from all graphs
        const callNodeKey = `Func_${func.name}`;
        
        // Remove from active graph
        if (this.app.graph && this.app.graph.nodes) {
            const nodesToRemove = [];
            for (const node of this.app.graph.nodes.values()) {
                if (node.nodeKey === callNodeKey) {
                    nodesToRemove.push(node.id);
                }
            }
            nodesToRemove.forEach(nodeId => this.app.graph.removeNode(nodeId));
        }

        // Remove from stored graphs
        const allGraphs = [];
        if (this.app.graphs) Object.values(this.app.graphs).forEach(g => allGraphs.push(g));
        if (this.app.functionRegistry) this.app.functionRegistry.getAll().forEach(f => allGraphs.push(f.graph));
        if (this.app.macroRegistry) this.app.macroRegistry.getAll().forEach(m => allGraphs.push(m.graph));

        allGraphs.forEach(graphData => {
            if (!graphData || !graphData.nodes) return;
            graphData.nodes = graphData.nodes.filter(n => n.nodeKey !== callNodeKey);
        });

        // 2. Unregister the function
        this.app.functionRegistry.unregister(func.id);

        // 3. Switch to EventGraph if we're currently viewing this function
        if (this.app.activeGraph === func.name) {
            this.app.switchGraph('EventGraph');
        }

        // 4. Update UI
        this.render();
        this.app.persistence.autoSave();
    }

"""
    
    if insert_point in functions_content:
        functions_content = functions_content.replace(insert_point, delete_method + "    " + insert_point)
        
    with open(functions_path, 'w', encoding='utf-8') as f:
        f.write(functions_content)
    print(f"Fixed function deletion in {functions_path}")
else:
    print(f"Could not find delete TODO in {functions_path}")

# Fix 2: Implement macro deletion in MacrosController.js
macros_path = 'src/ui/MacrosController.js'
with open(macros_path, 'r', encoding='utf-8') as f:
    macros_content = f.read()

# Replace the TODO delete callback with actual implementation
if old_delete in macros_content:
    macros_content = macros_content.replace(old_delete, new_delete.replace('deleteFunction', 'deleteMacro'))
    
    # Add the deleteMacro method
    insert_point = "    showContextMenu(e, macro) {"
    delete_method = """    deleteMacro(macro) {
        if (!confirm(`Delete macro '${macro.name}'? This will remove all CallMacro nodes.`)) {
            return;
        }

        // 1. Remove all CallMacro nodes from all graphs
        const callNodeKey = `Macro_${macro.name}`;
        
        // Remove from active graph
        if (this.app.graph && this.app.graph.nodes) {
            const nodesToRemove = [];
            for (const node of this.app.graph.nodes.values()) {
                if (node.nodeKey === callNodeKey) {
                    nodesToRemove.push(node.id);
                }
            }
            nodesToRemove.forEach(nodeId => this.app.graph.removeNode(nodeId));
        }

        // Remove from stored graphs
        const allGraphs = [];
        if (this.app.graphs) Object.values(this.app.graphs).forEach(g => allGraphs.push(g));
        if (this.app.functionRegistry) this.app.functionRegistry.getAll().forEach(f => allGraphs.push(f.graph));
        if (this.app.macroRegistry) this.app.macroRegistry.getAll().forEach(m => allGraphs.push(m.graph));

        allGraphs.forEach(graphData => {
            if (!graphData || !graphData.nodes) return;
            graphData.nodes = graphData.nodes.filter(n => n.nodeKey !== callNodeKey);
        });

        // 2. Unregister the macro
        this.app.macroRegistry.unregister(macro.id);

        // 3. Switch to EventGraph if we're currently viewing this macro
        if (this.app.activeGraph === macro.name) {
            this.app.switchGraph('EventGraph');
        }

        // 4. Update UI
        this.render();
        this.app.persistence.autoSave();
    }

"""
    
    if insert_point in macros_content:
        macros_content = macros_content.replace(insert_point, delete_method + "    " + insert_point)
        
    with open(macros_path, 'w', encoding='utf-8') as f:
        f.write(macros_content)
    print(f"Fixed macro deletion in {macros_path}")
else:
    print(f"Could not find delete TODO in {macros_path}")

# Fix 3: Fix component deselection logic
components_path = 'src/ui/ComponentsController.js'
with open(components_path, 'r', encoding='utf-8') as f:
    components_content = f.read()

# Find and replace the problematic selection logic
old_selection_logic = """            item.addEventListener('click', (e) => {
                // Don't select if clicking arrow
                if (e.target.classList.contains('expand-arrow')) return;

                const isMulti = e.ctrlKey || e.shiftKey || e.metaKey;

                if (this.selectedComponentIds.has(comp.id) && isMulti) {
                    this.selectComponent(comp.id, true);
                    e.target.blur();
                } else {
                    this.selectComponent(comp.id, isMulti);
                }
            });"""

new_selection_logic = """            item.addEventListener('click', (e) => {
                // Don't select if clicking arrow
                if (e.target.classList.contains('expand-arrow')) return;

                const isMulti = e.ctrlKey || e.shiftKey || e.metaKey;

                // If clicking an already-selected item with Ctrl, deselect it
                if (this.selectedComponentIds.has(comp.id) && isMulti) {
                    this.selectedComponentIds.delete(comp.id);
                    this.selectComponent(null); // Trigger UI update
                    // Re-add remaining selections
                    this.selectedComponentIds.forEach(id => this.selectedComponentIds.add(id));
                    this.selectComponent(Array.from(this.selectedComponentIds).pop(), false);
                } else {
                    this.selectComponent(comp.id, isMulti);
                }
            });"""

if old_selection_logic in components_content:
    components_content = components_content.replace(old_selection_logic, new_selection_logic)
    with open(components_path, 'w', encoding='utf-8') as f:
        f.write(components_content)
    print(f"Fixed component deselection in {components_path}")
else:
    print(f"Could not find exact selection logic in {components_path}")

print("All fixes applied!")
