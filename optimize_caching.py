import os

node_path = 'src/graph/Node.js'
with open(node_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Cache header element in render()
# Find where header is created
if "const header = document.createElement('div');" in content:
    # We want to add this.headerElement = header; after it
    content = content.replace(
        "const header = document.createElement('div');",
        "const header = document.createElement('div');\n        this.headerElement = header;"
    )

# 2. Use cached header in toggleBreakpoint()
# Replace querySelector with cached element
old_bp_logic = "const header = this.element.querySelector('.node-title');"
new_bp_logic = "const header = this.headerElement || this.element.querySelector('.node-title');"

if old_bp_logic in content:
    content = content.replace(old_bp_logic, new_bp_logic)
    print(f"Optimized toggleBreakpoint in {node_path}")

with open(node_path, 'w', encoding='utf-8') as f:
    f.write(content)
