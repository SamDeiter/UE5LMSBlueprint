"""
Fix exec pin CSS specificity issue.
The problem: .pin-dot.hollow is overriding exec pin styles.
Solution: Ensure exec pins don't get the generic hollow styles.
"""

import re

# Read the CSS file
with open('css/nodes.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Find the .pin-dot.hollow rule and update it to exclude exec pins
# Change: .pin-dot.hollow
# To: .pin-dot.hollow:not(.exec-pin)

css_content = css_content.replace(
    '.pin-dot.hollow {',
    '.pin-dot.hollow:not(.exec-pin) {'
)

# Write back
with open('css/nodes.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Fixed exec pin CSS specificity")
print("  - Updated .pin-dot.hollow to exclude exec pins")
print("  - Exec pins will now use their own hollow styling")
