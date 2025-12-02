import re

file_path = 'src/graph/Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replacements map
replacements = [
    ("this.type === 'pure-node'", "this.type === NODE_TYPES.PURE"),
    ("this.type === 'event-node'", "this.type === NODE_TYPES.EVENT"),
    ("this.type === 'function-node'", "this.type === NODE_TYPES.FUNCTION"),
    ("this.type === 'assessment-node'", "this.type === NODE_TYPES.ASSESSMENT"),
    ("this.type === 'comment-node'", "this.type === NODE_TYPES.COMMENT"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Successfully refactored {file_path}")
