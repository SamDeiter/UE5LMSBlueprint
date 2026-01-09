/**
 * EntityContextMenu - Standardized context menu builder for entities
 *
 * Consolidates the repetitive context menu patterns across:
 * - VariableController
 * - ComponentsController
 * - FunctionsController
 * - MacrosController
 * - EventDispatcherController
 *
 * Usage:
 *   EntityContextMenu.show(e, {
 *     entity: variable,
 *     entityType: 'Variable',
 *     app: this.app,
 *     onRename: (entity) => this.startRename(entity),
 *     onDelete: (entity) => this.deleteVariable(entity),
 *     onGet: (entity) => this.placeGetNode(entity),
 *     onSet: (entity) => this.placeSetNode(entity),
 *     extraItems: [
 *       { name: 'Custom Action', onClick: () => {} }
 *     ]
 *   });
 */

import { ContextMenuHelper } from "./ContextMenuHelper.js";

export class EntityContextMenu {
  /**
   * Show a standardized context menu for an entity
   * @param {MouseEvent} e - The mouse event
   * @param {Object} config - Configuration object
   * @param {Object} config.entity - The entity being right-clicked
   * @param {string} config.entityType - Type name ('Variable', 'Function', etc.)
   * @param {Object} config.app - The app instance
   * @param {Function} config.onRename - Callback for rename action
   * @param {Function} config.onDelete - Callback for delete action
   * @param {Function} config.onDuplicate - Optional callback for duplicate action
   * @param {Function} config.onGet - Optional callback for "Get" action (creates getter node)
   * @param {Function} config.onSet - Optional callback for "Set" action (creates setter node)
   * @param {Function} config.onCall - Optional callback for "Call" action (for functions)
   * @param {Array} config.extraItems - Additional menu items
   * @param {Function} config.getGraphCenter - Function to get graph center coords
   */
  static show(e, config) {
    e.preventDefault();
    e.stopPropagation();

    const {
      entity,
      entityType,
      app,
      onRename,
      onDelete,
      onDuplicate,
      onGet,
      onSet,
      onCall,
      extraItems = [],
      getGraphCenter,
    } = config;

    const items = [];

    // --- Node Creation Section ---
    if (onGet || onSet || onCall) {
      if (onGet) {
        items.push({
          name: `Get ${entity.name || entityType}`,
          icon: "fa-arrow-down",
          onClick: () => {
            const pos = getGraphCenter ? getGraphCenter() : { x: 400, y: 300 };
            onGet(entity, pos);
          },
        });
      }

      if (onSet) {
        items.push({
          name: `Set ${entity.name || entityType}`,
          icon: "fa-arrow-up",
          onClick: () => {
            const pos = getGraphCenter ? getGraphCenter() : { x: 400, y: 300 };
            onSet(entity, pos);
          },
        });
      }

      if (onCall) {
        items.push({
          name: `Call ${entity.name || entityType}`,
          icon: "fa-play",
          onClick: () => {
            const pos = getGraphCenter ? getGraphCenter() : { x: 400, y: 300 };
            onCall(entity, pos);
          },
        });
      }

      // Separator after node creation items
      items.push({ separator: true });
    }

    // --- Rename ---
    if (onRename) {
      items.push({
        name: "Rename",
        icon: "fa-pen",
        shortcut: "F2",
        onClick: () => onRename(entity),
      });
    }

    // --- Duplicate ---
    if (onDuplicate) {
      items.push({
        name: "Duplicate",
        icon: "fa-copy",
        shortcut: "Ctrl+D",
        onClick: () => onDuplicate(entity),
      });
    }

    // --- Extra Items ---
    if (extraItems.length > 0) {
      items.push({ separator: true });
      items.push(...extraItems);
    }

    // --- Delete (always last) ---
    if (onDelete) {
      items.push({ separator: true });
      items.push({
        name: "Delete",
        icon: "fa-trash",
        shortcut: "Del",
        danger: true,
        onClick: () => onDelete(entity),
      });
    }

    // Show the menu
    ContextMenuHelper.show(e, items, app);
  }

  /**
   * Create a standard "Get/Set" submenu items array
   * @param {Object} entity - The entity
   * @param {Function} onGet - Get callback
   * @param {Function} onSet - Set callback
   * @param {Function} getGraphCenter - Function to get center position
   * @returns {Array} Array of menu items
   */
  static createGetSetItems(entity, onGet, onSet, getGraphCenter) {
    const items = [];

    if (onGet) {
      items.push({
        name: `Get ${entity.name}`,
        icon: "fa-arrow-down",
        onClick: () => {
          const pos = getGraphCenter ? getGraphCenter() : { x: 400, y: 300 };
          onGet(entity, pos);
        },
      });
    }

    if (onSet) {
      items.push({
        name: `Set ${entity.name}`,
        icon: "fa-arrow-up",
        onClick: () => {
          const pos = getGraphCenter ? getGraphCenter() : { x: 400, y: 300 };
          onSet(entity, pos);
        },
      });
    }

    return items;
  }

  /**
   * Create standard CRUD items (Rename, Duplicate, Delete)
   * @param {Object} entity - The entity
   * @param {Object} callbacks - Object with onRename, onDuplicate, onDelete
   * @returns {Array} Array of menu items
   */
  static createCrudItems(entity, { onRename, onDuplicate, onDelete }) {
    const items = [];

    if (onRename) {
      items.push({
        name: "Rename",
        icon: "fa-pen",
        shortcut: "F2",
        onClick: () => onRename(entity),
      });
    }

    if (onDuplicate) {
      items.push({
        name: "Duplicate",
        icon: "fa-copy",
        shortcut: "Ctrl+D",
        onClick: () => onDuplicate(entity),
      });
    }

    if (onDelete) {
      items.push({
        name: "Delete",
        icon: "fa-trash",
        shortcut: "Del",
        danger: true,
        onClick: () => onDelete(entity),
      });
    }

    return items;
  }
}

export default EntityContextMenu;
