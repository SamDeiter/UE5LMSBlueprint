"""
Phase 4c: Fix Input Pin Triangle Position
Moves the triangle to the RIGHT side of the circle for input pins, matching UE5 style (O>)
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def fix_input_pin_triangle():
    """Update Data Input Pins to have Triangle on the RIGHT"""
    print("Fixing Input Pin Triangle position (Circle -> Arrow)...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # New code: Identical structure to Output pins (Circle then Arrow)
    new_input_logic = '''        // 4. DATA INPUT PINS (Circle + Arrow)
        const wrapper = document.createElement('div');
        wrapper.className = `pin-icon data-pin-compound ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
        wrapper.style.color = pinColor;
        wrapper.title = `${pin.name} (${pin.type})`;
        wrapper.style.cursor = 'pointer';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 18 12');

        // Circle (Left side)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'pin-circle');
        circle.setAttribute('cx', '6');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        svg.appendChild(circle);

        // Arrow (Right side, pointing right)
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('class', 'pin-arrow');
        arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
        svg.appendChild(arrow);

        wrapper.appendChild(svg);
        return wrapper;'''

    # Regex to find the section we just added
    # Matches from "// 4. DATA INPUT PINS" to the end of the method
    pattern = r'// 4\. DATA INPUT PINS[\s\S]*?return wrapper;'
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_input_logic, content)
        print("✅ Fixed Input Pin Triangle position")
    else:
        print("❌ Could not find '4. DATA INPUT PINS' section to fix")
        return False

    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Fix - Input Pin Triangle Position")
    print("=" * 60)
    fix_input_pin_triangle()
