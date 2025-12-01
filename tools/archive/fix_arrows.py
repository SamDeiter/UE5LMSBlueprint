"""
Fix arrow directions and remove text arrow from Node.js
"""

import os

NODE_JS_FILE = os.path.join(os.path.dirname(__file__), 'src', 'graph', 'Node.js')

# Read the file
with open(NODE_JS_FILE, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove the arrow code block
new_lines = []
skip_until_closing_brace = False
skip_count = 0

for i, line in enumerate(lines):
    # Look for the comment that starts the arrow section
    if '// Add output arrow indicator for data pins (not exec pins)' in line:
        skip_until_closing_brace = True
        skip_count = 0
        continue
    
    if skip_until_closing_brace:
        skip_count += 1
        # Skip until we find the closing brace of the if statement (around 8-9 lines)
        if '}' in line and skip_count >= 8:
            skip_until_closing_brace = False
            continue
    
    if not skip_until_closing_brace:
        new_lines.append(line)

# Write back
with open(NODE_JS_FILE, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✓ Removed text arrow code from Node.js")
