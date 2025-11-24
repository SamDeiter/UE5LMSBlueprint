with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the Delete key handler to add component deletion support
old_code = """            if (e.key === 'Delete' || e.key === 'Backspace') {
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

new_code = """            if (e.key === 'Delete' || e.key === 'Backspace') {
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

if old_code in content:
    content = content.replace(old_code, new_code)
    print("✓ Successfully updated Delete key handler for component deletion")
else:
    print("✗ Could not find the exact code block to replace")
    print("Attempting fallback replacement...")
    # Try with normalized whitespace
    import re
    # Just insert the component check after variable check
    pattern = r'(let varToDelete = null;.*?}\s*})\s*(if \(varToDelete\))'
    
    component_check = '''

                // --- PRIORITY 2: CHECK FOR COMPONENT DELETION ---
                let componentToDelete = null;
                if (!varToDelete && BlueprintApp.componentsController && BlueprintApp.componentsController.selectedComponentId) {
                    componentToDelete = BlueprintApp.componentsController.selectedComponentId;
                }
'''
    
    # Add "else if (componentToDelete)" after the varToDelete block
    content = re.sub(
        r"(if \(varToDelete\) \{\s*BlueprintApp\.variables\.deleteVariable\(varToDelete\);[^\}]*\})\s*// 2\. Check for selected nodes/links\s*else if",
        r"\1" + "\n                else if (componentToDelete) {\n                    BlueprintApp.componentsController.deleteComponent(componentToDelete);\n                }\n                // 3. Check for selected nodes/links\n                else if",
        content,
        flags=re.DOTALL
    )
    
    # Insert component check variable
    content = re.sub(
        r"(let varToDelete = null;.*?}\s*})([\r\n\s]*)(\n                if \(varToDelete\))",
        r"\1" + component_check + r"\3",
        content,
        flags=re.DOTALL
    )
    print("✓ Applied fallback replacement")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Component deletion support added to app.js!")
