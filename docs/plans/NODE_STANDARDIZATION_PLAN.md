# Node Standardization Plan

## Objective
Standardize all Blueprint node appearances to match the UE5 Event Tick reference implementation.

---

## Current State Analysis

### What Works ✓
- Basic node structure with title and content areas
- Pin dot rendering with proper colors
- Arrow indicators on data pins (right-pointing triangles)
- Connected/unconnected state management
- Multiple node types (event, function, pure, compact, SET)

### What Needs Updating ❌
1. **Node Container Styling**
   - Border radius (currently 4px, should be 12px)
   - Box shadow (needs double-border effect)
   - Backdrop filter enhancement

2. **Header Styling**
   - Glassy overlay effect (::after pseudo-element)
   - Proper gradient backgrounds
   - Better delegate icon (hollow red square)

3. **Pin Layout & Spacing**
   - Delta Seconds type pins need circle + arrow compound shape
   - Pin spacing and alignment refinement
   - Output column right padding

4. **Event Node Icon**
   - Diamond with block arrow SVG (currently might be different)

---

## Implementation Steps

### Phase 1: Update CSS Variables ✅
**File:** `css/variables.css`

Update color variables to match reference:
```css
--header-event-start: #750000;
--header-event-end: #300000;
--pin-float: #00EA32; /* Vibrant neon green (was #99FF22) */
```

### Phase 2: Enhance Node Container ✅
**File:** `css/nodes.css`

Update `.node` class:
- Change `border-radius: 4px` → `12px`
- Update `box-shadow` to include double-border effect and stronger drop shadow
- Enhance `backdrop-filter`

### Phase 3: Upgrade Header Styling ✅
**File:** `css/nodes.css`

Update `.node-title`:
- Add glassy overlay (::after with gradient)
- Ensure proper height (24px min-height)
- Proper gap spacing (8px)

Update `.delegate-icon` (event nodes):
- Make it hollow (transparent background)
- Red border (2px solid #ff4444)
- Proper positioning (margin-left: auto)

### Phase 4: Refine Pin Rendering 🔄
**File:** `src/graph/Node.js`

#### A. Update `createPinDot()` method:
- For execution pins: Keep current SVG wedge shape
- For data pins: Add proper arrow indicator positioning

#### B. Update pin rendering for output data pins:
- Circle (12px diameter, 2px border, hollow when unconnected)
- Arrow (right-pointing triangle, 2px gap from circle)
- Compound SVG for specific types (like Delta Seconds)

#### C. Ensure proper classes:
- `.pin-dot.connected` → filled circle + filled arrow
- `.pin-dot.hollow` → hollow circle + hollow arrow

### Phase 5: Event Node Icon Enhancement 🔄
**File:** `src/graph/Node.js` or appropriate icon configuration

Update event node header icon to diamond with block arrow:
```svg
<svg viewBox="0 0 24 24">
    <!-- Diamond Outline -->
    <path d="M12 3 L 21 12 L 12 21 L 3 12 Z" 
          fill="none" stroke="white" stroke-width="2.5"/>
    <!-- Solid Block Arrow -->
    <path d="M 7.5 10 L 11.5 10 L 11.5 7 L 16.5 12 
            L 11.5 17 L 11.5 14 L 7.5 14 Z" fill="white"/>
</svg>
```

### Phase 6: Testing & Validation 🧪
**File:** `TESTING_CHECKLIST.md`

Test all node types:
- [ ] Event nodes (Event Tick, Event BeginPlay)
- [ ] Flow nodes (Branch, Sequence)
- [ ] Function nodes (Print String, Get)
- [ ] Pure nodes (Math, Conversion)
- [ ] Variable nodes (Getter, Setter)
- [ ] Compact nodes
- [ ] SET nodes

Verify:
- [ ] Visual appearance matches reference
- [ ] Pin connections work correctly
- [ ] Arrow states transition properly (hollow ↔ filled)
- [ ] No console errors
- [ ] Performance is acceptable

---

## Success Criteria

All nodes should have:
1. ✅ 12px border radius with double-border effect
2. ✅ Glassy header with proper gradient
3. ✅ Proper delegate icon (hollow red square for events)
4. ✅ Consistent pin rendering (circle + arrow for data)
5. ✅ Proper spacing and alignment
6. ✅ Connected/unconnected state visualization
7. ✅ Event icon (diamond with block arrow)

---

## Files to Modify

### CSS Files
- [x] `css/variables.css` - Update color constants
- [ ] `css/nodes.css` - Main node styling updates

### JavaScript Files
- [ ] `src/graph/Node.js` - Pin rendering logic
- [ ] (Optional) Icon configuration for event nodes

### Testing Files
- [x] `reference_event_tick.html` - Standalone reference
- [ ] `TESTING_CHECKLIST.md` - Update with new criteria

---

## Notes

- Keep existing functionality intact (connections, drag, etc.)
- Maintain backward compatibility with saved graphs
- Test thoroughly before committing
- Use reference HTML for visual comparison
- Document any breaking changes

---

## Next Action

Run the standardization script to apply CSS updates:
```bash
python standardize_node_appearance.py
```
