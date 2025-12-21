"""
Phase 7: Convert inline .style. properties to CSS classes
Target: DebuggerController.js - Call Stack and Watch panels
"""

# 1. Add panel CSS classes to ui-elements.css
css_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\css\ui-elements.css"

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Add debug panel CSS after existing utility classes
new_css = '''
/* === PHASE 7: DEBUG PANEL STYLES === */
/* Extracted from DebuggerController.js inline styles */
.debug-floating-panel {
    position: absolute;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid #444;
    border-radius: 4px;
    padding: 10px;
    color: #fff;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    z-index: 100;
    min-width: 200px;
}

#call-stack-panel {
    top: 10px;
    right: 220px;
}

#watch-panel {
    top: 10px;
    right: 10px;
}

.debug-panel-header {
    font-weight: bold;
    margin-bottom: 5px;
    border-bottom: 1px solid #555;
    padding-bottom: 3px;
}

.debug-stack-frame {
    padding: 2px 0;
    cursor: pointer;
}

.debug-stack-frame.active {
    color: #4CAF50;
    font-weight: bold;
}

.debug-stack-frame.inactive {
    color: #aaa;
    padding-left: 10px;
}

.debug-watch-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
}

.debug-watch-label {
    color: #aaa;
}

.debug-watch-value {
    color: #4CAF50;
}
'''

if '.debug-floating-panel' not in css_content:
    css_content = css_content.rstrip() + '\n' + new_css
    print("✅ Added debug panel CSS classes")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Update DebuggerController.js to use CSS classes
debug_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DebuggerController.js"

with open(debug_path, 'r', encoding='utf-8') as f:
    debug_content = f.read()

# Replace the call stack panel inline styles
old_call_stack_style = '''        this.panel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 220px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;'''

new_call_stack_style = '''        this.panel.className = 'debug-floating-panel hidden';'''

if old_call_stack_style in debug_content:
    debug_content = debug_content.replace(old_call_stack_style, new_call_stack_style)
    print("✅ Converted call-stack-panel inline styles to CSS class")

# Replace watch panel inline styles
old_watch_style = '''        this.watchPanel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;'''

new_watch_style = '''        this.watchPanel.className = 'debug-floating-panel hidden';'''

if old_watch_style in debug_content:
    debug_content = debug_content.replace(old_watch_style, new_watch_style)
    print("✅ Converted watch-panel inline styles to CSS class")

# Update display toggle patterns
debug_content = debug_content.replace(
    "this.panel.style.display = 'none';",
    "this.panel.classList.add('hidden');"
)
debug_content = debug_content.replace(
    "this.panel.style.display = 'block';",
    "this.panel.classList.remove('hidden');"
)
debug_content = debug_content.replace(
    "this.watchPanel.style.display = 'none';",
    "this.watchPanel.classList.add('hidden');"
)
debug_content = debug_content.replace(
    "this.watchPanel.style.display = 'block';",
    "this.watchPanel.classList.remove('hidden');"
)

print("✅ Converted display toggles to classList methods")

with open(debug_path, 'w', encoding='utf-8') as f:
    f.write(debug_content)

print("\n🎉 Phase 7: DebuggerController conversion complete!")
