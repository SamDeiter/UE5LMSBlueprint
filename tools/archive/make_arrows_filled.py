"""
Make pin arrows filled/solid again (reverting hollow effect)
Ensure correct directions:
- Input pins: Arrow on left, pointing RIGHT (into circle)
- Output pins: Arrow on right, pointing LEFT (into circle)
"""

import os
import re

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the hollow arrow CSS with solid arrow CSS
# Since the hollow CSS uses both ::before and ::after, we'll use regex to replace the whole blocks

# 1. Fix Input Arrow (Left side, pointing RIGHT into circle)
# Remove the existing hollow input arrow styles (both ::before and ::after)
content = re.sub(r'\.pin-container\.in \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)

# 2. Fix Output Arrow (Right side, pointing LEFT into circle)
# Remove the existing hollow output arrow styles (both ::before and ::after)
content = re.sub(r'\.pin-container\.out \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)

# 3. Add the new solid arrow styles
new_styles = """
/* Arrow indicators for data pins (FILLED) */

/* Input pins: Arrow on left, pointing RIGHT (into circle) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid currentColor; /* Points RIGHT */
}

/* Output pins: Arrow on right, pointing LEFT (into circle) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 5px solid currentColor; /* Points LEFT */
}
"""

# Append the new styles to the end of the file (or replace if we can find a good spot, but appending is safer after regex removal)
# Clean up extra newlines created by regex
content = re.sub(r'\n\s*\n', '\n\n', content)
content += new_styles

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Made pin arrows filled/solid")
print("  - Input: Points RIGHT (into circle)")
print("  - Output: Points LEFT (into circle)")
