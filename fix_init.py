with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where WiringController is initialized
wiring_line = -1
for i, line in enumerate(lines):
    if 'BlueprintApp.wiring = new WiringController' in line:
        wiring_line = i
        break

if wiring_line == -1:
    print('ERROR: Could not find WiringController initialization')
else:
    print(f'Found WiringController at line {wiring_line + 1}')
    
    # Insert GraphController and GridController initialization after WiringController
    insert_lines = [
        '        BlueprintApp.graph = new GraphController(\r\n',
        '            document.getElementById("graph-editor"),\r\n',
        '            document.getElementById("graph-svg"),\r\n',
        '            document.getElementById("nodes-container"),\r\n',
        '            BlueprintApp\r\n',
        '        );\r\n',
        '        BlueprintApp.graph.initEvents();\r\n',
        '        BlueprintApp.grid = new GridController(document.getElementById("graph-canvas"), BlueprintApp);\r\n',
    ]
    
    # Insert after wiring line
    for i, new_line in enumerate(insert_lines):
        lines.insert(wiring_line + 1 + i, new_line)
    
    # Write back
    with open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print('Added GraphController and GridController initialization')
    print('Added initEvents() call')
