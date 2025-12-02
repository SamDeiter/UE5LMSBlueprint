"""
Add arrow indicator to output data pins - as part of the pin circle
Creates a small triangle pointing into the circle from the left
"""

# Read the Node.js file
with open('src/graph/Node.js', 'r', encoding='utf-8') as f:
    content = f.read()

# First, remove the old arrow code we added
old_arrow_code = """                // Add output arrow indicator for data pins (not exec pins)
                if (pin.type !== 'exec') {
                    const arrow = document.createElement('span');
                    arrow.textContent = '►';
                    arrow.style.fontSize = '6px';
                    arrow.style.color = '#555';
                    arrow.style.marginLeft = '3px';
                    arrow.style.marginRight = '1px';
                    arrow.style.opacity = '0.7';
                    pinContainer.appendChild(arrow);
                }"""

if old_arrow_code in content:
    content = content.replace(old_arrow_code, '')
    print("✓ Removed old arrow code")

# Now modify the createPinDot function to add arrow to output data pins
# Find the section where we return pinDot for regular pins
# We need to add the arrow as a pseudo-element via CSS class

# Add a class to output data pins
old_return = """        return pinDot;
    }"""

new_return = """        // Add arrow indicator class for output data pins
        if (pin.dir === 'out' && pin.type !== 'exec') {
            pinDot.classList.add('has-output-arrow');
        }
        
        return pinDot;
    }"""

if old_return in content:
    content = content.replace(old_return, new_return)
    print("✓ Added output arrow class to data pins")
else:
    print("⚠ Could not find return statement to modify")

# Write back
with open('src/graph/Node.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Node.js updated - output pins will have arrow class!")
