"""
Refine pin arrows to match UE5 style:
- Shrink arrows (make them small and subtle).
- Overlap with circle to create "merged" look.
- Maintain RIGHT direction for all arrows.
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

# Define new styles for Subtle/Merged Arrows
new_styles = """
/* --- SUBTLE MERGED ARROWS (UE5 Style) --- */

/* INPUT PINS (Left side) - Arrow points RIGHT */
/* Outer Triangle (Color) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -2px; /* Overlap the circle */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - for hollow effect) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: -2px; /* Match outer position */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 1.5px solid transparent;
    border-bottom: 1.5px solid transparent;
    border-left: 2px solid #141414; /* Smaller black triangle */
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
    right: -2px; /* Overlap the circle on the right */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - for hollow effect) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    right: -2px; /* Match outer position */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 1.5px solid transparent;
    border-bottom: 1.5px solid transparent;
    border-left: 2px solid #141414; /* Smaller black triangle */
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

print("✓ Refined arrows to be small, subtle, and merged with the circle")
