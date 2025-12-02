"""
Phase 3: Update Node.js createPinDot() method to use SVG for all pins
This script carefully replaces the createPinDot method while preserving container pin logic
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def create_backup():
    """Create backup of Node.js before modifying"""
    backup_path = NODE_JS + ".backup"
    print(f"\nCreating backup: {backup_path}")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Backup created")
    return content

def update_create_pin_dot():
    """Replace createPinDot method with complete SVG implementation"""
    print("\nUpdating createPinDot() method...")
    
    content = open(NODE_JS, 'r', encoding='utf-8').read()
    
    # New createPinDot implementation
    new_method = '''    createPinDot(pin, forceHollow = false) {
        const typeClass = Utils.getPinTypeClass(pin.type);
        const pinColor = Utils.getPinColor(pin.type);
        const isConnected = pin.links.length > 0 && !forceHollow;

        // 1. EXECUTION PINS - SVG Wedge (hollow when unconnected, filled when connected)
        if (pin.type === 'exec') {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '14');
            svg.setAttribute('height', '14');
            svg.setAttribute('viewBox', '0 0 14 14');
            svg.classList.add('pin-dot', 'exec-pin', typeClass);
            if (isConnected) svg.classList.add('connected');
            else svg.classList.add('hollow');
            svg.style.cursor = 'pointer';
            svg.title = `${pin.name} (${pin.type})`;

            // Wedge shape pointing right
            const wedge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            wedge.setAttribute('d', 'M 1 1 L 10 1 L 13 7 L 10 13 L 1 13 Z');
            wedge.setAttribute('fill', isConnected ? 'white' : 'none'); // Filled when connected!
            wedge.setAttribute('stroke', 'white');
            wedge.setAttribute('stroke-width', '1.5');
            wedge.setAttribute('stroke-linejoin', 'round');

            svg.appendChild(wedge);
            return svg;
        }

        // 2. CONTAINER PINS - Keep existing div-based icons
        if (pin.containerType && pin.containerType !== 'single') {
            const pinDot = document.createElement('div');
            let dotClasses = `pin-dot ${typeClass}`;
            pinDot.className = dotClasses + (isConnected ? ' connected' : ' hollow');
            pinDot.title = `${pin.name} (${pin.type})`;
            pinDot.classList.add('container-pin');

            // Add container icons (array, set, map)
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

        // 3. OUTPUT DATA PINS - SVG Compound (Circle + Arrow)
        if (pin.dir === 'out') {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '26');
            svg.setAttribute('height', '12');
            svg.setAttribute('viewBox', '0 0 18 12');
            svg.classList.add('pin-dot', typeClass, 'data-pin-output');
            svg.classList.add(isConnected ? 'connected' : 'hollow');
            svg.style.cursor = 'pointer';
            svg.style.overflow = 'visible';
            svg.title = `${pin.name} (${pin.type})`;

            // Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '6');
            circle.setAttribute('cy', '6');
            circle.setAttribute('r', '4.5');
            circle.setAttribute('fill', isConnected ? pinColor : 'transparent');
            circle.setAttribute('stroke', pinColor);
            circle.setAttribute('stroke-width', '2');
            svg.appendChild(circle);

            // Arrow (with gap from circle)
            const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
            arrow.setAttribute('fill', isConnected ? pinColor : 'transparent');
            arrow.setAttribute('stroke', isConnected ? 'none' : pinColor);
            arrow.setAttribute('stroke-width', isConnected ? '0' : '1');
            arrow.setAttribute('class', 'pin-arrow');
            svg.appendChild(arrow);

            return svg;
        }

        // 4. INPUT DATA PINS - SVG Circle Only
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '12');
        svg.setAttribute('height', '12');
        svg.setAttribute('viewBox', '0 0 12 12');
        svg.classList.add('pin-dot', typeClass);
        svg.classList.add(isConnected ? 'connected' : 'hollow');
        svg.style.cursor = 'pointer';
        svg.title = `${pin.name} (${pin.type})`;

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '6');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        circle.setAttribute('fill', isConnected ? pinColor : 'transparent');
        circle.setAttribute('stroke', pinColor);
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);

        return svg;
    }'''
    
    # Find and replace the entire createPinDot method
    # Pattern: from "createPinDot(" to the closing "}" before "renderPin"
    pattern = r'createPinDot\(pin, forceHollow = false\) \{[\s\S]*?\n    \}\n\n    renderPin'
    
    # Check if pattern matches
    if re.search(pattern, content):
        # Replace with new method, adding back the renderPin line
        content = re.sub(pattern, new_method + '\n\n    renderPin', content)
        print("✅ Replaced createPinDot() method")
    else:
        print("❌ Pattern not found - checking alternative approach")
        # Try a simpler pattern
        pattern2 = r'(    createPinDot\(pin, forceHollow = false\) \{)([\s\S]*?)(    \}\n\n    renderPin)'
        if re.search(pattern2, content):
            content = re.sub(pattern2, new_method + r'\n\n    renderPin', content)
            print("✅ Replaced createPinDot() method (alt pattern)")
        else:
            print("❌ Could not find createPinDot method to replace!")
            return False
    
    # Write updated content
    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Update Script - Phase 3: createPinDot()")
    print("=" * 60)
    
    # Create backup
    create_backup()
    
    # Update method
    success = update_create_pin_dot()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ Phase 3 Complete: Pin Rendering Updated")
        print("=" * 60)
        print("\n📝 Changes made:")
        print("   - Exec pins: SVG wedge with connection state (hollow/filled)")
        print("   - Data output pins: SVG circle + arrow compound")
        print("   - Data input pins: SVG circle only")
        print("   - Container pins: Preserved div-based icons")
        print("\n⚠️  IMPORTANT: Refresh browser to see changes!")
    else:
        print("\n❌ Update failed - restore from backup if needed")
        print(f"   Backup location: {NODE_JS}.backup")
