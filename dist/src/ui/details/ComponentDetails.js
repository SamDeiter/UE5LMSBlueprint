export class ComponentDetails {
  constructor(controller) {
    this.controller = controller;
    this.app = controller.app;
    this.panel = controller.panel;
  }

  show(component) {
    this.controller.currentVariable = null;
    this.app.wiring.clearLinkSelection();
    this.app.graph.clearSelection();

    if (!component) {
      this.panel.innerHTML =
        '<p style="color: #aaa; padding: 15px;">Select a component to see details.</p>';
      return;
    }

    this.panel.innerHTML = `
              <div class="details-group">
                  <h4>Component Details</h4>
                  <div class="detail-row">
                      <label>Name</label>
                      <input type="text" id="comp-name-input" class="details-input" value="${component.name}">
                  </div>
                  <div class="detail-row">
                      <label>Type</label>
                      <span class="detail-value-static">${component.type}</span>
                  </div>
              </div>
              <div class="details-group">
                  <h4>Transform</h4>
                  <div class="detail-row">
                      <label>Location</label>
                      <span class="detail-value-static">(0, 0, 0)</span>
                  </div>
                  <div class="detail-row">
                      <label>Rotation</label>
                      <span class="detail-value-static">(0, 0, 0)</span>
                  </div>
                  <div class="detail-row">
                      <label>Scale</label>
                      <span class="detail-value-static">(1, 1, 1)</span>
                  </div>
              </div>
          `;

    const nameInput = this.panel.querySelector("#comp-name-input");
    if (nameInput) {
      nameInput.addEventListener("change", (e) => {
        const newName = e.target.value.trim();
        if (newName && newName !== component.name) {
          component.name = newName;
          this.app.componentsController.updateNodeLibrary();
          this.app.componentsController.render();
          if (this.app.variables) this.app.variables.renderPanel();
          this.app.persistence.autoSave();
        }
      });
    }
  }
}
