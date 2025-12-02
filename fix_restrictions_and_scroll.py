import os

# 1. Update GraphInteraction.js to restrict nodes
graph_interaction_path = 'graph/GraphInteraction.js'
with open(graph_interaction_path, 'r', encoding='utf-8') as f:
    interaction_content = f.read()

# Replace the PALETTE_NODE handling block
# We need to be careful with indentation and context
old_block_start = "        else if (data.startsWith('PALETTE_NODE:')) {"
old_block_end = "            this.app.persistence.autoSave();\n        }"

# Since I can't guarantee the exact content between start and end due to previous edits or whitespace,
# I'll try to locate the start and find the matching closing brace.
start_idx = interaction_content.find(old_block_start)
if start_idx != -1:
    # Find the end of this block. It ends with a closing brace for the else if.
    # We can scan for balanced braces or just look for the next "else if" or end of method.
    # The block ends before "    handleGlobalMouseMove(e) {"
    
    # Let's assume the standard structure
    # It ends with:
    #             this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
    #             this.app.persistence.autoSave();
    #         }
    
    # Let's search for the end string
    end_marker = "this.app.persistence.autoSave();"
    end_idx = interaction_content.find(end_marker, start_idx)
    
    if end_idx != -1:
        # Find the closing brace after this
        block_end_idx = interaction_content.find("}", end_idx) + 1
        
        # Extract the old block to verify
        old_block = interaction_content[start_idx:block_end_idx]
        
        new_block = """        else if (data.startsWith('PALETTE_NODE:')) {
            const nodeType = data.split(':')[1];
            console.log('PALETTE_NODE dropped:', nodeType, 'at', graphCoords);

            // RESTRICTION: Construction Script cannot have Event nodes
            if (this.app.activeGraph === 'ConstructionScript') {
                const forbiddenNodes = ['EventBeginPlay', 'EventTick', 'EventActorBeginOverlap'];
                // Also check for any node starting with 'Event' except CustomEvent?
                // For now, specific list is safer + 'Event' prefix check if needed.
                if (forbiddenNodes.includes(nodeType) || (nodeType.startsWith('Event') && nodeType !== 'CustomEvent' && nodeType !== 'EventGraph')) {
                     alert(`Cannot place ${nodeType} in Construction Script.`);
                     return;
                }
            }

            // RESTRICTION: Event Graph cannot have Construction Script node
            if (this.app.activeGraph === 'EventGraph') {
                if (nodeType === 'ConstructionScript') {
                    alert('Cannot place Construction Script node in Event Graph.');
                    return;
                }
            }

            // Special handling for NeedNode - open modal for configuration
            if (nodeType === 'NeedNode') {
                this.app.needNodeModal.open(graphCoords.x, graphCoords.y);
                return;
            }

            this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
        }"""
        
        new_content = interaction_content[:start_idx] + new_block + interaction_content[block_end_idx:]
        
        with open(graph_interaction_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Updated GraphInteraction.js to restrict nodes.")
    else:
        print("Could not find end of PALETTE_NODE block.")
else:
    print("Could not find start of PALETTE_NODE block.")

# 2. Update css/panels.css to ensure palette scrolling
# The issue might be that #palette-panel needs to flex properly.
# In index.html:
# <div id="left-sidebar-tabs"> (flex-col)
#   <div id="components-panel"> ... </div>
#   <div id="my-blueprint"> ... </div>
#   <div id="palette-panel"> ... </div>
# </div>
#
# We need #palette-panel to have flex-grow: 1 and min-height: 0 to allow scrolling inside it.
# And #palette-content needs overflow-y: auto.

css_path = 'css/panels.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Add styles for #palette-panel if not present or update them
palette_panel_css = """
#palette-panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto; /* Allow it to grow and shrink */
    min-height: 0; /* Critical for nested flex scrolling */
    overflow: hidden;
}

#palette-content {
    overflow-y: auto;
    flex: 1;
    padding-bottom: 20px; /* Extra space at bottom */
}
"""

if '#palette-panel' not in css_content:
    css_content += palette_panel_css
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Updated css/panels.css for palette scrolling.")
else:
    # If it exists, we might need to update it. 
    # But let's just append the specific overrides to be sure.
    css_content += palette_panel_css
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print("Appended palette scrolling styles to css/panels.css.")
