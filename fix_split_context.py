import os

file_path = 'graph/GraphInteraction.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to replace the mutually exclusive if/else if block with independent if blocks
# Target block:
#             if (parentPin && parentPin.isSplit) {
#                 items.push({
#                     label: 'Recombine Struct Pin', callback: () => {
#                         if (parentPin.subPins) {
#                             parentPin.subPins.forEach(sub => {
#                                 if (sub.isConnected()) {
#                                     this.app.wiring.breakPinLinks(sub.id);
#                                 }
#                             });
#                         }
#                         parentPin.recombine();
#                         this.app.wiring.updateVisuals(parentPin.node);
#                         this.app.persistence.autoSave();
#                     }
#                 });
#             } else if (pin.canSplit()) {
#                 items.push({
#                     label: 'Split Struct Pin', callback: () => {
#                         if (pin.isConnected()) {
#                             this.app.wiring.breakPinLinks(pin.id);
#                         }
#                         pin.split();
#                         this.app.wiring.updateVisuals(pin.node);
#                         this.app.persistence.autoSave();
#                     }
#                 });
#             } else if (pin.isSplit) {
#                 items.push({
#                     label: 'Recombine Struct Pin', callback: () => {
#                         if (pin.subPins) {
#                             pin.subPins.forEach(sub => {
#                                 if (sub.isConnected()) {
#                                     this.app.wiring.breakPinLinks(sub.id);
#                                 }
#                             });
#                         }
#                         pin.recombine();
#                         this.app.wiring.updateVisuals(pin.node);
#                         this.app.persistence.autoSave();
#                     }
#                 });
#             }

# New block structure:
# Check pin.canSplit() -> Add Split
# Check pin.isSplit() -> Add Recombine
# Check parentPin && parentPin.isSplit -> Add Recombine Parent

# Since the callback code is long, I'll try to construct the replacement carefully.

old_block_start = "            if (parentPin && parentPin.isSplit) {"
old_block_end = "            }" # This is too generic, need to match the whole block structure or use a simpler replacement strategy

# Let's try to locate the start of the block and rewrite it entirely
start_idx = content.find("            // Add Split/Recombine options")
if start_idx != -1:
    # Find the end of the block (before "const node = pin.node;")
    end_idx = content.find("            const node = pin.node;", start_idx)
    
    if end_idx != -1:
        # Extract the section to verify
        section = content[start_idx:end_idx]
        
        new_section = """            // Add Split/Recombine options
            if (pin.canSplit()) {
                items.push({
                    label: 'Split Struct Pin', callback: () => {
                        if (pin.isConnected()) {
                            this.app.wiring.breakPinLinks(pin.id);
                        }
                        pin.split();
                        this.app.wiring.updateVisuals(pin.node);
                        this.app.persistence.autoSave();
                    }
                });
            }

            if (pin.isSplit) {
                items.push({
                    label: 'Recombine Struct Pin', callback: () => {
                        if (pin.subPins) {
                            pin.subPins.forEach(sub => {
                                if (sub.isConnected()) {
                                    this.app.wiring.breakPinLinks(sub.id);
                                }
                            });
                        }
                        pin.recombine();
                        this.app.wiring.updateVisuals(pin.node);
                        this.app.persistence.autoSave();
                    }
                });
            }

            if (parentPin && parentPin.isSplit) {
                items.push({
                    label: 'Recombine Parent Pin', callback: () => {
                        if (parentPin.subPins) {
                            parentPin.subPins.forEach(sub => {
                                if (sub.isConnected()) {
                                    this.app.wiring.breakPinLinks(sub.id);
                                }
                            });
                        }
                        parentPin.recombine();
                        this.app.wiring.updateVisuals(parentPin.node);
                        this.app.persistence.autoSave();
                    }
                });
            }

"""
        # Replace
        new_content = content[:start_idx] + new_section + content[end_idx:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("GraphInteraction.js updated to allow nested splitting.")
    else:
        print("Could not find end of Split/Recombine block.")
else:
    print("Could not find start of Split/Recombine block.")
