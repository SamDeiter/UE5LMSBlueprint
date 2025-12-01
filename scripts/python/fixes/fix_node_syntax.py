with open('graph/Node.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The problem is lines 348-405 are outside the renderCompactNode function
# Line 349 has a closing brace that shouldn't be there
# We need to remove line 349 and fix the indentation

# Remove the erroneous closing brace on line 349 (index 348)
if lines[348].strip() == '}':
    del lines[348]
    print('Removed erroneous closing brace at line 349')

# Remove duplicate pinIn/pinOut declarations (lines 351-352, now 350-351)
if 'const pinIn = this.pinsIn[0];' in lines[350]:
    del lines[350]
    del lines[350]  # Delete twice since indices shift
    print('Removed duplicate pinIn/pinOut declarations')

# Write back
with open('graph/Node.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed Node.js syntax error')
