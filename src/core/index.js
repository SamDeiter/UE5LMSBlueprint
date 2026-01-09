/**
 * Core Module Index - Exports all core infrastructure modules
 * Import from this file for centralized access to core functionality
 */

// Asset Management
export {
  BlueprintAsset,
  BlueprintAssetManager,
  BLUEPRINT_TYPES,
} from "./BlueprintAssetManager.js";

// Validation
export {
  ValidationResult,
  validateGraph,
  validateVariables,
  validateBlueprintState,
  findOrphanedNodes,
} from "./BlueprintValidator.js";

// Type System
export {
  TYPE_COLORS,
  TYPE_HEADER_COLORS,
  getTypeColor,
  getTypeHeaderColors,
  isTypeCompatible,
  supportsInlineWidget,
  getConversionNodeKey,
  PRIMITIVE_TYPES,
  STRUCT_TYPES,
} from "./TypeSystem.js";

// State Management
export { GraphStateManager, graphStateManager } from "./GraphStateManager.js";

// Event System
export { EventBus, AppEvents } from "./EventBus.js";

// Tab Management
export { Tab, TabManager, tabManager } from "./TabManager.js";
