import json
import sys
import os

def analyze_graph(file_path):
    """
    Analyzes a Blueprint Graph JSON export for integrity issues.
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        return

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Failed to parse JSON: {e}")
        return

    print(f"--- Graph Analysis: {data.get('graphName', 'Unknown')} ---")
    print(f"Timestamp: {data.get('timestamp', 'N/A')}")
    
    nodes = data.get('nodes', [])
    links = data.get('links', [])

    print(f"\n[Stats]")
    print(f"Nodes: {len(nodes)}")
    print(f"Links: {len(links)}")

    # 1. Index Nodes and Pins
    node_map = {n['id']: n for n in nodes}
    pin_map = {} # pin_id -> node_id
    
    print("\n[Node Integrity]")
    for node in nodes:
        # Check for missing essential fields
        if 'id' not in node or 'nodeKey' not in node:
            print(f"  [WARN] Malformed node found: {node}")
            continue
            
        # Index pins
        if 'pins' in node:
            for pin in node['pins']:
                pin_map[pin['id']] = node['id']
        else:
            print(f"  [INFO] Node {node['nodeKey']} ({node['id']}) has no pins data.")

    # 2. Analyze Links
    print("\n[Link Integrity]")
    broken_links = 0
    self_loops = 0
    
    for link in links:
        start_pin_id = link.get('startPinId')
        end_pin_id = link.get('endPinId')
        
        if not start_pin_id or not end_pin_id:
            print(f"  [ERR] Malformed link: {link}")
            broken_links += 1
            continue
            
        start_node_id = pin_map.get(start_pin_id)
        end_node_id = pin_map.get(end_pin_id)
        
        if not start_node_id:
            print(f"  [ERR] Link references missing start pin: {start_pin_id} (Link ID: {link.get('id')})")
            broken_links += 1
        
        if not end_node_id:
            print(f"  [ERR] Link references missing end pin: {end_pin_id} (Link ID: {link.get('id')})")
            broken_links += 1
            
        if start_node_id and end_node_id and start_node_id == end_node_id:
            print(f"  [WARN] Self-loop detected on node {start_node_id} (Link ID: {link.get('id')})")
            self_loops += 1

    if broken_links == 0 and self_loops == 0:
        print("  No link issues found.")
    else:
        print(f"  Found {broken_links} broken links and {self_loops} self-loops.")

    print("\n--- Analysis Complete ---")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python graph_tracker.py <path_to_graph_export.json>")
    else:
        analyze_graph(sys.argv[1])
