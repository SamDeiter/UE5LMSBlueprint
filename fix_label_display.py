#!/usr/bin/env python3
"""Fix label display property to work with flexbox layout"""

# Read the file
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix labels to override the CSS display: block
replacements = [
    # Title label
    ('<label for="need-title" style="width: 120px; text-align: right; flex-shrink: 0;">',
     '<label for="need-title" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">'),
    
    # Description label  
    ('<label for="need-description" style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 4px;">',
     '<label for="need-description" style="width: 120px; text-align: right; flex-shrink: 0; padding-top: 8px; display: inline-block; margin-bottom: 0;">'),
    
    # Pass Threshold label
    ('<label for="need-threshold" style="width: 120px; text-align: right; flex-shrink: 0;">',
     '<label for="need-threshold" style="width: 120px; text-align: right; flex-shrink: 0; display: inline-block; margin-bottom: 0;">'),
    
    # Empty label for checkbox
    ('<label style="width: 120px; flex-shrink: 0;"></label>',
     '<label style="width: 120px; flex-shrink: 0; display: inline-block; margin-bottom: 0;"></label>'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write back
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed label display properties to work with flexbox')
