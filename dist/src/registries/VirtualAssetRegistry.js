/**
 * VirtualAssetRegistry - Stores definitions of "Mock Assets"
 * for nodes like SpawnActorFromClass, CreateWidget, AddComponent, etc.
 *
 * This allows the assessment platform to account for external assets
 * without requiring the user to actually build them.
 */
export const VirtualAssetRegistry = {
  // --- Actor Blueprints ---
  BP_Projectile: {
    title: "BP_Projectile",
    type: "BlueprintClass",
    baseClass: "Actor",
    exposedVariables: [
      { name: "InitialSpeed", type: "float", defaultValue: 1500.0 },
      { name: "Damage", type: "float", defaultValue: 20.0 },
      { name: "OwnerActor", type: "object", defaultValue: "Self" },
    ],
  },
  BP_HealthPack: {
    title: "BP_HealthPack",
    type: "BlueprintClass",
    baseClass: "Actor",
    exposedVariables: [
      { name: "HealAmount", type: "float", defaultValue: 25.0 },
      { name: "IsReusable", type: "bool", defaultValue: false },
    ],
  },

  // --- Widget Blueprints ---
  WBP_HUD: {
    title: "WBP_HUD",
    type: "WidgetBlueprint",
    baseClass: "UserWidget",
    exposedVariables: [
      { name: "PlayerName", type: "string", defaultValue: "Player" },
      { name: "ShowScoreboard", type: "bool", defaultValue: true },
    ],
  },
  WBP_InventoryItem: {
    title: "WBP_InventoryItem",
    type: "WidgetBlueprint",
    baseClass: "UserWidget",
    exposedVariables: [
      { name: "ItemID", type: "name", defaultValue: "None" },
      { name: "Quantity", type: "int", defaultValue: 1 },
    ],
  },

  // --- Interfaces ---
  BPI_Damageable: {
    title: "BPI_Damageable",
    type: "BlueprintInterface",
    functions: [
      {
        name: "TakeDamage",
        inputs: [
          { name: "Amount", type: "float" },
          { name: "DamageType", type: "class" },
          { name: "Instigator", type: "object" },
        ],
      },
    ],
  },

  // --- Data Tables ---
  DT_ItemStats: {
    title: "DT_ItemStats",
    type: "DataTable",
    rowStruct: "FItemStats",
    rows: [
      { name: "Sword", data: { Damage: 50, Value: 100 } },
      { name: "Shield", data: { Damage: 0, Value: 150 } },
    ],
  },
};
