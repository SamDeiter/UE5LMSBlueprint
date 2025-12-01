# Fix the HTML to add the missing #center-area wrapper
import re

with open(r'c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the graph-editor div and wrap it in center-area
# Pattern: find the graph-editor opening tag and its closing tag
pattern = r'(\s*<!-- CENTER GRAPH EDITOR -->.*?<div id="graph-editor".*?</div>)'
replacement = r'    <!-- CENTER AREA -->\n    <div id="center-area">\n\1\n    </div>'

# Use DOTALL flag to match across newlines
content_fixed = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also need to fix grid-area assignments for menubar, tabbar, toolbar, bottom-strip
# Add these if they're missing

# Write the fixed content
with open(r'c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\index.html', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("HTML fixed: Added #center-area wrapper")
