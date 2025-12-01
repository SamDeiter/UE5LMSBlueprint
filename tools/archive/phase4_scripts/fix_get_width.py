"""
Phase 4m: Fix GET Node Width
Prevents GET nodes from stretching horizontally by resetting width constraints.
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def fix_get_node_width():
    """Fix GET node width stretching"""
    print("Fixing GET node width...")
    
    css_width_fix = """
/* =========================================
   GET NODE WIDTH FIX
   ========================================= */

.node.compact-node,
.node.getter-node {
    /* Prevent stretching */
    width: max-content !important;
    min-width: auto !important;
    max-width: none !important;
    
    /* Ensure flex behavior wraps content tightly */
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
    
    /* Reset padding to be compact but balanced */
    padding: 6px 16px 6px 16px !important;
}

/* Ensure content inside doesn't force expansion */
.node.compact-node .node-content,
.node.getter-node .node-content {
    width: auto !important;
    min-width: auto !important;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_width_fix)
    
    print(f"✅ Appended width fix to {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - GET Node Width")
    print("=" * 60)
    fix_get_node_width()
