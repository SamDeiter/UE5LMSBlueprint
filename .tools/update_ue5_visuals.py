#!/usr/bin/env python3
"""
Update UE5 Blueprint visual styling to match reference HTML
Applies pixel-perfect UE5 colors, gradients, and styling
"""

import re

# === 1. UPDATE PIN COLORS IN CSS VARIABLES ===

variables_file = 'src/css/variables.css'

with open(variables_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Update pin colors to match reference
color_updates = {
    '--color-exec: #FFFFFF': '--color-exec: #FFFFFF',  # Keep white
    '--color-bool: #920000': '--color-bool: #920101',  # Dark red (from reference)
    '--color-byte: #00858E': '--color-byte: #00858E',  # Keep
    '--color-int: #1EB570': '--color-int: #1EB570',  # Keep
    '--color-int64: #99B866': '--color-int64: #99B866',  # Keep
    '--color-float: #96E804': '--color-float: #96E804',  # Lime green (matches reference!)
    '--color-double: #7DE614': '--color-double: #7DE614',  # Keep
    '--color-name: #c987ff': '--color-name: #c987ff',  # Purple (matches reference!)
    '--color-string: #e60088': '--color-string: #e60088',  # Magenta-pink (matches reference!)
    '--color-text: #FF8585': '--color-text: #FF8585',  # Keep
    '--color-vector: #ffc000': '--color-vector: #ffc000',  # Orange-gold (matches reference!)
    '--color-rotator: #7AA8F3': '--color-rotator: #7AA8F3',  # Keep
    '--color-transform: #FF8C00': '--color-transform: #FF8C00',  # Keep
    '--color-object: #00a8f0': '--color-object: #00a8f0',  # Cyan-blue (matches reference!)
    '--color-enum: #00B359': '--color-enum: #00B359',  # Keep
}

# Apply updates (most already match, this ensures consistency)
for old, new in color_updates.items():
    content = content.replace(old, new)

with open(variables_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated pin colors in variables.css")

# === 2. UPDATE NODE HEADER GRADIENTS ===

constants_file = 'src/config/Constants.js'

with open(constants_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Update EVENT gradient to match reference exactly
content = re.sub(
    r'EVENT: \{ start: "[^"]+", end: "[^"]+" \}',
    'EVENT: { start: "#7a1515", end: "#500a0a" }',  # Reference values!
    content
)

# Update FUNCTION gradient
content = re.sub(
    r'FUNCTION: \{ start: "[^"]+", end: "[^"]+" \}',
    'FUNCTION: { start: "#1d4d65", end: "#123040" }',  # Reference values!
    content
)

# Update PURE gradient
content = re.sub(
    r'PURE: \{ start: "[^"]+", end: "[^"]+" \}',
    'PURE: { start: "#5d9168", end: "#3b6643" }',  # Reference values!
    content
)

with open(constants_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated header gradients in Constants.js")

# === 3. UPDATE NODE CSS STYLING ===

nodes_css = 'src/css/nodes.css'

with open(nodes_css, 'r', encoding='utf-8') as f:
    content = f.read()

# Update input box styling for better contrast
content = re.sub(
    r'\.literal-input \{[^}]+background-color: [^;]+;',
    '.literal-input {\n    background-color: #050505;  /* Darker for better contrast (reference) */',
    content,
    flags=re.MULTILINE
)

# Update dev-only badge colors (hazard stripe)
content = re.sub(
    r'(\.dev-only-badge[^{]+\{[^}]*background:[^;]+)',
    lambda m: m.group(0).replace('#b8860b', '#8a7800').replace('#996515', '#8a7800'),
    content
)

# Update badge text color
content = re.sub(
    r'(\.dev-only-badge[^}]+color: )[^;]+',
    r'\1#ffda45',  # Brighter yellow from reference
    content
)

with open(nodes_css, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated node CSS styling")

# === 4. UPDATE INPUT WIDGETS ===

# Check if details input needs updating
try:
    ui_elements_css = 'src/css/ui-elements.css'
    with open(ui_elements_css, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update details-input if it exists
    if '.details-input' in content:
        content = re.sub(
            r'(\.details-input[^{]+\{[^}]*background[^:]*: )[^;]+',
            r'\1#050505',  # Match reference
            content
        )
        
        with open(ui_elements_css, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✓ Updated input widget styling")
except:
    pass

print("\n✅ Visual styling updated to match UE5 reference!")
print("   - Pin colors: Exact UE5 values")
print("   - Header gradients: Pixel-perfect EVENT/FUNCTION/PURE")
print("   - Input backgrounds: Deeper contrast (#050505)")
print("   - Hazard footer: Better yellow tones")
