"""
CSS File Generator - Nodes with Output Arrow Indicators
Adds small triangle arrow to the left of output data pins
"""

import os

CSS_DIR = os.path.join(os.path.dirname(__file__), 'css')
os.makedirs(CSS_DIR, exist_ok=True)

nodes_css = """/* --- NODE STYLES --- */
.node {
    position: absolute;
    background-color: rgba(20, 20, 20, 0.95);
    border: 1px solid #000;
    border-radius: 4px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    min-width: 180px;
    z-index: 10;
    pointer-events: all;
    backdrop-filter: blur(5px);
}

.node.selected {
    box-shadow: 0 0 0 2px #FFA500;
}

/* --- NODE TITLE --- */
.node-title {
    padding: 6px 10px;
    font-weight: 700;
    font-size: 12px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    text-shadow: 0 1px 2px black;
    position: relative;
    overflow: hidden;
    min-height: 22px;
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

/* --- NODE CONTENT --- */
.node-content {
    padding: 4px 0;
}

.node-content.pure-node-content {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
}

/* --- PIN LAYOUT --- */
.pin-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 20px;
    padding: 2px 0;
}

.pin-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.pin-column.in {
    align-items: flex-start;
}

.pin-column.out {
    align-items: flex-end;
}

/* --- PIN CONTAINER --- */
.pin-container {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 6px;
    min-height: 18px;
}

.pin-container.in {
    flex-direction: row;
    justify-content: flex-start;
}

/* Output pins: label on LEFT, pin on RIGHT, pushed to right side */
.pin-container.out {
    flex-direction: row;
    justify-content: flex-end;
    margin-left: auto;
}

/* --- PIN WRAPPER (for label + input) --- */
.pin-wrapper {
    display: flex;
    align-items: center;
    gap: 4px;
}

/* --- PIN DOT --- */
.pin-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background-color: transparent;
    cursor: pointer;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    transition: transform 0.1s;
    position: relative;
}

.pin-dot:hover {
    transform: scale(1.2);
}

/* Connected pins are filled */
.pin-dot.connected,
.pin-dot.filled {
    background-color: currentColor;
}

/* Output data pins with arrow indicator */
.pin-dot.has-output-arrow::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    border-right: 4px solid currentColor;
}

/* Execution pins (SVG triangles) */
.pin-dot.exec-pin {
    width: 14px;
    height: 14px;
    border: none;
    background: transparent;
    box-shadow: none;
    flex-shrink: 0;
}

.pin-dot.exec-pin:hover {
    transform: scale(1.1);
}

/* Pin type colors */
.pin-dot.bool-pin { color: var(--color-bool); }
.pin-dot.byte-pin { color: var(--color-byte); }
.pin-dot.int-pin { color: var(--color-int); }
.pin-dot.int64-pin { color: var(--color-int64); }
.pin-dot.float-pin { color: var(--color-float); }
.pin-dot.name-pin { color: var(--color-name); }
.pin-dot.string-pin { color: var(--color-string); }
.pin-dot.text-pin { color: var(--color-text); }
.pin-dot.vector-pin { color: var(--color-vector); }
.pin-dot.rotator-pin { color: var(--color-rotator); }
.pin-dot.transform-pin { color: var(--color-transform); }
.pin-dot.object-pin { color: var(--color-object); }
.pin-dot.enum-pin { color: var(--color-enum); }

/* Container pins */
.pin-dot.container-pin {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px !important;
    height: 16px !important;
}

.pin-dot.container-pin i,
.pin-dot.container-pin span {
    font-size: 10px !important;
}

/* --- PIN LABELS --- */
.pin-label-in,
.pin-label-out {
    font-size: 11px;
    color: #ccc;
    white-space: nowrap;
    user-select: none;
}

.pin-label-in {
    margin-left: 4px;
}

.pin-label-out {
    margin-right: 4px;
}

/* --- COMPACT NODES (Getters, Math) --- */
.node.compact-node {
    min-width: auto;
    border-radius: 20px;
    padding: 6px 12px;
}

.node.compact-node.selected {
    box-shadow: 0 0 0 2px #FFA500;
}

.compact-node-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.compact-node-label {
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px black;
    white-space: nowrap;
    font-size: 13px;
}

.compact-node .node-title {
    display: none;
}

.compact-node .node-content {
    padding: 0;
}

/* --- SET NODE STYLES --- */
.node.set-node {
    min-width: 160px;
}

.node.set-node .node-title {
    justify-content: center;
    font-style: italic;
    font-weight: 800;
    font-size: 14px;
    letter-spacing: 1px;
}

.node.set-node .pin-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.2);
    margin: 2px 4px;
    border-radius: 3px;
}

/* --- EVENT DELEGATE ICON --- */
.event-delegate-icon {
    width: 10px;
    height: 10px;
    background-color: #ff4444;
    border: 1px solid #000;
    border-radius: 2px;
    margin-left: auto;
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.5);
}

/* --- INPUT WIDGETS --- */
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
    display: inline-block;
    flex-shrink: 0;
}

.ue5-checkbox:checked {
    background-color: #1a1a1a;
    border-color: #888;
}

.ue5-checkbox:checked::after {
    content: '\\f00c';
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    font-size: 9px;
    color: #eee;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.ue5-checkbox:hover {
    border-color: #aaa;
}

.node-literal-input {
    background-color: rgba(0, 0, 0, 0.5) !important;
    color: #eee !important;
    border: 1px solid transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
    border-radius: 2px !important;
    padding: 2px 4px;
    font-family: inherit;
    font-size: 10px;
    outline: none;
    transition: border-color 0.2s;
    height: 16px;
    line-height: 14px;
}

.node-literal-input:focus {
    border-bottom-color: #fca50f !important;
    background-color: rgba(0, 0, 0, 0.8) !important;
}

/* --- SPLIT PINS --- */
.pin-split-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.pin-container.sub-pin {
    padding-left: 12px;
    font-size: 10px;
}

.pin-container.sub-pin .pin-dot {
    width: 10px;
    height: 10px;
}
"""

# Write nodes.css
with open(os.path.join(CSS_DIR, 'nodes.css'), 'w', encoding='utf-8') as f:
    f.write(nodes_css)
    print("✓ Created nodes.css with output arrow indicators")

print("\n✅ CSS updated - output pins will show arrow pointing into circle!")
print(f"📁 Location: {CSS_DIR}")
