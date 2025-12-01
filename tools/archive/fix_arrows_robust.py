"""
Fix pin arrows using reliable border-based triangles.
- Unconnected: Hollow (Outer colored triangle + Inner black triangle)
- Connected: Filled (Inner black triangle hidden)
"""

import os
import re

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove existing arrow styles (both border and clip-path versions)
content = re.sub(r'\.pin-container\.in \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.out \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
# Remove the connected/filled overrides too
content = re.sub(r'\.pin-container\.(in|out) \.pin-dot\.(connected|filled):not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)


# Define new robust styles
new_styles = """
/* --- ROBUST ARROW INDICATORS --- */

/* INPUT PINS (Left side) - Arrow points RIGHT */
/* Outer Triangle (Color) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 6px solid currentColor; /* Points RIGHT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow effect) */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    left: -8px; /* Offset to overlay correctly */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-left: 4px solid #141414; /* Match node background */
    z-index: 2;
}

/* Connected Input: Hide inner triangle to make it solid */
.pin-container.in .pin-dot.connected:not(.exec-pin):not(.container-pin)::after,
.pin-container.in .pin-dot.filled:not(.exec-pin):not(.container-pin)::after {
    display: none;
}


/* OUTPUT PINS (Right side) - Arrow points LEFT */
/* Outer Triangle (Color) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 6px solid currentColor; /* Points LEFT */
    z-index: 1;
}

/* Inner Triangle (Black - creates hollow effect) */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    right: -8px; /* Offset to overlay correctly */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-right: 4px solid #141414; /* Match node background */
    z-index: 2;
}

/* Connected Output: Hide inner triangle to make it solid */
.pin-container.out .pin-dot.connected:not(.exec-pin):not(.container-pin)::before,
.pin-container.out .pin-dot.filled:not(.exec-pin):not(.container-pin)::before {
    display: none;
}
"""

# Clean up newlines and append
content = re.sub(r'\n\s*\n', '\n\n', content)
content += new_styles

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed pin arrows using robust border-layering technique")
