import os

# 1. Update GraphInteraction.js to prevent Event nodes in Construction Script
graph_interaction_path = 'graph/GraphInteraction.js'
with open(graph_interaction_path, 'r', encoding='utf-8') as f:
    interaction_content = f.read()

# We need to find where nodes are added.
# It seems GraphInteraction handles drag and drop in `handleDrop`
# But `addNode` is in `GraphController.js`.
# Let's check GraphInteraction first for the drop handler.

# Search for handleDrop
if 'handleDrop(e)' in interaction_content:
    # We want to intercept the drop logic
    # Specifically where it says: this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
    
    # We will replace the PALETTE_NODE handling block
    
    old_block = """        else if (data.startsWith('PALETTE_NODE:')) {
            const nodeType = data.split(':')[1];
            console.log('PALETTE_NODE dropped:', nodeType, 'at', graphCoords);

            // Special handling for NeedNode - open modal for configuration
            if (nodeType === 'NeedNode') {
                this.app.needNodeModal.open(graphCoords.x, graphCoords.y);
                return;
            }

            this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
            this.app.persistence.autoSave();
        }"""
    
    new_block = """        else if (data.startsWith('PALETTE_NODE:')) {
            const nodeType = data.split(':')[1];
            console.log('PALETTE_NODE dropped:', nodeType, 'at', graphCoords);

            // RESTRICTION: Construction Script cannot have Event nodes (except custom events maybe, but definitely not BeginPlay/Tick)
            if (this.app.activeGraph === 'ConstructionScript') {
                const forbiddenNodes = ['EventBeginPlay', 'EventTick', 'EventActorBeginOverlap'];
                if (forbiddenNodes.includes(nodeType)) {
                    alert(`Cannot place ${nodeType} in Construction Script.`);
                    return;
                }
                // Also check if it's an event node generally, if we can access registry
                const def = this.app.nodeRegistry ? this.app.nodeRegistry.get(nodeType) : null;
                if (def && def.type === 'event-node' && nodeType !== 'CustomEvent') {
                     // Allow CustomEvent? UE5 allows some events but not gameplay lifecycle events.
                     // For now, explicit ban is safer.
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

    if old_block in interaction_content:
        interaction_content = interaction_content.replace(old_block, new_block)
        with open(graph_interaction_path, 'w', encoding='utf-8') as f:
            f.write(interaction_content)
        print("Updated GraphInteraction.js to restrict nodes in Construction Script.")
    else:
        # Fallback: try to find a smaller chunk if whitespace mismatches
        print("Could not find exact match for PALETTE_NODE block in GraphInteraction.js")
        # Let's try a regex or just manual replacement if we were editing manually.
        # Since I can't see the file content perfectly with whitespace, I'll try to be more flexible.
        # But wait, I haven't read GraphInteraction.js in this turn, only in previous turn.
        # I should read it to be sure.
        pass

# 2. Update css/panels.css to ensure palette scrolling
# I already saw it has overflow-y: auto.
# But maybe the container height is not constrained properly.
# #palette-content needs a height or flex-grow to scroll.
# In layout.css, #left-sidebar-tabs has flex-grow: 1 and overflow: hidden.
# #palette-content is inside that? No, let's check index.html structure.

