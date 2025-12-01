#!/usr/bin/env python3
"""
CSS Refactoring Script - Phase 1: Split style.css into modular files
"""

import os
import re

def read_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        return f.readlines()

def write_css_file(filename, content):
    os.makedirs('css', exist_ok=True)
    filepath = os.path.join('css', filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(content)
    print(f"[OK] Created {filepath} ({len(content)} lines)")

def extract_section(lines, start_line, end_line):
    """Extract lines from start to end (inclusive, 1-indexed)"""
    return lines[start_line-1:end_line]

def split_css():
    lines = read_css()
    total_lines = len(lines)
    
    print(f"Total lines in style.css: {total_lines}\n")
    
    # Define sections based on the scan results
    sections = {
        'variables.css': (1, 44),           # :root variables
        'reset.css': (45, 107),             # Global resets, scrollbar, UI elements
        'layout.css': (108, 327),           # Layout grid, panels, resizers, toolbar
        'ui-elements.css': (328, 633),      # Panel toolbars, search, tree items, variables
        'nodes.css': (634, 1075),           # Node styles, pins, compact nodes, set nodes
        'graph.css': (1076, 1477),          # Wires, SVG, graph canvas
        'panels.css': (1478, 2699),         # Math nodes, parameters, type selectors, top bar
        'modals.css': (2700, total_lines),  # Modal dialogs
    }
    
    for filename, (start, end) in sections.items():
        section_lines = extract_section(lines, start, end)
        write_css_file(filename, section_lines)
    
    print(f"\n[OK] Successfully split style.css into {len(sections)} files")
    print("\nNext step: Update index.html to reference the new CSS files")

if __name__ == '__main__':
    split_css()
