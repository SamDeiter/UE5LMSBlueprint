"""
Phase 2: Implement Keyboard Shortcuts (Chorded Creation)
Modifies GraphInteraction.js to add chord key tracking and node spawning.
"""
import re

file_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\graph\GraphInteraction.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add activeKeys to constructor (after this.rafId = null;)
old_constructor_end = """        this.rafId = null;

        // Bind methods"""

new_constructor_end = """        this.rafId = null;

        // Chord Shortcuts State (Phase 2: Keyboard Shortcuts)
        this.activeKeys = new Set();

        // Bind methods"""

if old_constructor_end in content:
    content = content.replace(old_constructor_end, new_constructor_end)
    print("✅ Added activeKeys Set to constructor")
else:
    print("❌ Could not find constructor end marker")

# 2. Add keyup listener alongside keydown in initEvents
old_init_events = """        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }"""

new_init_events = """        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }"""

if old_init_events in content:
    content = content.replace(old_init_events, new_init_events)
    print("✅ Added keyup listener to initEvents()")
else:
    print("❌ Could not find initEvents keydown line")

# 3. Modify handleKeyDown to track keys
old_handleKeyDown = """    handleKeyDown(e) {
        const target = e.target;
        const tagName = target.tagName ? target.tagName.toUpperCase() : '';
        const isTextEditor = tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;

        if (isTextEditor) return;"""

new_handleKeyDown = """    handleKeyDown(e) {
        const target = e.target;
        const tagName = target.tagName ? target.tagName.toUpperCase() : '';
        const isTextEditor = tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;

        // Track held keys for chord shortcuts (only if not in text editor)
        if (!isTextEditor) {
            this.activeKeys.add(e.key.toLowerCase());
        }

        if (isTextEditor) return;"""

if old_handleKeyDown in content:
    content = content.replace(old_handleKeyDown, new_handleKeyDown)
    print("✅ Modified handleKeyDown to track keys")
else:
    print("❌ Could not find handleKeyDown signature")

# 4. Add handleKeyUp method after handleKeyDown method
# Find the end of handleKeyDown (after the closing brace before handleDragOver)
old_between_methods = """    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }"""

new_between_methods = """    }

    handleKeyUp(e) {
        this.activeKeys.delete(e.key.toLowerCase());
    }

    // Chord shortcut: Check if a chord key is held and return the corresponding node key
    getChordNode() {
        const CHORD_SHORTCUTS = {
            'b': 'Branch',
            's': 'Sequence',
            'd': 'Delay',
            'o': 'DoOnce',
            'g': 'Gate',
            'p': 'EventBeginPlay'
        };
        for (const [key, nodeKey] of Object.entries(CHORD_SHORTCUTS)) {
            if (this.activeKeys.has(key)) return nodeKey;
        }
        return null;
    }

    handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }"""

if old_between_methods in content:
    content = content.replace(old_between_methods, new_between_methods)
    print("✅ Added handleKeyUp() and getChordNode() methods")
else:
    print("❌ Could not find position for new methods")

# 5. Add chord check to handleEditorMouseDown before marqueeing
# We want to insert the chord check right after the marqueeing condition check (line 253 area)
# The chord should be checked when clicking on empty canvas (button === 0, no pinElement, no nodeElement)
old_marquee_start = """        // 4. Marqueeing
        if (e.button === 0) {
            this.isMarqueeing = true;"""

new_marquee_start = """        // 4. Chord Shortcuts - Check BEFORE marqueeing
        if (e.button === 0) {
            const chordNode = this.getChordNode();
            if (chordNode) {
                const graphCoords = this.controller.getGraphCoords(e.clientX, e.clientY);
                this.controller.addNode(chordNode, graphCoords.x, graphCoords.y);
                this.app.persistence.autoSave();
                return; // Chord consumed the click
            }
        }

        // 5. Marqueeing
        if (e.button === 0) {
            this.isMarqueeing = true;"""

if old_marquee_start in content:
    content = content.replace(old_marquee_start, new_marquee_start)
    print("✅ Added chord shortcut check before marqueeing")
else:
    print("❌ Could not find marqueeing section")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🎉 Phase 2: Keyboard Shortcuts implementation complete!")
print("Chords implemented: B→Branch, S→Sequence, D→Delay, O→DoOnce, G→Gate, P→EventBeginPlay")
