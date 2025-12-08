#!/usr/bin/env python3
"""Fix all alignment issues in NeedNodeModal by adding proper CSS grid layout"""

# Read the file
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix the modal body section to add consistent styling
new_lines = []
for i, line in enumerate(lines):
    # Add grid layout to form groups for consistent alignment
    if '<div class="form-group">' in line and i > 70 and i < 100:
        # Add inline style for grid layout
        line = line.replace('<div class="form-group">', 
                          '<div class="form-group" style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: start;">')
    
    # Fix label styling to work with grid
    if 'label for="need-title"' in line or 'label for="need-description"' in line or 'label for="need-threshold"' in line:
        # Labels will be in first column of grid
        line = line.replace('<label', '<label style="text-align: right; padding-top: 8px;"')
    
    new_lines.append(line)

# Write back
with open(r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\NeedNodeModal.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Applied CSS grid layout for proper label-input alignment')
