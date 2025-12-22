"""
Refactor DetailsController by extracting showClassDefaults into ClassDefaultsRenderer
"""
from pathlib import Path

DETAILS_FILE = Path(r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DetailsController.js")

def main():
    content = DETAILS_FILE.read_text(encoding='utf-8')
    lines = content.split('\n')
    
    # Find the showClassDefaults method (starts around line 1150)
    start_idx = None
    end_idx = None
    
    for i, line in enumerate(lines):
        if 'showClassDefaults()' in line and start_idx is None:
            start_idx = i
        # The method ends before addEventNodeToGraph (around line 1718)
        if start_idx is not None and 'addEventNodeToGraph(eventName)' in line:
            end_idx = i - 1
            break
    
    if start_idx is None or end_idx is None:
        print(f"Could not find showClassDefaults method boundaries")
        return
    
    print(f"Found showClassDefaults from line {start_idx + 1} to {end_idx + 1}")
    print(f"Removing {end_idx - start_idx + 1} lines")
    
    # Add import for ClassDefaultsRenderer at the top
    import_line = 'import { ClassDefaultsRenderer } from "./ClassDefaultsRenderer.js";'
    
    # Find where to insert import (after other imports)
    import_idx = None
    for i, line in enumerate(lines):
        if 'import {' in line and 'DetailsTypeSelector' in line:
            import_idx = i + 1
            break
    
    if import_idx:
        lines.insert(import_idx, import_line)
        # Adjust indices since we inserted a line
        start_idx += 1
        end_idx += 1
    
    # Replace the method with a delegation call
    replacement = [
        '  showClassDefaults() {',
        '    if (!this.classDefaultsRenderer) {',
        '      this.classDefaultsRenderer = new ClassDefaultsRenderer(this);',
        '    }',
        '    this.classDefaultsRenderer.render();',
        '  }',
        ''
    ]
    
    # Remove old method and insert new one
    new_lines = lines[:start_idx] + replacement + lines[end_idx + 1:]
    
    # Write back
    new_content = '\n'.join(new_lines)
    DETAILS_FILE.write_text(new_content, encoding='utf-8')
    
    print(f"✓ Refactored DetailsController")
    print(f"  - Added import for ClassDefaultsRenderer")
    print(f"  - Replaced showClassDefaults with delegation")
    print(f"  - Removed {end_idx - start_idx + 1} lines")
    print(f"  - New file size: {len(new_lines)} lines (was {len(lines)} lines)")

if __name__ == "__main__":
    main()
