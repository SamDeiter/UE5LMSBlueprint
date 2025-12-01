"""
Phase 4l: Polish GET Node Gloss & Gradient
Updates GET node styling to match the glossy, colored gradient reference.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def polish_get_node_gloss():
    """Polish GET node gloss and gradient"""
    print("Polishing GET node gloss and gradient...")
    
    css_polish = """
/* =========================================
   GET NODE GLOSS & GRADIENT POLISH
   ========================================= */

.node.compact-node,
.node.getter-node {
    /* Default background (will be overridden by JS for specific colors) */
    background: linear-gradient(to bottom, #333 0%, #000 100%) !important;
    position: relative;
    overflow: hidden; /* Ensure gloss stays inside */
    border: 1px solid rgba(0,0,0,0.8) !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5) !important;
}

/* Sharper Gloss Overlay */
.node.compact-node::after,
.node.getter-node::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to bottom, 
        rgba(255, 255, 255, 0.4) 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        rgba(255, 255, 255, 0.0) 100%) !important;
    border-radius: 50px 50px 20px 20px;
    pointer-events: none;
    z-index: 2;
}

/* Text Centering */
.node.compact-node .node-content,
.node.getter-node .node-content {
    justify-content: center !important; /* Center content */
    padding-right: 24px !important; /* Balance the pin width on the right */
}

/* Pin Positioning */
.node.compact-node .pin-wrapper,
.node.getter-node .pin-wrapper {
    position: absolute;
    right: 8px;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_polish)
    
    print(f"✅ Appended gloss polish to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - GET Node Gloss")
    print("=" * 60)
    polish_get_node_gloss()
