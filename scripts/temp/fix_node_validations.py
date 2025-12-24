import re
import os

def fix_variable_nodes():
    path = r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data\nodes\VariableNodes.js"
    with open(path, "r", encoding="utf-8", newline="") as f:
        content = f.read()

    # Add category to all Set_ nodes
    # Look for Set_... followed by title and type
    pattern = r"(Set_[a-zA-Z0-9_]+:\s*{\s*title:.*?\n\s*type:\s*\"variable-node\",)"
    replacement = r'\1\n    category: "Variables",'

    new_content = re.sub(pattern, replacement, content)

    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(new_content)
    print("Fixed VariableNodes.js")

def fix_av_nodes():
    path = r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data\nodes\AudioVisualNodes.js"
    with open(path, "r", encoding="utf-8", newline="") as f:
        content = f.read()

    # Replace direction: "input" with dir: "in"
    content = content.replace('direction: "input"', 'dir: "in"')
    # Replace direction: "output" with dir: "out"
    content = content.replace('direction: "output"', 'dir: "out"')

    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print("Fixed AudioVisualNodes.js")

if __name__ == "__main__":
    fix_variable_nodes()
    fix_av_nodes()
