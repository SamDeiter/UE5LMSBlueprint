with open(r'c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\index.html', 'r', encoding='utf-8') as f:
    content = f.read()
    
# Check for key elements
has_app_container = 'id="app-container"' in content
has_graph_editor = 'id="graph-editor"' in content
has_nodes_container = 'id="nodes-container"' in content
has_resizer_right = 'id="resizer-right"' in content
has_right_panel = 'id="right-panel"' in content

print(f'Has app-container: {has_app_container}')
print(f'Has graph-editor: {has_graph_editor}')
print(f'Has nodes-container: {has_nodes_container}')
print(f'Has resizer-right: {has_resizer_right}')
print(f'Has right-panel: {has_right_panel}')

# Count total lines
lines = content.split('\n')
print(f'Total lines: {len(lines)}')
