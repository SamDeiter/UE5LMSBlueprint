"""
Icon Migration Script
Replaces Font Awesome icons with UE5 SVG icons in NodeDefinitions.js
"""

import re

# Icon mapping: Font Awesome → UE5 SVG
ICON_MAP = {
    "fa-code-branch": "ue5/Branch.svg",
    "fa-list-ol": "ue5/Sequence.svg",
    "fa-step-forward": "ue5/DoOnce.svg",
    "fa-redo-alt": "ue5/DoN.svg",
    "fa-toggle-on": "ue5/FlipFlop.svg",
    "fa-sync-alt": "ue5/ForEach.svg",
    # Keep Font Awesome for nodes without UE5 equivalents
}

def migrate_icons(file_path):
    """Update icon references in NodeDefinitions.js"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    replacements = 0
    
    for fa_icon, ue5_icon in ICON_MAP.items():
        pattern = f'icon: "{fa_icon}"'
        replacement = f'icon: "{ue5_icon}"'
        
        count = content.count(pattern)
        if count > 0:
            content = content.replace(pattern, replacement)
            replacements += count
            print(f"✓ Replaced {count}x: {fa_icon} → {ue5_icon}")
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"\n✅ Updated {replacements} icon references")
    else:
        print("No changes needed")
    
    return replacements

if __name__ == "__main__":
    file_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data\NodeDefinitions.js"
    migrate_icons(file_path)
