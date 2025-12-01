"""
Fix SET node layout to match UE5 style:
- Left side: Pin, Label, Input widget (in that order)
- Right side: Just the output pin (no label)
- Output pin should be inside node bounds
"""

import os

NODE_JS_FILE = os.path.join(os.path.dirname(__file__), 'src', 'graph', 'Node.js')

# Read the file
with open(NODE_JS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the SET node pin row section
old_section = """        // 3. Variable Pins Row (Input on Left, Output on Right)
        const pinIn = this.pinsIn ? this.pinsIn.find(p => p.type !== 'exec') : null;
        const pinOut = this.pinsOut ? this.pinsOut.find(p => p.type !== 'exec') : null;

        if (pinIn || pinOut) {
            const pinRow = document.createElement('div');
            pinRow.className = 'pin-wrapper';
            pinRow.style.display = 'flex';
            pinRow.style.justifyContent = 'space-between';
            pinRow.style.alignItems = 'center';
            pinRow.style.width = '100%';

            // Left side (Input)
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';

            if (pinIn) {
                leftContainer.appendChild(this.renderPin(pinIn, true));
            }
            pinRow.appendChild(leftContainer);

            // Center Label
            const label = document.createElement('span');
            label.className = 'pin-label-in';
            label.innerText = pinIn ? pinIn.name : (pinOut ? pinOut.name : 'Variable');
            label.style.flex = '1';
            label.style.textAlign = 'center';
            pinRow.appendChild(label);

            // Right side (Output)
            const rightContainer = document.createElement('div');
            rightContainer.style.display = 'flex';
            rightContainer.style.alignItems = 'center';

            if (pinOut) {
                rightContainer.appendChild(this.renderPin(pinOut, true));
            }
            pinRow.appendChild(rightContainer);

            content.appendChild(pinRow);
        }"""

new_section = """        // 3. Variable Pins Row (Input on Left with Label, Output on Right)
        const pinIn = this.pinsIn ? this.pinsIn.find(p => p.type !== 'exec') : null;
        const pinOut = this.pinsOut ? this.pinsOut.find(p => p.type !== 'exec') : null;

        if (pinIn || pinOut) {
            const pinRow = document.createElement('div');
            pinRow.className = 'pin-wrapper';
            pinRow.style.display = 'flex';
            pinRow.style.justifyContent = 'space-between';
            pinRow.style.alignItems = 'center';
            pinRow.style.width = '100%';

            // Left side: Input pin + Label + Input widget
            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';
            leftContainer.style.gap = '4px';
            leftContainer.style.flex = '1';

            if (pinIn) {
                leftContainer.appendChild(this.renderPin(pinIn, false)); // Show label and input
            }
            pinRow.appendChild(leftContainer);

            // Right side: Output pin only (no label)
            const rightContainer = document.createElement('div');
            rightContainer.style.display = 'flex';
            rightContainer.style.alignItems = 'center';

            if (pinOut) {
                rightContainer.appendChild(this.renderPin(pinOut, true)); // Hide label
            }
            pinRow.appendChild(rightContainer);

            content.appendChild(pinRow);
        }"""

content = content.replace(old_section, new_section)

# Write back
with open(NODE_JS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed SET node layout")
print("  - Left: Pin + Label + Input widget")
print("  - Right: Output pin only (no label)")
