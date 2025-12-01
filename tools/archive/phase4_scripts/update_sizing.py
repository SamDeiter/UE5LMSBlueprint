"""
Phase 4i: Increase Node Sizing
Increases min-width and padding for all nodes to match UE5 scale.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def update_node_sizing():
    """Increase node dimensions"""
    print("Increasing node sizing...")
    
    css_sizing = """
/* =========================================
   NODE SIZING UPDATE
   ========================================= */

/* Standard Nodes */
.node {
    min-width: 220px !important; /* Increased from 160px */
}

/* SET Nodes */
.node.set-node {
    min-width: 180px !important; /* Slightly smaller but still substantial */
}

/* Header Sizing */
.node-header {
    height: 32px !important; /* Increased from 24px */
    padding: 0 12px !important;
}

.node-title {
    font-size: 14px !important; /* Larger title text */
}

/* Body Padding */
.node-content {
    padding: 12px 0 14px 0 !important;
}

/* Pin Row Spacing */
.pin-wrapper {
    min-height: 24px !important; /* Taller rows */
    gap: 10px !important;
}

.pin-label-in,
.pin-label-out {
    font-size: 12px !important; /* Larger labels */
}

/* GET Nodes - Keep compact but slightly larger */
.node.compact-node,
.node.getter-node {
    padding: 6px 16px 6px 20px !important;
    font-size: 12px !important;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_sizing)
    
    print(f"✅ Appended sizing updates to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Node Sizing")
    print("=" * 60)
    update_node_sizing()
