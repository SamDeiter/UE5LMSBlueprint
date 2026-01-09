/**
 * DOMHelper.js - Utility for cleaner DOM creation
 *
 * Usage:
 *   el('div', { class: 'foo', id: 'bar', text: 'Hello' }, [children])
 *   el('input', { type: 'text', value: 'default', on: { click: handler } })
 */

/**
 * Create a DOM element with attributes and children
 * @param {string} tag - Element tag name
 * @param {Object} attrs - Attributes object (class, id, text, html, style, data-*, on)
 * @param {Array} children - Child elements or strings
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class" || key === "className") {
      element.className = value;
    } else if (key === "text") {
      element.textContent = value;
    } else if (key === "html") {
      element.innerHTML = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(element.style, value);
    } else if (key === "on" && typeof value === "object") {
      for (const [event, handler] of Object.entries(value)) {
        element.addEventListener(event, handler);
      }
    } else if (key.startsWith("data-")) {
      element.setAttribute(key, value);
    } else {
      element[key] = value;
    }
  }

  for (const child of children) {
    if (typeof child === "string") {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  }

  return element;
}

/**
 * Create an icon element
 * @param {string} iconClass - FontAwesome class (e.g., 'fa-plus')
 * @param {string} extraClass - Additional classes
 */
export function icon(iconClass, extraClass = "") {
  return el("i", { class: `fas ${iconClass} ${extraClass}`.trim() });
}

/**
 * Create a button with icon and text
 * @param {string} iconClass - FontAwesome icon class
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler
 * @param {string} className - Button class
 */
export function iconButton(iconClass, text, onClick, className = "btn") {
  return el(
    "button",
    { class: className, on: { click: onClick } },
    [icon(iconClass), text ? el("span", { text }) : null].filter(Boolean)
  );
}

/**
 * Create a collapsible section header
 * @param {string} title - Section title
 * @param {boolean} expanded - Initial state
 * @param {Function} onToggle - Toggle callback
 */
export function sectionHeader(title, expanded = true, onToggle = null) {
  const arrow = icon(
    expanded ? "fa-caret-down" : "fa-caret-right",
    "section-arrow"
  );
  const header = el("div", { class: "section-header" }, [
    arrow,
    el("span", { text: title }),
  ]);

  if (onToggle) {
    header.addEventListener("click", () => {
      const isExpanded = arrow.classList.contains("fa-caret-down");
      arrow.className = `fas ${
        isExpanded ? "fa-caret-right" : "fa-caret-down"
      } section-arrow`;
      onToggle(!isExpanded);
    });
  }

  return header;
}
