"""
Fix output arrow styling - make it smaller and closer to the pin
"""

import re

# Read the Node.js file
with open('src/graph/Node.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the arrow styling
# Looking for the arrow creation code we just added
old_arrow = """                    const arrow = document.createElement('span');
                    arrow.textContent = '►';
                    arrow.style.fontSize = '8px';
                    arrow.style.color = '#666';
                    arrow.style.marginLeft = '2px';
                    arrow.style.marginRight = '2px';
                    pinContainer.appendChild(arrow);"""

new_arrow = """                    const arrow = document.createElement('span');
                    arrow.textContent = '►';
                    arrow.style.fontSize = '6px';
                    arrow.style.color = '#555';
                    arrow.style.marginLeft = '3px';
                    arrow.style.marginRight = '1px';
                    arrow.style.opacity = '0.7';
                    pinContainer.appendChild(arrow);"""

if old_arrow in content:
    content = content.replace(old_arrow, new_arrow)
    print("✓ Updated arrow styling - smaller and more subtle")
else:
    print("⚠ Could not find arrow code to update")

# Write back
with open('src/graph/Node.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Arrow styling updated!")
print("   - Smaller font (6px)")
print("   - More subtle color (#555)")
print("   - Tighter spacing")
