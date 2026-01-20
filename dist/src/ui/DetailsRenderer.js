/**
 * DetailsRenderer - Facade for Details Panel HTML Generation
 *
 * Delegates to:
 * - VariableDetailsRenderer
 * - DefaultValueRenderer
 */
import { VariableDetailsRenderer } from "./details/VariableDetailsRenderer.js";
import { DefaultValueRenderer } from "./details/DefaultValueRenderer.js";

export class DetailsRenderer {
  // --- Delegated Methods (Facade) ---

  // Variable Metadata
  static renderPropertyFlag(name, isSet) {
    return VariableDetailsRenderer.renderPropertyFlag(name, isSet);
  }

  static renderVariableSection(variable) {
    return VariableDetailsRenderer.renderVariableSection(variable);
  }

  static renderVariableFields(variable) {
    return VariableDetailsRenderer.renderVariableFields(variable);
  }

  static renderAdvancedSection(variable, propertyFlagsHTML) {
    return VariableDetailsRenderer.renderAdvancedSection(
      variable,
      propertyFlagsHTML
    );
  }

  static renderAdvancedFields(variable) {
    return VariableDetailsRenderer.renderAdvancedFields(variable);
  }

  // Default Values
  static renderDefaultValueSection(variable, contentHTML) {
    return DefaultValueRenderer.renderDefaultValueSection(
      variable,
      contentHTML
    );
  }

  static renderDefaultValueInput(variable) {
    return DefaultValueRenderer.renderDefaultValueInput(variable);
  }

  static renderArrayDefaultValue(variable) {
    return DefaultValueRenderer.renderArrayDefaultValue(variable);
  }

  static renderMapDefaultValue(variable) {
    return DefaultValueRenderer.renderMapDefaultValue(variable);
  }

  static renderSingleValueInput(type, value, extraAttrs) {
    return DefaultValueRenderer.renderSingleValueInput(type, value, extraAttrs);
  }

  static parseVectorValue(value) {
    return DefaultValueRenderer.parseVectorValue(value);
  }

  static parseTransformValue(value) {
    return DefaultValueRenderer.parseTransformValue(value);
  }

  // Kept for compatibility if used elsewhere, but delegates to VariableDetailsRenderer specific logic if private
  static getContainerIcon(containerType, variableType) {
    // This was a private helper in VariableDetailsRenderer, but exposed here if needed.
    // Re-implementing wrapper or making public in VariableDetailsRenderer.
    // Since it was static on DetailsRenderer, let's keep it here but implementation details might differ slightly
    // I'll grab the implementation from VariableDetailsRenderer (it was _getContainerIcon)
    return VariableDetailsRenderer._getContainerIcon(
      containerType,
      variableType
    );
  }
}
