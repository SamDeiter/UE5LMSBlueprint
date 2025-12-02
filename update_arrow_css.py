import os

css_path = 'css/nodes.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# The CSS we added previously
previous_arrow_css = """/* Output Pin Triangle Arrow (for non-exec pins) */
.pin-container.out .pin-dot:not(.exec-pin)::after {
    content: '';
    position: absolute;
    right: -7px; /* Adjusted for better visibility */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid currentColor; /* Slightly larger to match image */
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    pointer-events: none;
}"""

# The new CSS that includes unconnected input pins
new_arrow_css = """/* Pin Triangle Arrow (Output pins + Unconnected Input pins) */
.pin-container.out .pin-dot:not(.exec-pin)::after,
.pin-container.in .pin-dot.hollow:not(.exec-pin)::after {
    content: '';
    position: absolute;
    right: -7px; /* Adjusted for better visibility */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid currentColor; /* Slightly larger to match image */
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    pointer-events: none;
}"""

if previous_arrow_css in css_content:
    css_content = css_content.replace(previous_arrow_css, new_arrow_css)
else:
    # If exact match fails, try to just append the new rule (and maybe comment out the old one if we could find it, but appending is safer for now)
    # Actually, let's try to find the selector and replace the block
    import re
    # Regex to match the block we added or similar blocks
    pattern = r"/\* Output Pin Triangle Arrow.*?\}\s*"
    # This is risky with regex on multi-line.
    # Let's just append it at the end, cascading will handle it if the specificity is same or higher.
    # But wait, we want to avoid duplicates.
    # Let's just append it.
    css_content += "\n" + new_arrow_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updated CSS to include arrows on unconnected input pins.")
