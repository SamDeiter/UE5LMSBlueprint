"""
Phase 4b: Update Input Pins to show Arrow + Circle
Matches user request to show arrow on input pins (e.g. SET node inputs)
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def update_input_pins_to_compound():
    """Update Data Input Pins in createPinDot to use Arrow+Circle compound shape"""
    print("Updating Input Pins to use Arrow+Circle compound shape...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We need to replace the "4. DATA INPUT PINS" section
    # Current code:
    #         // 4. DATA INPUT PINS (Circle only)
    #         const wrapper = document.createElement('div');
    #         wrapper.className = `pin-icon ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
    #         ...
    #         const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    #         svg.setAttribute('viewBox', '0 0 12 12');
    #         ...
    #         svg.appendChild(circle);
    #         wrapper.appendChild(svg);
    #         return wrapper;
    
    # New code:
    new_input_logic = '''        // 4. DATA INPUT PINS (Arrow + Circle)
        const wrapper = document.createElement('div');
        // Use compound class for correct sizing (26px)
        wrapper.className = `pin-icon data-pin-compound ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
        wrapper.style.color = pinColor;
        wrapper.title = `${pin.name} (${pin.type})`;
        wrapper.style.cursor = 'pointer';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 18 12');

        // Arrow (Left side, pointing right -> into circle)
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('class', 'pin-arrow');
        arrow.setAttribute('d', 'M 1 3 L 6.5 6 L 1 9 Z');
        svg.appendChild(arrow);

        // Circle (Right side)
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'pin-circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        svg.appendChild(circle);

        wrapper.appendChild(svg);
        return wrapper;'''

    # Regex to find the section
    # We look for "// 4. DATA INPUT PINS" and match until the end of the method
    # The method ends with "return wrapper;\n    }"
    
    pattern = r'// 4\. DATA INPUT PINS[\s\S]*?return wrapper;'
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_input_logic, content)
        print("✅ Updated Data Input Pins to compound shape")
    else:
        print("❌ Could not find '4. DATA INPUT PINS' section")
        return False

    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Update - Input Pin Arrows")
    print("=" * 60)
    update_input_pins_to_compound()
