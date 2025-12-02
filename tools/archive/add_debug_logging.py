
import os
import re

file_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\src\graph\Node.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add debug logging to constructor
constructor_debug = r"""
        this.customData = nodeData.customData || {};

        if (this.nodeKey.startsWith('Set_') || this.nodeKey === 'EventBeginPlay') {
            console.group(`[Node Debug] ${this.nodeKey} (${this.id})`);
            console.log('Input nodeData.pins:', JSON.parse(JSON.stringify(nodeData.pins || [])));
        }

        let pinDataArray = nodeData.pins || [];
"""

content = content.replace('this.customData = nodeData.customData || {};\n\n        let pinDataArray = nodeData.pins || [];', constructor_debug.strip())

# Add debug logging after recovery
recovery_debug = r"""
        // --- NUCLEAR OPTION: Force Restore Critical Pins if still missing ---
        if (this.nodeKey === 'EventBeginPlay') {
            const hasExecOut = pinDataArray.some(p => p.type === 'exec' && p.dir === 'out');
            if (!hasExecOut) {
                console.warn('[Node Debug] Force restoring EventBeginPlay Exec Out');
                pinDataArray.push({ id: "exec_out", name: "Exec", type: "exec", dir: "out" });
            }
            this.type = "event-node";
            this.title = "Event BeginPlay";
            this.icon = "fa-play";
        }

        if (this.nodeKey.startsWith('Set_')) {
            const hasExecIn = pinDataArray.some(p => p.type === 'exec' && p.dir === 'in');
            const hasExecOut = pinDataArray.some(p => p.type === 'exec' && p.dir === 'out');
            
            if (!hasExecIn) {
                console.warn('[Node Debug] Force restoring Set Node Exec In');
                pinDataArray.unshift({ id: "exec_in", name: "Exec", type: "exec", dir: "in" });
            }
            if (!hasExecOut) {
                console.warn('[Node Debug] Force restoring Set Node Exec Out');
                pinDataArray.push({ id: "exec_out", name: "Exec", type: "exec", dir: "out" });
            }
            this.type = "variable-node";
        }

        if (this.nodeKey.startsWith('Set_') || this.nodeKey === 'EventBeginPlay') {
            console.log('Final pinDataArray:', JSON.parse(JSON.stringify(pinDataArray)));
            console.groupEnd();
        }
"""

# Replace the existing Nuclear Option block with the debug version
# We need to be careful with matching. I'll match the start of the block.
start_marker = "// --- NUCLEAR OPTION: Force Restore Critical Pins if still missing ---"
end_marker = "this.pins = pinDataArray.map(p => new Pin(this, p));"

# Regex to replace the block
pattern = re.escape(start_marker) + r".*?" + re.escape(end_marker)
replacement = recovery_debug.strip() + "\n\n        " + end_marker

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Add debug logging to renderSetNode
render_set_debug = r"""
    renderSetNode() {
        if (this.nodeKey.startsWith('Set_')) {
             console.log(`[Render Debug] Rendering Set Node ${this.id}`, {
                 pinsIn: this.pinsIn,
                 pinsOut: this.pinsOut
             });
        }
        const element = document.createElement('div');
"""
content = content.replace('renderSetNode() {\n        const element = document.createElement(\'div\');', render_set_debug.strip())

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
