import os
import re

# Step 1: Update index.html to add dropdown menu structure
html_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find the File menu item and replace it with a dropdown
old_file_menu = '''                <div class="menu-item">File</div>'''

new_file_menu = '''                <div class="menu-item dropdown-menu">
                    File
                    <div class="dropdown-content">
                        <div class="dropdown-item" id="new-blueprint-menu-item">
                            <i class="fas fa-file"></i> New Blueprint
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" id="save-blueprint-menu-item">
                            <i class="fas fa-save"></i> Save
                        </div>
                    </div>
                </div>'''

html_content = html_content.replace(old_file_menu, new_file_menu)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✓ Updated index.html with File menu dropdown")

# Step 2: Update ui-elements.css to add dropdown styles
css_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\css\ui-elements.css'

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

dropdown_css = '''
/* Dropdown Menu Styles */
.dropdown-menu {
    position: relative;
}

.dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #252525;
    min-width: 200px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 1px solid #333;
    border-radius: 2px;
    z-index: 1000;
    padding: 4px 0;
}

.dropdown-menu:hover .dropdown-content {
    display: block;
}

.dropdown-item {
    padding: 8px 16px;
    color: #ccc;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
}

.dropdown-item:hover {
    background-color: #0078d7;
    color: white;
}

.dropdown-item i {
    width: 16px;
    text-align: center;
}

.dropdown-divider {
    height: 1px;
    background-color: #333;
    margin: 4px 0;
}
'''

# Append dropdown styles to the end
css_content += '\n' + dropdown_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("✓ Updated ui-elements.css with dropdown styles")

print("\n✅ Menu structure created successfully!")
