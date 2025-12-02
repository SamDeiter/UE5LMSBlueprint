import os

# 1. Update css/nodes.css to enable arrows on input pins
css_path = 'css/nodes.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# The block we added previously
previous_arrow_css = """/* Pin Triangle Arrow (Output pins + Unconnected Input pins) */
.pin-container.out .pin-dot:not(.exec-pin)::after,
.pin-container.in .pin-dot.hollow:not(.exec-pin)::after {
    content: '';
    position: absolute;
    right: -7px; /* Adjusted for better visibility */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid currentColor; /* Slightly larger to match image */
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    pointer-events: none;
}"""

# The new block that removes .hollow from input pins
new_arrow_css = """/* Pin Triangle Arrow (Output pins + Input pins) */
.pin-container.out .pin-dot:not(.exec-pin)::after,
.pin-container.in .pin-dot:not(.exec-pin)::after {
    content: '';
    position: absolute;
    right: -7px; /* Adjusted for better visibility */
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid currentColor; /* Slightly larger to match image */
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    pointer-events: none;
}"""

if previous_arrow_css in css_content:
    css_content = css_content.replace(previous_arrow_css, new_arrow_css)
else:
    # If not found, append it (cascading will handle it)
    css_content += "\n" + new_arrow_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

# 2. Update ui/LayoutController.js to handle tab switching
layout_js_path = 'ui/LayoutController.js'
with open(layout_js_path, 'r', encoding='utf-8') as f:
    layout_js = f.read()

# We need to add initTabs() method and call it in constructor
if 'initTabs()' not in layout_js:
    # Add initTabs call in constructor
    layout_js = layout_js.replace('this.initDetailsResizer();', 'this.initDetailsResizer();\n        this.initTabs();')
    
    # Add initTabs method before end of class
    init_tabs_method = """
    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Determine graph name based on text content
                const text = tab.querySelector('span').textContent.trim();
                let graphName = 'EventGraph'; // Default
                if (text === 'Construction Script') {
                    graphName = 'ConstructionScript';
                } else if (text === 'Event Graph') {
                    graphName = 'EventGraph';
                }
                
                // Switch graph
                if (this.app.switchGraph) {
                    this.app.switchGraph(graphName);
                }
            });
        });
    }
"""
    # Insert before last closing brace
    last_brace_idx = layout_js.rfind('}')
    layout_js = layout_js[:last_brace_idx] + init_tabs_method + layout_js[last_brace_idx:]

    with open(layout_js_path, 'w', encoding='utf-8') as f:
        f.write(layout_js)

print("Updated CSS for arrows and added tab switching logic.")
