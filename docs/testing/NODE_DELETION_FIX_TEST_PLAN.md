
/**
 * Test Plan for Node Deletion Bug Fix
 * 
 * Issue: Pressing Backspace/Delete while editing text (e.g., node title, input value, variable name) 
 *        would sometimes delete the selected node instead of the text character.
 * 
 * Fix: Added a check in GraphInteraction.handleKeyDown to return early if the event target 
 *      is an input, textarea, or contentEditable element.
 * 
 * Verification Steps:
 * 1. Select a node in the graph.
 * 2. Double-click the node title (e.g., CustomEvent) to edit it.
 * 3. Press Backspace to delete a character.
 *    - Expected: Character is deleted, node remains.
 *    - Previous Behavior: Node was deleted.
 * 
 * 4. Add a node with a string input (e.g., Print String).
 * 5. Click into the "In String" input field.
 * 6. Type some text and press Backspace.
 *    - Expected: Text is deleted, node remains.
 * 
 * 7. Create a new variable in the My Blueprint panel.
 * 8. Rename the variable (focus the input).
 * 9. Press Backspace.
 *    - Expected: Text is deleted, variable remains.
 * 
 * 10. Select a component in the Components panel.
 * 11. Rename the component in the Details panel.
 * 12. Press Backspace.
 *     - Expected: Text is deleted, component remains.
 */

console.log("Test plan created. Please verify manually in the browser.");
