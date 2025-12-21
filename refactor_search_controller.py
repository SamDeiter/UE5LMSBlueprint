
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\SearchController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Empty Result
content = content.replace('empty.className = "find-result-empty";\n      empty.textContent = "No results found.";\n      empty.style.padding = "10px";\n      empty.style.color = "#888";\n      empty.style.fontStyle = "italic";', 'empty.className = "find-result-empty placeholder-italic";\n      empty.textContent = "No results found.";')

# 2. Item Style
content = content.replace('item.style.cssText =\n        "display: flex; align-items: center; padding: 4px 8px; cursor: pointer; border-bottom: 1px solid #333; font-size: 12px; color: #ccc;";', '')

# 3. Inner HTML
content = content.replace('<i class="fas ${res.icon} mr-2" style="width: 16px; opacity: 0.7;"></i>', '<i class="fas ${res.icon} mr-2 w-16 opacity-70"></i>')
content = content.replace('<span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">', '<span class="find-result-text">')
content = content.replace('<span style="color: #aaa; margin-right: 5px;">[${res.type}]</span>', '<span class="find-result-type">[${res.type}]</span>')

# 4. Hover removal
content = content.replace('item.addEventListener(\n        "mouseenter",\n        () => (item.style.backgroundColor = "rgba(255,255,255,0.05)")\n      );', '')
content = content.replace('item.addEventListener(\n        "mouseleave",\n        () => (item.style.backgroundColor = "transparent")\n      );', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring SearchController.js")
