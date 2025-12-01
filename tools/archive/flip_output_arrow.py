"""
Flip output pin arrow direction
The triangle point should face AWAY from circle, base touches the circle
"""

import os

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the output arrow to flip it
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
    border-left: 5px solid currentColor;
}"""

# Flip it: point faces RIGHT (away from circle), base on LEFT (touching circle)
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
    border-right: 5px solid currentColor;
}"""

content = content.replace(old_output_arrow, new_output_arrow)

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Flipped output pin arrow")
print("  - Arrow point now faces AWAY from circle")
print("  - Arrow base touches the circle")
