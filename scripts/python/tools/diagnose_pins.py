"""
Quick diagnostic script to check node rendering issues.
This will help us understand why execution pins aren't visible.
"""

print("=== Node Display Diagnostic ===\n")

print("ISSUE: Execution pins not visible on nodes")
print("STATUS: Page loads correctly, no JavaScript errors\n")

print("VERIFIED:")
print("✓ CSS exists for .pin-dot.exec-pin in css/nodes.css")
print("✓ Utils.getPinTypeClass('exec') returns 'exec-pin'")
print("✓ CSS variable --color-exec is defined as #FFFFFF")
print("✓ Pin rendering code in Node.js looks correct\n")

print("POSSIBLE CAUSES:")
print("1. Pins are rendering but have zero size")
print("2. Pins are rendering but are transparent")
print("3. Pins are being created but not appended to DOM")
print("4. CSS specificity issue overriding exec-pin styles")
print("5. Saved blueprint data doesn't have exec pins\n")

print("DEBUGGING STEPS:")
print("1. Open browser DevTools (F12)")
print("2. Inspect an Event node (like 'Event BeginPlay')")
print("3. Look for elements with class 'pin-dot exec-pin'")
print("4. Check computed styles for width, height, opacity")
print("5. Verify the pins exist in the DOM\n")

print("BROWSER CONSOLE COMMANDS TO TRY:")
print("// Check if exec pins exist in DOM")
print("document.querySelectorAll('.pin-dot.exec-pin').length")
print("")
print("// Check their computed styles")
print("const pin = document.querySelector('.pin-dot.exec-pin')")
print("if (pin) {")
print("  const styles = window.getComputedStyle(pin)")
print("  console.log('Width:', styles.width)")
print("  console.log('Height:', styles.height)")
print("  console.log('Background:', styles.backgroundColor)")
print("  console.log('Clip-path:', styles.clipPath)")
print("}")
print("")
print("// Check all pin classes on a node")
print("document.querySelectorAll('.pin-dot').forEach(p => console.log(p.className))")
print("")

print("\nIf pins don't exist in DOM:")
print("- Check if nodes are being rendered at all")
print("- Verify GraphController.renderAllNodes() is being called")
print("- Check browser console for errors during node creation")
print("")

print("If pins exist but aren't visible:")
print("- Check CSS clip-path property")
print("- Check width/height values")
print("- Check opacity and display properties")
print("- Look for CSS conflicts")
