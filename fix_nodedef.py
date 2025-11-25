import re

# Read the file
with open(r'c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\data\NodeDefinitions.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and fix the Set_rotator definition
pattern = r'("Set_rotator":\s*\{.*?"icon":\s*"fa-arrow-circle-up",\s*pins:\s*\[.*?\]\s*\})'
match = re.search(pattern, content, re.DOTALL)

if match:
    correct_set_rotator = '''    "Set_rotator": {
        title: "Set (Rotator)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "rotator", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "rotator", dir: "out" }
        ]
    },
    "Set_transform": {
        title: "Set (Transform)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "transform", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "transform", dir: "out" }
        ]
    },
    "Set_object": {
        title: "Set (Object)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "object", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "object", dir: "out" }
        ]
    }'''
    
    # Replace from Set_rotator to the end
    content = re.sub(
        r'"Set_rotator":.*?"NeedNode":',
        correct_set_rotator + ',\n    // --- ASSESSMENT ---\n    "NeedNode":',
        content,
        flags=re.DOTALL
    )
    
    with open(r'c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\data\NodeDefinitions.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed NodeDefinitions.js successfully!")
else:
    print("Pattern not found!")
