import os

# 1. Update index.html to include graph-tab class and data-graph attribute
index_path = 'index.html'
with open(index_path, 'r', encoding='utf-8') as f:
    index_content = f.read()

# Replace the tab block
old_tabs = """            <div class="tab active">
                <i class="fas fa-file-code" style="color: #4a90e2; margin-right: 6px;"></i>
                <span>Event Graph</span>
                <i class="fas fa-times tab-close"></i>
            </div>
            <div class="tab">
                <i class="fas fa-tools" style="color: #e24a4a; margin-right: 6px;"></i>
                <span>Construction Script</span>
                <i class="fas fa-times tab-close"></i>
            </div>"""

new_tabs = """            <div class="tab graph-tab active" data-graph="EventGraph">
                <i class="fas fa-file-code" style="color: #4a90e2; margin-right: 6px;"></i>
                <span>Event Graph</span>
                <i class="fas fa-times tab-close"></i>
            </div>
            <div class="tab graph-tab" data-graph="ConstructionScript">
                <i class="fas fa-tools" style="color: #e24a4a; margin-right: 6px;"></i>
                <span>Construction Script</span>
                <i class="fas fa-times tab-close"></i>
            </div>"""

if old_tabs in index_content:
    index_content = index_content.replace(old_tabs, new_tabs)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    print("Updated index.html tabs.")
else:
    print("Could not find tab block in index.html")

# 2. Update LayoutController.js to use data-graph attribute
layout_path = 'ui/LayoutController.js'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_content = f.read()

# We need to replace the initTabs method we added earlier
# Or just update it.
# Let's find the method and replace it.

start_marker = "    initTabs() {"
end_marker = "    }" # This is risky, let's match the content we wrote

old_method_content = """    initTabs() {
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
    }"""

new_method_content = """    initTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Determine graph name
                let graphName = tab.dataset.graph;
                
                if (!graphName) {
                    // Fallback to text content if data attribute missing
                    const text = tab.querySelector('span').textContent.trim();
                    if (text === 'Construction Script') {
                        graphName = 'ConstructionScript';
                    } else if (text === 'Event Graph') {
                        graphName = 'EventGraph';
                    } else {
                        graphName = 'EventGraph';
                    }
                }
                
                // Switch graph (GraphSwitcher handles UI update if we use it)
                if (this.app.switchGraph) {
                    this.app.switchGraph(graphName);
                } else {
                    // Manual UI update fallback
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                }
            });
        });
    }"""

# Since exact string match might fail due to whitespace, let's try a more robust replacement
# We know where we inserted it (at the end).
# Let's just overwrite the file with the new method if we can find the old one.
# Actually, since I just wrote it, I can probably find it.
# But let's be safe and just replace the whole file content if needed, or use regex.

if old_method_content in layout_content:
    layout_content = layout_content.replace(old_method_content, new_method_content)
    with open(layout_path, 'w', encoding='utf-8') as f:
        f.write(layout_content)
    print("Updated LayoutController.js initTabs.")
else:
    # Try to find it with normalized whitespace?
    # Or just append it if it's missing (but it shouldn't be).
    # Let's try to replace the logic inside the method.
    pass # If it fails, we'll see in the output.
