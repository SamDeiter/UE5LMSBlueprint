import os
import re

def split_styles():
    source_path = '../../style.css'
    output_dir = '../../css'
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    with open(source_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define sections with regex patterns or markers
    sections = {
        'base.css': {
            'start': None, # Start of file
            'end': '/* --- GRAPH EDITOR --- */'
        },
        'graph.css': {
            'start': '/* --- GRAPH EDITOR --- */',
            'end': '/* --- NODE STYLES --- */'
        },
        'nodes.css': {
            'start': '/* --- NODE STYLES --- */',
            'end': '/* --- CONNECTIONS (WIRES) --- */'
        },
        'connections.css': {
            'start': '/* --- CONNECTIONS (WIRES) --- */',
            'end': '/* --- UI PANELS --- */'
        },
        'ui.css': {
            'start': '/* --- UI PANELS --- */',
            'end': '/* --- CONTEXT MENU --- */'
        },
        'menus.css': {
            'start': '/* --- CONTEXT MENU --- */',
            'end': '/* Modal Styling */'
        },
        'modal.css': {
            'start': '/* Modal Styling */',
            'end': None # End of file
        }
    }

    # Extract and write files
    current_pos = 0
    
    # Create main style.css that imports others
    main_imports = []

    for filename, markers in sections.items():
        start_marker = markers['start']
        end_marker = markers['end']
        
        start_idx = 0
        if start_marker:
            start_idx = content.find(start_marker)
            if start_idx == -1:
                print(f"Warning: Start marker '{start_marker}' not found for {filename}")
                continue
        
        end_idx = len(content)
        if end_marker:
            end_idx = content.find(end_marker)
            if end_idx == -1:
                print(f"Warning: End marker '{end_marker}' not found for {filename}")
                continue

        section_content = content[start_idx:end_idx].strip()
        
        # Write to file
        with open(os.path.join(output_dir, filename), 'w', encoding='utf-8') as out_f:
            out_f.write(f"/* {filename} */\n\n")
            out_f.write(section_content)
            print(f"Created {filename}")
            
        main_imports.append(f"@import 'css/{filename}';")

    # Write new main style.css
    with open(source_path, 'w', encoding='utf-8') as f:
        f.write("/* Main Stylesheet - Imports Modular CSS Files */\n\n")
        f.write("\n".join(main_imports))
        print("Updated style.css with imports")

if __name__ == "__main__":
    split_styles()
