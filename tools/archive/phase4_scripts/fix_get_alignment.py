"""
Phase 4k: Fix GET Node Pin Alignment
Pushes the output pin to the far right edge of the capsule.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def fix_get_node_alignment():
    """Fix alignment of pins in GET nodes"""
    print("Fixing GET node pin alignment...")
    
    css_alignment = """
/* =========================================
   GET NODE ALIGNMENT FIX
   ========================================= */

/* Ensure the node content stretches to fill the capsule */
.node.compact-node .node-content,
.node.getter-node .node-content {
    width: 100%;
    justify-content: space-between !important; /* Push text left, pin right */
}

/* Target the pin wrapper inside compact nodes */
.node.compact-node .pin-wrapper,
.node.getter-node .pin-wrapper {
    margin-left: auto !important; /* Push pin to the far right */
    padding-left: 12px; /* Add spacing between text and pin */
}

/* Ensure the label stays on the left */
.node.compact-node .compact-node-label,
.node.getter-node .compact-node-label {
    margin-right: auto;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_alignment)
    
    print(f"✅ Appended alignment fix to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - GET Node Alignment")
    print("=" * 60)
    fix_get_node_alignment()
