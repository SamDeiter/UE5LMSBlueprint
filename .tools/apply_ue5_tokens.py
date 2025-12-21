import re

file_path = 'src/css/variables.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Exact UE5 Palette from Requirements
replacements = {
    # Pins
    r'--color-exec: #FFFFFF;': '--color-exec: #FFFFFF;',
    r'--color-bool: #920101;': '--color-bool: #920101;',
    r'--color-float: #96E804;': '--color-float: #96E804;',
    r'--color-string: #FF00FF;': '--color-string: #e60088;', # Corrected to Unreal Pink
    r'--color-vector: #FFC700;': '--color-vector: #ffc000;', # Corrected to Orange-Gold
    
    # Headers
    r'--header-event-start: #750000;': '--header-event-start: #7a1515;',
    r'--header-event-end: #300000;': '--header-event-end: #500a0a;',
    r'--header-function-start: #004060;': '--header-function-start: #1d4d65;',
    r'--header-function-end: #002030;': '--header-function-end: #123040;',
    
    # Body & Inputs
    r'--color-bg-dark: #151515;': '--color-bg-dark: #1a1a1a;',
}

for old, new in replacements.items():
     # Using re.sub to ensure we only replace the exact variable lines
    content = re.sub(old, new, content)

# Add new tokens for the overhaul
new_tokens = """
    /* --- UE5 PIXEL PERFECT TOKENS --- */
    --ue5-node-bg: rgba(10, 10, 10, 0.85);
    --ue5-node-blur: blur(4px);
    --ue5-node-radius: 8px;
    --ue5-input-bg: #050505;
    --ue5-input-border: #303030;
    --ue5-selection-orange: #f0a000;
    --ue5-checkbox-tick: #0070e0;
    --ue5-hazard-yellow: #8a7800;
    --ue5-text-shadow: 1px 1px 2px black;
"""

if '/* --- UE5 PIXEL PERFECT TOKENS --- */' not in content:
    content = content.replace('}', new_tokens + '\n}', 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Updated variables.css with exact UE5 requirements.")
