#!/usr/bin/env python3
"""
Fix inline styles in DetailsController.js
Phase 7: Technical Debt Refactor
"""

import re

filepath = 'src/ui/DetailsController.js'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Add missing const nameInput declaration (line ~942)
content = re.sub(
    r'(\s+row\.className = "param-row";\r?\n\s+row\.style\.cssText =\r?\n\s+"display: flex; align-items: center; margin-bottom: 4px;";\r?\n\r?\n\s+)nameInput\.type = "text";',
    r'\1const nameInput = document.createElement("input");\n      nameInput.type = "text";',
    content
)

# Fix 2: Remove row.style.cssText line (no longer needed with param-row CSS)
content = re.sub(
    r'(\s+row\.className = "param-row";\r?\n)\s+row\.style\.cssText =\r?\n\s+"display: flex; align-items: center; margin-bottom: 4px;";\r?\n',
    r'\1',
    content
)

# Fix 3: Find and replace nameInput.style.width = '100%' with addClass
content = re.sub(
    r'nameInput\.style\.width = [\'"]100%[\'"];',
    'nameInput.classList.add("w-100");',
    content
)

# Fix 4: Find and replace colorDot.style.backgroundColor with a data attribute approach
# This is dynamic, so we keep it but add a comment
content = re.sub(
    r'(colorDot\.style\.backgroundColor = Utils\.getPinColor\(pin\.type\);)',
    r'\1 // Dynamic color',
    content
)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed DetailsController.js inline styles")
print(" - Added missing const nameInput declaration")
print(" - Removed row.style.cssText inline style")
print(" - Replaced nameInput width with w-100 class")
print(" - Added comments for dynamic colors")
