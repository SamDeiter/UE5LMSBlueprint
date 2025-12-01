"""
Phase 4h: Update Event Node Header Icons
Adds the specific Diamond+Arrow SVG icon to Event Node headers.
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def update_event_header_icon():
    """Update Node.js to render the correct Event Node header icon"""
    print("Updating Event Node header icon...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to find where the header icon is rendered.
    # It's likely in the `render()` method or a `createHeader()` helper.
    # Let's look for where the icon is created.
    
    # Search for: if (this.icon)
    # or: const icon = document.createElement('i');
    
    # We'll replace the generic icon logic with a check for event nodes
    
    # New Logic:
    # If it's an event node, use the SVG.
    # Else, use the font awesome icon.
    
    # Let's try to find the icon creation block.
    # It usually looks like:
    # if (this.icon) {
    #    const icon = ...
    #    header.appendChild(icon);
    # }
    
    # We will replace it with:
    
    new_icon_logic = '''        // Icon
        if (this.type === 'event-node' || this.nodeKey.startsWith('Event')) {
            // UE5 Event Icon (Diamond with Arrow)
            const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgIcon.setAttribute('class', 'header-icon-svg');
            svgIcon.setAttribute('viewBox', '0 0 24 24');
            svgIcon.style.width = '18px';
            svgIcon.style.height = '18px';
            svgIcon.style.marginRight = '8px';
            
            // Diamond
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M12 3 L 21 12 L 12 21 L 3 12 Z');
            path1.setAttribute('fill', 'none');
            path1.setAttribute('stroke', 'white');
            path1.setAttribute('stroke-width', '2.5');
            path1.setAttribute('stroke-linejoin', 'round');
            svgIcon.appendChild(path1);
            
            // Arrow (Left pointing)
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M 16.5 12 L 11.5 7 L 11.5 10 L 7.5 10 L 7.5 14 L 11.5 14 L 11.5 17 Z');
            path2.setAttribute('fill', 'white');
            path2.setAttribute('stroke', 'none');
            svgIcon.appendChild(path2);
            
            header.appendChild(svgIcon);
        } else if (this.icon) {
            const icon = document.createElement('i');
            icon.className = `fas fa-${this.icon}`;
            icon.style.color = 'white';
            icon.style.marginRight = '8px';
            header.appendChild(icon);
        }'''

    # We need to find the existing icon logic to replace.
    # It's likely inside the `render()` method.
    
    # Let's try to match a common pattern for icon creation.
    pattern = r'if \(this\.icon\) \{[\s\S]*?header\.appendChild\(icon\);\s*\}'
    
    # This might be risky if there are multiple matches.
    # Let's assume the first one in render() is the header icon.
    
    if re.search(pattern, content):
        # We only want to replace the FIRST occurrence which is usually the header icon
        content = re.sub(pattern, new_icon_logic, content, count=1)
        print("✅ Updated Event Node header icon logic")
    else:
        print("❌ Could not find icon creation logic in render()")
        return False

    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Update - Event Header Icon")
    print("=" * 60)
    update_event_header_icon()
