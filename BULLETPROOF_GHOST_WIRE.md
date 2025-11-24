# Bulletproof Ghost Wire Fix

## The Problem
The ghost wire is still not appearing, likely due to a conflict between SVG attributes and CSS styles, or a missing `fill="none"` property causing it to render incorrectly.

## The Fix

**Open `graph/WiringController.js`**

**Replace the `updateGhostWire` method (lines 201-230) with this "Bulletproof" version:**

```javascript
    // FIXED: Bulletproof ghost wire visibility
    updateGhostWire(e, startPin) {
        if (!startPin || !startPin.element) {
            this.ghostWire.style.display = 'none';
            return;
        }
        
        // Force display block
        this.ghostWire.style.display = 'block';
        
        // Ensure it's in the DOM
        if (this.ghostWire.parentNode !== this.svgGroup) {
            this.svgGroup.appendChild(this.ghostWire);
        }

        // 1. Set Geometry
        const p1 = Utils.getPinPosition(startPin.element, this.app);
        const p2 = this.app.graph.getGraphCoords(e.clientX, e.clientY);
        const startX = startPin.dir === 'out' ? p1.x : p2.x;
        const startY = startPin.dir === 'out' ? p1.y : p2.y;
        const endX = startPin.dir === 'out' ? p2.x : p1.x;
        const endY = startPin.dir === 'out' ? p2.y : p1.y;
        
        const pathData = Utils.getWirePath(startX, startY, endX, endY);
        this.ghostWire.setAttribute('d', pathData);

        // 2. Set Visuals (Use BOTH style and attributes to be safe)
        const pinColor = Utils.getPinColor(startPin.type);
        
        // Attribute approach
        this.ghostWire.setAttribute('stroke', pinColor);
        this.ghostWire.setAttribute('stroke-width', '3');
        this.ghostWire.setAttribute('fill', 'none'); // Critical!
        
        // Style approach (backup for CSS variables)
        this.ghostWire.style.stroke = pinColor;
        this.ghostWire.style.strokeWidth = '3px';
        this.ghostWire.style.fill = 'none';
        this.ghostWire.style.opacity = '1';
        
        // Classes
        const typeClass = Utils.getPinTypeClass(startPin.type);
        this.ghostWire.setAttribute('class', `wire ${typeClass}`);
    }
```

## Why This Works
1. **Redundancy:** It sets both SVG attributes (`setAttribute`) and CSS styles (`style.xxx`). This ensures that no matter which one the browser prioritizes, the wire gets styled.
2. **Fill None:** Explicitly sets `fill="none"` and `style.fill = 'none'`. If this was missing, the wire might have been trying to "fill" a shape, looking invisible or weird.
3. **Stroke Color:** Applies the color to both attribute and style, ensuring CSS variables (`var(--color-exec)`) are resolved correctly.

## Next Steps
1. Apply this change to `graph/WiringController.js`.
2. Save and reload.
3. Test dragging a wire. It SHOULD be visible now.
