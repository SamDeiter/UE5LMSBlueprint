/**
 * ClassDefaultsRenderer - Handles rendering of Class Defaults panel
 * Extracted from DetailsController to improve maintainability
 */

export class ClassDefaultsRenderer {
  constructor(detailsController) {
    this.details = detailsController;
    this.app = detailsController.app;
    this.panel = detailsController.panel;
  }

  /**
   * Renders the Class Defaults panel with all UE5 CDO properties
   */
  render() {
    this.details.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    // Initialize comprehensive defaults structure (UE5 CDO)
    if (!this.app.classDefaults) {
      this.app.classDefaults = {
        // Actor Category
        parentClass: "Actor",
        initialLifeSpan: 0.0,
        tags: [],
        canBeDamaged: true,
        spawnCollisionHandling: "AlwaysSpawn",
        updateOverlapsMethod: "UseConfigDefault",

        // Replication Category
        replicates: false,
        netPriority: 1.0,
        netCullDistanceSquared: 225000000,
        netUpdateFrequency: 100.0,
        minNetUpdateFrequency: 2.0,
        netDormancy: "Awake",
        replicateMovement: false,

        // Input Category
        autoReceiveInput: "Disabled",
        inputPriority: 0,
        blockInput: false,

        // Tick Category
        startWithTickEnabled: true,
        tickInterval: 0.0,
        tickGroup: "PrePhysics",
        allowTickOnDedicatedServer: true,

        // World Partition Category
        isSpatiallyLoaded: true,
        runtimeGrid: "MainGrid",
        hlodLayer: "None",

        // Rendering Category
        hiddenInGame: false,
      };
    }
    const defaults = this.app.classDefaults;

    // Helper to create collapsible sections
    const createSection = (title, id, content, defaultExpanded = true) => `
      <div class="details-group">
        <h4 class="section-header ${
          defaultExpanded ? "expanded" : "collapsed"
        }" data-section="${id}">
          <i class="fas fa-caret-${
            defaultExpanded ? "down" : "right"
          }"></i> ${title}
        </h4>
        <div class="section-content" id="${id}-content" style="${
      defaultExpanded ? "" : "display: none;"
    }">
          ${content}
        </div>
      </div>
    `;

    // Build section contents
    const actorContent = this._buildActorSection(defaults);
    const replicationContent = this._buildReplicationSection(defaults);
    const inputContent = this._buildInputSection(defaults);
    const tickContent = this._buildTickSection(defaults);
    const worldPartitionContent = this._buildWorldPartitionSection(defaults);
    const renderingContent = this._buildRenderingSection(defaults);
    const variablesContent = this._buildVariablesSection();
    const eventsContent = this._buildEventsSection();

    // Assemble full panel
    this.panel.innerHTML = `
      <div class="class-defaults-header">
        <h3>Class Defaults</h3>
      </div>
      ${createSection("Actor", "actor", actorContent, true)}
      ${createSection("Replication", "replication", replicationContent, false)}
      ${createSection("Input", "input", inputContent, false)}
      ${createSection("Tick", "tick", tickContent, false)}
      ${createSection(
        "World Partition",
        "world-partition",
        worldPartitionContent,
        false
      )}
      ${createSection("Rendering", "rendering", renderingContent, false)}
      ${createSection("Variables", "variables", variablesContent, true)}
      ${createSection("Events", "events", eventsContent, false)}
    `;

    // Bind all event listeners
    this._bindEventListeners(defaults);
  }

