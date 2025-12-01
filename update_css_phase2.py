"""
Phase 2: Update nodes.css with complete node styling
This script reads the current nodes.css, inserts new styling sections, and writes it back
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def read_file(path):
    """Read file content"""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    """Write file content"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def update_nodes_css():
    """Update nodes.css with selection styling, SET/capsule styles"""
    print("Updating nodes.css...")
    
    content = read_file(NODES_CSS)
    
    # 1. Add transition to .node class (find and update)
    if 'transition: box-shadow 0.1s ease;' not in content:
        content = content.replace(
            '    backdrop-filter: blur(5px);',
            '    backdrop-filter: blur(5px);\n    transition: box-shadow 0.1s ease; /* Smooth selection animation */'
        )
        print("✅ Added transition to .node")
    
    # 2. Update .node.selected styling
    old_selected = r'\.node\.selected\s*\{[^}]+\}'
    new_selected = """.node.selected {
    box-shadow: 0 0 0 2px var(--node-selection-outline),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                0 10px 20px rgba(0, 0, 0, 0.5);
    z-index: 100; /* Bring selected nodes to front */
}"""
    
    if re.search(old_selected, content):
        content = re.sub(old_selected, new_selected, content)
        print("✅ Updated .node.selected with proper styling")
    
    # 3. Add function-node, variable-node, pure-node styling if missing
    if '.node.function-node .node-title' not in content:
        # Find where to insert (after .node.flow-node .node-title)
        flow_node_pattern = r'(\.node\.flow-node \.node-title \{[^}]+\})'
        function_styles = r'''\1

.node.function-node .node-title {
    background: linear-gradient(to bottom, var(--header-function-start), var(--header-function-end));
}

.node.variable-node .node-title,
.node.pure-node .node-title {
    background: linear-gradient(to bottom, #306030, #153015);
}'''
        content = re.sub(flow_node_pattern, function_styles, content)
        print("✅ Added function-node and variable-node/pure-node styling")
    
    # 4. Add SET node styling
    if '.node.set-node .node-title' not in content:
        # Insert after pure-node styling
        set_styles = """
/* SET Node: Centered, Italic Title */
.node.set-node .node-title {
    justify-content: center;
    font-style: italic;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 1px;
}
"""
        # Find insertion point (after variable/pure node styles)
        if '.node.pure-node .node-title' in content:
            content = content.replace(
                'background: linear-gradient(to bottom, #306030, #153015);\n}',
                'background: linear-gradient(to bottom, #306030, #153015);\n}' + set_styles
            )
            print("✅ Added SET node styling")
    
    # 5. Add NODE CONTENT section if missing
    if '/* --- NODE CONTENT --- */' not in content:
        node_content_section = """
/* --- NODE CONTENT --- */
.node-content {
    padding: 4px 0;
}
"""
        # Insert before PIN LAYOUT section
        content = content.replace(
            '/* --- PIN LAYOUT --- */',
            node_content_section + '\n/* --- PIN LAYOUT --- */'
        )
        print("✅ Added NODE CONTENT section")
    
    # 6. Add capsule/GET node styling
    if '.node.compact-node,' not in content or '.node.getter-node' not in content:
        capsule_styles = """
/* --- CAPSULE/GET NODE STYLES --- */
.node.compact-node,
.node.getter-node {
    background: linear-gradient(to bottom, #333 0%, #111 100%);
    border-radius: 50px !important; /* Capsule Shape */
    padding: 4px 12px 4px 16px;
    flex-direction: row; /* Horizontal Layout */
    align-items: center;
    min-width: auto;
    gap: 8px;
}

.node.compact-node::after,
.node.getter-node::after {
    content: '';
    position: absolute;
    top: 2px; left: 2px; right: 2px; height: 45%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 100%);
    border-radius: 50px 50px 20px 20px;
    pointer-events: none;
    z-index: 0;
}

.node.compact-node .node-title,
.node.getter-node .node-title {
    display: none !important; /* No header in capsule mode */
}

.node.compact-node .node-content,
.node.getter-node .node-content {
    padding: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}

/* Selected state for Capsule Nodes */
.node.compact-node.selected,
.node.getter-node.selected {
    box-shadow: 0 0 0 2px var(--node-selection-outline),
                0 4px 10px rgba(0, 0, 0, 0.5);
}
"""
        # Insert before PIN LAYOUT section
        content = content.replace(
            '/* --- NODE CONTENT --- */',
            capsule_styles + '\n/* --- NODE CONTENT --- */'
        )
        print("✅ Added capsule/GET node styling")
    
    # Write updated content
    write_file(NODES_CSS, content)
    print(f"\n✅ Updated {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update Script - Phase 2: nodes.css")
    print("=" * 60)
    
    update_nodes_css()
    
    print("\n" + "=" * 60)
    print("✅ Phase 2 Complete: Node Styling Updated")
    print("=" * 60)
    print("\n📝 Changes made:")
    print("   - Selection transition and styling (.node.selected)")
    print("   - Function/variable/pure node headers")
    print("   - SET node centered italic title")
    print("   - Capsule/GET node horizontal layout")
    print("   - Selection styling for capsule nodes")
