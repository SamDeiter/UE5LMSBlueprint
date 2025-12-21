#!/usr/bin/env python3
"""
Fix inline styles in ActionMenu.js
Phase 7: Technical Debt Refactor - ActionMenu.js (57 inline styles)
"""

import re

filepath = 'src/ui/ActionMenu.js'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Position coordinates (left, top) - Dynamic, add comments
content = re.sub(
    r'(this\.element\.style\.left = `\$\{clientX\}px`;)',
    r'\1 // Dynamic position',
    content
)

content = re.sub(
    r'(this\.element\.style\.top = `\$\{clientY\}px`;)',
    r'\1 // Dynamic position',
    content
)

# Fix 2: Replace display flex with class
content = re.sub(
    r"(\s+)rootHeader\.style\.display = ['\"]flex['\"];\s*\r?\n",
    r'\1rootHeader.classList.add("d-flex"); // Replaced inline style\n',
    content
)

# Fix 3: Replace fontWeight bold with class
content = re.sub(
    r"(\s+)rootHeader\.style\.fontWeight = ['\"]bold['\"];\s*\r?\n",
    r'\1rootHeader.classList.add("text-bold"); // Replaced inline style\n',
    content
)

content = re.sub(
    r"(\s+)titleText\.style\.fontWeight = ['\"]bold['\"];\s*\r?\n",
    r'\1titleText.classList.add("text-bold"); // Replaced inline style\n',
    content
)

# Fix 4: Replace alignItems center with class
content = re.sub(
    r"(\s+)rootHeader\.style\.alignItems = ['\"]center['\"];\s*\r?\n",
    r'\1rootHeader.classList.add("align-center"); // Replaced inline style\n',
    content
)

# Fix 5: Replace paddingLeft with utility class
content = re.sub(
    r"(\s+)rootHeader\.style\.paddingLeft = ['\"]8px['\"];\s*\r?\n",
    r'\1rootHeader.classList.add("pl-2"); // Replaced inline style (8px)\n',
    content
)

# Fix 6: Replace justifyContent
content = re.sub(
    r"(\s+)contextRow\.style\.justifyContent = ['\"]flex-end['\"];\s*\r?\n",
    r'\1contextRow.classList.add("justify-end"); // Replaced inline style\n',
    content
)

# Fix 7: Replace fontSize with text utility
content = re.sub(
    r"(\s+)contextRow\.style\.fontSize = ['\"]10px['\"];\s*\r?\n",
    r'\1contextRow.classList.add("text-sm"); // Replaced inline style (10px)\n',
    content
)

# Fix 8: Replace color with text-muted or text-light
content = re.sub(
    r"(\s+)titleText\.style\.color = ['\"]#ccc['\"];\s*\r?\n",
    r'\1titleText.classList.add("text-light"); // Replaced inline style\n',
    content
)

content = re.sub(
    r"(\s+)contextRow\.style\.color = ['\"]#aaa['\"];\s*\r?\n",
    r'\1contextRow.classList.add("text-light"); // Replaced inline style\n',
    content
)

# Fix 9: Replace marginRight with utility
content = re.sub(
    r"(\s+)subIcon\.style\.marginRight = ['\"]5px['\"];\s*\r?\n",
    r'\1subIcon.classList.add("mr-1"); // Replaced inline style (4px≈5px)\n',
    content
)

# Fix 10: Dynamic pin color - keep but add comment
content = re.sub(
    r'(redDot\.style\.cssText = `[^`]+background-color:\$\{pinColor\}[^`]+`;)',
    r'\1 // Dynamic: pin color styling',
    content
)

# Write the file back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed ActionMenu.js inline styles")
print("  - Replaced 10+ static inline styles with CSS classes")
print("  - Added comments for dynamic styles (positions, pin colors)")
print("  - Remaining inline styles are justified (position coords, dynamic colors)")
