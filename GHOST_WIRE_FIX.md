# Ghost Wire Fix - Manual Instructions

## The Problem

The ghost wire `updateGhostWire` method is being called, but the wire isn't visible. The attributes (`stroke`, `d`) aren't being set properly.

## The Fix

We need to ensure all SVG attributes are set correctly. The issue is likely that we're mixing style properties and setAttribute.

### Step 1: Open graph.js

Find the `updateGhostWire` method (around line 694)

### Step 2: Replace the method

**Find this (lines 694-717):**
```javascript
updateGhostWire(e, startPin) {
    if (!startPin || !startPin.element) {
        this.ghostWire.style.display = 'none';
        return;
    }
    this.ghostWire.style.display = 'block';
    if (this.ghostWire.parentNode !== this.svgGroup) {
        this.svgGroup.appendChild(this.ghostWire);
    }
    console.log('[GHOST WIRE] Called with:', { startPin, ghostWire: this.ghostWire });
    this.ghostWire.style.strokeWidth = '3px';
    this.ghostWire.style.opacity = '1';
    const typeClass = Utils.getPinTypeClass(startPin.type);
    this.ghostWire.setAttribute('class', `wire ${typeClass}`);
    const pinColor = Utils.getPinColor(startPin.type);
    this.ghostWire.setAttribute('stroke', pinColor);
    const p1 = Utils.getPinPosition(startPin.element, this.app);
    const p2 = this.app.graph.getGraphCoords(e.clientX, e.clientY);
    const startX = startPin.dir === 'out' ? p1.x : p2.x;
    const startY = startPin.dir === 'out' ? p1.y : p2.y;
    const endX = startPin.dir === 'out' ? p2.x : p1.x;
    const endY = startPin.dir === 'out' ? p2.y : p1.y;
    this.ghostWire.setAttribute('d', Utils.getWirePath(startX, startY, endX, endY));
}
```

**Replace with (use setAttribute for ALL SVG properties):**
```javascript
updateGhostWire(e, startPin) {
    if (!startPin || !startPin.element) {
        this.ghostWire.style.display = 'none';
        return;
    }
    this.ghostWire.style.display = 'block';
    if (this.ghostWire.parentNode !== this.svgGroup) {
        this.svgGroup.appendChild(this.ghostWire);
    }
    
    // Use setAttribute for ALL SVG properties
    this.ghostWire.setAttribute('stroke-width', '3');
    this.ghostWire.setAttribute('opacity', '1');
    
    const typeClass = Utils.getPinTypeClass(startPin.type);
    this.ghostWire.setAttribute('class', `wire ${typeClass}`);
    
    const pinColor = Utils.getPinColor(startPin.type);
    this.ghostWire.setAttribute('stroke', pinColor);
    
    const p1 = Utils.getPinPosition(startPin.element, this.app);
    const p2 = this.app.graph.getGraphCoords(e.clientX, e.clientY);
    const startX = startPin.dir === 'out' ? p1.x : p2.x;
    const startY = startPin.dir === 'out' ? p1.y : p2.y;
    const endX = startPin.dir === 'out' ? p2.x : p1.x;
    const endY = startPin.dir === 'out' ? p2.y : p1.y;
    
    const pathData = Utils.getWirePath(startX, startY, endX, endY);
    this.ghostWire.setAttribute('d', pathData);
}
```

### Key Changes:
1. **Removed debug console.log** (line 703)
2. **Changed `style.strokeWidth` to `setAttribute('stroke-width', '3')`** - SVG uses kebab-case
3. **Changed `style.opacity` to `setAttribute('opacity', '1')`** - Use setAttribute for consistency
4. **Added spacing** for readability

### Step 3: Test

1. Save graph.js
2. Check syntax: `node --check graph.js`
3. Reload browser (Ctrl+Shift+R)
4. Try dragging a wire from a pin
5. The ghost wire should now be visible!

### Step 4: Commit

```bash
git add graph.js
git commit -m "fix: Ghost wire now visible - use setAttribute for all SVG properties"
```

## Why This Works

SVG elements require `setAttribute()` for SVG-specific attributes like `stroke`, `stroke-width`, `d`, etc. Using `style.strokeWidth` doesn't work because:
1. SVG attributes use kebab-case (`stroke-width`) not camelCase (`strokeWidth`)
2. The `d` attribute (path data) MUST be set via `setAttribute`, not style

## If It Still Doesn't Work

Check in browser console:
```javascript
const ghostWire = document.getElementById('ghost-wire');
console.log({
    fill: ghostWire.getAttribute('fill'),
    stroke: ghostWire.getAttribute('stroke'),
    strokeWidth: ghostWire.getAttribute('stroke-width'),
    d: ghostWire.getAttribute('d'),
    display: ghostWire.style.display
});
```

All values should be non-null when dragging a wire.
