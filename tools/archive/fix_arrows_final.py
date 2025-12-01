"""
Fix arrow directions: ALL arrows should point RIGHT (execution direction).
- Input: Arrow on left, pointing Right (> O)
- Output: Arrow on right, pointing Right (O >)
Maintains hollow/solid logic.
"""

import os
import re

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove existing arrow styles to start fresh
content = re.sub(r'\.pin-container\.in \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.out \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.(in|out) \.pin-dot\.(connected|filled):not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)

# Define new styles
new_styles = """
/* --- DIRECTIONAL ARROW INDICATORS --- */

/* INPUT PINS (Left side) - Arrow points RIGHT (> O) */
/* Outer Triangle (Color) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px; /* Position on left of circle */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow chevron) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: -8px; /* Shifted left to cut out the base */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid #141414;
    z-index: 2;
}

/* Connected Input: Hide inner triangle -> Solid Triangle */
.pin-container.in .pin-dot.connected:not(.exec-pin):not(.container-pin)::after,
.pin-container.in .pin-dot.filled:not(.exec-pin):not(.container-pin)::after {
    display: none;
}


/* OUTPUT PINS (Right side) - Arrow points RIGHT (O >) */
/* Outer Triangle (Color) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -6px; /* Position on right of circle */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow chevron) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    right: -4px; /* Shifted left relative to the outer triangle to cut the base */
    /* Note: Since it's on the right, and we want to cut the base (left side of triangle),
       we need the black triangle to be to the left of the colored one.
       Outer is at right: -6px.
       Inner needs to be at right: -4px (closer to circle).
    */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid #141414; /* Points RIGHT */
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

print("✓ Fixed arrow directions: ALL point RIGHT")