  _buildActorSection(defaults) {
    return `
      <div class="detail-row">
        <label>Parent Class</label>
        <span class="detail-value-static parent-class-link" id="parent-class-trigger">${
          defaults.parentClass
        }</span>
      </div>
      <div class="detail-row">
        <label>Initial Life Span</label>
        <input type="number" id="initial-life-span-input" class="details-input" value="${
          defaults.initialLifeSpan
        }" step="0.1" min="0" title="0 = infinite lifetime">
      </div>
      <div class="detail-row">
        <label>Can Be Damaged</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="can-be-damaged-checkbox" class="ue5-checkbox" ${
            defaults.canBeDamaged ? "checked" : ""
          }>
        </div>
      </div>
      <div class="detail-row">
        <label>Spawn Collision Handling</label>
        <select id="spawn-collision-select" class="details-select">
          <option value="AlwaysSpawn" ${
            defaults.spawnCollisionHandling === "AlwaysSpawn" ? "selected" : ""
          }>Always Spawn, Ignore Collisions</option>
          <option value="AdjustIfPossibleButAlwaysSpawn" ${
            defaults.spawnCollisionHandling === "AdjustIfPossibleButAlwaysSpawn"
              ? "selected"
              : ""
          }>Try To Adjust, But Always Spawn</option>
          <option value="AdjustIfPossibleButDontSpawn" ${
            defaults.spawnCollisionHandling === "AdjustIfPossibleButDontSpawn"
              ? "selected"
              : ""
          }>Try To Adjust, Don't Spawn If Colliding</option>
          <option value="DontSpawn" ${
            defaults.spawnCollisionHandling === "DontSpawn" ? "selected" : ""
          }>Do Not Spawn</option>
        </select>
      </div>
      <div class="detail-row">
        <label>Update Overlaps on Stream</label>
        <select id="update-overlaps-select" class="details-select">
          <option value="UseConfigDefault" ${
            defaults.updateOverlapsMethod === "UseConfigDefault"
              ? "selected"
              : ""
          }>Use Config Default</option>
          <option value="AlwaysUpdate" ${
            defaults.updateOverlapsMethod === "AlwaysUpdate" ? "selected" : ""
          }>Always Update</option>
          <option value="OnlyUpdateMovable" ${
            defaults.updateOverlapsMethod === "OnlyUpdateMovable"
              ? "selected"
              : ""
          }>Only Update Movable</option>
          <option value="NeverUpdate" ${
            defaults.updateOverlapsMethod === "NeverUpdate" ? "selected" : ""
          }>Never Update</option>
        </select>
      </div>
      <div class="detail-row">
        <label>Tags</label>
        <div class="tags-container" id="actor-tags-container">
          ${(defaults.tags || [])
            .map(
              (tag, i) =>
                `<span class="actor-tag">${tag} <i class="fas fa-times tag-remove" data-index="${i}"></i></span>`
            )
            .join("")}
          <input type="text" id="add-tag-input" class="details-input tag-input" placeholder="Add tag...">
        </div>
      </div>
    `;
  }

  _buildReplicationSection(defaults) {
    return `
      <div class="detail-row">
        <label>Replicates</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="replicates-checkbox" class="ue5-checkbox" ${
            defaults.replicates ? "checked" : ""
          }>
        </div>
      </div>
      <div class="detail-row replication-dependent" ${
        !defaults.replicates ? 'style="opacity: 0.5;"' : ""
      }>
        <label>Replicate Movement</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="replicate-movement-checkbox" class="ue5-checkbox" ${
            defaults.replicateMovement ? "checked" : ""
          } ${!defaults.replicates ? "disabled" : ""}>
        </div>
      </div>
      <div class="detail-row replication-dependent" ${
        !defaults.replicates ? 'style="opacity: 0.5;"' : ""
      }>
        <label>Net Priority</label>
        <input type="number" id="net-priority-input" class="details-input" value="${
          defaults.netPriority
        }" step="0.1" min="0" ${!defaults.replicates ? "disabled" : ""}>
      </div>
      <div class="detail-row replication-dependent" ${
        !defaults.replicates ? 'style="opacity: 0.5;"' : ""
      }>
        <label>Net Update Frequency</label>
        <input type="number" id="net-update-freq-input" class="details-input" value="${
          defaults.netUpdateFrequency
        }" step="1" min="0" ${!defaults.replicates ? "disabled" : ""}>
      </div>
      <div class="detail-row replication-dependent" ${
        !defaults.replicates ? 'style="opacity: 0.5;"' : ""
      }>
        <label>Net Dormancy</label>
        <select id="net-dormancy-select" class="details-select" ${
          !defaults.replicates ? "disabled" : ""
        }>
          <option value="Awake" ${
            defaults.netDormancy === "Awake" ? "selected" : ""
          }>Awake</option>
          <option value="DormantAll" ${
            defaults.netDormancy === "DormantAll" ? "selected" : ""
          }>Dormant All</option>
          <option value="DormantPartial" ${
            defaults.netDormancy === "DormantPartial" ? "selected" : ""
          }>Dormant Partial</option>
          <option value="DormantInitial" ${
            defaults.netDormancy === "DormantInitial" ? "selected" : ""
          }>Dormant Initial</option>
        </select>
      </div>
    `;
  }

