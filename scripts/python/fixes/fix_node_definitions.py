
import os

file_path = 'data/NodeDefinitions.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line where NotEqual pins end and MakeVector starts
# We look for the closing bracket of NotEqual pins, which should be followed by a comma and closing brace for the object
for i, line in enumerate(lines):
    if '"MakeVector": {' in line:
        # Check previous non-empty lines
        j = i - 1
        while j >= 0 and lines[j].strip() == '' or lines[j].strip().startswith('//'):
            j -= 1
        
        if j >= 0:
            stripped = lines[j].strip()
            if stripped == ']':
                # It's missing the closing brace and comma
                lines[j] = '        ],\n    },\n'

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
