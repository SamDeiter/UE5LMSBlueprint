
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\GraphsController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Display
content = content.replace("content.style.display = 'block';", "content.classList.remove('hidden');")

# 2. Icon
content = content.replace("icon.style.marginRight = '6px';", "icon.classList.add('mr-1', 'text-xs', 'text-muted');")
content = content.replace("icon.style.color = '#ccc';", "")
content = content.replace("icon.style.fontSize = '10px';", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring GraphsController.js")
