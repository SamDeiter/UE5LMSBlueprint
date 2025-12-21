
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\VariableController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Output Circle
content = content.replace('outputCircle.style.backgroundColor = "var(--color-object)";', '') # Replaced by CSS or kept as dynamic? It's constant here.

# 2. Eye Icon remnants
content = content.replace('eyeIcon.style.marginLeft = "auto";', '')
content = content.replace('eyeIcon.style.marginRight = "8px";', '')
content = content.replace('eyeIcon.style.opacity = isPublic ? "1" : "0.5";', 'if (isPublic) eyeIcon.classList.add("opacity-100"); else eyeIcon.classList.add("opacity-50");')

# 3. Type Name Color (Wait, I said keep it? Let's check if it's dynamic).
# variable.type.charAt(0).toUpperCase() + variable.type.slice(1);
# typeName.style.color = color;
# color = Utils.getPinColor(variable.type);
# This is dynamic. Keep it.

# 4. Visible Flex usages
content = content.replace('modal.classList.add("visible-flex");', 'modal.classList.remove("hidden");')
content = content.replace('modal.classList.remove("visible-flex");', 'modal.classList.add("hidden");')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring VariableController.js")
