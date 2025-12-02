import os

# --- Optimize GraphRenderer.js ---
renderer_path = 'src/graph/GraphRenderer.js'
with open(renderer_path, 'r', encoding='utf-8') as f:
    renderer_content = f.read()

# Replace direct append with DocumentFragment in renderAllNodes
old_renderer_code = """    renderAllNodes() {
        this.controller.nodesContainer.innerHTML = '';
        for (const node of this.controller.nodes.values()) {
            this.controller.nodesContainer.appendChild(node.render());
        }
    }"""

new_renderer_code = """    renderAllNodes() {
        this.controller.nodesContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (const node of this.controller.nodes.values()) {
            fragment.appendChild(node.render());
        }
        this.controller.nodesContainer.appendChild(fragment);
    }"""

if old_renderer_code in renderer_content:
    renderer_content = renderer_content.replace(old_renderer_code, new_renderer_code)
    with open(renderer_path, 'w', encoding='utf-8') as f:
        f.write(renderer_content)
    print(f"Optimized {renderer_path}")
else:
    print(f"Could not find exact match for optimization in {renderer_path}")

# --- Optimize Node.js ---
# This is more complex as we need to find where 'element' is appended to.
# But looking at Node.js, it creates 'element' and appends 'header' and 'content' to it.
# 'element' is returned.
# The optimization here is less about the Node itself (which returns a single div) 
# and more about how the *content* of the node is built.
# However, 'header' and 'content' are just two elements. 
# The real benefit would be if 'content' has many pins.
# Let's optimize the loop where pins are added to 'content'.

node_path = 'src/graph/Node.js'
with open(node_path, 'r', encoding='utf-8') as f:
    node_content = f.read()

# Optimize pure-node pin rendering
old_pure_loop = """            this.pinsIn.forEach(pinIn => inCol.appendChild(this.renderPin(pinIn)));
            content.appendChild(inCol);

            const outCol = document.createElement('div');
            outCol.className = 'pin-column out';
            this.pinsOut.forEach(pinOut => outCol.appendChild(this.renderPin(pinOut)));
            content.appendChild(outCol);"""

new_pure_loop = """            const inFragment = document.createDocumentFragment();
            this.pinsIn.forEach(pinIn => inFragment.appendChild(this.renderPin(pinIn)));
            inCol.appendChild(inFragment);
            content.appendChild(inCol);

            const outCol = document.createElement('div');
            outCol.className = 'pin-column out';
            const outFragment = document.createDocumentFragment();
            this.pinsOut.forEach(pinOut => outFragment.appendChild(this.renderPin(pinOut)));
            outCol.appendChild(outFragment);
            content.appendChild(outCol);"""

if old_pure_loop in node_content:
    node_content = node_content.replace(old_pure_loop, new_pure_loop)
    print(f"Optimized pure-node loop in {node_path}")

# Optimize standard node pin rendering
# This loop appends rows to content.
old_std_loop = """                row.appendChild(spacer);
                }
                content.appendChild(row);
            }"""

new_std_loop = """                row.appendChild(spacer);
                }
                fragment.appendChild(row);
            }
            content.appendChild(fragment);"""

# We need to inject the fragment creation before the loop
if "const maxRows = Math.max(inLen, outLen);" in node_content:
    node_content = node_content.replace(
        "const maxRows = Math.max(inLen, outLen);", 
        "const maxRows = Math.max(inLen, outLen);\n            const fragment = document.createDocumentFragment();"
    )
    # And replace the end of the loop
    if old_std_loop in node_content:
        node_content = node_content.replace(old_std_loop, new_std_loop)
        print(f"Optimized standard node loop in {node_path}")

with open(node_path, 'w', encoding='utf-8') as f:
    f.write(node_content)
