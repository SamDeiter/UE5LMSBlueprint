"""
Update Node.js Pin Rendering to Match UE5 Reference
This script updates the createPinDot() method to render data output pins 
as SVG compound shapes (circle + arrow) matching the reference implementation.
"""

import re
from pathlib import Path

def update_node_js_pin_rendering():
    """Update Node.js to render data pins with SVG compound shapes"""
    file_path = Path('src/graph/Node.js')
    content = file_path.read_text(encoding='utf-8')
    
    # Find the createPinDot method
    # We'll add logic to create SVG compound shapes for data output pins
    
    new_data_pin_svg_method = '''
    // For data pins (non-exec), create SVG with circle + arrow
    if (pin.containerType && pin.containerType !== 'single') {
        // Container pins keep their existing icon logic
        const pinDot = document.createElement('div');
        let dotClasses = `pin-dot ${typeClass}`;
        const isConnected = pin.links.length > 0;

        if (forceHollow || !isConnected) {
            dotClasses += ' hollow';
        } else {
            dotClasses += ' connected';
        }
        pinDot.className = dotClasses;
        pinDot.title = `${pin.name} (${pin.type})`;

        pinDot.classList.add('container-pin');

        if (pin.containerType === 'array') {
            pinDot.classList.add('array-pin');
            const icon = document.createElement('i');
            icon.className = 'fas fa-th';
            icon.style.fontSize = '8px';
            icon.style.color = Utils.getPinColor(pin.type);
            pinDot.appendChild(icon);
        } else if (pin.containerType === 'set') {
            pinDot.classList.add('set-pin');
            const icon = document.createElement('span');
            icon.textContent = '{}';
            icon.style.fontSize = '8px';
            icon.style.fontWeight = 'bold';
            icon.style.color = Utils.getPinColor(pin.type);
            pinDot.appendChild(icon);
        } else if (pin.containerType === 'map') {
            pinDot.classList.add('map-pin');
            const icon = document.createElement('i');
            icon.className = 'fas fa-list-ul';
            icon.style.fontSize = '8px';
            icon.style.color = Utils.getPinColor(pin.type);
            pinDot.appendChild(icon);
        }
        
        return pinDot;
    }

    // For output data pins: Use SVG compound (circle + arrow)
    if (pin.dir === 'out') {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '26');
        svg.setAttribute('height', '12');
        svg.setAttribute('viewBox', '0 0 18 12');
        svg.classList.add('pin-dot', typeClass);
        if (forceHollow || pin.links.length === 0) {
            svg.classList.add('hollow');
        } else {
            svg.classList.add('connected');
        }
        svg.style.cursor = 'pointer';
        svg.style.overflow = 'visible';
        svg.title = `${pin.name} (${pin.type})`;

        const pinColor = Utils.getPinColor(pin.type);
        const isConnected = pin.links.length > 0;

        // Circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '6');
        circle.setAttribute('cy', '6');
        circle.setAttribute('r', '4.5');
        circle.setAttribute('fill', isConnected ? pinColor : 'transparent');
        circle.setAttribute('stroke', pinColor);
        circle.setAttribute('stroke-width', '2');
        svg.appendChild(circle);

        // Arrow (pointing right, with gap)
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrow.setAttribute('d', 'M 11.5 3 L 17 6 L 11.5 9 Z');
        arrow.setAttribute('fill', isConnected ? pinColor : 'transparent');
        arrow.setAttribute('stroke', isConnected ? 'none' : pinColor);
        arrow.setAttribute('stroke-width', isConnected ? '0' : '1');
        svg.appendChild(arrow);

        return svg;
    }

    // For input data pins: Use standard circle (with arrow in CSS)
    const pinDot = document.createElement('div');
    let dotClasses = `pin-dot ${typeClass}`;
    const isConnected = pin.links.length > 0;

    if (forceHollow || !isConnected) {
        dotClasses += ' hollow';
    } else {
        dotClasses += ' connected';
    }
    pinDot.className = dotClasses;
    pinDot.title = `${pin.name} (${pin.type})`;

    return pinDot;'''
    
    print("⚠️  Manual Update Required!")
    print()
    print("The createPinDot() method in src/graph/Node.js needs to be updated.")
    print()
    print("CURRENT LOGIC:")
    print("  1. Checks if pin.type === 'exec' → creates SVG triangle")
    print("  2. Else creates standard div pin-dot")
    print("  3. Handles container types (array, set, map)")
    print()
    print("NEW LOGIC NEEDED:")
    print("  1. If pin.type === 'exec' → create SVG triangle (keep existing)")
    print("  2. If pin.dir === 'out' AND not container → create SVG compound (circle + arrow)")
    print("  3. If pin.dir === 'in' → create standard div (keep CSS arrows)")
    print("  4. Handle container types (keep existing)")
    print()
    print("SUGGESTED IMPLEMENTATION:")
    print("-" * 70)
    print(new_data_pin_svg_method)
    print("-" * 70)
    print()
    print("Next steps:")
    print("1. Open src/graph/Node.js")
    print("2. Locate the createPinDot() method (around line 608)")
    print("3. Update the logic to match the pattern above")
    print("4. Test in browser to ensure:")
    print("   - Output pins show circle + arrow SVG")
    print("   - Input pins keep div (CSS arrows work)")
    print("   - Container pins still show icons")
    print("   - Exec pins unchanged")
    print()
    print("💡 TIP: Keep the existing code structure, just add the output pin")
    print("   SVG logic BEFORE the current pinDot creation.")
    
    # Also update CSS to hide pseudo-element arrows from SVG pins
    print()
    print("📝 CSS Update Needed:")
    print()
    print("Add to css/nodes.css:")
    print("""
/* Hide CSS arrows from SVG compound pins */
.pin-dot svg::after,
.pin-dot svg::before {
    display: none !important;
}
""")

def main():
    print("🔧 Node.js Pin Rendering Update Guide")
    print("=" * 70)
    print()
    update_node_js_pin_rendering()
    print()
    print("✅ Guide generated!")

if __name__ == '__main__':
    main()
