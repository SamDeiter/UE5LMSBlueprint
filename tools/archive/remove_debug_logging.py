
import os
import re

file_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\src\graph\Node.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove constructor debug logging
content = re.sub(r'console\.group\(`\[Node Debug\].*?console\.log\(\'Input nodeData\.pins:\'.*?\}\n', '', content, flags=re.DOTALL)

# Remove recovery debug logging
content = re.sub(r'console\.warn\(\'\[Node Debug\].*?\);', '', content)
content = re.sub(r'console\.log\(\'Final pinDataArray:\'.*?console\.groupEnd\(\);', '', content, flags=re.DOTALL)

# Remove renderSetNode debug logging
content = re.sub(r'console\.log\(`\[Render Debug\].*?\}\);', '', content, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
