
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\ComponentSelector.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modal Visibility
content = content.replace("this.modal.style.display = 'none';", "this.modal.classList.add('hidden');")
content = content.replace("this.modal.style.display = 'block';", "this.modal.classList.remove('hidden');")

# 2. Title Bar Icon
content = content.replace('<i class="fas fa-cube" style="margin-right: 6px; font-size: 10px;"></i>', '<i class="fas fa-cube component-selector-header-icon"></i>')

# 3. Search Box Flex
content = content.replace('<div class="search-box" style="flex: 1;">', '<div class="search-box flex-1">')

# 4. Category Arrow/Icon Style
content = content.replace("arrow.style.cssText = 'margin-right: 6px; font-size: 10px; transition: transform 0.2s;';", "arrow.className = 'fas fa-caret-down component-selector-arrow';")
content = content.replace("icon.style.cssText = 'margin-right: 6px; font-size: 10px;';", "icon.classList.add('component-selector-header-icon');")

# 5. Category Content Visibility
content = content.replace("contentContainer.style.display = 'block'; // Start expanded", "contentContainer.classList.remove('hidden'); // Start expanded")
content = content.replace("contentContainer.style.display = isExpanded ? 'block' : 'none';", "if (isExpanded) contentContainer.classList.remove('hidden'); else contentContainer.classList.add('hidden');")

# 6. Component Item Indentation and Icon
content = content.replace("item.style.paddingLeft = '24px'; // Indent", "item.classList.add('pl-4'); // Indent")
content = content.replace("compIcon.style.cssText = 'margin-right: 8px; font-size: 11px; color: #999;';", "compIcon.className = `fas ${comp.icon} component-selector-item-icon`;")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring ComponentSelector.js")
