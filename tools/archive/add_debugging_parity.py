"""
Phase 6: Debugging Parity - Active Wire Animation and Live Watch Bubbles
"""

# 1. Add active-wire CSS with hardware-accelerated animation to graph.css
graph_css_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\css\graph.css"

with open(graph_css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add after wire hover/selected styles
active_wire_css = '''
/* === PHASE 6: ACTIVE WIRE ANIMATION === */
/* Hardware-accelerated orange pulse during simulation */
.wire.active-wire {
    stroke: #ff8c00 !important;
    stroke-width: 4px;
    opacity: 1;
    filter: drop-shadow(0 0 8px #ff8c00);
    animation: wire-pulse 0.6s ease-in-out infinite;
    /* Hardware acceleration */
    transform: translateZ(0);
    will-change: stroke-width, filter, opacity;
}

@keyframes wire-pulse {
    0%, 100% {
        stroke-width: 4px;
        filter: drop-shadow(0 0 8px #ff8c00);
    }
    50% {
        stroke-width: 6px;
        filter: drop-shadow(0 0 15px #ffa500);
    }
}

/* Live Watch Bubble - Inline tooltip on pins during PIE */
.watch-bubble {
    position: absolute;
    background: linear-gradient(135deg, rgba(40, 40, 40, 0.95), rgba(30, 30, 30, 0.98));
    border: 1px solid #ff8c00;
    border-radius: 4px;
    padding: 4px 8px;
    color: #4CAF50;
    font-family: 'Inter', monospace;
    font-size: 11px;
    font-weight: 500;
    z-index: 200;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 140, 0, 0.3);
    animation: bubble-fade-in 0.2s ease-out;
    transform: translateZ(0);
}

.watch-bubble::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-right-color: #ff8c00;
}

.watch-bubble .bubble-label {
    color: #aaa;
    font-size: 9px;
    margin-right: 4px;
}

.watch-bubble .bubble-value {
    color: #4CAF50;
    font-weight: bold;
}

.watch-bubble .bubble-value.value-changed {
    color: #ff8c00;
    animation: value-flash 0.3s ease-out;
}

@keyframes bubble-fade-in {
    from {
        opacity: 0;
        transform: translateX(-5px) translateZ(0);
    }
    to {
        opacity: 1;
        transform: translateX(0) translateZ(0);
    }
}

@keyframes value-flash {
    0% { color: #ffffff; }
    100% { color: #4CAF50; }
}
'''

if '.wire.active-wire' not in content:
    # Add after the wire hover styles
    insertion_point = '.wire:hover,\n.wire.link-selected {'
    if insertion_point in content:
        # Find end of this block
        idx = content.find(insertion_point)
        # Find the closing brace
        brace_count = 0
        for i in range(idx, len(content)):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    insert_pos = i + 1
                    break
        content = content[:insert_pos] + active_wire_css + content[insert_pos:]
        print("✅ Added active-wire CSS animation to graph.css")
else:
    print("⚠️ active-wire CSS already exists")

with open(graph_css_path, 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Enhance DebuggerController with inline watch bubbles
debugger_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\ui\DebuggerController.js"

with open(debugger_path, 'r', encoding='utf-8') as f:
    debugger_content = f.read()

# Add watchBubbles tracking and methods
new_methods = '''
    /**
     * Phase 6: Create a watch bubble positioned next to a pin
     */
    createWatchBubble(pin, value) {
        // Remove existing bubble for this pin
        this.removeWatchBubble(pin.id);

        const pinDot = pin.node.element?.querySelector(`[data-pin-id="${pin.id}"] .pin-dot`);
        if (!pinDot) return;

        const bubble = document.createElement('div');
        bubble.className = 'watch-bubble';
        bubble.id = `watch-bubble-${pin.id}`;
        bubble.innerHTML = `<span class="bubble-label">${pin.name}:</span><span class="bubble-value">${this.formatValue(value)}</span>`;

        // Position relative to pin
        const rect = pinDot.getBoundingClientRect();
        const editorRect = document.getElementById('graph-editor').getBoundingClientRect();

        bubble.style.left = `${rect.right - editorRect.left + 10}px`;
        bubble.style.top = `${rect.top - editorRect.top + (rect.height / 2) - 12}px`;

        const editor = document.getElementById('graph-editor');
        if (editor) {
            editor.appendChild(bubble);
        }

        // Track previous value for change detection
        bubble.dataset.previousValue = String(value);
    }

    /**
     * Update a watch bubble value and highlight if changed
     */
    updateWatchBubble(pin, value) {
        const bubble = document.getElementById(`watch-bubble-${pin.id}`);
        if (!bubble) {
            this.createWatchBubble(pin, value);
            return;
        }

        const valueEl = bubble.querySelector('.bubble-value');
        const previousValue = bubble.dataset.previousValue;
        const newValue = String(value);

        if (previousValue !== newValue) {
            valueEl.textContent = this.formatValue(value);
            valueEl.classList.add('value-changed');
            bubble.dataset.previousValue = newValue;

            // Remove flash class after animation
            setTimeout(() => valueEl.classList.remove('value-changed'), 300);
        }
    }

    /**
     * Remove a watch bubble
     */
    removeWatchBubble(pinId) {
        const bubble = document.getElementById(`watch-bubble-${pinId}`);
        if (bubble) bubble.remove();
    }

    /**
     * Clear all watch bubbles
     */
    clearAllBubbles() {
        document.querySelectorAll('.watch-bubble').forEach(b => b.remove());
    }

    /**
     * Format value for display
     */
    formatValue(value) {
        if (value === undefined || value === null) return 'null';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
}
'''

# Replace closing brace with new methods
if 'createWatchBubble' not in debugger_content:
    debugger_content = debugger_content.rstrip()
    if debugger_content.endswith('}'):
        # Remove last closing brace and add new methods
        debugger_content = debugger_content[:-1].rstrip() + new_methods
        print("✅ Added watch bubble methods to DebuggerController")

with open(debugger_path, 'w', encoding='utf-8') as f:
    f.write(debugger_content)

# 3. Add setActiveWire method to SimulationEngine for highlighting during execution
sim_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\services\SimulationEngine.js"

with open(sim_path, 'r', encoding='utf-8') as f:
    sim_content = f.read()

# Find a place to add setActiveWire method - after the log method
set_active_wire_method = '''
    /**
     * Phase 6: Highlight wire during execution
     */
    highlightActiveWire(fromPinId, toPinId) {
        // Find the link between these pins
        const link = [...this.app.wiring.links.values()].find(
            l => (l.fromPinId === fromPinId && l.toPinId === toPinId) ||
                 (l.fromPinId === toPinId && l.toPinId === fromPinId)
        );

        if (link && link.element) {
            link.element.classList.add('active-wire');

            // Remove after a short delay
            setTimeout(() => {
                if (link.element) {
                    link.element.classList.remove('active-wire');
                }
            }, 500);
        }
    }

    /**
     * Phase 6: Update live watch bubbles for a node's output pins
     */
    updateWatchBubbles(node) {
        if (!this.app.debugger) return;

        for (const pin of node.pins.filter(p => p.dir === 'out' && p.type !== 'exec')) {
            const value = node.tempValues?.[pin.name];
            if (value !== undefined && this.app.debugger.watchedPins.has(pin.id)) {
                this.app.debugger.updateWatchBubble(pin, value);
            }
        }
    }

'''

if 'highlightActiveWire' not in sim_content:
    # Find a good insertion point - after the log method
    insertion_marker = 'log(message, type = \'info\')'
    idx = sim_content.find(insertion_marker)
    if idx > 0:
        # Find the end of this method (closing brace)
        brace_count = 0
        started = False
        for i in range(idx, len(sim_content)):
            if sim_content[i] == '{':
                brace_count += 1
                started = True
            elif sim_content[i] == '}':
                brace_count -= 1
                if started and brace_count == 0:
                    insert_pos = i + 1
                    break
        sim_content = sim_content[:insert_pos] + set_active_wire_method + sim_content[insert_pos:]
        print("✅ Added highlightActiveWire and updateWatchBubbles to SimulationEngine")

with open(sim_path, 'w', encoding='utf-8') as f:
    f.write(sim_content)

print("\n🎉 Phase 6: Debugging Parity implemented!")
print("- Active wire orange pulse animation (hardware-accelerated)")
print("- Watch bubble CSS with value change highlighting")
print("- DebuggerController methods: createWatchBubble, updateWatchBubble, clearAllBubbles")
print("- SimulationEngine methods: highlightActiveWire, updateWatchBubbles")
