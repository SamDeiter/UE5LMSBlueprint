"""
Add arrow indicators to data pins in nodes.css
Arrows point INTO input pins from left, OUT from output pins to right
"""

import os

CSS_FILE = os.path.join(os.path.dirname(__file__), 'css', 'nodes.css')

# Read the current CSS
with open(CSS_FILE, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Find the section after "/* Connected pins are filled */"
# and add the arrow indicator styles

arrow_styles = """
/* Arrow indicators for data pins */
/* Input pins: arrow pointing INTO circle from left */
.pin-container.in .pin-dot:not(.exec-pin):not(.container-pin)::before {
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
}

/* Output pins: arrow pointing OUT from circle to right */
.pin-container.out .pin-dot:not(.exec-pin):not(.container-pin)::after {
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
}
"""

# Find where to insert (after the filled pins section)
insert_marker = "/* Output data pins with arrow indicator */"
if insert_marker in css_content:
    # Replace the old arrow indicator with the new one
    parts = css_content.split(insert_marker)
    # Find the end of the old arrow section
    after_marker = parts[1]
    # Find the next comment or rule
    next_section_start = after_marker.find('\n/* Execution pins')
    if next_section_start != -1:
        css_content = parts[0] + arrow_styles + '\n' + after_marker[next_section_start:]
    else:
        css_content = parts[0] + arrow_styles + after_marker
else:
    # Insert after the filled pins section
    insert_marker = "    background-color: currentColor;\n}\n"
    css_content = css_content.replace(insert_marker, insert_marker + '\n' + arrow_styles)

# Write back
with open(CSS_FILE, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("✓ Added arrow indicators to data pins")
print("  - Input pins: arrow points INTO circle from left")
print("  - Output pins: arrow points OUT from circle to right")
