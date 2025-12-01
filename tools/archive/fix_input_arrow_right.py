"""
Fix input pin arrow to point RIGHT (away from the circle)
The triangle point should face RIGHT, base touches the circle on the left
"""

import os

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the input arrow to point RIGHT
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
    border-right: 5px solid currentColor;
}"""

# Point RIGHT: base on left (touching circle), point on right (away from circle)
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
    border-left: 5px solid currentColor;
}"""

content = content.replace(old_input_arrow, new_input_arrow)

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed input pin arrow to point RIGHT")
print("  - Arrow base touches the circle on the left")
print("  - Arrow point extends to the right (away from circle)")
