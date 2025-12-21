/**
 * ParentClassModal.js
 * Handles the "Pick Parent Class" modal for new Blueprint creation.
 */
import { _DOMElements } from "../config/DOMElements.js";

export class ParentClassModal {
  constructor(app) {
    this.app = app;
    this.modal = null;
    this.init();
  }

  init() {
    // Create modal container
    this.modal = document.createElement("div");
    this.modal.id = "parent-class-modal";
    this.modal.className = "modal-overlay d-none"; // Reusing existing modal overlay class if available, or define new

    // Modal Content
    this.modal.innerHTML = `
            <div class="modal-content parent-class-content">
                <div class="modal-header">
                    <h2>Pick Parent Class</h2>
                    <i class="fas fa-times close-btn" id="parent-class-close"></i>
                </div>
                
                <div class="common-classes-section">
                    <div class="section-title">COMMON</div>
                    <div class="class-buttons-grid">
                        ${this.createClassButton(
                          "Actor",
                          "An Actor is an object that can be placed or spawned in the world.",
                          "fas fa-cube"
                        )}
                        ${this.createClassButton(
                          "Pawn",
                          "A Pawn is an actor that can be 'possessed' and receive input from a controller.",
                          "fas fa-chess-pawn"
                        )}
                        ${this.createClassButton(
                          "Character",
                          "A character is a type of Pawn that includes the ability to walk around.",
                          "fas fa-user"
                        )}
                        ${this.createClassButton(
                          "PlayerController",
                          "A Player Controller is an actor responsible for controlling a Pawn used by the player.",
                          "fas fa-gamepad"
                        )}
                        ${this.createClassButton(
                          "GameModeBase",
                          "Game Mode Base defines the game being played, its rules, scoring, and other facets of the game type.",
                          "fas fa-cogs"
                        )}
                        ${this.createClassButton(
                          "ActorComponent",
                          "An ActorComponent is a reusable component that can be added to any actor.",
                          "fas fa-puzzle-piece"
                        )}
                        ${this.createClassButton(
                          "SceneComponent",
                          "A Scene Component is a component that has a scene transform and can be attached to other scene components.",
                          "fas fa-project-diagram"
                        )}
                    </div>
                </div>

                <div class="all-classes-section">
                    <div class="section-title toggle-all-classes"><i class="fas fa-caret-right"></i> ALL CLASSES</div>
                    <div class="all-classes-content d-none">
                        <input type="text" placeholder="Search All Classes..." class="class-search-input">
                        <div class="all-classes-list">
                            <!-- Dynamic list would go here -->
                            <div class="class-item">Object</div>
                            <div class="class-item">Actor</div>
                            <div class="class-item">Pawn</div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button id="parent-class-cancel" class="btn-cancel">Cancel</button>
                </div>
            </div>
        `;

    document.body.appendChild(this.modal);

    // Event Listeners
    this.modal
      .querySelector("#parent-class-close")
      .addEventListener("click", () => this.close());
    this.modal
      .querySelector("#parent-class-cancel")
      .addEventListener("click", () => this.close());

    // Bind class buttons
    const buttons = this.modal.querySelectorAll(".class-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectClass(btn.dataset.className);
      });
    });

    // Toggle All Classes
    const toggle = this.modal.querySelector(".toggle-all-classes");
    const content = this.modal.querySelector(".all-classes-content");
    const icon = toggle.querySelector("i");

    toggle.addEventListener("click", () => {
      const isHidden = content.classList.contains("d-none");
      content.classList.toggle("d-none", !isHidden);
      icon.className = isHidden ? "fas fa-caret-down" : "fas fa-caret-right";
    });
  }

  createClassButton(className, description, iconClass) {
    // Format display name (e.g. PlayerController -> Player Controller)
    const displayName = className.replace(/([A-Z])/g, " $1").trim();

    return `
            <button class="class-btn" data-class-name="${className}">
                <div class="class-btn-icon"><i class="${iconClass}"></i></div>
                <div class="class-btn-details">
                    <div class="class-btn-title">${displayName}</div>
                    <div class="class-btn-desc">${description}</div>
                </div>
                <div class="class-btn-help"><i class="fas fa-question-circle"></i></div>
            </button>
        `;
  }

  open() {
    this.modal.classList.remove("d-none");
    this.modal.classList.add("d-flex");
  }

  close() {
    this.modal.classList.add("d-none");
    this.modal.classList.remove("d-flex");
  }

  selectClass(className) {
    console.log(`Selected Parent Class: ${className}`);

    // 1. Close Modal
    this.close();

    // 2. Reset Graph (Load Default)
    // We need to access Persistence to reset.
    // But we might want to pass the class name to loadDefaultGraph or handle it here.

    // For now, we'll manually reset and set the parent class label
    if (this.app.persistence) {
      // 1. Clear Graph Nodes & Links
      this.app.graph.nodes.clear();
      this.app.graph.nodesContainer.innerHTML = "";
      this.app.wiring.links.clear();
      this.app.wiring.svgGroup.innerHTML =
        '<path id="ghost-wire" class="wire" style="pointer-events: none;"></path>';

      // 2. Clear Variables
      if (this.app.variables) {
        this.app.variables.variables.clear();
        this.app.variables.renderPanel();
      }

      // 3. Clear Components
      if (this.app.components) {
        this.app.components.clear();
        if (this.app.componentsController) {
          this.app.componentsController.render();
        }
      }

      // 4. Clear Functions & Macros
      if (this.app.functionRegistry) this.app.functionRegistry.clear();
      if (this.app.macroRegistry) this.app.macroRegistry.clear();
      if (this.app.functionsController) this.app.functionsController.render();
      if (this.app.macrosController) this.app.macrosController.render();

      // 5. Reset Graphs
      this.app.graphs = {
        EventGraph: { nodes: [], links: [] },
        ConstructionScript: { nodes: [], links: [] },
      };
      this.app.activeGraph = "EventGraph";
      if (this.app.graphSwitcher) this.app.graphSwitcher.updateTabs();

      // 6. Add default nodes based on class
      // For now, just standard Actor defaults
      this.app.graph.addNode("EventBeginPlay", 200, 200);
      this.app.graph.addNode("EventTick", 200, 400);
      this.app.graph.addNode("EventActorBeginOverlap", 200, 600);

      // 7. Save state
      this.app.history.saveState(`New Blueprint: ${className}`);
    }

    // 3. Update UI Label
    const label = document.querySelector(".parent-class-label");
    if (label) {
      label.innerHTML = `Parent class: <a href="#">${className}</a>`;
    }
  }
}
