
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Node.js'

# Read the existing file content
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to modify render() to ensure pure-node doesn't show exec pins.
# Although syncFunctionNodes removes them, we can add a safeguard in renderPin or render.
# Also, we need to ensure the header color logic is correct (which it seems to be).

# Let's modify renderPin to hide exec pins if the node is pure-node.
# Actually, if the pin exists in this.pins, it should be rendered.
# The issue is if the node data *incorrectly* has exec pins for a pure node.
# But syncFunctionNodes handles that.

# However, let's look at `renderPin`.
# Lines 460-462:
# if (this.type === 'function-node' && pin.type === 'exec') {
#     effectiveHideLabel = true;
# }

# We should add:
# if (this.type === 'pure-node' && pin.type === 'exec') {
#     return document.createElement('div'); // Return empty div to hide it completely?
# }
# Or better, filter them out in `refreshPinCache` or `render`.

# In `render`, lines 231-242 handle `pure-node` content layout.
# It iterates `this.pinsIn` and `this.pinsOut`.
# If `this.pinsIn` contains an exec pin, it will be rendered.

# So the best place is `refreshPinCache`.
# Let's modify `refreshPinCache` to filter out exec pins if type is pure-node.

start_marker = "    refreshPinCache() {"
end_marker = "    findPinById(pinId) {"

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    new_method = """    refreshPinCache() {
        if (!this.pins) this.pins = [];
        
        // Safeguard: For pure nodes, ensure no exec pins are exposed in the cache
        // This prevents them from being rendered even if they exist in the data
        if (this.type === 'pure-node') {
            this.pinsIn = this.pins.filter(p => p.dir === 'in' && p.type !== 'exec');
            this.pinsOut = this.pins.filter(p => p.dir === 'out' && p.type !== 'exec');
        } else {
            this.pinsIn = this.pins.filter(p => p.dir === 'in');
            this.pinsOut = this.pins.filter(p => p.dir === 'out');
        }
    }
"""
    new_content = content[:start_index] + new_method + "\n" + content[end_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully updated {file_path}")
else:
    print("Could not find markers to replace content.")
