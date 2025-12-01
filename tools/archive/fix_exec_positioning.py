#!/usr/bin/env python3
"""
Move exec pin further inside - increase right offset to 12px
"""

def move_exec_pin_inside():
    css_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\css\nodes.css"
    
    print("Reading CSS file...")
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and update the right positioning
    import re
    
    # Replace right: 6px with right: 12px in exec-pin-container
    pattern = r'(\.pin-container\.out\.exec-pin-container\s*\{[^}]*?right:\s*)(\d+px)'
    
    def replacer(match):
        return f"{match.group(1)}12px"
    
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        print("Writing updated CSS...")
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✓ Moved exec pin to right: 12px (further inside)")
        print("\n⚠️  Hard refresh browser (Ctrl+Shift+R)!")
        return True
    else:
        print("ERROR: Could not find exec-pin-container to update")
        return False

if __name__ == "__main__":
    move_exec_pin_inside()
