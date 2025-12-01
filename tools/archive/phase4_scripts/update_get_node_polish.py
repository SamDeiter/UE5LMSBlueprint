"""
Phase 4d: Final Polish for GET Node Styling
Updates the CSS for compact/getter nodes to match the user's exact "ue-node-get" reference.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def update_get_node_css():
    """Overwrite GET node styling with user's exact reference"""
    print("Applying final polish to GET node styling...")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will append this to the end to ensure it overrides everything else
    # or we could try to replace the existing block. Appending is safer for "overriding".
    
    # However, to keep the file clean, let's try to replace the block we added earlier if possible,
    # or just add a clearly marked "FINAL OVERRIDE" section.
    
    css_override = """
/* =========================================
   FINAL GET NODE (CAPSULE) STYLING
   Matches user reference exactly
   ========================================= */
.node.compact-node,
.node.getter-node {
    position: absolute; /* Kept from .node */
    display: flex;      /* Changed from inline-flex to flex to work with absolute positioning */
    align-items: center;
    
    /* The Dark Gradient Body */
    background: linear-gradient(to bottom, #333 0%, #111 100%) !important;
    
    /* Capsule Shape */
    border-radius: 50px !important; 
    padding: 4px 12px 4px 16px !important;
    border: 1px solid #000 !important;
    gap: 8px;
    
    /* Drop Shadow */
    box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
    
    /* Text Styling */
    font-size: 11px; 
    font-weight: 500; 
    color: white;
    min-width: auto !important;
}

/* The "Gloss" Reflection (Top Half) */
.node.compact-node::after,
.node.getter-node::after {
    content: ''; 
    position: absolute; 
    top: 2px; left: 2px; right: 2px; height: 45%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 100%);
    border-radius: 50px 50px 20px 20px; 
    pointer-events: none;
    z-index: 1; /* Ensure it sits on top */
}

/* Selected State (Orange Outline) */
.node.compact-node.selected,
.node.getter-node.selected {
     box-shadow: 0 0 0 2px var(--node-selection-outline), 0 4px 10px rgba(0,0,0,0.5) !important;
}

/* Hide the standard node title bar for these nodes if it exists */
.node.compact-node .node-title,
.node.getter-node .node-title {
    display: none !important;
}

/* Ensure content flows horizontally */
.node.compact-node .node-content,
.node.getter-node .node-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 !important;
    gap: 8px;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_override)
    
    print(f"✅ Appended final GET node styling to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Final GET Node Polish")
    print("=" * 60)
    update_get_node_css()
