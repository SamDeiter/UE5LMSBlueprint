
import re

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data\NodeDefinitions.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We will replace 'category: "Value",' with 'category: "Value",\n        executor: "Executor",'

replacements = {
    'category: "Math|Integer"': 'category: "Math|Integer",\n        executor: "Math"',
    'category: "Math|Float"': 'category: "Math|Float",\n        executor: "Math"',
    'category: "Math|Boolean"': 'category: "Math|Boolean",\n        executor: "Math"',
    'category: "Math|Comparison"': 'category: "Math|Comparison",\n        executor: "Math"',
    'category: "Math|Vector"': 'category: "Math|Vector",\n        executor: "Vector"',
    'category: "Math|Rotator"': 'category: "Math|Rotator",\n        executor: "Vector"',
    'category: "Math|Transform"': 'category: "Math|Transform",\n        executor: "Vector"',
    'category: "String"': 'category: "String",\n        executor: "String"',
    'category: "Flow Control"': 'category: "Flow Control",\n        executor: "FlowControl"',
    'category: "Events"': 'category: "Events",\n        executor: "Event"', 
    'category: "Function"': 'category: "Function",\n        executor: "Function"',
    'category: "Development"': 'category: "Development",\n        executor: "Print"', 
    'category: "Utilities|Time"': 'category: "Utilities|Time",\n        executor: "Timeline"',
}

new_content = content

for cat, replacement in replacements.items():
    # Use simple string replace for safety
    new_content = new_content.replace(cat + ',', replacement + ',')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated NodeDefinitions.js with executor metadata.")
