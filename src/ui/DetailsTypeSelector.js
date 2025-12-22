/**
 * DetailsTypeSelector - Manages the type selection menus for the Details panel
 */
import { Utils } from "../utils.js";
import { DetailsRenderer } from "./DetailsRenderer.js";

export class DetailsTypeSelector {
  constructor(controller) {
    this.controller = controller;
    this.typeMenu = null;
    this.containerMenu = null;
    this.createTypeMenu();
  }

  createTypeMenu() {
    // Note: This logic is superseded by showTypeMenu dynamically recreating the menu content
    // But we keep the container for safety
    this.typeMenu = document.createElement("div");
    this.typeMenu.id = "type-selector-menu";
    this.typeMenu.classList.add("hidden"); // Start hidden
    document.body.appendChild(this.typeMenu);

    // Removed persistent document listener to avoid immediate closing issues
    // Listener will be added temporarily in showTypeMenu
  }

  showTypeMenu(x, y, callback) {
    const menu = this.typeMenu;

    // 1. Reset Content
    menu.innerHTML = "";
    menu.classList.remove("hidden");
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // Close handler
    const closeHandler = (e) => {
      if (!menu.classList.contains("hidden") && !menu.contains(e.target)) {
        menu.classList.add("hidden");
        document.removeEventListener("click", closeHandler);
      }
    };
    // Add listener with delay to avoid catching the trigger click
    setTimeout(() => document.addEventListener("click", closeHandler), 0);

    // 2. Search Header
    const searchHeader = document.createElement("div");
    searchHeader.className = "type-selector-header";
    const icon = document.createElement("i");
    icon.className = "fas fa-search";
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search";
    searchInput.className = "type-selector-search-input";

    searchHeader.appendChild(icon);
    searchHeader.appendChild(searchInput);
    menu.appendChild(searchHeader);

    // 3. Scrollable List Container
    const listContainer = document.createElement("div");
    listContainer.className = "type-selector-list";
    menu.appendChild(listContainer);

    // Define Types with correct display names and icon colors
    const commonTypes = [
      { id: "bool", label: "Boolean", color: "#8C0202" }, // Red
      { id: "byte", label: "Byte", color: "#00665E" }, // Teal
      { id: "int", label: "Integer", color: "#28E897" }, // Cyan/Green
      { id: "int64", label: "Integer64", color: "#76D37E" }, // Pale Green
      { id: "float", label: "Float", color: "#96EE35" }, // Lime
      { id: "double", label: "Double", color: "#85DD24" }, // Darker green
      { id: "name", label: "Name", color: "#CC99FF" }, // Purple
      { id: "string", label: "String", color: "#FF00FF" }, // Magenta
      { id: "text", label: "Text", color: "#E27696" }, // Pink
      { id: "vector", label: "Vector", color: "#FFC700" }, // Gold
      { id: "rotator", label: "Rotator", color: "#99CCFF" }, // Blue
      { id: "transform", label: "Transform", color: "#FF7300" }, // Orange
      { id: "object", label: "Object", color: "#00A2E8" }, // Blue
      { id: "enum", label: "Enum", color: "#00BB55" }, // Forest green
    ];

    // Render Function
    const renderItems = (filterText = "") => {
      listContainer.innerHTML = "";
      const lowerFilter = filterText.toLowerCase();

      // A) Render Common Types (Primitives)
      commonTypes.forEach((type) => {
        if (type.label.toLowerCase().includes(lowerFilter)) {
          const row = document.createElement("div");
          row.className = "type-option";

          const pill = document.createElement("span");
          pill.className = "param-color-dot"; // Reusing pill style
          pill.style.backgroundColor = type.color;
          pill.classList.add("type-option-pill"); // Wider pill per image

          const text = document.createElement("span");
          text.textContent = type.label;

          row.appendChild(pill);
          row.appendChild(text);

          row.addEventListener("click", () => {
            callback(type.id);
            menu.classList.add("hidden");
            // Clean up listener if we can (though it removes itself on next click usually, better to be clean)
            // But closeHandler is local... it will clean up on next document click or we can leave it.
            // For now, just hide.
          });

          listContainer.appendChild(row);
        }
      });

      // B) Render Collapsible Categories (Visual Only for now, as per request focus)
      const categories = ["Structure", "Interface", "Object Types"];
      categories.forEach((cat) => {
        if (cat.toLowerCase().includes(lowerFilter) || filterText === "") {
          const catRow = document.createElement("div");
          catRow.className = "type-selector-section";
          catRow.innerHTML = `<i class="fas fa-caret-right"></i> <span>${cat}</span>`;
          listContainer.appendChild(catRow);
        }
      });
    };

    renderItems();

    // Bind Search
    searchInput.addEventListener("click", (e) => e.stopPropagation());
    searchInput.addEventListener("input", (e) => renderItems(e.target.value));

    // Auto-focus search
    setTimeout(() => searchInput.focus(), 0);

    // 4. Footer
    const footer = document.createElement("div");
    footer.className = "type-selector-footer";

    const countSpan = document.createElement("span");
    countSpan.textContent = `${commonTypes.length + 3} items`; // 16 types + 3 categories

    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "d-flex align-center gap-1";

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.className = "ue5-checkbox";
    chk.checked = true;

    const chkLabel = document.createElement("span");
    chkLabel.textContent = "Hide Non-Imported Types";

    checkboxContainer.appendChild(chk);
    checkboxContainer.appendChild(chkLabel);

    footer.appendChild(countSpan);
    footer.appendChild(checkboxContainer);
    menu.appendChild(footer);
  }

