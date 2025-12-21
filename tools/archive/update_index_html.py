
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add the parent class label to the toolbar
# We'll insert it before the closing </div> of the toolbar
toolbar_end_tag = '    </div>\n\n            <div id="left-panel" class="panel">'
if '<div class="parent-class-label">' not in content:
    new_content = content.replace(
        '    </div>\n\n            <div id="left-panel" class="panel">',
        '        <div class="parent-class-label" style="margin-left: auto;">Parent class: <a href="#">Actor</a></div>\n    </div>\n\n            <div id="left-panel" class="panel">'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated index.html with parent class label.")
else:
    print("Parent class label already exists in index.html.")
