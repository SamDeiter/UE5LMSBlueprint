"""
Phase 4f: Enable Node Transparency
Updates CSS to make node backgrounds semi-transparent so wires are visible behind them.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")
VARIABLES_CSS = os.path.join(PROJECT_ROOT, "css", "variables.css")

def update_transparency():
    """Update node background transparency"""
    print("Updating node transparency...")
    
    # 1. Update Variables (if used)
    # We'll just append an override to nodes.css to be safe and immediate
    
    css_transparency = """
/* =========================================
   NODE TRANSPARENCY
   Allows wires to be seen behind nodes
   ========================================= */

/* Standard Nodes */
.node {
    /* Make background semi-transparent black */
    background-color: rgba(10, 10, 10, 0.65) !important;
    
    /* Ensure blur is active */
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
}

/* GET/Compact Nodes */
.node.compact-node,
.node.getter-node {
    /* Slightly more opaque gradient for these, but still transparent */
    background: linear-gradient(to bottom, rgba(51, 51, 51, 0.8) 0%, rgba(17, 17, 17, 0.8) 100%) !important;
    backdrop-filter: blur(6px);
}

/* SET Nodes */
.node.set-node {
    background-color: rgba(10, 10, 10, 0.65) !important;
}

/* Ensure wires are behind nodes (usually canvas is z-index 0 or 1, nodes are higher) */
/* This is handled by the DOM structure usually, but transparency makes it work visually */
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_transparency)
    
    print(f"✅ Appended transparency settings to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Node Transparency")
    print("=" * 60)
    update_transparency()
