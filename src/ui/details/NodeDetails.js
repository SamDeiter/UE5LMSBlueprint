import { Utils } from "../../utils.js";
import { generateGUID } from "../../utils/guid.js";
import { Pin } from "../../graph/Pin.js"; // Correct import path

export class NodeDetails {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.panel = controller.panel;
  }

  show(node) {
    this.controller.currentVariable = null;
    this.app.wiring.clearLinkSelection();

    if (node.nodeKey.startsWith("Get_") || node.nodeKey.startsWith("Set_")) {
      const key = node.nodeKey;
      const underscoreIndex = key.indexOf("_");
      if (underscoreIndex !== -1) {
        let varName = key.substring(underscoreIndex + 1);
        // Attempt exact match first
        let variable = this.app.variables.variables.get(varName);

        if (!variable) {
          // Fallback: Iterate values to check for ID match if name match fails
          variable = [...this.app.variables.variables.values()].find(
            (v) => v.id === node.variableId
          );
        }

        if (variable) {
          this.controller.showVariableDetails(variable, false);
          return;
        }
      }
    }

    if (node.nodeKey === "CustomEvent") {
      this.showCustomEventDetails(node);
      return;
    }

    // Special handling for NeedNode
    if (node.nodeKey === "NeedNode") {
      const needData = node.customData?.needNodeData || {};
      const criteriaCount = needData.criteria?.length || 0;

      this.panel.innerHTML = `
                <div class="details-group">
                    <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                        <i class="fas fa-caret-down"></i> Need Node
                    </h4>
                    <div class="detail-row">
                        <label>Title</label>
                        <span class="detail-value-static">${
                          needData.title || "Not configured"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Task ID</label>
                        <span class="detail-value-static">${
                          needData.taskId || "None"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Description</label>
                        <span class="detail-value-static" style="font-size: 10px; color: #999;">${
                          needData.description || "None"
                        }</span>
                    </div>
                    <div class="detail-row">
                        <label>Criteria</label>
                        <span class="detail-value-static">${criteriaCount} requirement(s)</span>
                    </div>
                    <div class="detail-row">
                        <label>Pass Threshold</label>
                        <span class="detail-value-static">${
                          needData.passThreshold || 80
                        }%</span>
                    </div>
                    <div class="detail-row">
                        <label>Hidden</label>
                        <span class="detail-value-static">${
                          needData.hidden ? "Yes" : "No"
                        }</span>
                    </div>
                </div>
                <div class="details-group">
                    <button id="edit-need-node-btn" class="btn-primary" style="width: 100%; padding: 8px;">
                        <i class="fas fa-edit"></i> Edit Configuration
                    </button>
                </div>
            `;

      const editBtn = this.panel.querySelector("#edit-need-node-btn");
      if (editBtn) {
        editBtn.addEventListener("click", () => {
          if (this.app.needNodeModal) {
            this.app.needNodeModal.open(node);
          }
        });
      }
      return;
    }

    // Generic properties (for nodes that don't have specialized details)
    let specializedHTML = `
            <div class="details-group">
                <p style="color: #aaa;">This is a basic inspector. Full configuration options would appear here.</p>
            </div>
    `;

    // Specialized Logic for SpawnActorFromClass and CreateWidget
    if (
      node.nodeKey === "SpawnActorFromClass" ||
      node.nodeKey === "CreateWidget"
    ) {
      // Actually, I should just import VirtualAssetRegistry here too or get it from the service
      const VirtualAssetRegistry =
        this.app.assetInterfacingService?.virtualAssetRegistry || {};

      const options = Object.keys(VirtualAssetRegistry)
        .filter((key) => {
          if (node.nodeKey === "SpawnActorFromClass")
            return VirtualAssetRegistry[key].type === "Actor";
          if (node.nodeKey === "CreateWidget")
            return VirtualAssetRegistry[key].type === "Widget";
          return true;
        })
        .map(
          (key) =>
            `<option value="${key}" ${
              node.customData.class === key ? "selected" : ""
            }>${key}</option>`
        )
        .join("");

      specializedHTML = `
            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                    <i class="fas fa-caret-down"></i> ${node.title} Settings
                </h4>
                <div class="detail-row">
                    <label>Class</label>
                    <select id="node-class-select" class="details-select" style="width: 60%;">
                        <option value="">None</option>
                        ${options}
                    </select>
                </div>
            </div>
      `;
    }

    this.panel.innerHTML = `
            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                    <i class="fas fa-caret-down"></i> Node Details
                </h4>
                <div class="detail-row">
                    <label>Title</label>
                    <span class="detail-value-static">${
                      node.title || node.nodeKey
                    }</span>
                </div>
                 <div class="detail-row">
                    <label>Type</label>
                    <span class="detail-value-static">${node.type}</span>
                </div>
                <div class="detail-row">
                    <label>Node Key</label>
                    <span class="detail-value-static">${node.nodeKey}</span>
                </div>
            </div>
            ${specializedHTML}
        `;

    // Bind specialized events
    const classSelect = this.panel.querySelector("#node-class-select");
    if (classSelect) {
      classSelect.addEventListener("change", (e) => {
        node.onPropertyChanged("class", e.target.value);
        // Refresh the panel after change to potentially show more specific options in the future
      });
    }
  }

  showCustomEventDetails(node) {
    const updateReliableState = () => {
      const isReplicated =
        (node.customData.replicates || "NotReplicated") !== "NotReplicated";
      const reliableCheckbox = this.panel.querySelector("#reliable-checkbox");
      const reliableLabel = this.panel.querySelector("#reliable-label");

      if (reliableCheckbox) {
        reliableCheckbox.disabled = !isReplicated;
        reliableCheckbox.classList.toggle("opacity-100", isReplicated);
        reliableCheckbox.classList.toggle("opacity-50", !isReplicated);
        if (!isReplicated) reliableCheckbox.checked = false;
      }

      if (reliableLabel) {
        reliableLabel.classList.toggle("text-enabled", isReplicated);
        reliableLabel.classList.toggle("text-disabled", !isReplicated);
      }
    };

    this.panel.innerHTML = `
            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                    <i class="fas fa-caret-down"></i> Graph Node
                </h4>
                <div class="detail-row">
                    <label>Name</label>
                    <input type="text" id="node-title-input" class="details-input" value="${
                      node.title
                    }" style="width: 60%;">
                </div>
            </div>

            <div class="details-group">
                <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 10px;">
                     <i class="fas fa-caret-down"></i> Graph
                </h4>
                <div class="detail-row">
                    <label>Keywords</label>
                    <input type="text" id="keywords-input" class="details-input" placeholder="" value="${
                      node.customData.keywords || ""
                    }" style="width: 60%;">
                </div>
                 <div class="detail-row">
                    <label>Replicates</label>
                    <select id="replicates-select" class="details-select" style="width: 60%;">
                        <option value="NotReplicated" ${
                          node.customData.replicates === "NotReplicated"
                            ? "selected"
                            : ""
                        }>Not Replicated</option>
                        <option value="Multicast" ${
                          node.customData.replicates === "Multicast"
                            ? "selected"
                            : ""
                        }>Multicast</option>
                        <option value="RunOnServer" ${
                          node.customData.replicates === "RunOnServer"
                            ? "selected"
                            : ""
                        }>Run on Server</option>
                        <option value="RunOnOwningClient" ${
                          node.customData.replicates === "RunOnOwningClient"
                            ? "selected"
                            : ""
                        }>Run on Owning Client</option>
                    </select>
                </div>
                 <div class="detail-row" style="justify-content: flex-end;">
                    <div style="width: 60%; display: flex; align-items: center;">
                        <input type="checkbox" id="reliable-checkbox" class="ue5-checkbox" ${
                          node.customData.reliable ? "checked" : ""
                        }>
                        <span id="reliable-label" style="margin-left: 8px; color: #666;">Reliable</span>
                    </div>
                </div>
                 <div class="detail-row">
                    <label>Call In Editor</label>
                    <div style="width: 60%;">
                        <input type="checkbox" id="call-in-editor-checkbox" class="ue5-checkbox" ${
                          node.customData.callInEditor ? "checked" : ""
                        }>
                    </div>
                </div>
                 <div class="detail-row">
                    <label>Access Specifier</label>
                     <select id="access-specifier-select" class="details-select" style="width: 60%;">
                        <option value="Public" ${
                          node.customData.accessSpecifier === "Public"
                            ? "selected"
                            : ""
                        }>Public</option>
                        <option value="Private" ${
                          node.customData.accessSpecifier === "Private"
                            ? "selected"
                            : ""
                        }>Private</option>
                        <option value="Protected" ${
                          node.customData.accessSpecifier === "Protected"
                            ? "selected"
                            : ""
                        }>Protected</option>
                    </select>
                </div>
            </div>

            <div class="details-group">
                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <h4 style="color: #ddd; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0;">
                        <i class="fas fa-caret-down"></i> Inputs
                    </h4>
                    <i class="fas fa-plus-circle" id="add-input-param-btn" style="color: #ccc; cursor: pointer;"></i>
                </div>
                <div id="custom-inputs-list"></div>
            </div>
        `;

    updateReliableState();

    const titleInput = this.panel.querySelector("#node-title-input");
    if (titleInput) {
      titleInput.addEventListener("input", (e) => {
        node.title = e.target.value;
        // Re-render the node to update the header title
        this.app.wiring.updateVisuals(node);
        this.app.persistence.autoSave();
      });
    }

    const bindProperty = (selector, propName, isCheckbox = false) => {
      const el = this.panel.querySelector(selector);
      if (el) {
        el.addEventListener("change", (e) => {
          node.customData[propName] = isCheckbox
            ? e.target.checked
            : e.target.value;
          this.app.persistence.autoSave();
          if (propName === "replicates") {
            updateReliableState();
          }
        });
      }
    };

    bindProperty("#keywords-input", "keywords");
    bindProperty("#replicates-select", "replicates");
    bindProperty("#reliable-checkbox", "reliable", true);
    bindProperty("#call-in-editor-checkbox", "callInEditor", true);
    bindProperty("#access-specifier-select", "accessSpecifier");

    const addBtn = this.panel.querySelector("#add-input-param-btn");
    addBtn.addEventListener("click", () => {
      this.addCustomParameter(node);
    });

    this.renderCustomParameters(node);
  }

  addCustomParameter(node) {
    const id = generateGUID();
    const newPinData = {
      id: id,
      name: "NewParam",
      type: "bool",
      dir: "out",
      isCustom: true,
    };

    const pin = new Pin(node, newPinData);
    node.pins.push(pin);
    node.refreshPinCache();

    this.app.wiring.updateVisuals(node);
    this.renderCustomParameters(node);
    this.app.persistence.autoSave();
  }

  removeCustomParameter(node, pinId) {
    this.app.wiring.breakPinLinks(pinId);

    node.pins = node.pins.filter((p) => p.id !== pinId);
    node.refreshPinCache();

    this.app.wiring.updateVisuals(node);
    this.renderCustomParameters(node);
    this.app.persistence.autoSave();
  }

  renderCustomParameters(node) {
    const list = this.panel.querySelector("#custom-inputs-list");
    if (!list) return;
    list.innerHTML = "";

    const customPins = node.pins.filter((p) => p.isCustom);

    if (customPins.length === 0) {
      list.innerHTML = `<div style="background-color: #111; padding: 8px; color: #888; font-style: italic; font-size: 10px; border: 1px solid #333;">
            Please press the + icon above to add parameters
            </div>`;
      return;
    }

    customPins.forEach((pin) => {
      const row = document.createElement("div");
      row.className = "param-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = pin.name;
      nameInput.className = "details-input";
      nameInput.classList.add("w-100");
      nameInput.addEventListener("change", (e) => {
        pin.name = e.target.value;
        this.app.wiring.updateVisuals(node);
        this.app.persistence.autoSave();
      });

      const typeTrigger = document.createElement("div");
      typeTrigger.className = "param-type-trigger";

      const colorDot = document.createElement("span");
      colorDot.className = "param-color-dot";
      colorDot.style.backgroundColor = Utils.getPinColor(pin.type); // Dynamic color

      const typeLabel = document.createElement("span");
      typeLabel.textContent =
        pin.type.charAt(0).toUpperCase() + pin.type.slice(1);

      const downArrow = document.createElement("i");
      downArrow.className = "fas fa-caret-down";

      typeTrigger.appendChild(colorDot);
      typeTrigger.appendChild(typeLabel);
      typeTrigger.appendChild(downArrow);

      typeTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const rect = typeTrigger.getBoundingClientRect();
        this.controller.typeSelector.showTypeMenu(
          rect.left,
          rect.bottom + 5,
          (newType) => {
            pin.type = newType.toLowerCase();
            this.app.wiring.updateVisuals(node);
            this.app.graph.redrawNodeWires(node.id);
            this.renderCustomParameters(node);
            this.app.persistence.autoSave();
          }
        );
      });

      const delBtn = document.createElement("i");
      delBtn.className = "fas fa-times param-delete-btn";
      delBtn.addEventListener("click", () => {
        this.removeCustomParameter(node, pin.id);
      });

      row.appendChild(nameInput);
      row.appendChild(typeTrigger);
      row.appendChild(delBtn);

      list.appendChild(row);
    });
  }
  updateReplicationDependents(enabled) {
    this.panel.querySelectorAll(".replication-dependent").forEach((row) => {
      row.style.opacity = enabled ? "1" : "0.5";
      const inputs = row.querySelectorAll("input, select");
      inputs.forEach((input) => {
        input.disabled = !enabled;
      });
    });
  }
}
