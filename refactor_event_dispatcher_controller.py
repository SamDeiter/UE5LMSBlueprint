
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\EventDispatcherController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Icon
content = content.replace('<i class="fas fa-bolt" style="color: var(--color-exec); font-size: 10px;"></i>', '<i class="fas fa-bolt text-xs" style="color: var(--color-exec);"></i>')

# 2. Placeholder
content = content.replace('placeholder.className = "placeholder-text";\n      placeholder.textContent = "No event dispatchers";\n      placeholder.style.padding = "8px";\n      placeholder.style.color = "#666";\n      placeholder.style.fontStyle = "italic";', 'placeholder.className = "placeholder-text placeholder-italic";\n      placeholder.textContent = "No event dispatchers";')

# 3. Details HTML
content = content.replace('<h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">', '<h4 class="details-header-uppercase">')
content = content.replace('style="width: 60%;"', 'class="w-60"')
content = content.replace('<div style="width: 60%;">', '<div class="w-60">')

# 4. Context Menu
content = content.replace('menu.style.position = "fixed";', 'menu.classList.add("z-max");')
content = content.replace('menu.style.left = `${e.clientX}px`;', 'menu.style.left = `${e.clientX}px`;')
content = content.replace('menu.style.top = `${e.clientY}px`;', 'menu.style.top = `${e.clientY}px`;')
content = content.replace('menu.style.zIndex = "10000";', '')

# 5. Menu Item Icon
content = content.replace('style="margin-right: 8px; width: 12px;"', 'class="mr-1 w-12"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring EventDispatcherController.js")
