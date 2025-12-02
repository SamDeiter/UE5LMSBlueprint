import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
import_added = False
export_added = False

for line in lines:
    if 'import { NeedNodeModal }' in line and not import_added:
        new_lines.append(line)
        new_lines.append("import { ParentClassModal } from './ui/ParentClassModal.js';\n")
        import_added = True
    elif 'NeedNodeModal,' in line and 'export' not in line and not export_added:
        new_lines.append(line)
        new_lines.append('    ParentClassModal,\n')
        export_added = True
    else:
        new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Modified src/ui.js successfully')
