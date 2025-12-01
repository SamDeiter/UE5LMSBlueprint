"""
Phase 4 (Corrected): Implement Complex Input Widgets & Fix GET Node Styling
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def update_node_js_widgets():
    """Update Node.js to handle complex widgets"""
    print("Updating Node.js for complex widgets...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update createInputWidget
    new_create_input_widget = '''    createInputWidget(pin) {
        // COMPLEX WIDGETS (Vector, Rotator, Transform)
        if (['vector', 'rotator', 'transform'].includes(pin.type)) {
            const container = document.createElement('div');
            container.className = 'ue-vector-widget';
            
            const axes = ['X', 'Y', 'Z'];
            
            axes.forEach(axis => {
                const group = document.createElement('div');
                group.className = 'val-group';
                
                const label = document.createElement('span');
                label.className = 'val-label';
                label.textContent = axis;
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'small-input';
                input.value = '0.0'; // Default
                
                input.addEventListener('mousedown', (e) => e.stopPropagation());
                input.addEventListener('focus', () => this.app.graph.isEditingLiteral = true);
                input.addEventListener('blur', () => this.app.graph.isEditingLiteral = false);
                
                group.appendChild(label);
                group.appendChild(input);
                container.appendChild(group);
            });
            
            return container;
        }

        // STANDARD WIDGETS
        let inputEl;
        const pinValue = this.pinLiterals.get(pin.id);
        const updateLiteral = (e) => {
            let newValue = e.target.value;
            if (['int', 'int64', 'byte'].includes(pin.type)) {
                newValue = parseInt(newValue) || PinDefaults.INT;
            } else if (pin.type === 'float') {
                newValue = parseFloat(newValue) || PinDefaults.FLOAT;
            } else if (pin.type === 'bool') {
                newValue = e.target.checked;
            }
            this.pinLiterals.set(pin.id, newValue);
            this.app.persistence.autoSave();
        };

        if (pin.type === 'bool') {
            inputEl = document.createElement('input');
            inputEl.type = 'checkbox';
            inputEl.className = 'ue5-checkbox';
            inputEl.checked = pinValue;
            inputEl.addEventListener('change', updateLiteral);
            inputEl.addEventListener('mousedown', (e) => e.stopPropagation());
        } else {
            inputEl = document.createElement('input');
            inputEl.type = 'text';
            inputEl.value = pinValue;
            inputEl.className = 'node-literal-input';
            const wideTypes = ['string', 'text', 'name'];
            inputEl.style.width = wideTypes.includes(pin.type) ? '80px' : '40px';
            inputEl.style.backgroundColor = 'rgba(0,0,0,0.5)';
            inputEl.style.color = '#eee';
            inputEl.style.border = '1px solid transparent';
            inputEl.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
            inputEl.style.borderRadius = '2px';
            inputEl.style.marginLeft = '5px';
            inputEl.addEventListener('change', updateLiteral);
            inputEl.addEventListener('mousedown', (e) => e.stopPropagation());

            inputEl.addEventListener('focus', () => this.app.graph.isEditingLiteral = true);
            inputEl.addEventListener('blur', () => this.app.graph.isEditingLiteral = false);
        }
        return inputEl;
    }'''

    # Use getPinsData as anchor
    pattern_widget = r'(    createInputWidget\(pin\) \{[\s\S]*?)(    getPinsData\(\) \{)'
    
    if re.search(pattern_widget, content):
        content = re.sub(pattern_widget, new_create_input_widget + '\n\n    getPinsData() {', content)
        print("✅ Replaced createInputWidget()")
    else:
        print("❌ Could not match createInputWidget pattern")
        return False

    # 2. Update renderPin layout
    render_pin_replacement = '''            if (inputWidget && inputWidget.classList.contains('ue-vector-widget')) {
                // Complex Layout: Label on top, Widget below
                pinContainer.classList.add('has-widget');
                
                const contentCol = document.createElement('div');
                contentCol.className = 'pin-content';
                
                if (!effectiveHideLabel) {
                    pinLabel.style.marginBottom = '2px';
                    contentCol.appendChild(pinLabel);
                }
                contentCol.appendChild(inputWidget);
                
                // Pin icon is already appended to pinContainer
                // We append contentCol after it
                pinContainer.appendChild(contentCol);
                
            } else {
                // Standard Layout: Horizontal
                const wrapper = document.createElement('div');
                wrapper.className = 'pin-wrapper';
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '5px';

                if (!effectiveHideLabel) wrapper.appendChild(pinLabel);
                if (inputWidget) wrapper.appendChild(inputWidget);
                pinContainer.appendChild(wrapper);
            }'''
            
    block_pattern = r'            const wrapper = document\.createElement\(\'div\'\);\n            wrapper\.className = \'pin-wrapper\';[\s\S]*?pinContainer\.appendChild\(wrapper\);'
    
    if re.search(block_pattern, content):
        content = re.sub(block_pattern, render_pin_replacement, content)
        print("✅ Updated renderPin layout logic")
    else:
        print("❌ Could not match renderPin layout block")
        return False

    with open(NODE_JS, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated {NODE_JS}")
    return True

def fix_get_node_css():
    """Remove extra border from GET nodes"""
    print("Fixing GET node CSS...")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the capsule/GET node styling
    # We want to change the box-shadow to remove the 1px black border
    
    # Current:
    # .node.compact-node.selected,
    # .node.getter-node.selected {
    #     box-shadow: 0 0 0 2px var(--node-selection-outline),
    #                 0 4px 10px rgba(0, 0, 0, 0.5);
    # }
    
    # We also need to update the base class if it has a border
    # The base class .node has a border.
    # .node.compact-node overrides border-radius but inherits border.
    
    # We should add `border: 1px solid #000;` explicitly if needed, or rely on .node
    # But the user said "Removed the extra '0 0 0 1px #000' shadow that was making it 2px thick"
    
    # Let's add a specific override for compact nodes to match reference
    
    css_fix = """
/* Fix for GET/Compact Node Border */
.node.compact-node,
.node.getter-node {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5) !important; /* Remove double border */
    border: 1px solid #000 !important;
}

.node.compact-node.selected,
.node.getter-node.selected {
    box-shadow: 0 0 0 2px var(--node-selection-outline),
                0 4px 10px rgba(0, 0, 0, 0.5) !important;
}
"""
    
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(css_fix)
        
    print(f"✅ Updated {NODES_CSS} with GET node fix")

if __name__ == "__main__":
    print("=" * 60)
    print("Phase 4 Corrected - Widgets & Styling")
    print("=" * 60)
    
    if update_node_js_widgets():
        fix_get_node_css()
        print("\n✅ All updates complete!")
        print("⚠️  REFRESH BROWSER NOW")
    else:
        print("\n❌ JS Update Failed")
