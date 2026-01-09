/**
 * ComponentTreeRenderer.js - Renders component tree items
 * Extracted from ComponentsController.js for modularity
 */
import { el, icon } from "../utils/DOMHelper.js";

/**
 * Icon mapping for component types
 */
const COMPONENT_ICONS = {
  StaticMesh: "fa-cube",
  SkeletalMesh: "fa-person",
  PointLight: "fa-lightbulb",
  SpotLight: "fa-lightbulb",
  DirectionalLight: "fa-sun",
  Box: "fa-square",
  Sphere: "fa-circle",
  Capsule: "fa-capsules",
  Camera: "fa-video",
  Audio: "fa-volume-up",
  Particle: "fa-fire",
  Arrow: "fa-arrow-right",
  Billboard: "fa-image",
  Text: "fa-font",
  Spring: "fa-wave-square",
  Phys: "fa-atom",
};

/**
 * Get icon class for component type
 * @param {string} type - Component type
 * @returns {string} FontAwesome icon class
 */
export function getComponentIcon(type) {
  for (const [key, iconClass] of Object.entries(COMPONENT_ICONS)) {
    if (type.includes(key)) return iconClass;
  }
  return "fa-circle";
}

/**
 * Create a component tree item element
 * @param {Object} comp - Component data
 * @param {Object} options - Rendering options
 * @returns {HTMLElement} Tree item element
 */
export function createComponentTreeItem(comp, options = {}) {
  const {
    depth = 0,
    isRoot = false,
    isSelected = false,
    isExpanded = false,
    hasChildren = false,
    onSelect = () => {},
    onExpand = () => {},
    onDragStart = () => {},
    onContextMenu = () => {},
  } = options;

  const item = el("div", {
    class: `tree-item${isSelected ? " selected" : ""}`,
    style: { paddingLeft: `${depth * 16 + 8}px` },
  });
  item.setAttribute("tabindex", "0");
  item.dataset.componentId = comp.id;

  // Expand arrow
  if (hasChildren) {
    const arrow = icon(
      isExpanded ? "fa-caret-down" : "fa-caret-right",
      "expand-arrow"
    );
    arrow.style.marginRight = "4px";
    arrow.style.cursor = "pointer";
    arrow.style.width = "12px";
    arrow.addEventListener("click", (e) => {
      e.stopPropagation();
      onExpand();
    });
    item.appendChild(arrow);
  } else if (!isRoot) {
    const spacer = el("span", {
      style: { display: "inline-block", width: "16px" },
    });
    item.appendChild(spacer);
  }

  // Icon
  const iconClass = isRoot ? "fa-dot-circle" : getComponentIcon(comp.type);
  const compIcon = icon(iconClass);
  compIcon.style.marginRight = "8px";
  compIcon.style.color = "#ccc";
  item.appendChild(compIcon);

  // Name
  item.appendChild(el("span", { text: comp.name }));

  // Events
  if (!isRoot) {
    item.draggable = true;
    item.addEventListener("click", (e) => onSelect(e));
    item.addEventListener("dragstart", (e) => onDragStart(e));
    item.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      onContextMenu(e);
    });
  }

  return item;
}

/**
 * Check if targetId is a descendant of potentialAncestorId
 * @param {Map} components - Components map
 * @param {string} targetId - Target component ID
 * @param {string} potentialAncestorId - Potential ancestor ID
 * @returns {boolean}
 */
export function isDescendant(components, targetId, potentialAncestorId) {
  let currentId = targetId;
  while (currentId) {
    const comp = components.get(currentId);
    if (!comp || !comp.parentId) return false;
    if (comp.parentId === potentialAncestorId) return true;
    currentId = comp.parentId;
  }
  return false;
}
