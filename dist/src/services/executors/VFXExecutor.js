import { BaseExecutor } from "./BaseExecutor.js";

/**
 * VFXExecutor - Handles visual effect nodes.
 * Simulates particle systems using CSS/SVG overlays in the browser.
 */
export class VFXExecutor extends BaseExecutor {
  async execute(node) {
    const inputs = this.evaluateAllInputs(node);

    if (
      node.nodeKey === "SpawnNiagaraSystemAtLocation" ||
      node.nodeKey === "SpawnEmitterAtLocation"
    ) {
      const systemName = inputs.system || inputs.emitter || "DefaultSystem";
      const location = inputs.location || { x: 0, y: 0, z: 0 };

      this.log(
        `VFX: Spawning ${systemName} at X:${location.x} Y:${location.y} Z:${location.z}`,
        "info"
      );

      // Trigger a visual simulation in the DOM
      this.triggerVisualEffect(location, systemName);
    }

    return "exec_out";
  }

  /**
   * Triggers a temporary visual effect in the center of the viewport
   * or relative to the graph if we want more immersion.
   */
  triggerVisualEffect(location, name) {
    const container = document.getElementById("app-container");
    if (!container) return;

    const effect = document.createElement("div");
    effect.className = "vfx-simulation-particle";
    effect.style.left = "50%";
    effect.style.top = "50%";
    effect.style.transform = "translate(-50%, -50%)";
    effect.innerHTML = `<i class="fas fa-fire" style="color: #ff9800; font-size: 48px; filter: drop-shadow(0 0 10px #ff5722);"></i><br><small style="color:white; font-family: Inter;">${name}</small>`;

    container.appendChild(effect);

    // Simple animation: fade up and out
    effect.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" },
        {
          opacity: 1,
          transform: "translate(-50%, -70%) scale(1.5)",
          offset: 0.2,
        },
        { opacity: 0, transform: "translate(-50%, -100%) scale(2)" },
      ],
      {
        duration: 1500,
        easing: "ease-out",
      }
    ).onfinish = () => effect.remove();
  }
}
