/**
 * VariableItemRenderer.js - Renders individual variable items in the sidebar
 * Extracted from VariableController.js for modularity
 */
import { Utils } from "../utils.js";
import { el, icon } from "../utils/DOMHelper.js";

/**
 * Create a variable item element for the sidebar
 * @param {Object} variable - Variable data
 * @param {Object} options - Rendering options
 * @returns {HTMLElement}
 */
export function renderVariableItem(variable, options = {}) {
  const {
    isSelected = false,
    isRenaming = false,
    onSelect = () => {},
    onRename = () => {},
    onToggleVisibility = () => {},
    onContextMenu = () => {},
    onDragStart = () => {},
  } = options;

  const element = el("div", {
    class: `ue5-variable-item${isSelected ? " selected" : ""}`,
    draggable: true,
  });

  element.dataset.varId = variable.id;
  element.dataset.varName = variable.name;
  element.dataset.varType = variable.type;

  // Left side - drag handle, name
  const leftGroup = el("div", { class: "group-left" });

  const colorBar = el("span", {
    class: "ue5-type-bar",
    style: { backgroundColor: Utils.getTypeColor(variable.type) },
  });
  leftGroup.appendChild(colorBar);

  if (isRenaming) {
    const input = el("input", {
      type: "text",
      class: "rename-input",
      value: variable.name,
    });
    input.addEventListener("blur", (e) => onRename(e.target.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onRename(e.target.value);
      if (e.key === "Escape") onRename(null);
    });
    leftGroup.appendChild(input);
    setTimeout(() => input.focus(), 0);
  } else {
    leftGroup.appendChild(
      el("span", { class: "ue5-variable-name", text: variable.name })
    );
  }

  element.appendChild(leftGroup);

  // Right side - type icon, visibility
  const rightGroup = el("div", { class: "group-right" });

  const typeIcon = el("span", { class: "ue5-type-icon" });
  typeIcon.innerHTML = getTypeIconHTML(variable.type, variable.containerType);
  rightGroup.appendChild(typeIcon);

  rightGroup.appendChild(
    el("span", {
      class: "ue5-type-name",
      text: Utils.capitalizeFirst(variable.type),
    })
  );

  const eyeIcon = icon(
    variable.isPublic ? "fa-eye" : "fa-eye-slash",
    "ue5-visibility-icon"
  );
  eyeIcon.title = variable.isPublic ? "Public" : "Private";
  eyeIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    onToggleVisibility();
  });
  rightGroup.appendChild(eyeIcon);

  element.appendChild(rightGroup);

  // Event handlers
  element.addEventListener("click", () => onSelect());
  element.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    onContextMenu(e);
  });
  element.addEventListener("dragstart", (e) => onDragStart(e));

  return element;
}

/**
 * Get HTML for type-specific icon
 */
function getTypeIconHTML(type, containerType) {
  if (containerType === "array") return '<i class="fas fa-th-list"></i>';
  if (containerType === "set") return '<i class="fas fa-layer-group"></i>';
  if (containerType === "map") return '<i class="fas fa-project-diagram"></i>';

  const icons = {
    bool: '<i class="fas fa-toggle-on"></i>',
    int: '<i class="fas fa-hashtag"></i>',
    float: '<i class="fas fa-percentage"></i>',
    string: '<i class="fas fa-font"></i>',
    vector: '<i class="fas fa-arrows-alt"></i>',
    rotator: '<i class="fas fa-sync"></i>',
    transform: '<i class="fas fa-cube"></i>',
    object: '<i class="fas fa-box"></i>',
  };
  return icons[type] || '<i class="fas fa-circle"></i>';
}
