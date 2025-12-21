
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Breakpoint Icon Icon styles
content = content.replace('bpIcon.style.cssText =\n              "position: absolute; top: -4px; left: -4px; z-index: 10;";', '')
content = content.replace('bpIcon.style.cssText =\n        "position: absolute; top: -6px; left: -6px; z-index: 10;";', '')

# 2. Header Border Bottom
content = content.replace('header.style.borderBottomColor = "rgba(0,0,0,0.5)";', '')

# 3. Function Icon f styles
content = content.replace('iconEl.style.fontSize = "14px";', 'iconEl.classList.add("text-md");')
content = content.replace('iconEl.style.marginRight = "4px";', 'iconEl.classList.add("mr-1");')

# 4. Dev Badge styles
content = content.replace('devBadge.style.cssText =\n        "font-size: 8px; color: #aaa; margin-left: auto; padding-right: 4px; font-style: italic;";', 'devBadge.className = "dev-badge";')

# 5. Spacer minWidth
content = content.replace('spacer.minWidth = "10px";', 'spacer.classList.add("min-w-10");')

# 6. NeedNode Criteria visualization
content = content.replace('criteriaContainer.style.cssText =\n          "padding: 8px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px;";', 'criteriaContainer.className = "need-node-criteria-panel";')
content = content.replace('row.style.cssText =\n            "display: flex; gap: 6px; margin-bottom: 4px; align-items: center; color: #ccc;";', 'row.className = "need-node-criterion-row";')

# 7. Split Pin
content = content.replace('splitGroup.style.display = "flex";', '')
content = content.replace('splitGroup.style.flexDirection = "column";', '')
content = content.replace('splitGroup.style.alignItems =\n        pin.dir === "in" ? "flex-start" : "flex-end";', 'splitGroup.style.alignItems = pin.dir === "in" ? "flex-start" : "flex-end";') # Kept one as it is dynamic

# 8. Pin Label Visibility
content = content.replace('pinLabel.style.display = "none";', 'pinLabel.classList.add("hidden");')

# 9. Pin Wrapper
content = content.replace('wrapper.style.display = "flex";', 'wrapper.className = "pin-wrapper";')
content = content.replace('wrapper.style.alignItems = "center";', '')
content = content.replace('wrapper.style.gap = "5px";', '')

# 10. Input Widget
content = content.replace('inputEl.style.width = wideTypes.includes(pin.type) ? "80px" : "40px";', 'inputEl.classList.add(wideTypes.includes(pin.type) ? "input-wide" : "input-narrow");')
content = content.replace('inputEl.style.backgroundColor = "#111";', '')
content = content.replace('inputEl.style.color = "white";', '')
content = content.replace('inputEl.style.border = "1px solid #444";', '')
content = content.replace('inputEl.style.borderRadius = "2px";', '')
content = content.replace('inputEl.style.marginLeft = "5px";', '')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Finished refactoring Node.js")
