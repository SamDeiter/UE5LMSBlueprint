import os

css_path = 'css/nodes.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Update the arrow CSS to be more prominent and precise
old_arrow_css = """.pin-container.out .pin-dot:not(.exec-pin)::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid currentColor;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    pointer-events: none;
}"""

new_arrow_css = """/* Output Pin Triangle Arrow (for non-exec pins) */
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

# Replace if found (exact match from previous write)
if old_arrow_css in css_content:
    css_content = css_content.replace(old_arrow_css, new_arrow_css)
else:
    # If not found (maybe whitespace diff), try to append or regex replace
    # For now, let's just append it to the end to override any previous declaration
    css_content += "\n" + new_arrow_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updated pin arrow CSS.")
