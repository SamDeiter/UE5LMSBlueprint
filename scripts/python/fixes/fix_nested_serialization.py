file_path = r'c:\Users\sam.deiter\.gemini\antigravity\scratch\UE5LMSBlueprint\graph\Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace getPinsData with recursive serialization
old_get_pins = '''    getPinsData() {
        return this.pins.map(p => ({
            id: p.id ? p.id.replace(`${this.id}-`, '') : 'CORRUPTED',
            name: p.name,
            type: p.type,
            dir: p.dir,
            containerType: p.containerType,
            literalValue: this.pinLiterals.get(p.id),
            isCustom: p.isCustom,
            isSplit: p.isSplit,
            subPins: p.subPins ? p.subPins.map(sp => ({
                id: sp.id,
                name: sp.name,
                type: sp.type,
                dir: sp.dir,
                defaultValue: sp.defaultValue
            })) : []
        }));
    }'''

new_get_pins = '''    getPinsData() {
        return this.pins.map(p => this.serializePin(p));
    }

    serializePin(pin) {
        const data = {
            id: pin.id ? pin.id.replace(`${this.id}-`, '') : 'CORRUPTED',
            name: pin.name,
            type: pin.type,
            dir: pin.dir,
            containerType: pin.containerType,
            literalValue: this.pinLiterals.get(pin.id),
            isCustom: pin.isCustom,
            isSplit: pin.isSplit
        };

        // Recursively serialize sub-pins (for nested splits)
        if (pin.subPins && pin.subPins.length > 0) {
            data.subPins = pin.subPins.map(sp => this.serializePin(sp));
        } else {
            data.subPins = [];
        }

        return data;
    }'''

content = content.replace(old_get_pins, new_get_pins)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated getPinsData to recursively serialize nested splits')
