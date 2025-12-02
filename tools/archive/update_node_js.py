#!/usr/bin/env python3
"""
Update Node.js to add exec-pin-container class for exec pins
"""

def update_node_js():
    node_js_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\src\graph\Node.js"
    
    print("Reading Node.js...")
    with open(node_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the line where pin-container class is set and add exec-pin-container for exec pins
    old_code = """    const pinContainer = document.createElement('div');
    const typeClass = Utils.getPinTypeClass(pin.type);
    pinContainer.className = `pin-container ${pin.dir} ${typeClass}`;
    pinContainer.dataset.pinId = pin.id;"""
    
    new_code = """    const pinContainer = document.createElement('div');
    const typeClass = Utils.getPinTypeClass(pin.type);
    const execClass = (pin.type === 'exec' && pin.dir === 'out') ? 'exec-pin-container' : '';
    pinContainer.className = `pin-container ${pin.dir} ${typeClass} ${execClass}`.trim();
    pinContainer.dataset.pinId = pin.id;"""
    
    if old_code in content:
        content = content.replace(old_code, new_code)
        
        print("Writing updated Node.js...")
        with open(node_js_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✓ Updated Node.js to add exec-pin-container class")
        print("\n⚠️  Hard refresh browser (Ctrl+Shift+R)!")
        return True
    else:
        print("ERROR: Could not find target code in Node.js")
        return False

if __name__ == "__main__":
    update_node_js()
