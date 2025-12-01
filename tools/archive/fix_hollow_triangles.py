"""
Fix pin arrows to be consistent shapes (Triangle) in both states.
- Unconnected: Hollow Triangle (Closed base) ▷
- Connected: Filled Triangle ▶
- Direction: ALL point RIGHT (Execution flow) ->

This fixes the "chevron vs triangle" inconsistency.
"""

import os
import re

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove existing arrow styles
content = re.sub(r'\.pin-container\.in \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.out \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.(in|out) \.pin-dot\.(connected|filled):not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)

# Define new styles for Hollow Triangles
new_styles = """
/* --- CONSISTENT TRIANGLE ARROWS --- */

/* INPUT PINS (Left side) - Arrow points RIGHT */
/* Outer Triangle (Color) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px; /* Base at -6px, Point at 0px */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow effect with CLOSED base) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: -5px; /* Base at -5px (leaving 1px border), Point at -1px */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid #141414; /* Match background */
    z-index: 2;
}

/* Connected Input: Hide inner triangle -> Solid Triangle */
.pin-container.in .pin-dot.connected:not(.exec-pin):not(.container-pin)::after,
.pin-container.in .pin-dot.filled:not(.exec-pin):not(.container-pin)::after {
    display: none;
}


/* OUTPUT PINS (Right side) - Arrow points RIGHT */
/* Outer Triangle (Color) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: 100%; /* Base at right edge of circle (12px) */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow effect with CLOSED base) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: calc(100% + 1px); /* Base at 13px (leaving 1px border) */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid #141414; /* Match background */
    z-index: 2;
}

/* Connected Output: Hide inner triangle -> Solid Triangle */
.pin-container.out .pin-dot.connected:not(.exec-pin):not(.container-pin)::before,
.pin-container.out .pin-dot.filled:not(.exec-pin):not(.container-pin)::before {
    display: none;
}
"""

# Clean up and append
content = re.sub(r'\n\s*\n', '\n\n', content)
content += new_styles

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed arrows to be consistent Hollow Triangles (not chevrons)")
print("✓ All arrows point RIGHT")
