#!/usr/bin/env python3
"""
Update index.html to use modular CSS files
"""

def update_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find and replace the old CSS link with new modular links
    old_css = '    <link rel="stylesheet" href="style.css?v=20251125105000">'
    
    new_css = '''    <!-- Modular CSS Files -->
    <link rel="stylesheet" href="css/variables.css?v=20251128">
    <link rel="stylesheet" href="css/reset.css?v=20251128">
    <link rel="stylesheet" href="css/layout.css?v=20251128">
    <link rel="stylesheet" href="css/ui-elements.css?v=20251128">
    <link rel="stylesheet" href="css/nodes.css?v=20251128">
    <link rel="stylesheet" href="css/graph.css?v=20251128">
    <link rel="stylesheet" href="css/panels.css?v=20251128">
    <link rel="stylesheet" href="css/modals.css?v=20251128">'''
    
    if old_css in content:
        content = content.replace(old_css, new_css)
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("[OK] Updated index.html with modular CSS references")
    else:
        print("[ERROR] Could not find the old CSS link in index.html")
        print("Looking for:", old_css)

if __name__ == '__main__':
    update_html()
