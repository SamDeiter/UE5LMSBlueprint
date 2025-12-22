/**
 * GraphInteraction - Handles user input events (mouse, keyboard, drag-drop) for the Graph Editor.
 */

import { DRAG_DATA_PREFIXES } from "../config/Constants.js";

export class GraphInteraction {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.editor = controller.editor;
    this.nodesContainer = controller.nodesContainer;

    // Interaction State
    this.isPanning = false;
    this.isDraggingNode = false;
    this.isWiring = false;
    this.isRmbDown = false;
    this.isMarqueeing = false;
    this.isEditingLiteral = false;
    this.hasDragged = false;
    this.activePin = null;

    this.dragStart = { x: 0, y: 0 };
    this.nodeDragOffsets = new Map();
    this.marqueeStart = { x: 0, y: 0 };
    this.marqueeEl = document.getElementById("selection-marquee");
    this.rafId = null;

    // Chord Shortcuts State (Phase 2: Keyboard Shortcuts)
    this.activeKeys = new Set();

    // Bind methods
    this.handleGlobalMouseMove = this.handleGlobalMouseMove.bind(this);
    this.handleGlobalMouseUp = this.handleGlobalMouseUp.bind(this);
  }

  initEvents() {
    this.editor.addEventListener(
      "mousedown",
      this.handleEditorMouseDown.bind(this)
    );
    this.editor.addEventListener("wheel", this.handleZoom.bind(this));
    this.editor.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.handleContextMenu(e);
    });
    this.nodesContainer.addEventListener(
      "contextmenu",
      this.handlePinContextMenu.bind(this)
    );
    this.editor.addEventListener("dragover", this.handleDragOver.bind(this));
    this.editor.addEventListener("drop", this.handleDrop.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  handleKeyDown(e) {
    const target = e.target;
    const tagName = target.tagName ? target.tagName.toUpperCase() : "";
    const isTextEditor =
      tagName === "INPUT" || tagName === "TEXTAREA" || target.isContentEditable;

    // Track held keys for chord shortcuts (only if not in text editor)
    if (!isTextEditor) {
      this.activeKeys.add(e.key.toLowerCase());
    }

    if (isTextEditor) return;

    if (
      (e.key === "c" || e.key === "C") &&
      this.controller.selectedNodes.size > 0
    ) {
      e.preventDefault();
      this.controller.createCommentAroundSelection();
      return;
    }

    if (e.key === "F7") {
      e.preventDefault();
      this.app.compiler.compile();
      return;
    }

    if (e.key === "F9") {
      e.preventDefault();
      this.controller.selectedNodes.forEach((nodeId) => {
        const node = this.controller.nodes.get(nodeId);
        if (node) node.toggleBreakpoint();
      });
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      if (this.controller.selectedNodes.size > 0) {
        e.preventDefault();
        this.controller.deleteSelectedNodes();
      } else if (this.app.wiring && this.app.wiring.selectedLinks.size > 0) {
        e.preventDefault();
        this.app.wiring.deleteSelectedLinks();
      }
    }
  }

  handleKeyUp(e) {
    this.activeKeys.delete(e.key.toLowerCase());
  }

  // Chord shortcut: Check if a chord key is held and return the corresponding node key
  getChordNode() {
    const CHORD_SHORTCUTS = {
      b: "Branch",
      s: "Sequence",
      d: "Delay",
      o: "DoOnce",
      g: "Gate",
      p: "EventBeginPlay",
      c: "Comment",
      f: "ForEachLoop",
      m: "MultiGate",
    };
    for (const [key, nodeKey] of Object.entries(CHORD_SHORTCUTS)) {
      if (this.activeKeys.has(key)) return nodeKey;
    }
    return null;
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const graphCoords = this.controller.getGraphCoords(e.clientX, e.clientY);

    // COMPONENT_GET or COMPONENT_REPARENT - From Components panel
    if (
      data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_GET) ||
      data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_REPARENT)
    ) {
      const prefix = data.startsWith(DRAG_DATA_PREFIXES.COMPONENT_GET)
        ? DRAG_DATA_PREFIXES.COMPONENT_GET
        : DRAG_DATA_PREFIXES.COMPONENT_REPARENT;
      const compId = data.substring(prefix.length);
      const nodeKey = `GetComponent_${compId}`;
      this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
      this.app.persistence.autoSave();
      return;
    }

    // COMPONENT - From Variables panel, shows Get/Set menu
    if (data.startsWith(DRAG_DATA_PREFIXES.COMPONENT)) {
      const compId = data.split(":")[1];
      const comp = this.app.components.get(compId);
      if (!comp) return;

      // Check for modifier keys (like variables)
      let nodeKey = null;
      if (e.altKey) nodeKey = `SetComponent_${compId}`;
      else if (e.ctrlKey) nodeKey = `GetComponent_${compId}`;

      if (nodeKey) {
        this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
        this.app.persistence.autoSave();
      } else {
        // Show action menu with Get/Set options
        this.app.actionMenu.show(e.clientX, e.clientY, null, null, comp);
      }
    } else if (data.startsWith("VARIABLE:")) {
      const varName = data.split(":")[1];
      let nodeKey = null;
      if (e.altKey) nodeKey = `Set_${varName}`;
      else if (e.ctrlKey) nodeKey = `Get_${varName}`;
      if (nodeKey) {
        this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
        this.app.persistence.autoSave();
      } else {
        this.app.actionMenu.show(e.clientX, e.clientY, null, varName);
      }
    } else if (data.startsWith("FUNCTION:")) {
      const funcName = data.split(":")[1];
      const nodeKey = `Func_${funcName}`;
      this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
      this.app.persistence.autoSave();
    } else if (data.startsWith("MACRO:")) {
      const macroName = data.split(":")[1];
      const nodeKey = `Macro_${macroName}`;
      this.controller.addNode(nodeKey, graphCoords.x, graphCoords.y);
      this.app.persistence.autoSave();
    } else if (data.startsWith("PALETTE_NODE:")) {
      const nodeType = data.split(":")[1];

      // RESTRICTION: Construction Script cannot have Event nodes
      if (this.app.activeGraph === "ConstructionScript") {
        const forbiddenNodes = [
          "EventBeginPlay",
          "EventTick",
          "EventActorBeginOverlap",
        ];
        // Also check for any node starting with 'Event' except CustomEvent?
        // For now, specific list is safer + 'Event' prefix check if needed.
        if (
          forbiddenNodes.includes(nodeType) ||
          (nodeType.startsWith("Event") &&
            nodeType !== "CustomEvent" &&
            nodeType !== "EventGraph")
        ) {
          window.alert(`Cannot place ${nodeType} in Construction Script.`);
          return;
        }
      }

      // RESTRICTION: Event Graph cannot have Construction Script node
      if (this.app.activeGraph === "EventGraph") {
        if (nodeType === "ConstructionScript") {
          window.alert("Cannot place Construction Script node in Event Graph.");
          return;
        }
      }

      // Special handling for NeedNode - open modal for configuration
      if (nodeType === "NeedNode") {
        if (this.app.needNodeModal) {
          this.app.needNodeModal._pendingLocation = graphCoords;
          this.app.needNodeModal.open();
        } else {
          console.error("[GraphInteraction] needNodeModal not found!");
        }
        return;
      }

      this.controller.addNode(nodeType, graphCoords.x, graphCoords.y);
      this.app.persistence.autoSave();
    }
  }

  handleEditorMouseDown(e) {
    if (this.isEditingLiteral) return;

    this.hasDragged = false;
    this.app.wiring.clearLinkSelection();
    if (this.isMarqueeing) {
      this.isMarqueeing = false;
      this.marqueeEl.classList.add("hidden");
    }

    const pinElement = e.target.closest(".pin-container");
    const nodeElement = e.target.closest(".node");

    // 1. Wiring Start
    if (pinElement && e.button === 0) {
      e.stopPropagation();
      e.preventDefault();
      this.isWiring = true;
      const pinId = pinElement.dataset.pinId;
      this.activePin = this.controller.findPinById(pinId);

      if (e.altKey && this.activePin) {
        if (this.activePin.isConnected()) {
          this.app.wiring.breakPinLinks(this.activePin.id);
        }
      }

      if (
        this.activePin &&
        this.activePin.dir === "in" &&
        this.activePin.isConnected()
      ) {
        this.app.wiring.breakPinLinks(this.activePin.id);
      }

      if (this.activePin) {
        this.app.wiring.updateGhostWire(e, this.activePin);
      }

      document.addEventListener("mousemove", this.handleGlobalMouseMove);
      document.addEventListener("mouseup", this.handleGlobalMouseUp);
      return;
    }

    // 2. Node Dragging/Selection
    if (nodeElement && e.button === 0) {
      e.stopPropagation();
      this.isDraggingNode = true;
      const mode = e.ctrlKey ? "toggle" : e.shiftKey ? "add" : "new";

      if (
        mode === "new" &&
        !this.controller.selectedNodes.has(nodeElement.id)
      ) {
        this.controller.selectNode(nodeElement.id, false, "new");
      } else if (mode !== "new") {
        this.controller.selectNode(nodeElement.id, true, mode);
      }

      const mouseGraphCoords = this.controller.getGraphCoords(
        e.clientX,
        e.clientY
      );
      this.nodeDragOffsets.clear();
      for (const nodeId of this.controller.selectedNodes) {
        const node = this.controller.nodes.get(nodeId);
        if (node) {
          this.nodeDragOffsets.set(nodeId, {
            x: mouseGraphCoords.x - node.x,
            y: mouseGraphCoords.y - node.y,
          });
        }
      }

      document.addEventListener("mousemove", this.handleGlobalMouseMove);
      document.addEventListener("mouseup", this.handleGlobalMouseUp);
      return;
    }

    // 3. Panning
    if (e.button === 2) {
      // Right mouse button
      // Do not prevent default here to allow contextmenu event to fire
      this.isRmbDown = true;
      this.isPanning = false; // Reset panning state
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      this.editor.classList.add("dragging");
      document.addEventListener("mousemove", this.handleGlobalMouseMove);
      document.addEventListener("mouseup", this.handleGlobalMouseUp);
      return;
    }

    // 4. Chord Shortcuts - Check BEFORE marqueeing
    if (e.button === 0) {
      const chordNode = this.getChordNode();
      if (chordNode) {
        const graphCoords = this.controller.getGraphCoords(
          e.clientX,
          e.clientY
        );
        this.controller.addNode(chordNode, graphCoords.x, graphCoords.y);
        this.app.persistence.autoSave();
        return; // Chord consumed the click
      }
    }

    // 5. Marqueeing
    if (e.button === 0) {
      this.isMarqueeing = true;
      this.marqueeStart.x = e.clientX;
      this.marqueeStart.y = e.clientY;
      const rect = this.editor.getBoundingClientRect();
      this.marqueeEl.classList.remove("hidden");
      this.marqueeEl.classList.remove("hidden");
      this.marqueeEl.style.left = `${e.clientX - rect.left}px`;
      this.marqueeEl.style.top = `${e.clientY - rect.top}px`;
      this.marqueeEl.style.width = "0px";
      this.marqueeEl.style.height = "0px";

      if (!e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.controller.clearSelection();
        // NOTE: Do NOT clear component selection here.
        // UE5 behavior: component selection in sidebar is independent from graph node selection.
      }

      document.addEventListener("mousemove", this.handleGlobalMouseMove);
      document.addEventListener("mouseup", this.handleGlobalMouseUp);
    }
  }

  handleGlobalMouseMove(e) {
    if (this.rafId) return;

    this.rafId = requestAnimationFrame(() => {
      if (this.isRmbDown) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;

        // Threshold for panning to avoid accidental drags preventing context menu
        if (!this.isPanning && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          this.isPanning = true;
        }

        if (this.isPanning) {
          this.controller.pan.x += dx;
          this.controller.pan.y += dy;

          this.controller.updateTransform();

          this.dragStart.x = e.clientX;
          this.dragStart.y = e.clientY;
        }
      } else if (this.isDraggingNode) {
        this.hasDragged = true;
        const _zoom = this.controller.zoom;

        this.controller.selectedNodes.forEach((nodeId) => {
          const node = this.controller.nodes.get(nodeId);
          const offset = this.nodeDragOffsets.get(nodeId);

          if (node && offset) {
            const mouseGraphPos = this.controller.getGraphCoords(
              e.clientX,
              e.clientY
            );

            node.x = mouseGraphPos.x - offset.x;
            node.y = mouseGraphPos.y - offset.y;

            node.updatePosition();
          }
        });

        this.app.wiring.updateConnectedLinks(this.controller.selectedNodes);
      } else if (this.isWiring) {
        this.hasDragged = true;
        this.app.wiring.updateGhostWire(e, this.activePin);
      } else if (this.isMarqueeing) {
        const rect = this.editor.getBoundingClientRect();
        const currentX = e.clientX;
        const currentY = e.clientY;

        const x = Math.min(this.marqueeStart.x, currentX);
        const y = Math.min(this.marqueeStart.y, currentY);
        const width = Math.abs(currentX - this.marqueeStart.x);
        const height = Math.abs(currentY - this.marqueeStart.y);

        this.marqueeEl.style.left = `${x - rect.left}px`;
        this.marqueeEl.style.top = `${y - rect.top}px`;
        this.marqueeEl.style.width = `${width}px`;
        this.marqueeEl.style.height = `${height}px`;

        const graphStart = this.controller.getGraphCoords(
          Math.min(this.marqueeStart.x, currentX),
          Math.min(this.marqueeStart.y, currentY)
        );
        const graphEnd = this.controller.getGraphCoords(
          Math.max(this.marqueeStart.x, currentX),
          Math.max(this.marqueeStart.y, currentY)
        );
        const selectionRect = {
          left: graphStart.x,
          top: graphStart.y,
          right: graphEnd.x,
          bottom: graphEnd.y,
        };

        const mode = e.ctrlKey ? "toggle" : e.shiftKey ? "add" : "new";
        this.controller.selectNodesInRect(selectionRect, mode);
      }
      this.rafId = null;
    });
  }

  handleGlobalMouseUp(e) {
    document.removeEventListener("mousemove", this.handleGlobalMouseMove);
    document.removeEventListener("mouseup", this.handleGlobalMouseUp);

    if (this.isRmbDown) {
      this.isRmbDown = false;
      // Do NOT reset isPanning here immediately, so handleContextMenu can check it.
      // It will be reset on next mousedown or we can reset it after a short delay?
      // Actually, handleContextMenu fires usually right after mouseup or before.
      // Let's reset it in handleContextMenu or next mousedown.
      // But if contextmenu doesn't fire (e.g. shift-right-click?), we might be stuck?
      // Safe to reset on next mousedown.
      this.editor.classList.remove("dragging");
    }

    if (this.isDraggingNode) {
      this.isDraggingNode = false;
      this.controller.snapSelectedNodesToGrid();
      this.app.dirtyState?.markDirty();
      this.app.persistence.autoSave();
    }

    if (this.isWiring) {
      this.isWiring = false;
      this.app.wiring.ghostWire.classList.add("hidden");

      const pinElement = e.target.closest(".pin-container");
      if (pinElement) {
        const pinId = pinElement.dataset.pinId;
        const targetPin = this.controller.findPinById(pinId);
        if (targetPin && this.activePin && targetPin.id !== this.activePin.id) {
          this.app.wiring.createConnection(this.activePin, targetPin);
        }
      } else {
        if (this.hasDragged && this.activePin) {
          this.app.actionMenu.show(e.clientX, e.clientY, this.activePin);
        }
      }
      this.activePin = null;
    }

    if (this.isMarqueeing) {
      this.isMarqueeing = false;
      this.marqueeEl.classList.add("hidden");
      this.marqueeEl.classList.add("hidden");
    }
  }

  handleZoom(e) {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const oldZoom = this.controller.zoom;
    this.controller.zoom += delta;
    this.controller.zoom = Math.min(Math.max(0.1, this.controller.zoom), 5);

    const rect = this.editor.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const graphX = (mouseX - this.controller.pan.x) / oldZoom;
    const graphY = (mouseY - this.controller.pan.y) / oldZoom;

    this.controller.pan.x = mouseX - graphX * this.controller.zoom;
    this.controller.pan.y = mouseY - graphY * this.controller.zoom;

    this.controller.updateTransform();
    if (this.controller.zoomReadout) {
      this.controller.zoomReadout.textContent = `${Math.round(
        this.controller.zoom * 100
      )}%`;
    }
  }

  handleContextMenu(e) {
    e.preventDefault();

    // If we were panning, don't show the menu
    if (this.isPanning) {
      this.isPanning = false; // Reset for next time
      return;
    }
    const nodeEl = e.target.closest(".node");

    if (nodeEl) {
      const node = this.controller.nodes.get(nodeEl.id);
      if (node) {
        const items = [];

        // 1. Toggle Breakpoint
        items.push({
          label: node.isBreakpoint ? "Disable Breakpoint" : "Toggle Breakpoint",
          icon: node.isBreakpoint ? "fas fa-circle" : "far fa-circle",
          callback: () => {
            node.toggleBreakpoint();
            this.app.persistence.autoSave();
          },
        });

        items.push({ separator: true });

        // 2. Make/Break Struct Options (Existing Logic)
        if (
          node.nodeKey.startsWith("Get_") ||
          node.nodeKey.startsWith("Set_")
        ) {
          const varName = node.nodeKey.replace(/^(Get_|Set_)/, "");
          const variable = this.app.variables.variables.get(varName);

          if (variable) {
            if (variable.type === "vector") {
              items.push({
                label: "Make Vector",
                icon: "fas fa-plus",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "MakeVector",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({
                label: "Break Vector",
                icon: "fas fa-minus",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "BreakVector",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({ separator: true });
            } else if (variable.type === "rotator") {
              items.push({
                label: "Make Rotator",
                icon: "fas fa-sync",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "MakeRotator",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({
                label: "Break Rotator",
                icon: "fas fa-sync",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "BreakRotator",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({ separator: true });
            } else if (variable.type === "transform") {
              items.push({
                label: "Make Transform",
                icon: "fas fa-cube",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "MakeTransform",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({
                label: "Break Transform",
                icon: "fas fa-cube",
                callback: () => {
                  const worldPos = this.controller.getGraphCoords(
                    e.clientX,
                    e.clientY
                  );
                  this.controller.addNode(
                    "BreakTransform",
                    worldPos.x + 50,
                    worldPos.y
                  );
                },
              });
              items.push({ separator: true });
            }
          }
        }

        // 3. Standard Actions
        items.push({
          label: "Duplicate",
          icon: "fas fa-clone",
          callback: () => {
            this.controller.selectNode(node.id, false, "new");
            this.controller.duplicateSelectedNodes();
          },
        });

        items.push({
          label: "Delete",
          icon: "fas fa-trash",
          callback: () => {
            this.controller.selectNode(node.id, false, "new");
            this.controller.deleteSelectedNodes();
          },
        });

        this.app.contextMenu.show(e.clientX, e.clientY, items);
        return;
      }
    }

    this.app.actionMenu.show(e.clientX, e.clientY, null);
  }

  showNodeContextMenu(e, node, variable) {
    const menu = document.createElement("div");
    menu.className = "context-menu";
    
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.classList.add("z-max");
    

    const createMenuItem = (label, icon, onClick) => {
      const item = document.createElement("div");
      item.className = "menu-item";
      item.innerHTML = `<i class="${icon}" class="mr-1 w-12"></i> ${label}`;
      item.addEventListener("click", (ev) => {
        ev.stopPropagation();
        document.body.removeChild(menu);
        onClick();
      });
      return item;
    };

    // Add Make/Break options based on type
    if (variable.type === "vector") {
      menu.appendChild(
        createMenuItem("Make Vector", "fas fa-plus", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode("MakeVector", worldPos.x + 50, worldPos.y);
        })
      );
      menu.appendChild(
        createMenuItem("Break Vector", "fas fa-minus", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode("BreakVector", worldPos.x + 50, worldPos.y);
        })
      );
    } else if (variable.type === "rotator") {
      menu.appendChild(
        createMenuItem("Make Rotator", "fas fa-sync", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode("MakeRotator", worldPos.x + 50, worldPos.y);
        })
      );
      menu.appendChild(
        createMenuItem("Break Rotator", "fas fa-sync", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode("BreakRotator", worldPos.x + 50, worldPos.y);
        })
      );
    } else if (variable.type === "transform") {
      menu.appendChild(
        createMenuItem("Make Transform", "fas fa-cube", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode("MakeTransform", worldPos.x + 50, worldPos.y);
        })
      );
      menu.appendChild(
        createMenuItem("Break Transform", "fas fa-cube", () => {
          const worldPos = this.controller.getGraphCoords(e.clientX, e.clientY);
          this.controller.addNode(
            "BreakTransform",
            worldPos.x + 50,
            worldPos.y
          );
        })
      );
    }

    // Close menu on click outside
    const closeMenu = () => {
      if (document.body.contains(menu)) {
        document.body.removeChild(menu);
      }
      document.removeEventListener("click", closeMenu);
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);

    document.body.appendChild(menu);
  }

  handlePinContextMenu(e) {
    const pinContainerEl = e.target.closest(".pin-container");
    if (pinContainerEl) {
      e.preventDefault();
      e.stopPropagation();
      const pinId = pinContainerEl.dataset.pinId;
      let pin = this.controller.findPinById(pinId);

      if (!pin) return;

      // Check if this is a sub-pin - if so, find the parent
      const parentPinId = pinContainerEl.dataset.parentPinId;
      let parentPin = null;
      if (parentPinId) {
        parentPin = this.controller.findPinById(parentPinId);
      }

      const items = [];

      // Watch Value
      if (pin.type !== "exec") {
        items.push({
          label: "Watch this value",
          callback: () => {
            this.app.sim.addWatch(pin);
          },
        });
        items.push({ label: "---", callback: () => {} });
      }

      items.push({
        label: `Promote to Variable`,
        callback: () => this.controller.promotePinToVariable(pin),
      });

      // Add Split/Recombine options
      if (pin.canSplit()) {
        items.push({
          label: "Split Struct Pin",
          callback: () => {
            if (pin.isConnected()) {
              this.app.wiring.breakPinLinks(pin.id);
            }
            pin.split();
            this.app.wiring.updateVisuals(pin.node);
            this.app.persistence.autoSave();
          },
        });
      }

      if (pin.isSplit) {
        items.push({
          label: "Recombine Struct Pin",
          callback: () => {
            if (pin.subPins) {
              pin.subPins.forEach((sub) => {
                if (sub.isConnected()) {
                  this.app.wiring.breakPinLinks(sub.id);
                }
              });
            }
            pin.recombine();
            this.app.wiring.updateVisuals(pin.node);
            this.app.persistence.autoSave();
          },
        });
      }

      if (parentPin && parentPin.isSplit) {
        items.push({
          label: "Recombine Parent Pin",
          callback: () => {
            if (parentPin.subPins) {
              parentPin.subPins.forEach((sub) => {
                if (sub.isConnected()) {
                  this.app.wiring.breakPinLinks(sub.id);
                }
              });
            }
            parentPin.recombine();
            this.app.wiring.updateVisuals(parentPin.node);
            this.app.persistence.autoSave();
          },
        });
      }

      const node = pin.node;
      if (node.nodeKey === "CustomEvent" && pin.isCustom) {
        items.push({ label: "---", callback: () => {} });
        items.push({
          label: `Remove Pin: ${pin.name}`,
          callback: () => this.controller.removeCustomPin(node.id, pin.id),
        });
      }

      this.app.contextMenu.show(e.clientX, e.clientY, items);
    }
  }
}
