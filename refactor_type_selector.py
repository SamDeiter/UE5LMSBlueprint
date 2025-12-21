
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DetailsTypeSelector.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Type Menu Visibility
content = content.replace("menu.style.display = 'flex';", "menu.classList.remove('hidden');")
content = content.replace("if (menu.style.display !== 'none' && !menu.contains(e.target)) {", "if (!menu.classList.contains('hidden') && !menu.contains(e.target)) {")
content = content.replace("menu.style.display = 'none';", "menu.classList.add('hidden');")

# 2. Pill Styles
content = content.replace("pill.style.width = '12px';", 'pill.classList.add("type-option-pill");')
content = content.replace("pill.style.borderRadius = '4px';", '')

# 3. Footer Checkbox Row
content = content.replace("checkboxContainer.style.display = 'flex';", "checkboxContainer.className = 'd-flex align-center gap-1';")
content = content.replace("checkboxContainer.style.alignItems = 'center';", '')
content = content.replace("checkboxContainer.style.gap = '4px';", '')

# 4. Container Type Menu styles
content = content.replace("menu.style.cssText = `\n            position: fixed;\n            left: ${x}px;\n            top: ${y}px;\n            background-color: #1a1a1a;\n            border: 1px solid #444;\n            border-radius: 4px;\n            box-shadow: 0 5px 15px rgba(0,0,0,0.5);\n            width: 120px;\n            z-index: 6001;\n            display: flex;\n            flex-direction: column;\n            padding: 4px 0;\n        `;", "menu.className = 'container-type-menu';\n        menu.style.left = `${x}px`;\n        menu.style.top = `${y}px`;")

# 5. Disabled Option
content = content.replace("item.style.opacity = '0.3';", 'item.classList.add("type-option-disabled");')
content = content.replace("item.style.cursor = 'not-allowed';", '')

# 6. Padding and structural styles
content = content.replace("item.style.padding = '4px 12px 4px 12px';", "item.classList.add('py-1', 'px-3');")
content = content.replace('<div style="width: 20px; display: flex; justify-content: center;">', '<div class="w-20 d-flex justify-center">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring DetailsTypeSelector.js")