  _buildInputSection(defaults) {
    return `
      <div class="detail-row">
        <label>Auto Receive Input</label>
        <select id="auto-receive-input-select" class="details-select">
          <option value="Disabled" ${
            defaults.autoReceiveInput === "Disabled" ? "selected" : ""
          }>Disabled</option>
          <option value="Player0" ${
            defaults.autoReceiveInput === "Player0" ? "selected" : ""
          }>Player 0</option>
          <option value="Player1" ${
            defaults.autoReceiveInput === "Player1" ? "selected" : ""
          }>Player 1</option>
          <option value="Player2" ${
            defaults.autoReceiveInput === "Player2" ? "selected" : ""
          }>Player 2</option>
          <option value="Player3" ${
            defaults.autoReceiveInput === "Player3" ? "selected" : ""
          }>Player 3</option>
        </select>
      </div>
      <div class="detail-row">
        <label>Input Priority</label>
        <input type="number" id="input-priority-input" class="details-input" value="${
          defaults.inputPriority
        }" step="1">
      </div>
      <div class="detail-row">
        <label>Block Input</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="block-input-checkbox" class="ue5-checkbox" ${
            defaults.blockInput ? "checked" : ""
          }>
        </div>
      </div>
    `;
  }

  _buildTickSection(defaults) {
    return `
      <div class="detail-row">
        <label>Start With Tick Enabled</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="start-tick-enabled-checkbox" class="ue5-checkbox" ${
            defaults.startWithTickEnabled ? "checked" : ""
          }>
        </div>
      </div>
      <div class="detail-row">
        <label>Tick Interval (secs)</label>
        <input type="number" id="tick-interval-input" class="details-input" value="${
          defaults.tickInterval
        }" step="0.01" min="0" title="0 = every frame">
      </div>
      <div class="detail-row">
        <label>Tick Group</label>
        <select id="tick-group-select" class="details-select">
          <option value="PrePhysics" ${
            defaults.tickGroup === "PrePhysics" ? "selected" : ""
          }>Pre Physics</option>
          <option value="StartPhysics" ${
            defaults.tickGroup === "StartPhysics" ? "selected" : ""
          }>Start Physics</option>
          <option value="DuringPhysics" ${
            defaults.tickGroup === "DuringPhysics" ? "selected" : ""
          }>During Physics</option>
          <option value="PostPhysics" ${
            defaults.tickGroup === "PostPhysics" ? "selected" : ""
          }>Post Physics</option>
          <option value="PostUpdateWork" ${
            defaults.tickGroup === "PostUpdateWork" ? "selected" : ""
          }>Post Update Work</option>
        </select>
      </div>
      <div class="detail-row">
        <label>Allow Tick on Dedicated Server</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="allow-tick-server-checkbox" class="ue5-checkbox" ${
            defaults.allowTickOnDedicatedServer ? "checked" : ""
          }>
        </div>
      </div>
    `;
  }

