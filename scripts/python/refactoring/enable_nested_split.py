file_path = r'c:\Users\sam.deiter\.gemini\antigravity\scratch\UE5LMSBlueprint\graph\Pin.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update canSplit to allow nested splitting
old_can_split = '''    canSplit() {
        return ['vector', 'rotator', 'transform'].includes(this.type) && !this.isSplit;
    }'''

new_can_split = '''    canSplit() {
        // Allow splitting for vector, rotator, and transform types
        // Even if already split (for nested splitting like Transform -> Location -> X/Y/Z)
        return ['vector', 'rotator', 'transform'].includes(this.type) && !this.isSplit;
    }'''

content = content.replace(old_can_split, new_can_split)

# Update recombine to handle nested splits
old_recombine = '''    recombine() {
        if (!this.isSplit) return;

        this.isSplit = false;
        this.subPins = [];
    }'''

new_recombine = '''    recombine() {
        if (!this.isSplit) return;

        // Recursively recombine any split sub-pins first
        this.subPins.forEach(subPin => {
            if (subPin.isSplit) {
                subPin.recombine();
            }
        });

        this.isSplit = false;
        this.subPins = [];
    }'''

content = content.replace(old_recombine, new_recombine)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Pin.js to support nested splitting')
