import { FunctionDefinition } from "../functions/FunctionDefinition.js";
import { Pin } from "../graph/Pin.js";
import { createCollapsibleHeader } from "./ui-helpers.js";
import { generateGUID } from "../utils/guid.js";
import { UE5Renderer } from "../utils/UE5Renderer.js";

export class FunctionsController {
  constructor(app) {
    this.app = app;
    this.listContainer = document.getElementById("functions-list");

    // Initial render
    this.render();
  }

  addNewFunction() {
    const name = this.app.functionRegistry.getUniqueName("NewFunction");
    const newFunc = new FunctionDefinition(name);
    this.app.functionRegistry.register(newFunc);
    this.render();
    // TODO: Select and focus rename
  }

  render() {
    if (!this.listContainer) return;

    this.listContainer.innerHTML = "";

    const section = document.createElement("div");
    section.className = "sidebar-section";

    const content = document.createElement("div");
    content.classList.remove('hidden');

    const header = createCollapsibleHeader(section, "Functions", content, {
      onAdd: (e) => {
        // e.stopPropagation(); // Handled by createCollapsibleHeader
        this.addNewFunction();
      },
      isExpanded: true,
      iconClass: "fas fa-caret-down",
    });

    // Add Import Button to Header (Custom)
    const actionGroup = header.querySelector(".action-group");
    if (actionGroup) {
      const importBtn = document.createElement("i");
      importBtn.className = "fas fa-file-import add-btn";
      importBtn.title = "Import Function";
      importBtn.classList.add('mr-1');
      importBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.importFunction();
      });
      actionGroup.insertBefore(importBtn, actionGroup.firstChild);
    }

    const functions = this.app.functionRegistry.getAll();

    functions.forEach((func) => {
      const item = document.createElement("div");
      item.className = "tree-item";
      item.dataset.functionId = func.id;

      const icon = document.createElement("span");
      icon.className = "function-icon-container";
      icon.innerHTML = UE5Renderer.renderFunctionIcon(func.isPure);

      const label = document.createElement("span");
      label.className = "tree-item-label";
      label.textContent = func.name;

      item.appendChild(icon);
      item.appendChild(label);

      // Visibility Eye Icon
      const eyeIcon = document.createElement("i");
      const isPublic = func.access === "public" || func.access === undefined;
      eyeIcon.className = `fas ${
        isPublic ? "fa-eye active" : "fa-eye-slash"
      } var-eye-icon`;
      eyeIcon.title = isPublic ? "Public" : "Private";
      
      

      eyeIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        func.access = isPublic ? "private" : "public";
        this.render();
        this.app.persistence.autoSave();
      });
      item.appendChild(eyeIcon);

      // Drag Logic
      item.draggable = true;
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", `FUNCTION:${func.name}`);
        e.dataTransfer.effectAllowed = "copy";
      });

      // Selection
      item.addEventListener("click", (e) => {
        this.selectFunction(func.id);
        e.stopPropagation();
      });

      // Double click to open
      item.addEventListener("dblclick", () => {
        this.app.switchGraph(func.name);
      });

      // Context Menu
      item.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.showContextMenu(e, func);
      });

      content.appendChild(item);
    });

    // Deselect when clicking on empty space
    this.listContainer.addEventListener("click", (e) => {
      if (
        e.target === this.listContainer ||
        e.target.classList.contains("sidebar-section")
      ) {
        this.selectFunction(null);
      }
    });

    section.appendChild(content);
    this.listContainer.appendChild(section);
  }

  selectFunction(id) {
    // Deselect others
    const items = this.listContainer.querySelectorAll(".tree-item");
    items.forEach((el) => el.classList.remove("selected"));

    if (id) {
      const selected = this.listContainer.querySelector(
        `[data-function-id="${id}"]`
      );
      if (selected) selected.classList.add("selected");

      const func = this.app.functionRegistry.get(id);
      if (func) {
        this.app.details.showFunctionDetails(func);
      }
    } else {
      this.app.details.clear();
    }
  }

  syncFunctionNodes(func) {
    // 1. Update FunctionEntry and FunctionResult nodes in the function's own graph
    if (this.app.activeGraph === func.name) {
      const entryNode = [...this.app.graph.nodes.values()].find(
        (n) => n.nodeKey === "FunctionEntry"
      );
      const resultNode = [...this.app.graph.nodes.values()].find(
        (n) => n.nodeKey === "FunctionResult"
      );

      if (entryNode) {
        // Entry Node always has Exec Out, No Exec In
        this.updateNodePins(entryNode, func.inputs, "out", false, true);
      }
      if (resultNode) {
        // Result Node always has Exec In, No Exec Out
        this.updateNodePins(resultNode, func.outputs, "in", true, false);
      }
    }

    // 2. Update CallFunction nodes in the ACTIVE graph
    const callNodes = [...this.app.graph.nodes.values()].filter(
      (n) => n.nodeKey === `Func_${func.name}`
    );
    callNodes.forEach((node) => {
      // Update Type
      node.type = func.isPure ? "pure-node" : "function-node";

      // Prepare pin definitions based on function signature
      const newPinDefs = this.getFunctionPinDefs(func);
      this.applyPinSync(node, newPinDefs);
    });

    // 3. Update nodes in ALL other graphs (Inactive)
    this.syncAllGraphs(func);
  }

  getFunctionPinDefs(func) {
    const newPinDefs = [];

    // 1. Exec In (if not pure)
    if (!func.isPure) {
      newPinDefs.push({ name: "Exec", type: "exec", dir: "in" });
    }

    // 2. Data Inputs
    func.inputs.forEach((param) => {
      newPinDefs.push({ name: param.name, type: param.type, dir: "in" });
    });

    // 3. Exec Out (if not pure)
    if (!func.isPure) {
      newPinDefs.push({ name: "Exec", type: "exec", dir: "out" });
    }

    // 4. Data Outputs
    func.outputs.forEach((param) => {
      newPinDefs.push({ name: param.name, type: param.type, dir: "out" });
    });

    return newPinDefs;
  }

  updateNodePins(node, params, dir, hasExecIn, hasExecOut) {
    const newPinDefs = [];

    if (hasExecIn) {
      newPinDefs.push({ name: "Exec", type: "exec", dir: "in" });
    }

    params.forEach((param) => {
      newPinDefs.push({ name: param.name, type: param.type, dir: dir });
    });

    if (hasExecOut) {
      newPinDefs.push({ name: "Exec", type: "exec", dir: "out" });
    }

    this.applyPinSync(node, newPinDefs);
  }

  applyPinSync(node, newPinDefs) {
    const oldPinsMap = new Map(node.pins.map((p) => [this.getPinKey(p), p]));
    const newPins = [];

    newPinDefs.forEach((def) => {
      const key = this.getPinKey(def);
      const oldPin = oldPinsMap.get(key);

      let pin;
      if (oldPin) {
        pin = oldPin;
        // Update type if changed
        if (pin.type !== def.type) {
          pin.type = def.type;
        }
        // Ensure name is synced
        pin.name = def.name;
      } else {
        if (!def.id) {
          def.id = generateGUID();
        }
        pin = new Pin(node, def);
      }
      newPins.push(pin);
    });

    // Handle removed pins (break their links)
    node.pins.forEach((p) => {
      if (!newPins.includes(p)) {
        this.app.wiring.breakPinLinks(p.id);
      }
    });

    node.pins = newPins;
    node.refreshPinCache();
    this.app.wiring.updateVisuals(node);
  }

  syncAllGraphs(func) {
    const allGraphs = [];
    if (this.app.graphs)
      Object.values(this.app.graphs).forEach((g) => allGraphs.push(g));
    if (this.app.functionRegistry)
      this.app.functionRegistry
        .getAll()
        .forEach((f) => allGraphs.push(f.graph));
    if (this.app.macroRegistry)
      this.app.macroRegistry.getAll().forEach((m) => allGraphs.push(m.graph));

    allGraphs.forEach((graphData) => {
      if (!graphData || !graphData.nodes) return;

      // Check if this is the active graph storage
      let isActive = false;
      if (
        this.app.graphs &&
        this.app.graphs[this.app.activeGraph] === graphData
      )
        isActive = true;
      if (this.app.functionRegistry) {
        const activeFunc = this.app.functionRegistry.getByName(
          this.app.activeGraph
        );
        if (activeFunc && activeFunc.graph === graphData) isActive = true;
      }
      if (this.app.macroRegistry) {
        const activeMacro = this.app.macroRegistry.getByName(
          this.app.activeGraph
        );
        if (activeMacro && activeMacro.graph === graphData) isActive = true;
      }

      if (isActive) return;

      // Update CallFunction nodes
      graphData.nodes.forEach((node) => {
        if (node.nodeKey === `Func_${func.name}`) {
          this.syncNodeData(node, func, graphData);
        }
      });

      // Update Entry/Result if this is the function's own graph
      if (func.graph === graphData) {
        const entry = graphData.nodes.find(
          (n) => n.nodeKey === "FunctionEntry"
        );
        const result = graphData.nodes.find(
          (n) => n.nodeKey === "FunctionResult"
        );
        if (entry)
          this.updateNodeDataPins(
            entry,
            func.inputs,
            "out",
            false,
            true,
            graphData
          );
        if (result)
          this.updateNodeDataPins(
            result,
            func.outputs,
            "in",
            true,
            false,
            graphData
          );
      }
    });
  }

  syncNodeData(nodeData, func, graphData) {
    nodeData.type = func.isPure ? "pure-node" : "function-node";
    const newPinDefs = this.getFunctionPinDefs(func);
    this.applyPinSyncToData(nodeData, newPinDefs, graphData);
  }

  updateNodeDataPins(nodeData, params, dir, hasExecIn, hasExecOut, graphData) {
    const newPinDefs = [];
    if (hasExecIn) newPinDefs.push({ name: "Exec", type: "exec", dir: "in" });
    params.forEach((param) =>
      newPinDefs.push({ name: param.name, type: param.type, dir: dir })
    );
    if (hasExecOut) newPinDefs.push({ name: "Exec", type: "exec", dir: "out" });
    this.applyPinSyncToData(nodeData, newPinDefs, graphData);
  }

  applyPinSyncToData(nodeData, newPinDefs, graphData) {
    if (!nodeData.pins) nodeData.pins = [];
    const oldPinsMap = new Map(
      nodeData.pins.map((p) => [this.getPinKey(p), p])
    );
    const newPins = [];

    newPinDefs.forEach((def) => {
      const key = this.getPinKey(def);
      const oldPin = oldPinsMap.get(key);

      let pin;
      if (oldPin) {
        pin = oldPin;
        if (pin.type !== def.type) pin.type = def.type;
        pin.name = def.name;
      } else {
        // Create new pin object (POJO)
        pin = {
          id: `${nodeData.id}-${generateGUID()}`, // Generate unique ID
          name: def.name,
          type: def.type,
          dir: def.dir,
          // Default values for new pins
          literalValue: undefined,
          isCustom: false,
        };
      }
      newPins.push(pin);
    });

    // Handle removed pins: Remove links
    const newPinIds = new Set(newPins.map((p) => p.id));
    const removedPins = nodeData.pins.filter((p) => !newPinIds.has(p.id));

    if (removedPins.length > 0 && graphData.links) {
      const removedPinIds = new Set(removedPins.map((p) => p.id));
      graphData.links = graphData.links.filter(
        (link) =>
          !removedPinIds.has(link.startPinId) &&
          !removedPinIds.has(link.endPinId)
      );
    }

    nodeData.pins = newPins;
  }

  getPinKey(pin) {
    // Helper to match pins by direction and name
    // For Exec pins, we treat 'execute', 'then', 'Exec' as equivalent for matching purposes
    // to handle legacy/inconsistent naming.
    let name = pin.name;
    if (pin.type === "exec") {
      return `${pin.dir}_EXEC`;
    }
    return `${pin.dir}_${name}`;
  }

  deleteFunction(func) {
    if (
      !window.confirm(
        `Delete function '${func.name}'? This will remove all CallFunction nodes.`
      )
    ) {
      return;
    }

    // 1. Remove all CallFunction nodes from all graphs
    const callNodeKey = `Func_${func.name}`;

    // Remove from active graph
    if (this.app.graph && this.app.graph.nodes) {
      const nodesToRemove = [];
      for (const node of this.app.graph.nodes.values()) {
        if (node.nodeKey === callNodeKey) {
          nodesToRemove.push(node.id);
        }
      }
      nodesToRemove.forEach((nodeId) => this.app.graph.removeNode(nodeId));
    }

    // Remove from stored graphs
    const allGraphs = [];
    if (this.app.graphs)
      Object.values(this.app.graphs).forEach((g) => allGraphs.push(g));
    if (this.app.functionRegistry)
      this.app.functionRegistry
        .getAll()
        .forEach((f) => allGraphs.push(f.graph));
    if (this.app.macroRegistry)
      this.app.macroRegistry.getAll().forEach((m) => allGraphs.push(m.graph));

    allGraphs.forEach((graphData) => {
      if (!graphData || !graphData.nodes) return;
      graphData.nodes = graphData.nodes.filter(
        (n) => n.nodeKey !== callNodeKey
      );
    });

    // 2. Unregister the function
    this.app.functionRegistry.unregister(func.id);

    // 3. Switch to EventGraph if we're currently viewing this function
    if (this.app.activeGraph === func.name) {
      this.app.switchGraph("EventGraph");
    }

    // 4. Update UI
    this.render();
    this.app.persistence.autoSave();
  }

  showContextMenu(e, func) {
    const items = [
      { label: "Open", callback: () => this.app.switchGraph(func.name) },
      {
        label: "Rename",
        callback: () => {
          /* TODO */
        },
      },
      {
        label: "Duplicate",
        callback: () => {
          /* TODO */
        },
      },
      { label: "Delete", callback: () => this.deleteFunction(func) },
      { label: "---", callback: () => {} },
      { label: "Export to JSON", callback: () => this.exportFunction(func) },
    ];
    this.app.contextMenu.show(e.clientX, e.clientY, items);
  }

  exportFunction(func) {
    const data = JSON.stringify(func, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${func.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFunction() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.classList.add('hidden');

    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const funcDef = JSON.parse(event.target.result);
          // Basic validation
          if (!funcDef.name || !funcDef.graph) {
            window.alert("Invalid function definition file.");
            return;
          }

          // Ensure unique name
          funcDef.name = this.app.functionRegistry.getUniqueName(funcDef.name);
          // Generate new ID to avoid conflicts
          // funcDef.id = generateGUID(); // Assuming we have access to this or let registry handle it
          // Actually, FunctionDefinition constructor usually handles ID, but here we are loading raw data.
          // We should probably let the registry handle ID collision or re-generate it.

          // Register
          // We might need to instantiate FunctionDefinition from data if it has methods,
          // but currently it's likely a POJO.
          this.app.functionRegistry.register(funcDef);
          this.render();
          window.alert(`Function '${funcDef.name}' imported successfully.`);
        } catch (err) {
          console.error("Import failed:", err);
          window.alert("Failed to import function: " + err.message);
        }
      };
      reader.readAsText(file);
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  loadState(functionsData) {
    this.app.functionRegistry.clear();
    if (functionsData) {
      functionsData.forEach((data) => {
        const func = FunctionDefinition.fromJSON(data);
        this.app.functionRegistry.register(func);
      });
    }
    this.render();
  }
}