  _buildWorldPartitionSection(defaults) {
    return `
      <div class="detail-row">
        <label>Is Spatially Loaded</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="spatially-loaded-checkbox" class="ue5-checkbox" ${
            defaults.isSpatiallyLoaded ? "checked" : ""
          }>
        </div>
      </div>
      <div class="detail-row spatial-dependent" ${
        !defaults.isSpatiallyLoaded ? 'style="opacity: 0.5;"' : ""
      }>
        <label>Runtime Grid</label>
        <select id="runtime-grid-select" class="details-select" ${
          !defaults.isSpatiallyLoaded ? "disabled" : ""
        }>
          <option value="MainGrid" ${
            defaults.runtimeGrid === "MainGrid" ? "selected" : ""
          }>MainGrid</option>
          <option value="LandscapeGrid" ${
            defaults.runtimeGrid === "LandscapeGrid" ? "selected" : ""
          }>LandscapeGrid</option>
          <option value="SmallActorsGrid" ${
            defaults.runtimeGrid === "SmallActorsGrid" ? "selected" : ""
          }>SmallActorsGrid</option>
        </select>
      </div>
      <div class="detail-row">
        <label>HLOD Layer</label>
        <select id="hlod-layer-select" class="details-select">
          <option value="None" ${
            defaults.hlodLayer === "None" ? "selected" : ""
          }>None</option>
          <option value="HLOD_Level_0" ${
            defaults.hlodLayer === "HLOD_Level_0" ? "selected" : ""
          }>HLOD Level 0</option>
          <option value="HLOD_Level_1" ${
            defaults.hlodLayer === "HLOD_Level_1" ? "selected" : ""
          }>HLOD Level 1</option>
          <option value="HLOD_Level_2" ${
            defaults.hlodLayer === "HLOD_Level_2" ? "selected" : ""
          }>HLOD Level 2</option>
        </select>
      </div>
    `;
  }

  _buildRenderingSection(defaults) {
    return `
      <div class="detail-row">
        <label>Hidden in Game</label>
        <div class="checkbox-wrapper">
          <input type="checkbox" id="hidden-in-game-checkbox" class="ue5-checkbox" ${
            defaults.hiddenInGame ? "checked" : ""
          }>
        </div>
      </div>
    `;
  }

  _buildVariablesSection() {
    let variablesContent = "";
    if (this.app.variables && this.app.variables.variables.size > 0) {
      variablesContent = `<div class="variable-defaults-list" id="variable-defaults-list">`;
      this.app.variables.variables.forEach((variable) => {
        const defaultVal =
          variable.defaultValue !== undefined ? variable.defaultValue : "";
        variablesContent += `
          <div class="detail-row variable-default-row" data-var-id="${
            variable.id
          }">
            <label title="${variable.type}">${variable.name}</label>
            ${this.details.renderVariableDefaultInput(variable, defaultVal)}
          </div>
        `;
      });
      variablesContent += `</div>`;
    } else {
      variablesContent = `<p class="no-variables-msg">No variables defined. Add variables in My Blueprint panel.</p>`;
    }
    return variablesContent;
  }

