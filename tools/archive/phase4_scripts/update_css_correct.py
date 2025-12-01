"""
Corrected CSS Update Script - Add .pin-icon selectors to nodes.css
Based on working HTML reference pattern
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def add_pin_icon_css():
    """Add .pin-icon CSS selectors to nodes.css"""
    print("Adding .pin-icon CSS to nodes.css...")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already added
    if '.pin-icon {' in content:
        print("⚠️  .pin-icon CSS already exists, skipping...")
        return
    
    # CSS to add (insert before /* --- PIN LABELS --- */)
    pin_icon_css = """
/* --- PIN ICON WRAPPER & SVG STATE MANAGEMENT --- */
.pin-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white; /* Default, overridden by inline style */
    cursor: pointer;
}

.pin-icon svg {
    width: 100%;
    height: 100%;
    fill: transparent; /* Default: hollow */
    stroke-width: 2px;
    stroke: currentColor; /* Inherits from .pin-icon color */
}

/* CONNECTED STATE: Fill shapes */
.pin-icon.connected svg path,
.pin-icon.connected svg circle {
    fill: currentColor !important;
}

/* Exec pins: wedge sizing */
.pin-icon.exec-pin {
    width: 14px;
    height: 14px;
}

/* Data input pins: circle only */
.pin-icon:not(.data-pin-compound):not(.exec-pin):not(.container-pin) {
    width: 12px;
    height: 12px;
}

/* Data output pins: circle + arrow compound */
.pin-icon.data-pin-compound {
    width: 26px;
    height: 12px;
}

.pin-icon.data-pin-compound svg {
    overflow: visible;
}

/* Circle in compound shape */
.pin-icon.data-pin-compound .pin-circle {
    fill: transparent;
    stroke: currentColor;
    stroke-width: 2px;
}

/* Arrow in compound shape */
.pin-icon.data-pin-compound .pin-arrow {
    fill: currentColor;
    stroke: none;
}

/* When compound is CONNECTED, fill the circle too */
.pin-icon.connected .pin-circle {
    fill: currentColor !important;
}

"""
    
    # Insert before PIN LABELS section
    marker = '/* --- PIN LABELS --- */'
    if marker in content:
        content = content.replace(marker, pin_icon_css + marker)
        print("✅ Added .pin-icon CSS selectors")
    else:
        print("❌ Could not find insertion point (PIN LABELS section)")
        return False
    
    # Write back
    with open(NODES_CSS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODES_CSS}")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Pin Icon Wrappers")
    print("=" * 60)
    
    success = add_pin_icon_css()
    
    if success:
        print("\n✅ CSS update complete")
        print("\n📝 Added .pin-icon wrapper CSS for state management")
        print("   - .connected class fills SVG shapes")
        print("   - .hollow class keeps shapes transparent")
        print("   - Uses currentColor for type-specific colors")
    else:
        print("\n⚠️  CSS update skipped or failed")
