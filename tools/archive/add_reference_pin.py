"""
Add Reference Pin JS Logic
- Updates Pin.js to add isReference property
- Updates Node.js to apply reference-pin class in createPinDot()
"""
import re

# --- Update Pin.js ---
pin_js_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Pin.js"

with open(pin_js_path, 'r', encoding='utf-8') as f:
    pin_content = f.read()

# Add isReference property after isCustom (line 17-18 area)
old_pin_constructor = """        this.isCustom = pinData.isCustom || false;
        this.isSplit = pinData.isSplit || false;"""

new_pin_constructor = """        this.isCustom = pinData.isCustom || false;
        this.isReference = pinData.isReference || pinData.byRef || false;  // Pass-by-reference diamond pin
        this.isSplit = pinData.isSplit || false;"""

if old_pin_constructor in pin_content:
    pin_content = pin_content.replace(old_pin_constructor, new_pin_constructor)
    print("✅ Pin.js: Added isReference property to constructor")
else:
    print("❌ Pin.js: Could not find target constructor block")

with open(pin_js_path, 'w', encoding='utf-8') as f:
    f.write(pin_content)

# --- Update Node.js ---
node_js_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\Node.js"

with open(node_js_path, 'r', encoding='utf-8') as f:
    node_content = f.read()

# Add reference-pin class logic after the map container handling (around line 496)
old_createPinDot = """      } else if (pin.containerType === "map") {
        pinDot.classList.add("map-pin");
        const icon = document.createElement("i");
        icon.className = "fas fa-list-ul";
        icon.style.fontSize = "8px";
        icon.style.color = Utils.getPinColor(pin.type);
        pinDot.appendChild(icon);
      }
    }

    return pinDot;"""

new_createPinDot = """      } else if (pin.containerType === "map") {
        pinDot.classList.add("map-pin");
        const icon = document.createElement("i");
        icon.className = "fas fa-list-ul";
        icon.style.fontSize = "8px";
        icon.style.color = Utils.getPinColor(pin.type);
        pinDot.appendChild(icon);
      }
    }

    // Handle reference pins (pass-by-reference diamond shape)
    if (pin.isReference) {
      pinDot.classList.add("reference-pin");
    }

    return pinDot;"""

if old_createPinDot in node_content:
    node_content = node_content.replace(old_createPinDot, new_createPinDot)
    print("✅ Node.js: Added reference-pin class logic to createPinDot()")
else:
    print("❌ Node.js: Could not find target createPinDot block")

# Also add isReference to serializePin for persistence
old_serialize = """      containerType: pin.containerType,
      literalValue: this.pinLiterals.get(pin.id),
      isCustom: pin.isCustom,
      isSplit: pin.isSplit,"""

new_serialize = """      containerType: pin.containerType,
      literalValue: this.pinLiterals.get(pin.id),
      isCustom: pin.isCustom,
      isReference: pin.isReference,
      isSplit: pin.isSplit,"""

if old_serialize in node_content:
    node_content = node_content.replace(old_serialize, new_serialize)
    print("✅ Node.js: Added isReference to serializePin()")
else:
    print("❌ Node.js: Could not find serializePin block (non-critical)")

with open(node_js_path, 'w', encoding='utf-8') as f:
    f.write(node_content)

print("\n🎉 Reference Pin JS logic implementation complete!")
print("Now you can use isReference: true or byRef: true in NodeDefinitions.js pin definitions.")
