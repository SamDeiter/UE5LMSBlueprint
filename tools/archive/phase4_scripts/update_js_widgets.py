"""
Phase 4: JavaScript Update - Implement Complex Input Widgets
Modifies Node.js to render multi-field widgets for Vector, Rotator, and Transform pins
"""

import os
import re

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODE_JS = os.path.join(PROJECT_ROOT, "src", "graph", "Node.js")

def update_node_js_widgets():
    """Update Node.js to handle complex widgets"""
    print("Updating Node.js for complex widgets...")
    
    with open(NODE_JS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update createInputWidget to handle complex types
    # We'll replace the entire method
    
    new_create_input_widget = '''    createInputWidget(pin) {
        // COMPLEX WIDGETS (Vector, Rotator, Transform)
        if (['vector', 'rotator', 'transform'].includes(pin.type)) {
            const container = document.createElement('div');
            container.className = 'ue-vector-widget';
            
            const axes = ['X', 'Y', 'Z'];
            // For Transform, we might want 3 rows (Location, Rotation, Scale), 
            // but usually the pin itself is split or it's a struct. 
            // If it's a single "Transform" pin with a widget, UE5 often shows just a "..." or expanded struct.
            // For this implementation, we'll assume Vector/Rotator style 3-field input.
            
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
                // TODO: Bind to actual sub-values if available
                
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
            // UE5 Style: Subtle transparent input
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

    # Replace createInputWidget
    # Pattern: from "createInputWidget(pin) {" to the end of the method (before next method or end of class)
    # This is tricky with regex. Let's assume it ends before the last closing brace of the class or next method.
    # Looking at file, createInputWidget is at the end.
    
    # We'll use a simpler replacement if possible, or just overwrite the bottom of the file if we know the structure.
    # But let's try to find the method start and replace until the end of the block.
    
    # Actually, let's just find the existing method and replace it.
    # It starts with "    createInputWidget(pin) {"
    # It ends with "        return inputEl;\n    }"
    
    pattern_widget = r'(    createInputWidget\(pin\) \{)([\s\S]*?)(    \})'
    # This might be too greedy.
    
    # Let's try to locate it by context.
    if 'createInputWidget(pin) {' in content:
        # We'll split the content, find the part, and replace.
        parts = content.split('createInputWidget(pin) {')
        pre_widget = parts[0]
        
        # The rest is the body + end of class.
        # We need to find the matching closing brace.
        # Since we're writing a script, we can just replace the known existing implementation.
        
        # Existing implementation ends with:
        #         return inputEl;
        #     }
        
        # Let's use regex with a specific end marker
        pattern = r'    createInputWidget\(pin\) \{[\s\S]*?return inputEl;\n    \}'
        
        if re.search(pattern, content):
            content = re.sub(pattern, new_method, content)
            print("✅ Replaced createInputWidget()")
        else:
            print("❌ Could not match createInputWidget pattern")
            return False
    else:
        print("❌ createInputWidget not found")
        return False

    # 2. Update renderPin to handle layout changes
    # We need to modify how the wrapper is constructed
    
    # Existing:
    #             if (!effectiveHideLabel) wrapper.appendChild(pinLabel);
    #             if (inputWidget) wrapper.appendChild(inputWidget);
    #             pinContainer.appendChild(wrapper);
    
    # New Logic:
    # If inputWidget is a .ue-vector-widget, we need vertical layout (label on top, widget below)
    # We can achieve this by checking the class of inputWidget or the pin type
    
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
            
    # Find the block to replace in renderPin
    # It's inside "if (pin.dir === 'in') {"
    
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

if __name__ == "__main__":
    print("=" * 60)
    print("JavaScript Update - Complex Widgets")
    print("=" * 60)
    update_node_js_widgets()
