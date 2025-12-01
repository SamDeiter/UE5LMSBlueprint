"""
Phase 4g: Increase Node Transparency
Further reduces opacity to make nodes more see-through (0.65 -> 0.45)
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def increase_transparency():
    """Increase node background transparency"""
    print("Increasing node transparency...")
    
    css_transparency_v2 = """
/* =========================================
   NODE TRANSPARENCY V2 (More see-through)
   ========================================= */

/* Standard Nodes */
.node {
    /* Reduced opacity from 0.65 to 0.45 */
    background-color: rgba(10, 10, 10, 0.45) !important;
}

/* GET/Compact Nodes */
.node.compact-node,
.node.getter-node {
    /* Lighter gradient for more transparency */
    background: linear-gradient(to bottom, rgba(51, 51, 51, 0.5) 0%, rgba(17, 17, 17, 0.5) 100%) !important;
}

/* SET Nodes */
.node.set-node {
    background-color: rgba(10, 10, 10, 0.45) !important;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_transparency_v2)
    
    print(f"✅ Appended V2 transparency settings to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - More Transparency")
    print("=" * 60)
    increase_transparency()
