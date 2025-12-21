
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\GraphInteraction.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Marquee Visibility
content = content.replace('this.marqueeEl.style.display = "none";', 'this.marqueeEl.classList.add("hidden");')
content = content.replace('this.marqueeEl.style.display = "block";', 'this.marqueeEl.classList.remove("hidden");')

# 2. Ghost Wire Visibility
content = content.replace('this.app.wiring.ghostWire.style.display = "none";', 'this.app.wiring.ghostWire.classList.add("hidden");')

# 3. Context Menu Styles (Old logic remnants)
content = content.replace('menu.style.position = "fixed";', '')
content = content.replace('menu.style.zIndex = "10000";', '')
content = content.replace('menu.style.left = `${e.clientX}px`;\n    menu.style.top = `${e.clientY}px`;', 'menu.style.left = `${e.clientX}px`;\n    menu.style.top = `${e.clientY}px`;\n    menu.classList.add("z-max");') # Need z-max

# 4. Menu Item Icon
content = content.replace('style="margin-right: 8px; width: 12px;"', 'class="mr-1 w-12"')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring GraphInteraction.js")
