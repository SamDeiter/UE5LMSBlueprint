"""
Phase 1 & 2: Update CSS Variables and Node Styling for UE5 Blueprint Nodes
This script updates both variables.css and nodes.css with the complete UE5 color palette and node styling
"""

import os

# Get the project root directory
PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
VARIABLES_CSS = os.path.join(PROJECT_ROOT, "css", "variables.css")
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def update_variables_css():
    """Update css/variables.css with complete UE5 color palette"""
    print("Updating variables.css...")
    
    content = """/* --- GLOBAL STYLES & LAYOUT --- */
:root {
    /* General Theme */
    --color-bg-dark: #151515;
    --color-bg-medium: #262626;
    --color-bg-light: #333333;
    --color-text-main: #e0e0e0;
    --color-accent-blue: #0077D8;
    --color-border: #111;
    --color-selection: rgba(255, 165, 0, 0.5);
    --color-comment: rgba(255, 255, 255, 0.05);
    --color-reroute: #FFFFFF;
    --color-breakpoint: #FF4444;

    /* Selection Outline (UE5 Golden Orange) */
    --node-selection-outline: #F0B000;

    /* Node Header Gradients - Event & Flow Control */
    --header-event-start: #750000;
    --header-event-end: #300000;
    --header-flow-start: #404040;
    --header-flow-end: #202020;
    --header-function-start: #004060;
    --header-function-end: #002030;
    --header-macro-start: #505050;
    --header-macro-end: #282828;

    /* Additional Header Gradients - Function Types */
    --header-function-blue: linear-gradient(to bottom, #005075 0%, #002535 100%); /* Impure Functions */
    --header-pure-green: linear-gradient(to bottom, #407500 0%, #152500 100%);    /* Pure Functions */
    --header-flow-gray: linear-gradient(to bottom, #505050 0%, #1A1A1A 100%);     /* Flow Control */

    /* Header Gradients for SET Nodes (Variable Type-Based) */
    --header-float-green: linear-gradient(to bottom, #38E056 0%, #155720 100%);
    --header-object-blue: linear-gradient(to bottom, #005A8E 0%, #00253E 100%);
    --header-int-green: linear-gradient(to bottom, #38E056 0%, #155720 100%);
    --header-string-magenta: linear-gradient(to bottom, #E030E0 0%, #600060 100%);
    --header-vector-gold: linear-gradient(to bottom, #FFC700 0%, #6B5400 100%);
    --header-transform-orange: linear-gradient(to bottom, #FF6600 0%, #662900 100%);

    /* Pin Colors (Authentic UE5 Palette) */
    --color-exec: #FFFFFF;
    --color-bool: #920101; /* Dark Red */
    --color-byte: #0065CA; /* Deep Blue */
    --color-int: #18E1A6; /* Cyan/Teal */
    --color-int64: #76D37E;
    --color-float: #00EA32; /* Vibrant Neon Green (UE5 Standard) */
    --color-double: #4A90E2;
    --color-name: #C966E3; /* Lavender */
    --color-string: #FF00FF; /* Magenta */
    --color-text: #E27696; /* Pinkish */
    --color-vector: #FFC700; /* Gold */
    --color-rotator: #9999FF; /* Purple */
    --color-transform: #FF6600; /* Orange */
    --color-object: #00A8E8; /* Cyan Blue */
    --color-class: #5800A0; /* Purple */
    --color-enum: #0065CA;
    
    --color-dev-yellow: #FFC72C;
    --color-dev-black: #202020;
    --color-array-dim: 2px;
}
"""
    
    with open(VARIABLES_CSS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {VARIABLES_CSS}")
    print("   - Added selection outline color (#F0B000)")
    print("   - Added all header gradients (function-blue, pure-green, flow-gray, SET variants)")
    print("   - Updated pin colors (rotator, transform, object)")

def create_backup():
    """Create backup of nodes.css before modifying"""
    backup_path = NODES_CSS + ".backup"
    print(f"\nCreating backup: {backup_path}")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Backup created")
    return content

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update Script - Phase 1 & 2")
    print("=" * 60)
    
    # Phase 1: Update variables.css
    update_variables_css()
    
    # Create backup of nodes.css
    nodes_css_original = create_backup()
    
    print("\n" + "=" * 60)
    print("✅ Phase 1 Complete: CSS Variables Updated")
    print("=" * 60)
    print("\n⚠️  Phase 2 (nodes.css modifications) will be done")
    print("   in a separate pass to ensure accuracy.")
    print("\n📝 Backup created at: css/nodes.css.backup")
