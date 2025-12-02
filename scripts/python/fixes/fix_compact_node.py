import re

file_path = r'c:\Users\sam.deiter\.gemini\antigravity\scratch\UE5LMSBlueprint\graph\Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the renderCompactNode method and replace it
# Use regex to find the method boundaries
pattern = r'(    renderCompactNode\(\) \{.*?^\s{4}\})'
replacement = '''    renderCompactNode() {
        const element = document.createElement('div');
        element.id = this.id;
        element.className = `node compact-node ${this.type}`;
        element.style.left = `${this.x}px`;
        element.style.top = `${this.y}px`;

        const container = document.createElement('div');
        container.className = 'compact-node-container';

        // Ensure pins are correctly cached before accessing
        if (!this.pinsIn || !this.pinsOut) {
            this.refreshPinCache();
        }

        const pinIn = this.pinsIn[0];
        const pinOut = this.pinsOut[0];

        // 1. Left Pin (Input) - Use renderPin to support split pins
        if (pinIn) {
            const pinEl = this.renderPin(pinIn);
            // Add compact styling if not split
            if (!pinIn.isSplit && !pinIn.isConnected()) {
                const inputWidget = pinEl.querySelector('.node-literal-input, .ue5-checkbox');
                if (inputWidget) {
                    inputWidget.classList.add('compact-input-widget');
                }
            }
            container.appendChild(pinEl);
        }

        // --- INSERT LABEL ---
        const labelSpan = document.createElement('span');
        labelSpan.className = 'compact-node-label';
        // Clean up "Get_" prefix for display to match standard UI
        if (this.nodeKey.startsWith('Get_')) {
            labelSpan.textContent = this.nodeKey.substring(4);
        } else if (this.nodeKey.startsWith('GetComponent_')) {
            labelSpan.textContent = this.title.replace('Get ', '');
        } else {
            labelSpan.textContent = this.title;
        }
        container.appendChild(labelSpan);

        // 3. Right Pin (Output) - Use renderPin to support split pins
        if (pinOut) {
            const pinEl = this.renderPin(pinOut);
            container.appendChild(pinEl);
        }

        element.appendChild(container);
        this.element = element;
        return element;
    }'''

content = re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated renderCompactNode to use renderPin for split pin support')
