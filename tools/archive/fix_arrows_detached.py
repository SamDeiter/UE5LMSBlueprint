"""
Fix pin arrows to match target image:
- Detached from circle (small gap).
- Distinct triangle shape.
- ALWAYS on RIGHT side.
- ALWAYS point RIGHT.
- Unconnected: Hollow.
- Connected: Filled.
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
# Remove the unified style from previous step
content = re.sub(r'\.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-dot\.(connected|filled):not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)


# Define new styles
new_styles = """
/* --- DISTINCT RIGHT-SIDE ARROWS --- */

/* COMMON STYLES FOR BOTH INPUT AND OUTPUT */
/* The arrow is ALWAYS attached to the RIGHT side of the pin dot with a GAP */

/* Outer Triangle (Color) */
.pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: 14px; /* Gap from circle (12px width + 2px gap) */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - for hollow effect) */
.pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: 15px; /* Shifted right to cut the base */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 2.5px solid transparent;
    border-bottom: 2.5px solid transparent;
    border-left: 3.5px solid #141414; /* Match background */
    z-index: 2;
}

/* Connected/Filled: Hide inner triangle -> Solid Triangle */
.pin-dot.connected:not(.exec-pin):not(.container-pin)::before,
.pin-dot.filled:not(.exec-pin):not(.container-pin)::before {
    display: none;
}
"""

# Clean up and append
content = re.sub(r'\n\s*\n', '\n\n', content)
content += new_styles

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed arrows: Detached with gap, distinct triangle, always on right")
