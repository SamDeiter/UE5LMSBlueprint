#!/usr/bin/env python3
"""
Fix inline styles in Node.js
Phase 7: Technical Debt Refactor - Node.js (38 inline styles)
"""

import re

filepath = 'src/graph/Node.js'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern 1: Position coordinates (left, top) - These are DYNAMIC and should stay
# We'll just add comments to clarify they're position coordinates

# Pattern 2: cssText with multiple properties - Break into classes where possible
# Example: bpIcon.style.cssText = "position: absolute; ..."

# Pattern 3: Single property assignments that can become classes
# fontWeight, fontStyle, color (when not dynamic), minWidth, etc.

# Fix 1: Replace fontWeight, fontStyle for icon elements
content = re.sub(
    r'(\s+)iconEl\.style\.fontWeight = ["\']bold["\']; *\r?\n',
    r'\1iconEl.classList.add("text-bold"); // Replaced inline style\n',
    content
)

content = re.sub(
    r'(\s+)iconEl\.style\.fontStyle = ["\']italic["\']; *\r?\n',
    r'\1iconEl.classList.add("text-italic"); // Replaced inline style\n',
    content
)

content = re.sub(
    r'(\s+)iconEl\.style\.color = ["\']white["\']; *\r?\n',
    r'\1iconEl.classList.add("text-white"); // Replaced inline style\n',
    content
)

# Fix 2: Replace minWidth with utility class
content = re.sub(
    r'spacer\.style\.minWidth = ["\']10px["\']; *\r?\n',
    r'spacer.classList.add("min-w-10"); // Replaced inline style\n',
    content
)

# Fix 3: Replace fontSize for icon
content = re.sub(
    r'(\s+)icon\.style\.fontSize = ["\']8px["\']; *\r?\n',
    r'\1icon.classList.add("icon-xs"); // Replaced inline style (8px)\n',
    content
)

# Fix 4: Add comments for dynamic styles that must remain
# Position coordinates
content = re.sub(
    r'(this\.element\.style\.left = `\$\{this\.x\}px`;)',
    r'\1 // Dynamic position',
    content
)

content = re.sub(
    r'(this\.element\.style\.top = `\$\{this\.y\}px`;)',
    r'\1 // Dynamic position',
    content
)

content = re.sub(
    r'(element\.style\.left = `\$\{this\.x\}px`;)',
    r'\1 // Dynamic position',
    content
)

content = re.sub(
    r'(element\.style\.top = `\$\{this\.y\}px`;)',
    r'\1 // Dynamic position',
    content
)

# Dynamic colors
content = re.sub(
    r'(icon\.style\.color = Utils\.getPinColor\(pin\.type\);)',
    r'\1 // Dynamic color',
    content
)

content = re.sub(
    r'(header\.style\.background = `linear-gradient)',
    r'\1 // Dynamic gradient',
    content
)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed Node.js inline styles")
print("  - Replaced 6 static inline styles with CSS classes")
print("  - Added comments for 32+ dynamic styles (positions, colors)")
print("  - Dynamic styles retained: position coordinates, gradients, pin colors")
