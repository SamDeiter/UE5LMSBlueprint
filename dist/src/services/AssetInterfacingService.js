/**
 * AssetInterfacingService - Handles dynamic pin generation for nodes
 * that reference "Virtual Assets" (mock blueprints, widgets, etc.).
 */
import { VirtualAssetRegistry } from "../registries/VirtualAssetRegistry.js";

export class AssetInterfacingService {
  constructor(app) {
    this.app = app;
    this.virtualAssetRegistry = VirtualAssetRegistry;
  }

  /**
   * Returns an array of dynamic pin definitions for a given node instance
   * based on its current configuration (e.g. selected class).
   * @param {Node} node
   */
  getDynamicPinsForNode(node) {
    const dynamicPins = [];

    // --- SpawnActorFromClass ---
    if (node.nodeKey === "SpawnActorFromClass") {
      const selectedClassId = node.customData.class;
      if (selectedClassId && VirtualAssetRegistry[selectedClassId]) {
        const asset = VirtualAssetRegistry[selectedClassId];

        // Add "Expose on Spawn" variables as input pins
        if (asset.exposedVariables) {
          asset.exposedVariables.forEach((vr) => {
            dynamicPins.push({
              id: `dynamic_${vr.name}`,
              name: vr.name,
              type: vr.type,
              dir: "in",
              defaultValue: vr.defaultValue,
              isDynamic: true,
            });
          });
        }
      }
    }

    // --- CreateWidget ---
    if (node.nodeKey === "CreateWidget") {
      const selectedWidgetId = node.customData.class; // CreateWidget usually calls it 'class' too in node definitions
      if (selectedWidgetId && VirtualAssetRegistry[selectedWidgetId]) {
        const asset = VirtualAssetRegistry[selectedWidgetId];

        if (asset.exposedVariables) {
          asset.exposedVariables.forEach((vr) => {
            dynamicPins.push({
              id: `dynamic_${vr.name}`,
              name: vr.name,
              type: vr.type,
              dir: "in",
              defaultValue: vr.defaultValue,
              isDynamic: true,
            });
          });
        }
      }
    }

    // --- GetDataTableRow ---
    if (node.nodeKey === "GetDataTableRow") {
      const selectedTableId = node.customData.DataTable;
      if (selectedTableId && VirtualAssetRegistry[selectedTableId]) {
        const asset = VirtualAssetRegistry[selectedTableId];
        // In UE5, GetDataTableRow has a "Row" output pin that matches the RowStruct.
        // We'll add a generic struct pin named 'Row'.
        dynamicPins.push({
          id: "row_data",
          name: "Row",
          type: "struct",
          dir: "out",
          subType: asset.rowStruct || "GenericStruct",
          isDynamic: true,
        });
      }
    }

    return dynamicPins;
  }
}
