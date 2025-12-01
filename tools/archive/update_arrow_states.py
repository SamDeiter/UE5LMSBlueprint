"""
Update pin arrows to be state-dependent:
- Unconnected: Hollow/Chevron style
- Connected: Filled/Triangle style
Using clip-path for precise shape control.
"""

import os
import re

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the file
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove existing arrow styles (border-based)
content = re.sub(r'\.pin-container\.in \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)
content = re.sub(r'\.pin-container\.out \.pin-dot:not\(\.exec-pin\):not\(\.container-pin\)::(before|after)\s*\{[^}]+\}', '', content)

# Define new styles using clip-path
new_styles = """
/* --- DYNAMIC ARROW INDICATORS --- */

/* INPUT PINS (Left side) - Arrow points RIGHT */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 8px;
    background-color: currentColor;
    /* Default: Hollow/Chevron pointing Right */
    clip-path: polygon(0 0, 100% 50%, 0 100%, 35% 50%);
}

/* Connected Input: Filled Triangle pointing Right */
.pin-container.in .pin-dot.connected:not(.exec-pin):not(.container-pin)::before,
.pin-container.in .pin-dot.filled:not(.exec-pin):not(.container-pin)::before {
    clip-path: polygon(0 0, 100% 50%, 0 100%);
}

/* OUTPUT PINS (Right side) - Arrow points LEFT */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 8px;
    background-color: currentColor;
    /* Default: Hollow/Chevron pointing Left */
    clip-path: polygon(100% 0, 0 50%, 100% 100%, 65% 50%);
}

/* Connected Output: Filled Triangle pointing Left */
.pin-container.out .pin-dot.connected:not(.exec-pin):not(.container-pin)::after,
.pin-container.out .pin-dot.filled:not(.exec-pin):not(.container-pin)::after {
    clip-path: polygon(100% 0, 0 50%, 100% 100%);
}
"""

# Clean up newlines and append
content = re.sub(r'\n\s*\n', '\n\n', content)
content += new_styles

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated pin arrows to be state-dependent (Hollow vs Filled)")
