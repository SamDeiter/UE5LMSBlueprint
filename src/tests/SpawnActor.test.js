import assert from "assert";
import { AssetInterfacingService } from "../services/AssetInterfacingService.js";
import { VirtualAssetRegistry } from "../registries/VirtualAssetRegistry.js";

// Mock Node class structure
const createMockNode = (nodeKey, customData = {}) => ({
  nodeKey,
  customData,
  pins: [],
});

// Mock App structure
const mockApp = {
  wiring: {
    findLink: () => null,
  },
};

console.log("🧪 Starting SpawnActor Dynamic Pin Tests...");
let passed = 0;
let failed = 0;

async function runTest(name, testFn) {
  try {
    await testFn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ FAIL: ${name}`);
    console.error(e);
    failed++;
  }
}

const service = new AssetInterfacingService(mockApp);

// --- TESTS ---

// Test 1: Verify BP_Projectile exists in Registry
await runTest("Verify BP_Projectile Registry Data", async () => {
  const asset = VirtualAssetRegistry["BP_Projectile"];
  assert.ok(asset, "BP_Projectile should exist in registry");
  assert.strictEqual(
    asset.type,
    "BlueprintClass",
    "Should be a BlueprintClass"
  );
  assert.ok(asset.exposedVariables.length > 0, "Should have exposed variables");
});

// Test 2: SpawnActorFromClass with No Class Selected
await runTest("SpawnActor (No Class)", async () => {
  const node = createMockNode("SpawnActorFromClass", { class: "" });
  const dynamicPins = service.getDynamicPinsForNode(node);
  assert.strictEqual(
    dynamicPins.length,
    0,
    "Should have 0 dynamic pins when no class is selected"
  );
});

// Test 3: SpawnActorFromClass with BP_Projectile
await runTest("SpawnActor (BP_Projectile)", async () => {
  const node = createMockNode("SpawnActorFromClass", {
    class: "BP_Projectile",
  });
  const dynamicPins = service.getDynamicPinsForNode(node);

  // BP_Projectile has: InitialSpeed, Damage, OwnerActor
  assert.strictEqual(dynamicPins.length, 3, "Should generate 3 dynamic pins");

  const speedPin = dynamicPins.find((p) => p.name === "InitialSpeed");
  assert.ok(speedPin, "Should have InitialSpeed pin");
  assert.strictEqual(speedPin.type, "float", "InitialSpeed should be float");
  assert.strictEqual(speedPin.dir, "in", "Should be an input pin");
  assert.strictEqual(speedPin.isDynamic, true, "Should be marked as dynamic");

  const damagePin = dynamicPins.find((p) => p.name === "Damage");
  assert.ok(damagePin, "Should have Damage pin");
});

// Test 4: CreateWidget with WBP_HUD
await runTest("CreateWidget (WBP_HUD)", async () => {
  // Note: Node definitions might use 'class' or 'WidgetClass', logic uses 'class'
  const node = createMockNode("CreateWidget", { class: "WBP_HUD" });
  const dynamicPins = service.getDynamicPinsForNode(node);

  // WBP_HUD has: PlayerName, ShowScoreboard
  assert.strictEqual(
    dynamicPins.length,
    2,
    "Should generate 2 dynamic pins for HUD"
  );

  const playerPin = dynamicPins.find((p) => p.name === "PlayerName");
  assert.ok(playerPin, "Should have PlayerName pin");
  assert.strictEqual(playerPin.type, "string", "PlayerName should be string");
});

console.log("\n========================");
console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
