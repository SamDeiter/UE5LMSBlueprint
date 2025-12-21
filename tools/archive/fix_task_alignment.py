#!/usr/bin/env python3
"""Fix the Associated Task dropdown and button alignment in NeedNodeModal.js"""

# Read the file
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the Associated Task section - add align-items: center to the flex container
old_line = '                        <div style="display: flex; gap: 10px;">'
new_line = '                        <div style="display: flex; gap: 10px; align-items: center;">'

content = content.replace(old_line, new_line)

# Write back
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed Associated Task alignment - added align-items: center to flex container')
