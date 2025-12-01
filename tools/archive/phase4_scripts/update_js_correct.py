"""
Corrected JavaScript Update - Replace createPinDot() with wrapper-based approach
Uses CSS classes (.connected/.hollow) for state management
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def update_create_pin_dot():
    """Replace createPinDot() method with wrapper-based implementation"""
    print("Updating createPinDot() in Node.js...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # New implementation
    new_method = '''    createPinDot(pin, forceHollow = false) {
        const typeClass = Utils.getPinTypeClass(pin.type);
        const pinColor = Utils.getPinColor(pin.type);
        const isConnected = pin.links.length > 0 && !forceHollow;

        // 1. EXECUTION PINS
        if (pin.type === 'exec') {
            const wrapper = document.createElement('div');
            wrapper.className = `pin-icon exec-pin ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
            wrapper.style.color = 'white';
            wrapper.title = `${pin.name} (${pin.type})`;
            wrapper.style.cursor = 'pointer';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 14 14');
            
            const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            wedge.setAttribute('d', 'M 1 1 L 10 1 L 13 7 L 10 13 L 1 13 Z');
            wedge.setAttribute('stroke-linejoin', 'round');
            
            svg.appendChild(wedge);
            wrapper.appendChild(svg);
            return wrapper;
        }

        // 2. CONTAINER PINS (Keep existing div-based icons)
        if (pin.containerType && pin.containerType !== 'single') {
            const pinDot = document.createElement('div');
            let dotClasses = `pin-dot ${typeClass}`;
            pinDot.className = dotClasses + (isConnected ? ' connected' : ' hollow');
            pinDot.title = `${pin.name} (${pin.type})`;
            pinDot.classList.add('container-pin');

            if (pin.containerType === 'array') {
                pinDot.classList.add('array-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-th';
                icon.style.fontSize = '8px';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'set') {
                pinDot.classList.add('set-pin');
                const icon = document.createElement('span');
                icon.textContent = '{}';
                icon.style.fontSize = '8px';
                icon.style.fontWeight = 'bold';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            } else if (pin.containerType === 'map') {
                pinDot.classList.add('map-pin');
                const icon = document.createElement('i');
                icon.className = 'fas fa-list-ul';
                icon.style.fontSize = '8px';
                icon.style.color = pinColor;
                pinDot.appendChild(icon);
            }
            
            return pinDot;
        }

        // 3. DATA OUTPUT PINS (Circle + Arrow)
        if (pin.dir === 'out') {
            const wrapper = document.createElement('div');
            wrapper.className = `pin-icon data-pin-compound ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
            wrapper.style.color = pinColor;
            wrapper.title = `${pin.name} (${pin.type})`;
            wrapper.style.cursor = 'pointer';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 18 12');

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'pin-circle');
            circle.setAttribute('cx', '6');
            circle.setAttribute('cy', '6');
            circle.setAttribute('r', '4.5');
            svg.appendChild(circle);

            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrow.setAttribute('class', 'pin-arrow');
            arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
            svg.appendChild(arrow);

            wrapper.appendChild(svg);
            return wrapper;
        }

        // 4. DATA INPUT PINS (Circle only)
        const wrapper = document.createElement('div');
        wrapper.className = `pin-icon ${typeClass} ${isConnected ? 'connected' : 'hollow'}`;
        wrapper.style.color = pinColor;
        wrapper.title = `${pin.name} (${pin.type})`;
        wrapper.style.cursor = 'pointer';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 12 12');

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '6');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        svg.appendChild(circle);

        wrapper.appendChild(svg);
        return wrapper;
    }'''
    
    # Find pattern: from "createPinDot(" to closing "}" before next method
    pattern = r'(    createPinDot\(pin, forceHollow = false\) \{)[\s\S]*?\n(    \}\n\n    renderPin)'
    
    if re.search(pattern, content):
        content = re.sub(pattern, new_method + r'\n\n    renderPin', content)
        print("✅ Replaced createPinDot() method")
    else:
        print("❌ Could not find createPinDot() method")
        return False
    
    # Write back
    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Update - createPinDot() Wrapper Approach")
    print("=" * 60)
    
    success = update_create_pin_dot()
    
    if success:
        print("\n✅ JavaScript update complete!")
        print("\n📝 Changes:")
        print("   - Exec pins: <div class='pin-icon exec-pin connected/hollow'>")
        print("   - Data outputs: <div class='pin-icon data-pin-compound'>")
        print("   - Data inputs: <div class='pin-icon'>")
        print("   - Container pins: Preserved existing logic")
        print("\n⚠️  REFRESH BROWSER to see changes!")
    else:
        print("\n❌ Update failed")
        print(f"   Restore from: {NODE_JS}.backup")
