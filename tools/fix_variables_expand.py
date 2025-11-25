"""
Fix Variables section to stay expanded when components exist
"""

with open('ui/VariableController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Variables section creation and update isExpanded logic
old_var_section = """        // 4. VARIABLES
        const varSection = createSection('Variables', 'section-variables', () => this.addVariable());
        this.listContainer.appendChild(varSection.section);"""

# Check if we should keep it expanded - if components exist OR variables exist
new_var_section = """        // 4. VARIABLES - Keep expanded if components or variables exist
        const hasComponents = this.app.components && this.app.components.size > 0;
        const hasVariables = this.variables.size > 0;
        const varSection = createSection('Variables', 'section-variables', () => this.addVariable());
        
        // Force expanded state if components exist (even if no variables)
        if (hasComponents || hasVariables) {
            const varContent = varSection.content;
            if (varContent) varContent.style.display = 'block';
            // Update arrow icon
            const arrow = varSection.section.querySelector('.fa-caret-right, .fa-caret-down');
            if (arrow) arrow.className = 'fas fa-caret-down';
        }
        
        this.listContainer.appendChild(varSection.section);"""

if old_var_section in content:
    content = content.replace(old_var_section, new_var_section)
    print("✓ Updated Variables section to stay expanded when components exist")
else:
    print("✗ Could not find Variables section creation")

with open('ui/VariableController.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nVariables section will now stay expanded if components exist!")
