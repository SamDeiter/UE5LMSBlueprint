import os

file_path = 'src/graph/GraphController.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the line that's causing the error by adding a null check
old_line = "        if (this.app.activeGraph.startsWith('Func_') || this.app.functionRegistry.getAll().find(f => f.name === this.app.activeGraph)) {"
new_line = "        if (this.app.activeGraph && (this.app.activeGraph.startsWith('Func_') || this.app.functionRegistry.getAll().find(f => f.name === this.app.activeGraph))) {"

if old_line in content:
    content = content.replace(old_line, new_line)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed activeGraph null check in {file_path}")
else:
    print(f"Could not find the exact line to fix in {file_path}")
    print("Searching for similar patterns...")
    # Try to find the line number
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        if 'activeGraph.startsWith' in line and i >= 130 and i <= 140:
            print(f"Found at line {i}: {line.strip()}")
