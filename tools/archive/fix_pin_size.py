#!/usr/bin/env python3
"""
Carefully update ONLY the exec pin size without corrupting the file
"""

def update_exec_pin_size_carefully():
    css_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\css\nodes.css"
    
    print("Reading CSS file...")
    with open(css_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Find and update only the width and height lines in .pin-dot.exec-pin
    in_exec_pin_block = False
    updated = False
    
    for i, line in enumerate(lines):
        if '.pin-dot.exec-pin {' in line:
            in_exec_pin_block = True
            print(f"Found exec-pin block at line {i+1}")
        elif in_exec_pin_block and '}' in line and 'width' not in line:
            in_exec_pin_block = False
        elif in_exec_pin_block:
            if 'width:' in line and 'px' in line:
                lines[i] = '    width: 20px !important;\n'
                print(f"Updated width at line {i+1}")
                updated = True
            elif 'height:' in line and 'px' in line:
                lines[i] = '    height: 20px !important;\n'
                print(f"Updated height at line {i+1}")
                updated = True
    
    if updated:
        print("\nWriting updated CSS...")
        with open(css_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        
        print("✓ Successfully updated exec pin to 20px")
        print("\n⚠️  Hard refresh browser (Ctrl+Shift+R)!")
        return True
    else:
        print("ERROR: Could not find exec-pin width/height to update")
        return False

if __name__ == "__main__":
    update_exec_pin_size_carefully()
