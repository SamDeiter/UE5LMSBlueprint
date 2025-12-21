
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\FunctionsController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Display
content = content.replace('content.style.display = "block";', "content.classList.remove('hidden');")

# 2. Import Button
content = content.replace('importBtn.style.marginRight = "8px";', "importBtn.classList.add('mr-1');")

# 3. Eye Icon
content = content.replace('eyeIcon.style.marginLeft = "auto";', "")
content = content.replace('eyeIcon.style.marginRight = "8px";', "")

# 4. File Input
content = content.replace('input.style.display = "none";', "input.classList.add('hidden');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring FunctionsController.js")
