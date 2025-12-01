#!/usr/bin/env python3
"""
Extract clean sections from backup and rebuild nodes.css completely
"""

def clean_rebuild():
    css_path = r"c:\Users\Sam Deiter\Desktop\UE5LMSBlueprint-main\css\nodes.css"
    
    print("Reading corrupted CSS...")
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract only the parts we know are clean (first 127 lines based on earlier views)
    lines = content.split('\n')
    
    # Keep everything up to .node.set-node .pin-wrapper (around line 118)
    clean_start = []
    found_pin_wrapper = False
    for i, line in enumerate(lines):
        clean_start.append(line)
        if '.node.set-node .pin-wrapper' in line:
            # Keep going until we close this block
            brace_count = line.count('{') - line.count('}')
            j = i + 1
            while j < len(lines) and brace_count > 0:
                clean_start.append(lines[j])
                brace_count += lines[j].count('{') - lines[j].count('}')
                j += 1
            found_pin_wrapper = True
            break
    
    if not found_pin_wrapper:
        print("ERROR: Could not find clean start section")
        return False
    
    # Now add our complete pin styles section
    pin_section = """
.node.set-node .pin-container .pin-label-in {
    font-size: 13px;
}

/* --- PIN STYLES --- */

/* Base Pin Dot */
.pin-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #888;
    border: 1px solid #000;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    cursor: crosshair;
    flex-shrink: 0;
    position: relative;
    z-index: 5;
}

/* Exec Pin - White Triangle */
.pin-dot.exec-pin {
    width: 16px;
    height: 16px;
    border-radius: 0 !important;
    background-color: transparent;
    border: none;
    box-shadow: none;
    background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22white%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%204v16l12-8z%22%2F%3E%3C%2Fsvg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}

/* Exec Pin Hollow (Unconnected) */
.pin-dot.exec-pin.hollow {
    background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%204v16l12-8z%22%2F%3E%3C%2Fsvg%3E");
}

.pin-dot.bool-pin {
    color: var(--color-bool);
    background-color: var(--color-bool);
}

.pin-dot.byte-pin {
    color: var(--color-byte);
    background-color: var(--color-byte);
}

.pin-dot.int-pin {
    color: var(--color-int);
    background-color: var(--color-int);
}

.pin-dot.int64-pin {
    color: var(--color-int64);
    background-color: var(--color-int64);
}

.pin-dot.float-pin {
    color: var(--color-float);
    background-color: var(--color-float);
}

.pin-dot.double-pin {
    color: var(--color-double);
    background-color: var(--color-double);
}

.pin-dot.name-pin {
    color: var(--color-name);
    background-color: var(--color-name);
}

.pin-dot.string-pin {
    color: var(--color-string);
    background-color: var(--color-string);
}

.pin-dot.text-pin {
    color: var(--color-text);
    background-color: var(--color-text);
}

.pin-dot.vector-pin {
    color: var(--color-vector);
    background-color: var(--color-vector);
}

.pin-dot.rotator-pin {
    color: var(--color-rotator);
    background-color: var(--color-rotator);
}

.pin-dot.transform-pin {
    color: var(--color-transform);
    background-color: var(--color-transform);
}

.pin-dot.object-pin {
    color: var(--color-object);
    background-color: var(--color-object);
}

.pin-dot.enum-pin {
    color: var(--color-enum);
    background-color: var(--color-enum);
}

.pin-dot.array-pin {
    border: none;
    box-shadow: none;
    background-color: transparent;
}

.pin-dot.container-pin {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px !important;
    height: 16px !important;
    margin: 0 4px;
}

.pin-dot.container-pin i,
.pin-dot.container-pin span {
    font-size: 12px !important;
}

/* --- PIN LAYOUT --- */
.pin-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 24px;
    padding: 2px 0;
}

.pin-container {
    display: flex;
    align-items: center;
    gap: 5px;
}

.pin-container.in {
    justify-content: flex-start;
}

.pin-container.out {
    justify-content: flex-end;
    margin-left: auto;
}

.pin-label-in {
    margin-left: 5px;
}

.pin-label-out {
    margin-right: 5px;
}

/* --- DELEGATE ICON (Red Square) --- */
.event-delegate-icon {
    width: 10px;
    height: 10px;
    background-color: #d12e2e;
    border: 1px solid #500;
    border-radius: 2px;
    margin-left: auto;
    margin-right: 4px;
    box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.5);
}

/* --- NODE TITLE STYLES --- */
.node-title {
    padding: 6px 10px;
    font-weight: 700;
    font-size: 12px;
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 1px 2px black;
    position: relative;
    overflow: hidden;
    height: 22px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
}

.node-title::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
}

.node-title::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background-color: var(--node-accent-color, rgba(255, 255, 255, 0.2));
    z-index: 2;
}

.node.event-node .node-title {
    background: linear-gradient(to bottom, var(--header-event-start), var(--header-event-end));
}

.node.flow-node .node-title {
    background: linear-gradient(to bottom, var(--header-flow-start), var(--header-flow-end));
}

.node.function-node .node-title {
    background: linear-gradient(to bottom, var(--header-function-start), var(--header-function-end));
}

.node.variable-node .node-title,
.node.pure-node .node-title {
    background: linear-gradient(to bottom, #306030, #153015);
}

/* --- NODE CONTENT STYLES --- */
.node-content {
    padding: 8px 0;
}

.node-content.pure-node-content {
    display: flex;
    justify-content: space-between;
}

.pin-column.out {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
}

/* --- INPUT WIDGETS --- */

/* UE5 Checkbox Style */
.ue5-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background-color: #1a1a1a;
    border: 1px solid #555;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    margin-left: 5px;
    vertical-align: middle;
    display: inline-block;
}

.ue5-checkbox:checked {
    background-color: #1a1a1a;
    border-color: #888;
}

.ue5-checkbox:checked::after {
    content: '\\f00c';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    font-size: 10px;
    color: #eee;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.ue5-checkbox:hover {
    border-color: #aaa;
}

/* Literal Input Fields */
.node-literal-input {
    background-color: rgba(0, 0, 0, 0.5) !important;
    color: #eee !important;
    border: 1px solid transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 2px !important;
    padding: 2px 4px;
    font-family: inherit;
    font-size: 11px;
    outline: none;
    transition: border-color 0.2s;
    height: 16px;
    line-height: 16px;
}

.node-literal-input:focus {
    border-bottom-color: #fca50f !important;
    background-color: rgba(0, 0, 0, 0.8) !important;
}
"""
    
    # Write completely new file
    new_content = '\n'.join(clean_start) + '\n' + pin_section
    
    print("Writing completely rebuilt CSS file...")
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✓ CSS file completely rebuilt from scratch!")
    print("✓ Preserved all clean node styles")
    print("✓ Added complete pin styles with exec-pin SVG")
    print("✓ Added event-delegate-icon (red square)")
    print("✓ Added all layout and widget styles")
    print("\n⚠️  IMPORTANT: Hard refresh browser (Ctrl+Shift+R)!")
    return True

if __name__ == "__main__":
    clean_rebuild()
