"""
Phase 4e: Final Polish for SET Node Styling
Updates the CSS for SET nodes to match the user's exact reference.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def update_set_node_css():
    """Update SET node styling to match reference"""
    print("Applying final polish to SET node styling...")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    css_override = """
/* =========================================
   FINAL SET NODE STYLING
   Matches user reference
   ========================================= */
.node.set-node .node-title {
    justify-content: center !important;
    font-style: italic !important;
    font-weight: 700 !important;
    font-size: 13px !important;
    text-shadow: 1px 1px 0 rgba(0,0,0,0.8);
    width: 100%;
    display: flex;
}

/* Ensure the header itself allows centering */
.node.set-node .node-header {
    justify-content: center !important;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_override)
    
    print(f"✅ Appended final SET node styling to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Final SET Node Polish")
    print("=" * 60)
    update_set_node_css()