  _buildEventsSection() {
    const actorEvents = [
      {
        name: "OnTakeAnyDamage",
        desc: "Called when the actor takes any damage",
      },
      {
        name: "OnTakePointDamage",
        desc: "Called when the actor takes point damage",
      },
      {
        name: "OnTakeRadialDamage",
        desc: "Called when the actor takes radial damage",
      },
      {
        name: "OnActorBeginOverlap",
        desc: "Called when another actor overlaps this actor",
      },
      {
        name: "OnActorEndOverlap",
        desc: "Called when another actor stops overlapping",
      },
      {
        name: "OnBeginCursorOver",
        desc: "Called when mouse cursor moves over actor",
      },
      {
        name: "OnEndCursorOver",
        desc: "Called when mouse cursor leaves actor",
      },
      { name: "OnClicked", desc: "Called when actor is clicked" },
      { name: "OnReleased", desc: "Called when click is released on actor" },
      { name: "OnInputTouchBegin", desc: "Called when touch begins on actor" },
      { name: "OnInputTouchEnd", desc: "Called when touch ends on actor" },
      { name: "OnActorHit", desc: "Called when actor is hit by another" },
      { name: "OnDestroyed", desc: "Called when actor is destroyed" },
      { name: "OnEndPlay", desc: "Called when gameplay ends for this actor" },
    ];

    return `
      <div class="events-list" id="actor-events-list">
        ${actorEvents
          .map(
            (evt) => `
          <div class="event-row" data-event="${evt.name}" title="${evt.desc}">
            <i class="fas fa-bolt event-icon"></i>
            <span class="event-name">${evt.name}</span>
            <button class="event-add-btn" data-event="${evt.name}" title="Add ${evt.name} node to graph">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  _bindEventListeners(_defaults) {
    // Helper to bind input changes
    const bindInput = (id, prop, isCheckbox = false, isNumber = false) => {
      const el = this.panel.querySelector(id);
      if (el) {
        el.addEventListener("change", (e) => {
          let val = isCheckbox
            ? e.target.checked
            : isNumber
            ? parseFloat(e.target.value)
            : e.target.value;
          this.app.classDefaults[prop] = val;
          this.app.persistence.autoSave();

          // Update dependent fields
          if (prop === "replicates") {
            this.details.updateReplicationDependents(val);
          }
          if (prop === "isSpatiallyLoaded") {
            this.details.updateSpatialDependents(val);
          }
        });
      }
    };

    // Bind all inputs
    bindInput("#initial-life-span-input", "initialLifeSpan", false, true);
    bindInput("#can-be-damaged-checkbox", "canBeDamaged", true);
    bindInput("#spawn-collision-select", "spawnCollisionHandling");
    bindInput("#update-overlaps-select", "updateOverlapsMethod");
    bindInput("#replicates-checkbox", "replicates", true);
    bindInput("#replicate-movement-checkbox", "replicateMovement", true);
    bindInput("#net-priority-input", "netPriority", false, true);
    bindInput("#net-update-freq-input", "netUpdateFrequency", false, true);
    bindInput("#net-dormancy-select", "netDormancy");
    bindInput("#auto-receive-input-select", "autoReceiveInput");
    bindInput("#input-priority-input", "inputPriority", false, true);
    bindInput("#block-input-checkbox", "blockInput", true);
    bindInput("#start-tick-enabled-checkbox", "startWithTickEnabled", true);
    bindInput("#tick-interval-input", "tickInterval", false, true);
    bindInput("#tick-group-select", "tickGroup");
    bindInput(
      "#allow-tick-server-checkbox",
      "allowTickOnDedicatedServer",
      true
    );
    bindInput("#spatially-loaded-checkbox", "isSpatiallyLoaded", true);
    bindInput("#runtime-grid-select", "runtimeGrid");
    bindInput("#hlod-layer-select", "hlodLayer");
    bindInput("#hidden-in-game-checkbox", "hiddenInGame", true);

    // Parent class trigger
    const parentTrigger = this.panel.querySelector("#parent-class-trigger");
    if (parentTrigger && this.app.parentClassModal) {
      parentTrigger.addEventListener("click", () => {
        this.app.parentClassModal.show();
      });
    }

    // Tags management
    const tagInput = this.panel.querySelector("#add-tag-input");
    if (tagInput) {
      tagInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.value.trim()) {
          if (!this.app.classDefaults.tags) this.app.classDefaults.tags = [];
          this.app.classDefaults.tags.push(e.target.value.trim());
          this.render(); // Re-render to show new tag
          this.app.persistence.autoSave();
        }
      });
    }

    // Tag removal
    this.panel.querySelectorAll(".tag-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.target.dataset.index);
        this.app.classDefaults.tags.splice(index, 1);
        this.render();
        this.app.persistence.autoSave();
      });
    });

    // Event add buttons
    this.panel.querySelectorAll(".event-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const eventName = e.currentTarget.dataset.event;
        this.details.addEventNodeToGraph(eventName);
      });
    });

    // Section collapse/expand
    this.panel.querySelectorAll(".section-header").forEach((header) => {
      header.addEventListener("click", () => {
        const sectionId = header.dataset.section;
        const content = this.panel.querySelector(`#${sectionId}-content`);
        const icon = header.querySelector("i");

        if (content.style.display === "none") {
          content.style.display = "";
          icon.className = "fas fa-caret-down";
          header.classList.remove("collapsed");
          header.classList.add("expanded");
        } else {
          content.style.display = "none";
          icon.className = "fas fa-caret-right";
          header.classList.remove("expanded");
          header.classList.add("collapsed");
        }
      });
    });

    // Bind variable default inputs
    this.details.bindVariableDefaultInputs();
  }
}
