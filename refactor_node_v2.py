import re

file_path = 'src/graph/Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacements map
replacements = [
    # Fix assignments
    ('this.type = nodeData.type || "pure-node"', 'this.type = nodeData.type || NODE_TYPES.PURE'),
    
    # Fix comparisons (if not already done)
    ("this.type === 'pure-node'", "this.type === NODE_TYPES.PURE"),
    ("this.type === 'event-node'", "this.type === NODE_TYPES.EVENT"),
    ("this.type === 'function-node'", "this.type === NODE_TYPES.FUNCTION"),
    ("this.type === 'assessment-node'", "this.type === NODE_TYPES.ASSESSMENT"),
    ("this.type === 'comment-node'", "this.type === NODE_TYPES.COMMENT"),
    
    # Fix other string literals
    ("this.nodeKey === 'ConstructionScript'", "this.nodeKey === 'ConstructionScript'"), # Keep as is for now unless constant exists
]

for old, new in replacements:
    content = content.replace(old, new)

# Check if DocumentFragment is already used
if 'document.createDocumentFragment()' not in content:
    # We will inject DocumentFragment usage in render()
    # This is a bit complex with regex, so we'll look for specific patterns
    pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully refactored {file_path}")
