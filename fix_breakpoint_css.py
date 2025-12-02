import re

# Read the CSS file
with open('src/css/nodes.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace overflow: hidden with overflow: visible in .node-title
content = re.sub(
    r'(\.node-title\s*{[^}]*?)overflow:\s*hidden;',
    r'\1overflow: visible; /* Changed from hidden to prevent breakpoint icon clipping */',
    content,
    flags=re.DOTALL
)

# Add breakpoint icon CSS after .node-title closing brace
insertion_point = content.find('.node-title::after')
if insertion_point != -1:
    breakpoint_css = '''
/* Breakpoint Icon */
.breakpoint-icon {
    width: 14px;
    height: 14px;
    background: #d32f2f;
    border-radius: 50%;
    position: absolute;
    top: 4px;
    left: 4px;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    z-index: 10;
    pointer-events: none;
}

'''
    content = content[:insertion_point] + breakpoint_css + content[insertion_point:]

# Write back
with open('src/css/nodes.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Updated nodes.css successfully")
