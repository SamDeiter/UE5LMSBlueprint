"""
Fix CSS arrow directions for data pins
Input pins: arrow points RIGHT (into circle)
Output pins: arrow points LEFT (into circle)
"""

import os

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the arrow indicator styles with corrected directions
old_input_arrow = """.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid currentColor;
}"""

new_input_arrow = """.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 5px solid currentColor;
}"""

old_output_arrow = """.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-right: 5px solid currentColor;
}"""

new_output_arrow = """.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid currentColor;
}"""

content = content.replace(old_input_arrow, new_input_arrow)
content = content.replace(old_output_arrow, new_output_arrow)

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed CSS arrow directions")
print("  - Input pins: arrow points RIGHT (into circle)")
print("  - Output pins: arrow points LEFT (into circle)")
