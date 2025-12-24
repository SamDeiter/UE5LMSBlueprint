export class ClassDetails {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.panel = controller.panel;
  }

  showSettings() {
    this.controller.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    // Ensure settings exist
    if (!this.app.classSettings) {
      this.app.classSettings = {
        parentClass: "Actor",
        tickGroup: "PrePhysics",
        canEverTick: true,
        startWithTickEnabled: true,
        allowTickBeforeBeginPlay: false,
        tickPrerequisites: [],
        componentTickGroup: "PrePhysics",
        generatesOverlapEvents: true,
        actorLabel: "",
      };
    }
    const settings = this.app.classSettings;

    this.panel.innerHTML = `
              <div class="details-group">
                  <h4>Class Settings</h4>
                  <div class="detail-row">
                      <label>Parent Class</label>
                      <span class="detail-value-static" style="color: #4a90e2; cursor: pointer;" id="parent-class-trigger">${
                        this.app.classDefaults?.parentClass || "Actor"
                      }</span>
                  </div>
              </div>
              <div class="details-group">
                  <h4>Tick</h4>
                  <div class="detail-row">
                      <label>Tick Group</label>
                      <select id="tick-group-select" class="details-select">
                          <option value="PrePhysics" ${
                            settings.tickGroup === "PrePhysics"
                              ? "selected"
                              : ""
                          }>Pre Physics</option>
                          <option value="DuringPhysics" ${
                            settings.tickGroup === "DuringPhysics"
                              ? "selected"
                              : ""
                          }>During Physics</option>
                          <option value="PostPhysics" ${
                            settings.tickGroup === "PostPhysics"
                              ? "selected"
                              : ""
                          }>Post Physics</option>
                          <option value="PostUpdateWork" ${
                            settings.tickGroup === "PostUpdateWork"
                              ? "selected"
                              : ""
                          }>Post Update Work</option>
                      </select>
                  </div>
                  <div class="detail-row">
                      <label>Can Ever Tick</label>
                      <div style="width: 60%;">
                          <input type="checkbox" id="can-ever-tick-checkbox" class="ue5-checkbox" ${
                            settings.canEverTick ? "checked" : ""
                          }>
                      </div>
                  </div>
                  <div class="detail-row">
                      <label>Start With Tick Enabled</label>
                      <div style="width: 60%;">
                          <input type="checkbox" id="start-tick-checkbox" class="ue5-checkbox" ${
                            settings.startWithTickEnabled ? "checked" : ""
                          }>
                      </div>
                  </div>
                  <div class="detail-row">
                      <label>Allow Tick Before BeginPlay</label>
                      <div style="width: 60%;">
                          <input type="checkbox" id="tick-before-begin-checkbox" class="ue5-checkbox" ${
                            settings.allowTickBeforeBeginPlay ? "checked" : ""
                          }>
                      </div>
                  </div>
              </div>
              <div class="details-group">
                  <h4>Actor</h4>
                  <div class="detail-row">
                      <label>Actor Label</label>
                      <input type="text" id="actor-label-input" class="details-input" value="${
                        settings.actorLabel || ""
                      }" placeholder="(Instance-specific)">
                  </div>
                  <div class="detail-row">
                      <label>Generates Overlap Events</label>
                      <div style="width: 60%;">
                          <input type="checkbox" id="overlap-events-checkbox" class="ue5-checkbox" ${
                            settings.generatesOverlapEvents ? "checked" : ""
                          }>
                      </div>
                  </div>
              </div>
          `;

    // Bind events
    const bindInput = (id, prop, isCheckbox = false) => {
      const el = this.panel.querySelector(id);
      if (el) {
        el.addEventListener("change", (e) => {
          let val = isCheckbox ? e.target.checked : e.target.value;
          this.app.classSettings[prop] = val;
          this.app.persistence.autoSave();
        });
      }
    };

    bindInput("#tick-group-select", "tickGroup");
    bindInput("#can-ever-tick-checkbox", "canEverTick", true);
    bindInput("#start-tick-checkbox", "startWithTickEnabled", true);
    bindInput("#tick-before-begin-checkbox", "allowTickBeforeBeginPlay", true);
    bindInput("#actor-label-input", "actorLabel");
    bindInput("#overlap-events-checkbox", "generatesOverlapEvents", true);

    // Parent class trigger
    const parentTrigger = this.panel.querySelector("#parent-class-trigger");
    if (parentTrigger && this.app.parentClassModal) {
      parentTrigger.addEventListener("click", () => {
        this.app.parentClassModal.show();
      });
    }
  }
}
