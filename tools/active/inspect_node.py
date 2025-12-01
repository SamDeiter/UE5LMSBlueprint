
import os

file_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\src\graph\Node.js"

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print("--- First 50 lines of Node.js ---")
        for i, line in enumerate(lines[:50]):
            print(f"{i+1}: {line}", end='')
else:
    print(f"File not found: {file_path}")
