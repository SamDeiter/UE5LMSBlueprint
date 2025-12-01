import re

file_path = r'c:\Users\sam.deiter\.gemini\antigravity\scratch\UE5LMSBlueprint\graph\GraphInteraction.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken line 463
content = content.replace(
    r"{ label: \Promote to Variable\, callback: () => this.controller.promotePinToVariable(pin) }",
    "{ label: `Promote to Variable`, callback: () => this.controller.promotePinToVariable(pin) }"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed syntax error in GraphInteraction.js line 463')
