
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\TaskController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Flex
content = content.replace("text.style.flex = '1';", "text.classList.add('flex-1');")

# 2. Confirmation Button
# yesBtn.style.backgroundColor = '#4CAF50';
content = content.replace("yesBtn.style.backgroundColor = '#4CAF50';", "yesBtn.classList.add('bg-success');")
content = content.replace("yesBtn.style.backgroundColor = originalYesColor;", "yesBtn.classList.remove('bg-success');")
content = content.replace("const originalYesColor = yesBtn.style.backgroundColor;", "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring TaskController.js")
