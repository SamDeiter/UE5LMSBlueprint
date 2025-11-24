#!/usr/bin/env python3
"""
Script to remove duplicate methods from GraphController.js
The duplicates are at lines 737-852 and should be removed.
"""

file_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\graph\GraphController.js"

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove lines 737-852 (0-indexed: 736-851)
# Keep everything before line 737 and after line 852
new_lines = lines[:736] + lines[853:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Removed duplicate methods from GraphController.js")
print(f"Original lines: {len(lines)}")
print(f"New lines: {len(new_lines)}")
print(f"Removed: {len(lines) - len(new_lines)} lines")
