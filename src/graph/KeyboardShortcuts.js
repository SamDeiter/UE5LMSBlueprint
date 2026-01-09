/**
 * KeyboardShortcuts.js - Keyboard shortcut handling for the graph editor
 * Extracted from GraphInteraction.js for modularity
 */

/**
 * Chord shortcuts - single key hold + click spawns node
 */
export const CHORD_SHORTCUTS = {
  b: "Branch",
  s: "Sequence",
  d: "Delay",
  o: "DoOnce",
  g: "Gate",
  p: "EventBeginPlay",
  c: "Comment",
  f: "ForEachLoop",
  m: "MultiGate",
};

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} e - Keyboard event
 * @param {GraphController} controller - Graph controller
 * @param {Object} app - App instance
 * @param {Set} activeKeys - Currently held keys
 * @returns {boolean} True if event was handled
 */
export function handleKeyboardShortcut(e, controller, app, activeKeys) {
  const target = e.target;
  const tagName = target.tagName ? target.tagName.toUpperCase() : "";
  const isTextEditor =
    tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable;

  // Track held keys for chord shortcuts
  if (!isTextEditor) {
    activeKeys.add(e.key.toLowerCase());
  }

  if (isTextEditor) return false;

  // C - Create Comment around selection
  if ((e.key === "c" || e.key === "C") && controller.selectedNodes.size > 0) {
    e.preventDefault();
    controller.createCommentAroundSelection();
    return true;
  }

  // F7 - Compile
  if (e.key === "F7") {
    e.preventDefault();
    app.compiler.compile();
    return true;
  }

  // F9 - Toggle Breakpoint on selected nodes
  if (e.key === "F9") {
    e.preventDefault();
    controller.selectedNodes.forEach((nodeId) => {
      const node = controller.nodes.get(nodeId);
      if (node) node.toggleBreakpoint();
    });
    return true;
  }

  // Delete/Backspace - Delete selection
  if (e.key === "Delete" || e.key === "Backspace") {
    if (controller.selectedNodes.size > 0) {
      e.preventDefault();
      controller.deleteSelectedNodes();
      return true;
    } else if (app.wiring && app.wiring.selectedLinks.size > 0) {
      e.preventDefault();
      app.wiring.deleteSelectedLinks();
      return true;
    }
  }

  return false;
}

/**
 * Get chord node from active keys
 * @param {Set} activeKeys - Currently held keys
 * @returns {string|null} Node key or null
 */
export function getChordNode(activeKeys) {
  for (const [key, nodeKey] of Object.entries(CHORD_SHORTCUTS)) {
    if (activeKeys.has(key)) return nodeKey;
  }
  return null;
}

/**
 * Handle key up - remove from active keys
 * @param {KeyboardEvent} e - Keyboard event
 * @param {Set} activeKeys - Currently held keys
 */
export function handleKeyUp(e, activeKeys) {
  activeKeys.delete(e.key.toLowerCase());
}
