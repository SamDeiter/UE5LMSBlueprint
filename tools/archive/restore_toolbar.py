
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\index.html'

toolbar_content = """    <div id="toolbar">
        <div class="group">
            <button id="compile-btn" title="Compile (F7)">
                <i class="fas fa-check-square"></i> Compile
            </button>
            <button id="save-btn" title="Save (Ctrl+S)">
                <i class="fas fa-save"></i> Save
            </button>
            <button id="browse-btn" title="Browse">
                <i class="fas fa-search"></i> Browse
            </button>
        </div>

        <div class="group">
             <button id="undo-btn" title="Undo (Ctrl+Z)">
                <i class="fas fa-undo"></i>
            </button>
             <button id="redo-btn" title="Redo (Ctrl+Y)">
                <i class="fas fa-redo"></i>
            </button>
        </div>

        <div class="group">
            <button id="play-btn" title="Play">
                <i class="fas fa-play" style="color: #4caf50;"></i>
            </button>
            <button id="stop-btn" title="Stop">
                <i class="fas fa-stop" style="color: #f44336;"></i>
            </button>
            <button id="step-btn" title="Step Over">
                <i class="fas fa-step-forward"></i>
            </button>
             <button id="step-into-btn" title="Step Into">
                <i class="fas fa-indent"></i>
            </button>
             <button id="step-out-btn" title="Step Out">
                <i class="fas fa-outdent"></i>
            </button>
        </div>

        <div class="group">
            <label for="task-selector" style="color: #ccc; margin-right: 8px; font-size: 12px;">Task:</label>
            <select id="task-selector"
                style="background: #2a2a2a; color: #ccc; border: 1px solid #444; padding: 4px 8px; border-radius: 2px; min-width: 200px;">
                <option value="">Select Task...</option>
            </select>
        </div>

        <div class="group" style="margin-left: auto;">
             <button id="class-defaults-btn" title="Class Defaults">
                <i class="fas fa-cog"></i> Class Defaults
            </button>
             <button id="help-btn" title="Help">
                <i class="fas fa-question-circle"></i>
            </button>
        </div>
        <div class="parent-class-label" style="margin-left: 10px;">Parent class: <a href="#">Actor</a></div>
    </div>"""

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the existing toolbar block
start_marker = '<div id="toolbar">'
end_marker = '<div id="left-panel" class="panel">'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Extract the part before and after
    pre_toolbar = content[:start_idx]
    post_toolbar = content[end_idx:]
    
    # Combine
    new_content = pre_toolbar + toolbar_content + "\n\n            " + post_toolbar
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Restored toolbar buttons in index.html")
else:
    print("Could not locate toolbar section to replace.")
