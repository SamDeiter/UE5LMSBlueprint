
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\WiringController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ghost Wire Visibility
content = content.replace('this.ghostWire.style.display = "none";', "this.ghostWire.classList.add('hidden');")
content = content.replace('this.ghostWire.style.display = "block";', "this.ghostWire.classList.remove('hidden');")
content = content.replace('wireEl.style.display = "";', "wireEl.classList.remove('hidden');")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring WiringController.js")
