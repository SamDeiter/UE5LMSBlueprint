"""
Phase 4: Add CSS for Vector/Rotator Input Widgets
Adds styling for multi-field widgets (X, Y, Z) and layout adjustments
"""

import os

PROJECT_ROOT = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main"
NODES_CSS = os.path.join(PROJECT_ROOT, "css", "nodes.css")

def add_widget_css():
    """Add CSS for vector widgets to nodes.css"""
    print("Adding vector widget CSS to nodes.css...")
    
    with open(NODES_CSS, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '.ue-vector-widget' in content:
        print("⚠️  Vector widget CSS already exists, skipping...")
        return

    widget_css = """
/* --- COMPLEX INPUT WIDGETS (Vector, Rotator, Transform) --- */

/* Container for Label + Widget (Vertical Layout) */
.pin-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

/* The Widget Container (Horizontal X, Y, Z) */
.ue-vector-widget {
    display: flex;
    gap: 4px;
    align-items: center;
    margin-bottom: 4px;
}

/* Individual Value Group (Label + Input) */
.val-group {
    display: flex;
    align-items: center;
    gap: 2px;
}

/* Axis Label (X, Y, Z) */
.val-label {
    font-size: 10px;
    color: #aaa;
    font-family: monospace;
    font-weight: bold;
}

/* Small Input Field */
.small-input {
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 2px;
    padding: 1px 4px;
    color: #ddd;
    font-size: 10px;
    width: 28px; /* Slightly wider for usability */
    text-align: right;
    outline: none;
}

.small-input:focus {
    border-color: rgba(255,255,255,0.5);
    background: rgba(0,0,0,0.8);
}

/* Adjust pin layout for complex widgets */
.pin-row.has-widget {
    height: auto;
    align-items: flex-start;
    padding-top: 4px;
    padding-bottom: 4px;
}

.pin-row.has-widget .pin-icon {
    margin-top: 2px; /* Align with label text */
}
"""
    
    # Append to end of file
    with open(NODES_CSS, 'a', encoding='utf-8') as f:
        f.write(widget_css)
    
    print(f"✅ Updated {NODES_CSS}")

if __name__ == "__main__":
    print("=" * 60)
    print("CSS Update - Vector/Rotator Widgets")
    print("=" * 60)
    add_widget_css()
