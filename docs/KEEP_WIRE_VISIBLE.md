# Keep Ghost Wire Visible When Menu Opens

## The Goal
We want the ghost wire to remain visible when you drop a wire on the background to open the Action Menu, so you can see what you are connecting from.

## The Fix

**Open `graph/GraphController.js`**

**Find the `handleGlobalMouseUp` method (around line 260).**

**Replace the entire `handleGlobalMouseUp` method with this:**

```javascript
    handleGlobalMouseUp(e) {
        document.removeEventListener('mousemove', this.handleGlobalMouseMove);
        document.removeEventListener('mouseup', this.handleGlobalMouseUp);

        if (this.isRmbDown) {
            this.isRmbDown = false;
            this.editor.classList.remove('dragging');
            // If we dragged significantly, don't trigger context menu
            if (this.hasDragged) {
                // Prevent context menu from showing immediately after drag
                // This is handled by the contextmenu event listener checking for drag
            }
        }

        if (this.isDraggingNode) {
            this.isDraggingNode = false;
            this.snapSelectedNodesToGrid();
            this.app.persistence.autoSave();
        }

        if (this.isWiring) {
            this.isWiring = false;
            
            // Logic to handle wire drop
            const pinElement = e.target.closest('.pin-container');
            
            if (pinElement) {
                // Dropped on a pin - try to connect
                const pinId = pinElement.dataset.pinId;
                const targetPin = this.findPinById(pinId);
                if (targetPin && this.activePin) {
                    this.app.wiring.createConnection(this.activePin, targetPin);
                }
                // Hide ghost wire after connection attempt
                this.app.wiring.ghostWire.style.display = 'none';
                this.activePin = null;
            } else {
                // Wiring ended on empty space
                if (this.hasDragged && this.activePin) {
                    // Show action menu AND KEEP GHOST WIRE VISIBLE
                    // The ActionMenu.hide() method will handle hiding the wire later
                    this.app.actionMenu.show(e.clientX, e.clientY, this.activePin);
                    
                    // IMPORTANT: Do NOT set activePin to null here, ActionMenu needs it
                    return; 
                } else {
                    // Just a click or invalid drag, hide wire
                    this.app.wiring.ghostWire.style.display = 'none';
                    this.activePin = null;
                }
            }
        }

        if (this.isMarqueeing) {
            this.isMarqueeing = false;
            this.marqueeEl.style.display = 'none';
        }
    }
```

## Why This Works
1. We removed the global `this.app.wiring.ghostWire.style.display = 'none';` at the start of the block.
2. We only hide the wire if we connected to a pin OR if we cancelled (didn't drag enough).
3. If we show the Action Menu, we `return` early, keeping `this.activePin` set and the wire visible.
4. `ActionMenu.js` already has logic in its `hide()` method to clear `activePin` and hide the ghost wire when the menu closes.

## Next Steps
1. Apply this change to `graph/GraphController.js`.
2. Save and reload.
3. Drag a wire to empty space -> Menu opens -> **Wire should stay visible!**
