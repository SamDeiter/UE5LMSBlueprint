"""
Fix Node.js renderPin to add output arrows
Adds small arrow indicators (►) next to output data pins
"""

import re

# Read the Node.js file
with open('src/graph/Node.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the renderPin function and modify it to add arrows for output pins
# We need to add the arrow after the label for output pins

# Find the section where we append pinLabel for output pins
# Looking for: if (pin.dir === 'out') { ... pinContainer.appendChild(pinLabel); ... }

# The pattern we're looking for is around line 730-732
old_pattern = r"(        } else \{\s+if \(!effectiveHideLabel\) pinContainer\.appendChild\(pinLabel\);\s+pinContainer\.appendChild\(pinDot\);)"

new_code = """        } else {
            if (!effectiveHideLabel) {
                pinContainer.appendChild(pinLabel);
                // Add output arrow indicator for data pins (not exec pins)
                if (pin.type !== 'exec') {
                    const arrow = document.createElement('span');
                    arrow.textContent = '►';
                    arrow.style.fontSize = '8px';
                    arrow.style.color = '#666';
                    arrow.style.marginLeft = '2px';
                    arrow.style.marginRight = '2px';
                    pinContainer.appendChild(arrow);
                }
            }
            pinContainer.appendChild(pinDot);"""

# Try to replace
if re.search(old_pattern, content, re.MULTILINE):
    content = re.sub(old_pattern, new_code, content, flags=re.MULTILINE)
    print("✓ Modified renderPin to add output arrows")
else:
    print("⚠ Pattern not found, trying alternative approach...")
    # Alternative: find the exact lines
    lines = content.split('\n')
    modified = False
    for i in range(len(lines) - 3):
        if ('} else {' in lines[i] and 
            'if (!effectiveHideLabel) pinContainer.appendChild(pinLabel);' in lines[i+1] and
            'pinContainer.appendChild(pinDot);' in lines[i+2]):
            # Found it! Replace these lines
            indent = '            '
            lines[i] = '        } else {'
            lines[i+1] = '            if (!effectiveHideLabel) {'
            lines.insert(i+2, f'{indent}    pinContainer.appendChild(pinLabel);')
            lines.insert(i+3, f'{indent}    // Add output arrow indicator for data pins (not exec pins)')
            lines.insert(i+4, f'{indent}    if (pin.type !== \'exec\') {{')
            lines.insert(i+5, f'{indent}        const arrow = document.createElement(\'span\');')
            lines.insert(i+6, f'{indent}        arrow.textContent = \'►\';')
            lines.insert(i+7, f'{indent}        arrow.style.fontSize = \'8px\';')
            lines.insert(i+8, f'{indent}        arrow.style.color = \'#666\';')
            lines.insert(i+9, f'{indent}        arrow.style.marginLeft = \'2px\';')
            lines.insert(i+10, f'{indent}        arrow.style.marginRight = \'2px\';')
            lines.insert(i+11, f'{indent}        pinContainer.appendChild(arrow);')
            lines.insert(i+12, f'{indent}    }}')
            lines.insert(i+13, f'{indent}}}')
            # Remove the old line that's now at i+14
            del lines[i+14]
            content = '\n'.join(lines)
            modified = True
            print("✓ Modified renderPin to add output arrows (alternative method)")
            break
    
    if not modified:
        print("✗ Could not find the pattern to modify")

# Write back
with open('src/graph/Node.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Node.js updated - output data pins will now show arrows!")
print("📁 File: src/graph/Node.js")
