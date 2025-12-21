/**
 * TimerExecutor - Handles Timer nodes (SetTimerByEvent, ClearTimer, IsTimerActive)
 * Phase 4: Behavioral Optimization
 */
import { BaseExecutor } from "./BaseExecutor.js";
import { timerManager } from "../TimerManager.js";

export class TimerExecutor extends BaseExecutor {
  async execute(node, inputPin) {
    switch (node.nodeKey) {
      case "SetTimerByEvent": {
        const timerName =
          this.evaluateInput(node, "name_in") || `timer_${node.id}`;
        const time = this.evaluateInput(node, "time_in") || 1.0;
        const looping = this.evaluateInput(node, "looping_in") || false;

        // Get the event name if provided (for simulation callback)
        const eventName = this.evaluateInput(node, "event_in") || null;

        // Set up timer callback
        const callback = () => {
          // Log for simulation visibility
          console.log(`[Timer] ${timerName} fired (looping: ${looping})`);

          // If there's a connected event, we could trigger it
          // For now, we just fire the timer output
          if (node.app && node.app.sim) {
            // Trigger any nodes connected to the timer's exec output
            const timerExecPin = node.pins.find((p) =>
              p.id.endsWith("timer_exec")
            );
            if (timerExecPin) {
              node.app.sim.executeFromPin(timerExecPin);
            }
          }
        };

        // Use node-local TimerManager reference through app
        const manager = node.app?.timerManager || timerManager;
        manager.setTimer(timerName, callback, time, looping);

        // Store timer name in temp values for reference
        node.tempValues = node.tempValues || {};
        node.tempValues.activeTimer = timerName;

        return "exec_out";
      }

      case "ClearTimer": {
        const timerName = this.evaluateInput(node, "name_in") || "";

        const manager = node.app?.timerManager || timerManager;
        manager.clearTimer(timerName);

        return "exec_out";
      }

      case "IsTimerActive": {
        const timerName = this.evaluateInput(node, "name_in") || "";

        const manager = node.app?.timerManager || timerManager;
        const isActive = manager.isActive(timerName);

        // Set output value
        node.tempValues = node.tempValues || {};
        node.tempValues.is_active_out = isActive;

        return null; // Pure node, no exec output
      }

      default:
        return null;
    }
  }
}
