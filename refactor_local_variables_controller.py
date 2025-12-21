
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\LocalVariablesController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Section
content = content.replace("section.className = 'sidebar-section';", "section.className = 'sidebar-section sidebar-section-top-border';")
content = content.replace("section.style.borderTop = '1px solid #333';", "")
content = content.replace("section.style.marginTop = '0px';", "")

# 2. Display
content = content.replace("content.style.display = 'block';", "content.classList.remove('hidden');")

# 3. Icon
content = content.replace("iconSpan.className = 'ue5-variable-type-icon';", "iconSpan.className = 'ue5-variable-type-icon ue5-local-var-icon';")
content = content.replace("iconSpan.style.backgroundColor = color;", "iconSpan.style.backgroundColor = color;") # Keep dynamic
content = content.replace("iconSpan.style.width = '8px';", "")
content = content.replace("iconSpan.style.height = '4px';", "")
content = content.replace("iconSpan.style.borderRadius = '2px';", "")
content = content.replace("iconSpan.style.marginLeft = 'auto';", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring LocalVariablesController.js")
