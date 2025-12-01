"""
Phase 4j: Update Editor Background & Theme
Matches the dark UE5 editor theme (Grid, Backgrounds, Panels)
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
LAYOUT_CSS = os.path.join(PROJECT_ROOT, "css", "layout.css")
VARIABLES_CSS = os.path.join(PROJECT_ROOT, "css", "variables.css")

def update_editor_theme():
    """Update editor background and UI theme"""
    print("Updating editor theme to match UE5...")
    
    # 1. Update Variables for Global Theme
    with open(VARIABLES_CSS, 'a', encoding='utf-8') as f:
        f.write("""
/* =========================================
   UE5 EDITOR THEME OVERRIDES
   ========================================= */
:root {
    /* Main Backgrounds */
    --bg-graph: #262626;
    --bg-panel: #151515;
    --bg-header: #0f0f0f;
    
    /* Grid Lines */
    --grid-line-major: #353535;
    --grid-line-minor: #2e2e2e;
    
    /* Text */
    --text-primary: #e0e0e0;
    --text-secondary: #a0a0a0;
}
""")

    # 2. Update Layout CSS for Grid and Panels
    css_theme = """
/* =========================================
   UE5 EDITOR THEME STYLING
   ========================================= */

/* Main Graph Area */
#graph-container {
    background-color: var(--bg-graph) !important;
    background-image: 
        linear-gradient(var(--grid-line-major) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px),
        linear-gradient(var(--grid-line-minor) 1px, transparent 1px),
        linear-gradient(90deg, var(--grid-line-minor) 1px, transparent 1px) !important;
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px !important;
    background-position: -1px -1px, -1px -1px, -1px -1px, -1px -1px !important;
}

/* Sidebars (My Blueprint, Details) */
.sidebar, .panel {
    background-color: var(--bg-panel) !important;
    border-right: 1px solid #000;
    border-left: 1px solid #000;
}

/* Panel Headers */
.panel-header {
    background-color: var(--bg-header) !important;
    border-bottom: 1px solid #333;
    color: var(--text-primary);
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Toolbar */
.toolbar {
    background-color: var(--bg-header) !important;
    border-bottom: 1px solid #000;
}

/* Watermark */
#graph-container::after {
    content: 'BLUEPRINT';
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 64px;
    font-weight: 900;
    color: rgba(255, 255, 255, 0.05);
    pointer-events: none;
    z-index: 0;
}
"""
    
    # We need to make sure we're appending to the right file.
    # layout.css is a good place for this.
    with open(LAYOUT_CSS, 'a', encoding='utf-8') as f:
        f.write(css_theme)
    
    print(f"✅ Appended theme updates to {LAYOUT_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Editor Theme")
    print("=" * 60)
    update_editor_theme()
