import { Utils } from "../../utils.js";
import { PinDefaults } from "../../config/NodeDefaults.js";

/**
 * NodeWidgets - Handles creation of input widgets for nodes.
 * Extracted from Node.js to improve modularity.
 */
export class NodeWidgets {
  static createClassWidget(pin, node) {
    const select = document.createElement("select");
    select.className = "ue-enum-select class-select";

    const registry =
      node.app.assetInterfacingService?.virtualAssetRegistry || {};

    // UE5 Style: First option is Select Class (None)
    const noneOpt = document.createElement("option");
    noneOpt.value = "";
    noneOpt.textContent = "Select Class";
    select.appendChild(noneOpt);

    const nodeToAssetType = {
      SpawnActorFromClass: "BlueprintClass",
      CreateWidget: "WidgetBlueprint",
    };
    const targetAssetType = nodeToAssetType[node.nodeKey] || null;

    Object.entries(registry).forEach(([id, data]) => {
      // Filter based on node type (e.g. SpawnActor only shows Actors/Blueprints)
      const matchesType = !targetAssetType || data.type === targetAssetType;

      if (matchesType) {
        const opt = document.createElement("option");
        opt.value = id;
        opt.textContent = data.title || id;
        if (node.customData.class === id) opt.selected = true;
        select.appendChild(opt);
      }
    });

    select.addEventListener("change", (e) => {
      node.onPropertyChanged("class", e.target.value);
    });

    // Prevent dragging node when interacting with select
    select.addEventListener("mousedown", (e) => e.stopPropagation());

    return select;
  }

  static createInputWidget(pin, node) {
    // Safeguard: Connection-only types should never have widgets
    const connectionOnlyTypes = [
      "array",
      "object",
      "struct",
      "wildcard",
      "interface",
    ];
    if (connectionOnlyTypes.includes(pin.type) || pin.isArray) {
      return null;
    }

    let inputEl;
    const pinValue = node.pinLiterals.get(pin.id);
    const updateLiteral = (e) => {
      let newValue = e.target.value;
      if (["int", "int64", "byte"].includes(pin.type)) {
        newValue = parseInt(newValue) || PinDefaults.INT;
      } else if (pin.type === "float") {
        newValue = parseFloat(newValue) || PinDefaults.FLOAT;
      } else if (pin.type === "bool") {
        newValue = e.target.checked;
      }
      node.pinLiterals.set(pin.id, newValue);
      node.app.persistence.autoSave();
    };

    // Handle vector/rotator/transform types
    if (["vector", "rotator", "transform"].includes(pin.type)) {
      return this.createVectorWidget(pin, node);
    }

    // Handle class types
    if (pin.type === "class") {
      return this.createClassWidget(pin, node);
    }

    // Handle enum types
    if (pin.type === "enum" || pin.enumValues) {
      return this.createEnumWidget(pin, node);
    }

    // Handle color types
    if (pin.type === "color" || pin.name.toLowerCase().includes("color")) {
      return this.createColorWidget(pin, node);
    }

    if (pin.type === "bool") {
      inputEl = document.createElement("input");
      inputEl.type = "checkbox";
      inputEl.className = "ue5-checkbox";
      inputEl.checked = pinValue;
      inputEl.addEventListener("change", updateLiteral);
      inputEl.addEventListener("mousedown", (e) => e.stopPropagation());
    } else {
      inputEl = document.createElement("input");
      inputEl.type = "text";
      inputEl.value = pinValue;
      inputEl.className = "node-literal-input";
      const wideTypes = ["string", "text", "name"];
      inputEl.classList.add(
        wideTypes.includes(pin.type) ? "input-wide" : "input-narrow"
      );

      inputEl.addEventListener("change", updateLiteral);
      inputEl.addEventListener("mousedown", (e) => e.stopPropagation());

      inputEl.addEventListener(
        "focus",
        () => (node.app.graph.isEditingLiteral = true)
      );
      inputEl.addEventListener(
        "blur",
        () => (node.app.graph.isEditingLiteral = false)
      );
    }
    return inputEl;
  }

  static createVectorWidget(pin, node) {
    const container = document.createElement("div");
    container.className = "ue-vector-widget";

    const value = node.pinLiterals.get(pin.id) || "(0,0,0)";
    const components = value
      .replace(/[()]/g, "")
      .split(",")
      .map((v) => parseFloat(v.trim()) || 0);

    const labels = pin.type === "rotator" ? ["R", "P", "Y"] : ["X", "Y", "Z"];

    labels.forEach((label, i) => {
      const group = document.createElement("div");
      group.className = "val-group";

      const labelEl = document.createElement("span");
      labelEl.className = "val-label";
      labelEl.textContent = label;

      const input = document.createElement("input");
      input.type = "text";
      input.className = "small-input";
      input.value = components[i] || 0;

      input.addEventListener("change", () => {
        components[i] = parseFloat(input.value) || 0;
        node.pinLiterals.set(pin.id, `(${components.join(",")})`);
        node.app.persistence.autoSave();
      });

      input.addEventListener("mousedown", (e) => e.stopPropagation());
      input.addEventListener(
        "focus",
        () => (node.app.graph.isEditingLiteral = true)
      );
      input.addEventListener(
        "blur",
        () => (node.app.graph.isEditingLiteral = false)
      );

      group.appendChild(labelEl);
      group.appendChild(input);
      container.appendChild(group);
    });

    return container;
  }

  static createEnumWidget(pin, node) {
    const select = document.createElement("select");
    select.className = "ue-enum-select"; // ensure consistency
    select.classList.add("enum-widget");
    const options = pin.options || pin.enumValues || [];

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = Utils.formatNodeProperty(opt);
      if (opt === pin.defaultValue) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      pin.defaultValue = e.target.value;
      node.onPropertyChanged(pin.id, e.target.value);
    });

    select.addEventListener("mousedown", (e) => e.stopPropagation());
    select.addEventListener(
      "focus",
      () => (node.app.graph.isEditingLiteral = true)
    );
    select.addEventListener(
      "blur",
      () => (node.app.graph.isEditingLiteral = false)
    );

    return select;
  }

  static createObjectSelection(pin, node) {
    const select = document.createElement("select");
    select.className = "object-selection-widget";
    const options = pin.options || [];

    options.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = Utils.formatNodeProperty(opt);
      if (opt === pin.defaultValue) option.selected = true;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      pin.defaultValue = e.target.value;
      node.onPropertyChanged(pin.id, e.target.value);
    });

    select.addEventListener("mousedown", (e) => e.stopPropagation());
    select.addEventListener(
      "focus",
      () => (node.app.graph.isEditingLiteral = true)
    );
    select.addEventListener(
      "blur",
      () => (node.app.graph.isEditingLiteral = false)
    );

    return select;
  }

  static createColorWidget(pin, node) {
    const container = document.createElement("div");
    container.className = "ue-color-picker-container";

    const colorBox = document.createElement("input");
    colorBox.type = "color";
    colorBox.className = "ue-color-picker";

    const value = node.pinLiterals.get(pin.id) || "#FF0000";
    colorBox.value = value;

    colorBox.addEventListener("change", (e) => {
      node.pinLiterals.set(pin.id, e.target.value);
      node.app.persistence.autoSave();
    });

    colorBox.addEventListener("mousedown", (e) => e.stopPropagation());

    container.appendChild(colorBox);
    return container;
  }
}
