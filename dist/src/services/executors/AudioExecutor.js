import { BaseExecutor } from "./BaseExecutor.js";

/**
 * AudioExecutor - Handles audio playback nodes.
 * Uses browser's native Audio API.
 */
export class AudioExecutor extends BaseExecutor {
  async execute(node) {
    const inputs = this.evaluateAllInputs(node);

    if (
      node.nodeKey === "PlaySound2D" ||
      node.nodeKey === "PlaySoundAtLocation"
    ) {
      const soundPath = inputs.sound || "";
      const volume = inputs.volume !== undefined ? inputs.volume : 1.0;
      const pitch = inputs.pitch !== undefined ? inputs.pitch : 1.0;
      const startTime = inputs.start_time || 0;

      if (!soundPath) {
        this.log("Audio: No sound file specified", "warning");
        return "exec_out";
      }

      try {
        const audio = new Audio(soundPath);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.playbackRate = Math.max(0.1, Math.min(4, pitch)); // Browser limits
        audio.currentTime = startTime;

        audio.play().catch((err) => {
          this.log(`Audio error: ${err.message}`, "error");
        });

        this.log(
          `Audio: Playing ${soundPath} (vol: ${volume}, pitch: ${pitch})`,
          "info"
        );
      } catch (err) {
        this.log(`Audio error: ${err.message}`, "error");
      }
    }

    return "exec_out";
  }
}
