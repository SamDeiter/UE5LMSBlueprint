"""
Harden exec pin CSS.
"""

import re

with open('css/nodes.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace the hollow exec pin rule with a hardened version
old_rule = r'\.pin-dot\.exec-pin\.hollow \{[^}]+\}'
new_rule = """.pin-dot.exec-pin.hollow {
    background-color: transparent !important;
    width: 0 !important;
    height: 0 !important;
    border-top: 6px solid transparent !important;
    border-bottom: 6px solid transparent !important;
    border-left: 10px solid white !important; /* Fallback */
    border-left: 10px solid var(--color-exec) !important;
    clip-path: unset !important;
    padding: 0 !important;
    display: block !important;
    z-index: 100;
}"""

css = re.sub(old_rule, new_rule, css)

with open('css/nodes.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Hardened exec pin CSS")
