
file_path = 'graph/Node.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicate line at line 348-349
lines = content.split('\n')

# Find and remove the duplicate "const pinIn = this.pinsIn[0];" around line 348
fixed_lines = []
skip_next = False
for i, line in enumerate(lines):
    if i == 348 and 'const pinIn = this.pinsIn[0];' in line:
        # Skip this duplicate line
        continue
    if i == 349 and line.strip() == '}':
        # Skip this closing brace that doesn't belong
        continue
    fixed_lines.append(line)

with open(file_path, 'w', encoding='utf-8', newline='\r\n') as f:
    f.write('\n'.join(fixed_lines))

print("Fixed Node.js syntax error")
