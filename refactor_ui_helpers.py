
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\ui-helpers.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Display Visibility
content = content.replace("content.style.display = isExpanded ? 'block' : 'none';", "if (isExpanded) content.classList.remove('hidden'); else content.classList.add('hidden');")
content = content.replace("const isHidden = content.style.display === 'none';", "const isHidden = content.classList.contains('hidden');")
content = content.replace("content.style.display = isHidden ? 'block' : 'none';", "if (isHidden) content.classList.remove('hidden'); else content.classList.add('hidden');")
content = content.replace("content.style.display = autoExpand ? 'block' : 'none';", "if (autoExpand) content.classList.remove('hidden'); else content.classList.add('hidden');")

# 2. Arrow Styles
content = content.replace("arrow.style.marginRight = '5px';", "arrow.classList.add('collapsible-arrow');")
content = content.replace("arrow.style.width = '10px';", "")

# 3. SetupToggle Display
content = content.replace("content.style.display = isExpanded ? 'block' : 'none';", "if (isExpanded) content.classList.remove('hidden'); else content.classList.add('hidden');")
content = content.replace("const isHidden = content.style.display === 'none';", "const isHidden = content.classList.contains('hidden');")
content = content.replace("content.style.display = isHidden ? 'block' : 'none';", "if (isHidden) content.classList.remove('hidden'); else content.classList.add('hidden');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring ui-helpers.js")
