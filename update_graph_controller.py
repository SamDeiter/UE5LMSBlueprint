
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\GraphController.js'

# Read the existing file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to add logic to manage LocalVariablesController when loading state.
# Specifically, in loadState, we should check if we are in a function graph and update local variables.

# But GraphController doesn't seem to have direct reference to LocalVariablesController.
# It's likely on `this.app.localVariables`.

# Let's find loadState method
start_marker = "    loadState(state) {"
end_marker = "    findPinById(pinId) {"

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    # We will inject the logic at the end of loadState, before the closing brace of the method.
    # Actually, let's rewrite loadState to include the new logic.
    
    # We need to know if the current active graph is a function.
    # this.app.activeGraph holds the name.
    
    new_load_state = """    loadState(state) {
        // Ensure state is an object, or default to an empty object
        const safeState = state || {};
        const safeNodes = safeState.nodes || [];
        const safeLinks = safeState.links || [];

        // Clear existing state
        this.nodes.clear();
        this.app.wiring.links.clear();
        this.clearSelection();
        this.app.wiring.clearLinkSelection();

        // 1. Load Nodes
        safeNodes.forEach((nodeData) => {
            const template = nodeRegistry.get(nodeData.nodeKey);
            
            // Dynamic Node Handling (Functions/Macros) if template is missing
            let dynamicTemplate = null;
            if (!template) {
                if (nodeData.nodeKey.startsWith('Func_')) {
                    const funcName = nodeData.nodeKey.replace('Func_', '');
                    const funcDef = this.app.functionRegistry.getAll().find(f => f.name === funcName);
                    if (funcDef) {
                        dynamicTemplate = {
                            title: `Call ${funcName}`,
                            type: funcDef.isPure ? 'pure-node' : 'function-node',
                            category: 'Function',
                            icon: 'f',
                            pins: [] // Pins will be handled by sync or saved data
                        };
                        // We rely on saved pins for dynamic nodes usually, or sync logic
                    }
                }
            }

            const effectiveTemplate = template || dynamicTemplate;

            if (!effectiveTemplate) {
                console.warn(`Skipping node during load: Key '${nodeData.nodeKey}' not found in NodeRegistry.`);
                return;
            }

            // Determine the final pin definition to use: saved pins (for dynamic nodes) or template pins (for static nodes)
            let pinsToLoad = effectiveTemplate.pins || [];

            // If the node is a Custom Event (or other dynamic node) AND saved pins exist
            if (nodeData.nodeKey === 'CustomEvent') {
                // Check if saved pins contains custom pins (more than the base exec/delegate pins)
                const hasCustomPins = nodeData.pins && nodeData.pins.some(p => p.isCustom);
                if (hasCustomPins) {
                    pinsToLoad = nodeData.pins;
                }
            } else if (nodeData.nodeKey.startsWith('Func_') && nodeData.pins) {
                // Function call pins may change. We should handle merging the template and saved pins if needed, 
                // but for simplicity here, we assume if we have saved pins, we use them to restore literal values/structure if dynamic.
                pinsToLoad = nodeData.pins;
            }

            const fullNodeData = { ...effectiveTemplate, ...nodeData, pins: pinsToLoad };
            const node = new Node(nodeData.id, fullNodeData, nodeData.x, nodeData.y, nodeData.nodeKey, this.app);
            this.nodes.set(node.id, node);

            // Restore literal values
            if (nodeData.pins) {
                nodeData.pins.forEach(savedPin => {
                    // Normalize saved pin ID to match the runtime Pin ID format
                    const fullPinId = savedPin.id.includes(node.id) ? savedPin.id : `${node.id}-${savedPin.id}`;
                    const pin = node.findPinById(fullPinId);

                    if (pin && savedPin.literalValue !== undefined) {
                        node.pinLiterals.set(pin.id, savedPin.literalValue);
                    } else if (pin) {
                        // Ensure a default is set if literalValue was missing or undefined
                        node.pinLiterals.set(pin.id, pin.defaultValue);
                    }
                });
            }
        });

        // 2. Load Links
        safeLinks.forEach(linkData => {
            const startPin = this.findPinById(linkData.startPinId);
            const endPin = this.findPinById(linkData.endPinId);

            if (startPin && endPin) {
                const link = { id: linkData.id, startPin, endPin };
                this.app.wiring.links.set(link.id, link);
                startPin.links.push(link.id);
                endPin.links.push(link.id);
            } else {
                console.warn(`Skipping link during load due to missing pin: ${linkData.id}`);
            }
        });

        // 3. Render and Redraw
        this.renderAllNodes();
        this.drawAllWires();

        // 4. Restore Pan/Zoom
        if (safeState.pan) this.pan = safeState.pan;
        if (safeState.zoom) this.zoom = safeState.zoom;
        this.updateTransform();

        // 5. Update Local Variables Context
        if (this.app.localVariables) {
            const func = this.app.functionRegistry.getAll().find(f => f.name === this.app.activeGraph);
            if (func) {
                this.app.localVariables.setContext(func);
            } else {
                this.app.localVariables.clearContext();
            }
        }
        
        // 6. Sync Function Nodes (Entry/Result) if in a function graph
        const func = this.app.functionRegistry.getAll().find(f => f.name === this.app.activeGraph);
        if (func && this.app.functionsController) {
            this.app.functionsController.syncFunctionNodes(func);
        }
    }
"""
    # Replace the method
    # We need to be careful about the exact string match for replacement.
    # The original method content is quite long.
    
    # Instead of string replacement, let's use the indices.
    # But we need to make sure we capture the closing brace of the method correctly.
    
    # The end_marker is the start of the NEXT method.
    # So we replace everything from start_marker up to end_marker (exclusive) with new_load_state + "\n\n"
    
    new_content = content[:start_index] + new_load_state + "\n\n" + content[end_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated {file_path}")
else:
    print("Could not find markers to replace content.")
