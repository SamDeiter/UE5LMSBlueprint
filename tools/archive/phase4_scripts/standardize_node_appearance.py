"""
Node Appearance Standardization Script
Applies UE5-style node appearance updates to CSS files
Based on the Event Tick reference implementation
"""

import re
from pathlib import Path

def update_variables_css():
    """Update color variables to match UE5 reference"""
    file_path = Path('css/variables.css')
    content = file_path.read_text(encoding='utf-8')
    
    # Update event header colors
    content = re.sub(
        r'--header-event-start:\s*#[0-9a-fA-F]+;',
        '--header-event-start: #750000;',
        content
    )
    content = re.sub(
        r'--header-event-end:\s*#[0-9a-fA-F]+;',
        '--header-event-end: #300000;',
        content
    )
    
    # Update float pin color to vibrant neon green
    content = re.sub(
        r'--color-float:\s*#[0-9a-fA-F]+;.*',
        '--color-float: #00EA32; /* Vibrant Neon Green (UE5 Standard) */',
        content
    )
    
    file_path.write_text(content, encoding='utf-8')
    print(f"✅ Updated {file_path}")

def update_nodes_css():
    """Update node styling to match UE5 reference"""
    file_path = Path('css/nodes.css')
    content = file_path.read_text(encoding='utf-8')
    
    # 1. Update .node container styling
    # Find the .node class and update border-radius
    content = re.sub(
        r'(\.node\s*{[^}]*?)border-radius:\s*\d+px;',
        r'\1border-radius: 12px;',
        content,
        flags=re.DOTALL
    )
    
    # Update box-shadow for double-border effect
    node_box_shadow = """box-shadow: 0 0 0 1px #000000,
                    inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                    0 10px 20px rgba(0, 0, 0, 0.5);"""
    
    content = re.sub(
        r'(\.node\s*{[^}]*?)box-shadow:[^;]+;',
        rf'\1{node_box_shadow}',
        content,
        flags=re.DOTALL
    )
    
    # 2. Enhance .node-title styling
    # Ensure glassy overlay exists
    if '/* The "Gloss" Overlay */' not in content:
        # Find .node-title::after and update or add gloss effect
        gloss_overlay = """\n/* The "Gloss" Overlay */
.node-title::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.15) 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
}"""
        
        # Insert after .node-title::before if it exists, or after .node-title
        if '.node-title::before' in content:
            content = re.sub(
                r'(\.node-title::before\s*\{[^}]+\})',
                rf'\1{gloss_overlay}',
                content,
                flags=re.DOTALL
            )
        else:
            content = re.sub(
                r'(\.node-title\s*\{[^}]+\})',
                rf'\1{gloss_overlay}',
                content,
                flags=re.DOTALL
            )
    
    # 3. Update delegate icon (event nodes)
    # Find and update .event-delegate-icon or create it
    delegate_icon_css = """\n/* Event Delegate Icon (Hollow Red Square) */
.event-delegate-icon {
    width: 10px;
    height: 10px;
    background-color: transparent; /* HOLLOW */
    border: 2px solid #ff4444;
    border-radius: 3px;
    margin-left: auto;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 2;
}"""
    
    if '.event-delegate-icon' in content:
        # Replace existing
        content = re.sub(
            r'\.event-delegate-icon\s*\{[^}]+\}',
            delegate_icon_css,
            content,
            flags=re.DOTALL
        )
    else:
        # Add after node-title styles
        content = re.sub(
            r'(\.node\.set-node \.node-title[^}]+\})',
            rf'\1{delegate_icon_css}',
            content
        )
    
    # 4. Update pin container styling for outputs
    # Ensure output column has proper right padding
    output_column_update = """/* Output pins: label on LEFT, pin on RIGHT, pushed to right side */
.pin-container.out {
    flex-direction: row;
    justify-content: flex-end;
    margin-left: auto;
    padding-right: 10px; /* Right padding for proper alignment */
}"""
    
    content = re.sub(
        r'\/\* Output pins:[^}]+\.pin-container\.out\s*\{[^}]+\}',
        output_column_update,
        content,
        flags=re.DOTALL
    )
    
    file_path.write_text(content, encoding='utf-8')
    print(f"✅ Updated {file_path}")

def main():
    print("🚀 Starting Node Appearance Standardization...")
    print()
    
    try:
        update_variables_css()
        update_nodes_css()
        
        print()
        print("✨ Standardization complete!")
        print()
        print("Next steps:")
        print("1. Open reference_event_tick.html to see the target appearance")
        print("2. Open index.html in browser to test the changes")
        print("3. Check TESTING_CHECKLIST.md and verify all items")
        print("4. Review NODE_STANDARDIZATION_PLAN.md for remaining tasks")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
