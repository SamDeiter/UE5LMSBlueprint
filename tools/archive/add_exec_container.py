#!/usr/bin/env python3
"""
Add exec-pin-container positioning after rebuilding CSS
"""

def add_exec_container_positioning():
    css_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\css\nodes.css"
    
    print("Reading CSS file...")
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find .pin-container.out and add exec-pin-container rule after it
    marker = """.pin-container.out {
    justify-content: flex-end;
    margin-left: auto;
    position: relative;
}"""
    
    addition = """
.pin-container.out.exec-pin-container {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    padding-right: 0;
}"""
    
    if marker in content:
        content = content.replace(marker, marker + addition)
        
        print("Writing updated CSS...")
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✓ Added exec-pin-container positioning (right: 14px)")
        print("\n⚠️  Hard refresh browser (Ctrl+Shift+R)!")
        return True
    else:
        print("ERROR: Could not find .pin-container.out")
        return False

if __name__ == "__main__":
    add_exec_container_positioning()
