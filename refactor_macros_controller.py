
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\MacrosController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Display
content = content.replace("content.style.display = 'block';", "content.classList.remove('hidden');")

# 2. Import Button
content = content.replace("importBtn.style.marginRight = '8px';", "importBtn.classList.add('mr-1');")

# 3. Icon
content = content.replace("icon.className = 'fas fa-scroll function-icon';", "icon.className = 'fas fa-scroll function-icon text-muted text-xs mr-1';")
content = content.replace("icon.style.marginRight = '6px';", "")
content = content.replace("icon.style.color = '#ccc';", "")
content = content.replace("icon.style.fontSize = '10px';", "")

# 4. Import Input
content = content.replace("input.style.display = 'none';", "input.classList.add('hidden');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring MacrosController.js")
