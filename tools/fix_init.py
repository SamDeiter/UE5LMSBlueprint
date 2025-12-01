import re

# Fix GraphController.js - move duplicateSelectedNodes out of synchronizeNodeWithTemplate
with open('graph/GraphController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and fix the issue
content = content.replace(
    '        node.refreshPinCache();\r\n        duplicateSelectedNodes() {',
    '        node.refreshPinCache();\r\n        this.app.wiring.updateVisuals(node);\r\n    }\r\n\r\n    duplicateSelectedNodes() {'
)

with open('graph/GraphController.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix app.js - add graphs and activeGraph initialization
with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "BlueprintApp.componentsController"
insert_after_idx = None
for i, line in enumerate(lines):
    if 'BlueprintApp.componentsController = new ComponentsController(BlueprintApp);' in line:
        insert_after_idx = i
        break

if insert_after_idx:
    # Insert the initialization after componentsController
    new_lines = lines[:insert_after_idx+1]
    new_lines.append('\r\n')
    new_lines.append('        // Initialize graph storage for multi-graph support\r\n')
    new_lines.append("        BlueprintApp.graphs = {\r\n")
    new_lines.append("            'EventGraph': { nodes: [], links: [] },\r\n")
    new_lines.append("            'ConstructionScript': { nodes: [], links: [] }\r\n")
    new_lines.append('        };\r\n')
    new_lines.append("        BlueprintApp.activeGraph = 'EventGraph';\r\n")
    new_lines.extend(lines[insert_after_idx+1:])
    
    with open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Fixed app.js successfully")
else:
    print("Could not find insertion point in app.js")

print("GraphController.js and app.js have been fixed!")
