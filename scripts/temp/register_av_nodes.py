import os

root_dir = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint'
index_path = os.path.join(root_dir, 'src', 'data', 'nodes', 'index.js')

with open(index_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Add import
import_line = "import { AudioVisualNodes } from './AudioVisualNodes.js';\n"
new_lines = []
imported = False
for line in lines:
    if line.startswith('import ') and not imported:
        new_lines.append(line)
        # Check if we should insert the new import after existing ones
        continue
    if not line.startswith('import ') and not imported:
        new_lines.append(import_line)
        imported = True
    new_lines.append(line)

# Add to core merge
final_lines = []
merged = False
for line in new_lines:
    if '...VariableNodes,' in line:
        final_lines.append(line)
        final_lines.append('  ...AudioVisualNodes,\n')
        merged = True
        continue
    final_lines.append(line)

with open(index_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("✓ Registered AudioVisualNodes in index.js")
