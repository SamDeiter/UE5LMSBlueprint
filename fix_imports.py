import os

file_path = 'src/utils.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the import path
new_content = content.replace("from '../config/Constants.js'", "from './config/Constants.js'")

if content != new_content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Fixed import in {file_path}")
else:
    print(f"No changes needed for {file_path}")
