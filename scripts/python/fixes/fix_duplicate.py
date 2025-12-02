file_path = r'c:\Users\sam.deiter\.gemini\antigravity\scratch\UE5LMSBlueprint\graph\GraphInteraction.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove line 513 (the duplicate const node declaration)
# Line 513 is index 512 (0-indexed)
if lines[512].strip() == 'const node = pin.node;':
    del lines[512]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Removed duplicate const node declaration')
