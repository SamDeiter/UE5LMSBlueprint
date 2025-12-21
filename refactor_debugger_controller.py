
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DebuggerController.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Panel Titles
content = content.replace('<div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #555; padding-bottom: 3px;">', '<div class="debug-panel-title">')

# 2. Stack Frame Current
content = content.replace("currentFrame.style.color = '#4CAF50';", "currentFrame.className = 'stack-frame-current';")
content = content.replace("currentFrame.style.fontWeight = 'bold';", "")
content = content.replace("currentFrame.style.cursor = 'pointer';", "")
content = content.replace("currentFrame.style.padding = '2px 0';", "")

# 3. Stack Frame Items
content = content.replace("el.style.paddingLeft = '10px';", "el.className = 'stack-frame-item';")
content = content.replace("el.style.color = '#aaa';", "")
content = content.replace("el.style.cursor = 'pointer';", "")
content = content.replace("el.style.padding = '2px 0 2px 10px';", "")

# 4. Watch List Row
content = content.replace("row.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 2px;';", "row.className = 'd-flex justify-between mb-1';")

# 5. Watch List Rows Spans
content = content.replace('<span style="color: #aaa;">', '<span class="text-muted">')
content = content.replace('<span style="color: #4CAF50;">', '<span class="text-success">')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring DebuggerController.js")
