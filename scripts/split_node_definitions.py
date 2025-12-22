"""
NodeDefinitions.js Splitter Script
Parses the monolithic NodeDefinitions.js and creates modular category-based files.
"""
import re
import json
import os
from pathlib import Path
from collections import defaultdict

# Paths
SRC_DIR = Path(r"c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\data")
INPUT_FILE = SRC_DIR / "NodeDefinitions.js"
OUTPUT_DIR = SRC_DIR / "nodes"

# Category groupings for file output
CATEGORY_MAPPING = {
    # Granular file mapping
    "Events": "EventNodes",
    "Flow Control": "FlowControlNodes",
    "Input": "InputNodes",
    "Math|Integer": "MathNodes",
    "Math|Float": "MathNodes",
    "Math|Boolean": "MathNodes",
    "Math|Comparison": "MathNodes",
    "Math|Vector": "MathNodes",
    "Math|Rotator": "MathNodes",
    "Math|Transform": "MathNodes",
    "Math|Random": "MathNodes",
    "Math|Trig": "MathNodes",
    "String": "StringNodes",
    "Utilities": "UtilityNodes",
    "Utilities|Time": "UtilityNodes",
    "Utilities|Array": "CollectionNodes",
    "Utilities|Set": "CollectionNodes",
    "Utilities|Map": "CollectionNodes",
    "Collision": "CollisionNodes",
    "Collision|Structs": "CollisionNodes",
    "Casting": "CastingNodes",
    "Function": "FunctionNodes",
    "Macro": "MacroNodes",
    "Rendering": "ActorNodes",
    "Transformation": "ActorNodes",
    "Game|Actor": "ActorNodes",
    "Assessment": "AssessmentNodes",
}

# Fallbacks for nodes without category
NO_CATEGORY_FILE = "VariableNodes"  # For Set_* nodes without category

def extract_node_definitions(content):
    """
    Parses the NodeDefinitions.js and extracts individual node definitions.
    Returns a dict: { node_name: { category, definition_text } }
    """
    # Remove the wrapper: export const NodeDefinitions = { ... };
    match = re.search(r'export const NodeDefinitions = \{(.+)\};', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find NodeDefinitions export")
    
    inner_content = match.group(1)
    
    nodes = {}
    
    # Pattern to match node definitions
    # Matches: NodeName: { ... }, (handling nested braces)
    node_pattern = re.compile(r'^\s*(\w+):\s*\{', re.MULTILINE)
    
    for m in node_pattern.finditer(inner_content):
        node_name = m.group(1)
        start = m.start()
        
        # Find the end of this definition by counting braces
        brace_count = 0
        in_string = False
        escape_next = False
        string_char = None
        i = m.end() - 1  # Start from the opening brace
        
        while i < len(inner_content):
            c = inner_content[i]
            
            if escape_next:
                escape_next = False
                i += 1
                continue
            
            if c == '\\':
                escape_next = True
                i += 1
                continue
            
            if in_string:
                if c == string_char:
                    in_string = False
            else:
                if c in ('"', "'", '`'):
                    in_string = True
                    string_char = c
                elif c == '{':
                    brace_count += 1
                elif c == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        # Found the end
                        end = i + 1
                        definition = inner_content[start:end].strip().rstrip(',').strip()
                        
                        # Extract category
                        cat_match = re.search(r'category:\s*["\']([^"\']+)["\']', definition)
                        category = cat_match.group(1) if cat_match else None
                        
                        nodes[node_name] = {
                            'category': category,
                            'definition': definition
                        }
                        break
            i += 1
    
    return nodes


def group_by_file(nodes):
    """Groups nodes by their target output file."""
    files = defaultdict(list)
    
    for name, info in nodes.items():
        category = info['category']
        
        # Find the file mapping
        target_file = None
        if category:
            # Try exact match first
            if category in CATEGORY_MAPPING:
                target_file = CATEGORY_MAPPING[category]
            else:
                # Try prefix match (e.g., "Math|Integer" matches "Math")
                for cat_prefix, file_name in CATEGORY_MAPPING.items():
                    if category.startswith(cat_prefix.split('|')[0]):
                        target_file = file_name
                        break
        
        if not target_file:
            target_file = NO_CATEGORY_FILE
        
        files[target_file].append((name, info['definition']))
    
    return files


def write_module_file(output_dir, filename, nodes):
    """Writes a module file with the given nodes."""
    output_path = output_dir / f"{filename}.js"
    
    # Create export object name (e.g., EventNodes -> EventNodes)
    export_name = filename
    
    # Build content
    lines = [
        "/**",
        f" * {filename} - Auto-generated from NodeDefinitions.js",
        " * Contains node definitions for this category.",
        " */",
        f"export const {export_name} = {{",
    ]
    
    for i, (name, definition) in enumerate(nodes):
        # Extract just the object part (remove the name: prefix)
        obj_match = re.match(r'^\s*\w+:\s*(\{.+\})$', definition, re.DOTALL)
        if obj_match:
            obj_content = obj_match.group(1)
            lines.append(f"  {name}: {obj_content},")
        else:
            # Fallback: include as-is
            lines.append(f"  {definition},")
    
    lines.append("};")
    lines.append("")
    
    output_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f"  Created: {filename}.js ({len(nodes)} nodes)")
    return export_name


def write_index_file(output_dir, file_exports):
    """Writes the index.js aggregator file."""
    output_path = output_dir / "index.js"
    
    lines = [
        "/**",
        " * NodeDefinitions Index - Aggregates all node category modules",
        " * Auto-generated from split_node_definitions.py",
        " */",
        "",
    ]
    
    # Imports
    for filename, export_name in sorted(file_exports.items()):
        lines.append(f"import {{ {export_name} }} from './{filename}.js';")
    
    lines.append("")
    lines.append("// Aggregate all node definitions")
    lines.append("export const NodeDefinitions = {")
    
    for filename, export_name in sorted(file_exports.items()):
        lines.append(f"  ...{export_name},")
    
    lines.append("};")
    lines.append("")
    
    output_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f"  Created: index.js (aggregates {len(file_exports)} modules)")


def main():
    print("NodeDefinitions Splitter")
    print("=" * 40)
    
    # Read input file
    print(f"\nReading: {INPUT_FILE}")
    content = INPUT_FILE.read_text(encoding='utf-8')
    
    # Parse nodes
    print("Parsing node definitions...")
    nodes = extract_node_definitions(content)
    print(f"  Found {len(nodes)} nodes")
    
    # Group by file
    files = group_by_file(nodes)
    print(f"\nGrouped into {len(files)} category files:")
    for f, n in sorted(files.items()):
        print(f"  {f}: {len(n)} nodes")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    
    # Write module files
    print("\nWriting module files:")
    file_exports = {}
    for filename, node_list in sorted(files.items()):
        export_name = write_module_file(OUTPUT_DIR, filename, node_list)
        file_exports[filename] = export_name
    
    # Write index file
    print("\nWriting index file:")
    write_index_file(OUTPUT_DIR, file_exports)
    
    # Summary
    total_nodes = sum(len(n) for n in files.values())
    print(f"\n{'=' * 40}")
    print(f"SUCCESS: Split {total_nodes} nodes into {len(files)} files")
    print(f"Next steps:")
    print(f"  1. Update imports in app.js and SimulationEngine.js")
    print(f"  2. Delete the original NodeDefinitions.js")
    print(f"  3. Test the application")


if __name__ == "__main__":
    main()
