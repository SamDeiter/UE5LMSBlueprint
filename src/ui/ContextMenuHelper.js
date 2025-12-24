/**
 * ContextMenuHelper - Provides shared context menu functionality
 * Consolidates duplicate createMenuItem/closeMenu patterns from multiple controllers
 */

export class ContextMenuHelper {
  /**
   * Shows a context menu at the specified position
   * @param {number} x - Client X position
   * @param {number} y - Client Y position
   * @param {Array<{label: string, icon: string, onClick: Function}|{separator: true}>} items - Menu items
   * @param {string} menuClass - Additional CSS class for the menu (default: 'context-menu')
   * @returns {HTMLElement} The created menu element
   */
  static show(x, y, items, menuClass = "context-menu") {
    // Remove any existing context menus
    ContextMenuHelper.hideAll();

    const menu = document.createElement("div");
    menu.className = `${menuClass} menu-fixed z-max`;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.dataset.contextMenuHelper = "true";

    items.forEach((item) => {
      if (item.separator) {
        const sep = document.createElement("div");
        sep.className = "separator-h";
        menu.appendChild(sep);
      } else {
        menu.appendChild(
          ContextMenuHelper.createItem(item.label, item.icon, () => {
            ContextMenuHelper.hide(menu);
            item.onClick();
          })
        );
      }
    });

    // Auto-close on outside click
    const closeHandler = () => {
      ContextMenuHelper.hide(menu);
      document.removeEventListener("click", closeHandler);
    };
    setTimeout(() => document.addEventListener("click", closeHandler), 0);

    document.body.appendChild(menu);
    return menu;
  }

  /**
   * Creates a single menu item element
   * @param {string} label - Item text
   * @param {string} icon - Font Awesome icon class (e.g., 'fas fa-edit')
   * @param {Function} onClick - Click handler
   * @returns {HTMLElement}
   */
  static createItem(label, icon, onClick) {
    const item = document.createElement("div");
    item.className = "menu-item";
    item.innerHTML = `<i class="${icon}" style="margin-right: 8px; width: 12px;"></i> ${label}`;
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return item;
  }

  /**
   * Hides a specific menu
   * @param {HTMLElement} menu
   */
  static hide(menu) {
    if (menu && document.body.contains(menu)) {
      document.body.removeChild(menu);
    }
  }

  /**
   * Hides all context menus created by this helper
   */
  static hideAll() {
    document
      .querySelectorAll("[data-context-menu-helper]")
      .forEach((menu) => menu.remove());
    // Also clean up legacy menus
    document
      .querySelectorAll(".variable-context-menu")
      .forEach((menu) => menu.remove());
  }
}
