# Ghost Wire Debugging Guide

## Problem
Ghost wire disappears when dragging off a pin instead of following the cursor.

## Checklist

### 1. Verify HTML Structure
- [x] `ghost-wire` element exists in index.html (line 179)
- [x] It's inside the `wire-group` SVG group
- [x] Has correct initial styles: `pointer-events: none; display: none;`

### 2. Verify JavaScript Initialization
Check in browser console:
```javascript
// Check if ghost wire element exists
document.getElementById('ghost-wire')

// Check if WiringController has reference to it
window.app.wiring.ghostWire

// Check if it's in the correct parent
window.app.wiring.svgGroup
```

### 3. Test Wiring Flow
Add temporary debug logging to `graph.js`:

In `handleEditorMouseDown` (around line 862):
```javascript
if (pinElement && e.button === 0) {
    console.log('WIRING START', this.activePin);
    this.isWiring = true;
    // ... rest of code
}
```

In `handleGlobalMouseMove` (around line 978):
```javascript
else if (this.isWiring) {
    console.log('WIRING MOVE', this.activePin);
    if (this.activePin) {
        this.app.wiring.updateGhostWire(e, this.activePin);
    }
}
```

In `WiringController.updateGhostWire`:
```javascript
updateGhostWire(e, startPin) {
    console.log('updateGhostWire called', { e, startPin, ghostWire: this.ghostWire });
    // ... rest of code
}
```

### 4. Common Issues

**Issue 1: Ghost wire not visible**
- Check if `display: none` is being set
- Check if stroke color is transparent
- Check if path `d` attribute is valid

**Issue 2: isWiring flag not set**
- Verify `handleEditorMouseDown` is being called
- Check if pin element is being detected correctly
- Verify event listeners are attached

**Issue 3: activePin is null**
- Check if `findPinById` is working
- Verify pin elements have correct `data-pin-id` attributes

**Issue 4: updateGhostWire not being called**
- Verify `handleGlobalMouseMove` is attached to document
- Check if `isWiring` flag stays true during drag

### 5. Quick Fix Test

Add this to browser console to manually test ghost wire:
```javascript
const ghostWire = document.getElementById('ghost-wire');
ghostWire.style.display = 'block';
ghostWire.setAttribute('stroke', '#ff0000');
ghostWire.setAttribute('stroke-width', '3');
ghostWire.setAttribute('d', 'M 100 100 C 200 100, 200 200, 300 200');
```

If this shows a red wire, the element is working and the issue is in the JavaScript logic.

### 6. Verify Event Binding

Check if mouse events are properly bound:
```javascript
// In browser console
window.app.graph.handleGlobalMouseMove
window.app.graph.handleGlobalMouseUp
```

Both should return function references, not undefined.

## Next Steps

1. Open browser console
2. Try to drag a wire from a pin
3. Check console for any errors
4. Look for the debug logs (if added)
5. Report findings
