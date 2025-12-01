"""
Remove the text arrow (►) from output pins in Node.js
We're using CSS arrows instead
"""

import os
import re

NODE_JS_FILE = os.path.join(os.path.dirname(__file__), 'src', 'graph', 'Node.js')

# Read the file
with open(NODE_JS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove the arrow indicator code
# Looking for the section that adds the arrow span element

# Pattern to match the arrow addition code
pattern = r"(\s+)// Add output arrow indicator for data pins \(not exec pins\)\s+if \(pin\.type !== 'exec'\) \{\s+const arrow = document\.createElement\('span'\);\s+arrow\.textContent = '►';\s+arrow\.style\.fontSize = '6px';\s+arrow\.style\.color = '#555';\s+arrow\.style\.marginLeft = '3px';\s+arrow\.style\.marginRight = '1px';\s+arrow\.style\.opacity = '0\.7';\s+pinContainer\.appendChild\(arrow\);\s+\}"

# Replace with empty string (remove it)
content = re.sub(pattern, '', content, flags=re.MULTILINE)

# Write back
with open(NODE_JS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Removed text arrow (►) from Node.js")
print("  CSS arrows will be used instead")
