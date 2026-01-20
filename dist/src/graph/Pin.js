/**
 * Pin class - Represents a single data pin on a node.
 */
import { PinDefaults, StructComponents } from "../config/NodeDefaults.js";

class Pin {
  constructor(node, pinData) {
    this.id = pinData.id.includes(node.id)
      ? pinData.id
      : `${node.id}-${pinData.id}`;
    this.node = node;
    this.name = pinData.name;
    this.type = (pinData.type || "").toLowerCase(); // Safe lowercasing
    this.dir = pinData.dir;
    this.element = null;
    this.links = [];
    this.containerType = pinData.containerType || "single";
    this.defaultValue =
      pinData.defaultValue !== undefined
        ? pinData.defaultValue
        : this.getDefaultValue();
    this.isCustom = pinData.isCustom || false;
    this.isReference = pinData.isReference || pinData.byRef || false; // Pass-by-reference diamond pin
    this.isSplit = pinData.isSplit || false;
    this.noDefaultValue = pinData.noDefaultValue || false; // Prevent input widget for this pin
    this.enumValues = pinData.options || pinData.enumValues;
    this.subPins = [];

    // Restore sub-pins if loading from save
    if (this.isSplit && pinData.subPins) {
      this.restoreSubPins(pinData.subPins);
    }
  }

  getDefaultValue() {
    const typeUpper = this.type.toUpperCase();
    return PinDefaults[typeUpper] !== undefined
      ? PinDefaults[typeUpper]
      : PinDefaults.DEFAULT;
  }

  isConnected() {
    return this.links.length > 0;
  }

  getMaxLinks() {
    if (this.dir === "in" && this.type !== "exec") {
      return 1;
    }
    return Infinity;
  }

  canSplit() {
    // Allow splitting for vector, rotator, and transform types
    // Even if already split (for nested splitting like Transform -> Location -> X/Y/Z)
    return (
      ["vector", "rotator", "transform", "hitresult"].includes(this.type) &&
      !this.isSplit
    );
  }

  split() {
    if (!this.canSplit()) return;

    this.isSplit = true;
    this.createSubPins();
  }

  recombine() {
    if (!this.isSplit) return;

    // Recursively recombine any split sub-pins first
    this.subPins.forEach((subPin) => {
      if (subPin.isSplit) {
        subPin.recombine();
      }
    });

    this.isSplit = false;
    this.subPins = [];
  }

  createSubPins() {
    this.subPins = [];
    const components = this.getStructComponents();

    components.forEach((comp) => {
      const subPinId = `${this.id}_${comp.name}`;
      // Use comp.default if defined, otherwise fallback to 0 for numeric types
      const defaultVal = comp.default !== undefined ? comp.default : 0;
      const subPin = new Pin(this.node, {
        id: subPinId,
        name: comp.name,
        type: comp.type,
        dir: this.dir,
        defaultValue: defaultVal,
      });

      this.subPins.push(subPin);
    });
  }

  restoreSubPins(savedSubPins) {
    this.subPins = [];
    savedSubPins.forEach((savedPin) => {
      const subPin = new Pin(this.node, savedPin);
      this.subPins.push(subPin);
    });
  }

  getStructComponents() {
    const typeUpper = this.type.toUpperCase();
    return StructComponents[typeUpper] || [];
  }
}

export { Pin };
