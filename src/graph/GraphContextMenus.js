/**
 * GraphContextMenus.js - Context menu builders for graph elements
 * Extracted from GraphInteraction.js for modularity
 */
import { ContextMenuHelper } from "../ui/ContextMenuHelper.js";

/**
 * Build node context menu items
 * @param {Node} node - The clicked node
 * @param {Object} app - App instance
 * @param {Function} getWorldPos - Function to get graph coordinates
 * @param {GraphController} controller - Graph controller
 * @returns {Array} Menu items
 */
export function buildNodeContextMenuItems(node, app, getWorldPos, controller) {
  const items = [];

  // Toggle Breakpoint
  items.push({
    label: node.isBreakpoint ? "Disable Breakpoint" : "Toggle Breakpoint",
    icon: node.isBreakpoint ? "fas fa-circle" : "far fa-circle",
    callback: () => {
      node.toggleBreakpoint();
      app.persistence.autoSave();
    },
  });

  items.push({ separator: true });

  // Make/Break Struct Options for variable nodes
  if (node.nodeKey.startsWith("Get_") || node.nodeKey.startsWith("Set_")) {
    const varName = node.nodeKey.replace(/^(Get_|Set_)/, "");
    const variable = app.variables.variables.get(varName);

    if (variable) {
      addStructMenuItems(items, variable.type, getWorldPos, controller);
    }
  }

  // Comment node options
  if (node.nodeKey === "Comment") {
    addCommentMenuItems(items, node, app);
  }

  // Standard node actions
  items.push({ separator: true });
  items.push({
    label: "Delete Node(s)",
    icon: "fas fa-trash",
    callback: () => controller.deleteSelectedNodes(),
  });
  items.push({
    label: "Duplicate Node(s)",
    icon: "fas fa-copy",
    callback: () => controller.duplicateSelectedNodes(),
  });

  return items;
}

/**
 * Add struct-specific menu items (Vector, Rotator, Transform)
 */
function addStructMenuItems(items, type, getWorldPos, controller) {
  const structs = {
    vector: { make: "MakeVector", break: "BreakVector", icon: "fa-arrows-alt" },
    rotator: { make: "MakeRotator", break: "BreakRotator", icon: "fa-sync" },
    transform: {
      make: "MakeTransform",
      break: "BreakTransform",
      icon: "fa-cube",
    },
  };

  const cfg = structs[type];
  if (!cfg) return;

  items.push({
    label: `Make ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    icon: `fas ${cfg.icon}`,
    callback: () => {
      const pos = getWorldPos();
      controller.addNode(cfg.make, pos.x + 50, pos.y);
    },
  });
  items.push({
    label: `Break ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    icon: `fas ${cfg.icon}`,
    callback: () => {
      const pos = getWorldPos();
      controller.addNode(cfg.break, pos.x + 50, pos.y);
    },
  });
  items.push({ separator: true });
}

/**
 * Add comment node menu items
 */
function addCommentMenuItems(items, node, app) {
  const colors = [
    { name: "White", color: "#ffffff" },
    { name: "Red", color: "#ff4444" },
    { name: "Orange", color: "#ff8800" },
    { name: "Yellow", color: "#ffff00" },
    { name: "Green", color: "#44ff44" },
    { name: "Cyan", color: "#00ffff" },
    { name: "Blue", color: "#4444ff" },
    { name: "Purple", color: "#ff44ff" },
  ];

  colors.forEach((c) => {
    items.push({
      label: c.name,
      icon: "fas fa-square",
      iconStyle: { color: c.color },
      callback: () => {
        node.commentColor = c.color;
        node.render();
        app.persistence.autoSave();
      },
    });
  });
}

/**
 * Build pin context menu items
 * @param {Pin} pin - The clicked pin
 * @param {Object} app - App instance
 * @param {GraphController} controller - Graph controller
 * @returns {Array} Menu items
 */
export function buildPinContextMenuItems(pin, app, controller) {
  const items = [];

  // Break link(s)
  if (pin.links.length > 0) {
    items.push({
      label: "Break Link(s)",
      icon: "fas fa-unlink",
      callback: () => app.wiring.breakPinLinks(pin.id),
    });
  }

  // Split/Recombine struct pins
  if (["vector", "rotator", "transform"].includes(pin.type)) {
    items.push({
      label: pin.isSplit ? "Recombine Struct Pin" : "Split Struct Pin",
      icon: pin.isSplit ? "fas fa-compress-alt" : "fas fa-expand-alt",
      callback: () => {
        if (pin.isSplit) {
          pin.node.recombineStructPin(pin);
        } else {
          pin.node.splitStructPin(pin);
        }
      },
    });
  }

  // Promote to variable
  if (pin.type !== "exec") {
    items.push({
      label: "Promote to Variable",
      icon: "fas fa-arrow-up",
      callback: () => controller.promotePinToVariable(pin),
    });
  }

  // Add Watch
  if (pin.dir === "out" && pin.type !== "exec") {
    items.push({
      label: "Add Watch",
      icon: "fas fa-eye",
      callback: () => app.sim.addWatch(pin),
    });
  }

  return items;
}

/**
 * Show context menu at position
 */
export function showContextMenu(x, y, items, className = "context-menu") {
  ContextMenuHelper.show(x, y, items, className);
}