  // NEW: Show Container Type Menu (Single, Array, Set, Map)
  showContainerTypeMenu(x, y, variableType, callback) {
    // Remove existing if present
    if (this.containerMenu) this.containerMenu.remove();

    const color = Utils.getPinColor(variableType);

    const menu = document.createElement("div");
    menu.id = "container-type-menu";
    menu.className = "type-selector-menu"; // Reuse basic styling structure or create new
    menu.className = "container-type-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    const options = [
      {
        id: "single",
        label: "Single",
        iconHTML: `<span class="param-color-dot" style="background-color: ${color};"></span>`,
      },
      {
        id: "array",
        label: "Array",
        iconHTML: `<i class="fas fa-th" style="color: ${color}; font-size: 10px;"></i>`,
      },
      {
        id: "set",
        label: "Set",
        iconHTML: `<span style="color: ${color}; font-weight: bold; font-size: 10px;">{ }</span>`,
      },
      {
        id: "map",
        label: "Map",
        iconHTML: `<i class="fas fa-list-ul" style="color: ${color}; font-size: 10px;"></i>`,
      },
    ];

    options.forEach((opt) => {
      const item = document.createElement("div");
      item.className = "type-option";
      item.classList.add("py-1", "px-3"); // Increased padding

      // Disable Set and Map for Boolean type
      const isDisabled =
        variableType === "bool" && (opt.id === "set" || opt.id === "map");

      if (isDisabled) {
        item.classList.add("type-option-disabled");

        item.title = "Not available for Boolean type";
      }

      item.innerHTML = `
                <div class="w-20 d-flex justify-center">
                    ${DetailsRenderer.getContainerIcon(opt.id, variableType)}
                </div>
                <span>${opt.label}</span>
            `;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        if (isDisabled) return;
        callback(opt.id);
        menu.remove();
        this.containerMenu = null;
      });
      menu.appendChild(item);
    });

    document.body.appendChild(menu);
    this.containerMenu = menu;

    // Check bounds and adjust if off-screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${x - rect.width} px`; // Shift to left of cursor
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height} px`; // Shift up
    }

    // Close on click outside
    const closeHandler = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        this.containerMenu = null;
        document.removeEventListener("click", closeHandler);
      }
    };
    // Delay binding to prevent immediate close
    setTimeout(() => document.addEventListener("click", closeHandler), 0);
  }
}
