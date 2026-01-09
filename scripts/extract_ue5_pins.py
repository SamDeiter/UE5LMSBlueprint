#!/usr/bin/env python3
r"""
Extract Blueprint node pin definitions from UE5 source code.

Parses K2Node_*.cpp files to extract:
- Pin names from FName patterns
- CreatePin() calls with types and directions
- AllocateDefaultPins() implementations

Usage:
    python extract_ue5_pins.py <ue5_source_path> <output_json>

Example:
    python extract_ue5_pins.py "D:\\Fortnite\\UE_5.6\\Engine\\Source\\Editor\\BlueprintGraph" output.json
"""

import os
import re
import json
import sys
from pathlib import Path
from collections import defaultdict


def extract_pin_names(content: str) -> list[dict]:
    """Extract static FName pin definitions like:
    static FName PlayPinName(TEXT("Play"));
    """
    pattern = r'static\s+FName\s+(\w+)\s*\(\s*TEXT\s*\(\s*"([^"]+)"\s*\)\s*\)'
    matches = re.findall(pattern, content)
    return [{"variable": m[0], "name": m[1]} for m in matches]


def extract_create_pin_calls(content: str) -> list[dict]:
    """Extract CreatePin() calls to find pin definitions."""
    pins = []

    # Pattern for CreatePin with direction, type, and name
    # CreatePin(EGPD_Input, UEdGraphSchema_K2::PC_Exec, PlayPinName);
    # CreatePin(EGPD_Output, UEdGraphSchema_K2::PC_Float, NewTimePinName);
    pattern = r'CreatePin\s*\(\s*(EGPD_\w+)\s*,\s*(?:UEdGraphSchema_K2::)?(\w+)(?:\s*,\s*(?:UEdGraphSchema_K2::)?(\w+))?\s*,\s*(\w+)\s*\)'

    for match in re.finditer(pattern, content):
        direction = match.group(1)
        pin_type = match.group(2)
        sub_type = match.group(3)
        pin_name_var = match.group(4)

        pins.append({
            "direction": "input" if "Input" in direction else "output",
            "type": pin_type,
            "subType": sub_type,
            "nameVariable": pin_name_var
        })

    return pins


def extract_loctext_names(content: str) -> list[dict]:
    """Extract LOCTEXT definitions for display names."""
    pattern = r'LOCTEXT\s*\(\s*"(\w+)"\s*,\s*"([^"]+)"\s*\)'
    matches = re.findall(pattern, content)
    return [{"key": m[0], "display": m[1]} for m in matches]


def extract_node_title(content: str, node_name: str) -> str | None:
    """Try to extract the node's display title."""
    # Look for GetNodeTitle implementations
    pattern = r'GetNodeTitle.*?return\s+(?:NSLOCTEXT|LOCTEXT)\s*\([^,]+,\s*"([^"]+)"\s*\)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1)

    # Look for node title in tooltip
    pattern = r'GetTooltipText.*?return\s+(?:NSLOCTEXT|LOCTEXT)\s*\([^,]+,\s*"([^"]+)"\s*\)'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        return match.group(1)

    return None


def parse_cpp_file(filepath: Path) -> dict | None:
    """Parse a K2Node_*.cpp file and extract pin definitions."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        print(f"  [WARN] Could not read {filepath}: {e}")
        return None

    # Extract node name from filename
    node_name = filepath.stem.replace("K2Node_", "")

    # Extract all pattern matches
    pin_names = extract_pin_names(content)
    create_pins = extract_create_pin_calls(content)
    loctext = extract_loctext_names(content)
    title = extract_node_title(content, node_name)

    if not pin_names and not create_pins:
        return None

    # Create a lookup for pin names
    name_lookup = {p["variable"]: p["name"] for p in pin_names}

    # Resolve pin names in CreatePin calls
    resolved_pins = []
    for pin in create_pins:
        name_var = pin["nameVariable"]
        resolved_name = name_lookup.get(name_var, name_var)
        resolved_pins.append({
            "name": resolved_name,
            "direction": pin["direction"],
            "type": pin["type"],
            "subType": pin.get("subType")
        })

    return {
        "nodeClass": f"K2Node_{node_name}",
        "nodeName": node_name,
        "title": title,
        "pinNames": pin_names,
        "pins": resolved_pins,
        "loctext": loctext[:5] if loctext else []  # Limit to first 5
    }


def main(source_path: str, output_path: str):
    """Main extraction function."""
    source_dir = Path(source_path)

    # Find the Private directory for CPP files
    private_dir = source_dir / "Private"
    if not private_dir.exists():
        print(f"Error: Private directory not found at {private_dir}")
        sys.exit(1)

    print(f"Scanning {private_dir} for K2Node_*.cpp files...")

    # Find all K2Node cpp files
    cpp_files = list(private_dir.glob("K2Node_*.cpp"))
    print(f"Found {len(cpp_files)} K2Node files")

    results = {}
    for cpp_file in sorted(cpp_files):
        print(f"  Parsing {cpp_file.name}...")
        node_data = parse_cpp_file(cpp_file)
        if node_data:
            results[node_data["nodeName"]] = node_data

    print(f"\nExtracted pin definitions for {len(results)} nodes")

    # Write output
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)

    print(f"Wrote output to {output_file}")

    # Print summary of key nodes
    key_nodes = ["Timeline", "IfThenElse", "ExecutionSequence", "CallFunction", "Event"]
    print("\n=== Key Node Summary ===")
    for node_name in key_nodes:
        if node_name in results:
            node = results[node_name]
            pins = node.get("pins", [])
            in_pins = [p for p in pins if p["direction"] == "input"]
            out_pins = [p for p in pins if p["direction"] == "output"]
            print(f"\n{node_name}:")
            print(f"  Inputs:  {', '.join(p['name'] for p in in_pins)}")
            print(f"  Outputs: {', '.join(p['name'] for p in out_pins)}")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python extract_ue5_pins.py <ue5_blueprintgraph_path> <output_json>")
        print("Example: python extract_ue5_pins.py D:\\Fortnite\\UE_5.6\\Engine\\Source\\Editor\\BlueprintGraph output.json")
        sys.exit(1)

    main(sys.argv[1], sys.argv[2])
