"""
Fix output pin arrow to point LEFT (into the circle)
The triangle point should be on the LEFT touching the circle
"""

import os

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the output arrow to point LEFT
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

# Point LEFT: base on right, point on left (touching circle)
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

content = content.replace(old_output_arrow, new_output_arrow)

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed output pin arrow to point LEFT")
print("  - Arrow point touches the circle on the left")
print("  - Arrow base extends to the right")
