/**
 * AudioVisualNodes - Node definitions for Audio and Visual Effects
 * Following UE5 standards for pins and categories.
 */
import { NodeFactory as F } from "./NodeDefinitionFactory.js";

// Helper for standard audio controls (Volume, Pitch, Start Time)
const audioControlPins = [
  F.pin("volume", "Volume Multiplier", "float", "in", { defaultValue: 1.0 }),
  F.pin("pitch", "Pitch Multiplier", "float", "in", { defaultValue: 1.0 }),
  F.pin("start_time", "Start Time", "float", "in", { defaultValue: 0.0 }),
];

// Helper for standard transform pins (Location, Rotation, Scale)
// Note: Some nodes only need Loc/Rot, so we break them up
const locationPin = F.pin("location", "Location", "vector", "in", {
  defaultValue: { x: 0, y: 0, z: 0 },
});
const rotationPin = F.pin("rotation", "Rotation", "rotator", "in", {
  defaultValue: { r: 0, p: 0, y: 0 },
});
const scalePin = F.pin("scale", "Scale", "vector", "in", {
  defaultValue: { x: 1, y: 1, z: 1 },
});

export const AudioVisualNodes = {
  // ============================================================================
  // AUDIO NODES
  // ============================================================================

  PlaySound2D: F.flowNode({
    title: "Play Sound 2D",
    category: "Audio",
    executor: "Audio",
    icon: "fa-volume-up",
    headerColor: "#1B5E20",
    description: "Plays a 2D sound (non-spatialized).",
    inputs: [
      F.pin("sound", "Sound", "object", "in", { defaultValue: "" }),
      ...audioControlPins,
    ],
  }),

  PlaySoundAtLocation: F.flowNode({
    title: "Play Sound at Location",
    category: "Audio",
    executor: "Audio",
    icon: "fa-volume-up",
    headerColor: "#1B5E20",
    description:
      "Plays a sound at the specified location (simulated spatialization).",
    inputs: [
      F.pin("sound", "Sound", "object", "in", { defaultValue: "" }),
      locationPin,
      rotationPin,
      ...audioControlPins,
    ],
  }),

  // ============================================================================
  // VFX NODES
  // ============================================================================

  SpawnNiagaraSystemAtLocation: F.flowNode({
    title: "Spawn System at Location",
    category: "VFX|Niagara",
    executor: "VFX",
    icon: "fa-fire",
    headerColor: "#00508F",
    description: "Spawns a Niagara system at the specified location.",
    inputs: [
      F.pin("system", "System Template", "object", "in", { defaultValue: "" }),
      locationPin,
      rotationPin,
      scalePin,
      F.pin("auto_destroy", "Auto Destroy", "bool", "in", {
        defaultValue: true,
      }),
      F.pin("auto_activate", "Auto Activate", "bool", "in", {
        defaultValue: true,
      }),
    ],
    outputs: [F.pin("return_value", "Return Value", "object", "out")],
  }),

  SpawnEmitterAtLocation: F.flowNode({
    title: "Spawn Emitter at Location",
    category: "VFX|Cascade",
    executor: "VFX",
    icon: "fa-fire",
    headerColor: "#00508F",
    description: "Spawns a Cascade emitter (legacy) at the specified location.",
    inputs: [
      F.pin("emitter", "Emitter Template", "object", "in", {
        defaultValue: "",
      }),
      locationPin,
      rotationPin,
      scalePin,
      F.pin("auto_destroy", "Auto Destroy", "bool", "in", {
        defaultValue: true,
      }),
    ],
    outputs: [F.pin("return_value", "Return Value", "object", "out")],
  }),
};
