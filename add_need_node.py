import os

file_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\data\NodeDefinitions.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the last closing brace of the object
last_brace_index = content.rfind('};')

if last_brace_index != -1:
    new_node = """
    ,
    "NeedNode": {
        title: "Need Node",
        type: "assessment-node",
        category: "Assessment",
        icon: "fa-clipboard-check",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "score_out", name: "Score", type: "int", dir: "out" },
            { id: "passed_out", name: "Passed", type: "bool", dir: "out" }
        ]
    }
    """
    
    new_content = content[:last_brace_index] + new_node + content[last_brace_index:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully added NeedNode.")
else:
    print("Could not find end of object.")
