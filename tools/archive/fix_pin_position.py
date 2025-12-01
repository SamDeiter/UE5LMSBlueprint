#!/usr/bin/env python3
"""
Fix node content layout - exec pins should be absolutely positioned on the right edge
"""

def fix_exec_pin_layout():
    css_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\css\nodes.css"
    
    print("Reading CSS file...")
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update node-content to be position relative so we can absolutely position pins
    old_node_content = """.node-content {
    padding: 8px 0;
}"""
    
    new_node_content = """.node-content {
    padding: 8px 0;
    position: relative;
    min-height: 30px;
}"""
    
    # Make output exec pins absolutely positioned on the right edge
    pin_container_addition = """
.pin-container.out.exec-pin-container {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding-right: 4px;
}"""
    
    # Find where to insert the new rule (after .pin-container.out)
    insert_marker = """.pin-container.out {
    justify-content: flex-end;
    margin-left: auto;
    position: relative;
}"""
    
    if insert_marker in content:
        content = content.replace(insert_marker, insert_marker + pin_container_addition)
    
    # Also update node-content
    content = content.replace(old_node_content, new_node_content)
    
    print("Writing updated CSS...")
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Updated node-content positioning")
    print("✓ Added absolute positioning for exec output pins")
    print("\n⚠️  Hard refresh browser (Ctrl+Shift+R)!")
    return True

if __name__ == "__main__":
    fix_exec_pin_layout()
