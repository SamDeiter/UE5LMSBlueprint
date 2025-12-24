import ScormClient from "../../assessment/ScormClient.js";
import assert from "assert";

// Mock Browser Environment
const setupMockWindow = () => {
  global.window = {
    parent: null,
    API: null,
    API_1484_11: null,
  };
  global.window.parent = global.window; // recursive top
};

const mockAPI2004 = {
  Initialize: () => "true",
  SetValue: () => "true",
  GetValue: () => "",
  Commit: () => "true",
  Terminate: () => "true",
  lastCall: null,
};

// Trap calls for assertions
const trapCalls = (apiObj) => {
  return new Proxy(apiObj, {
    get(target, prop) {
      if (typeof target[prop] === "function") {
        return (...args) => {
          target.lastCall = { method: prop, args };
          return target[prop](...args);
        };
      }
      return target[prop];
    },
  });
};

const mockAPI12 = {
  LMSInitialize: () => "true",
  LMSSetValue: () => "true",
  LMSGetValue: () => "",
  LMSCommit: () => "true",
  LMSFinish: () => "true",
  lastCall: null,
};

console.log("🧪 Starting ScormClient Unit Tests...");
let passed = 0;
let failed = 0;

async function runTest(name, testFn) {
  try {
    setupMockWindow();
    ScormClient.api = null; // Reset static state
    ScormClient.version = null;

    await testFn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ FAIL: ${name}`);
    console.error(e);
    failed++;
  }
}

// --- TESTS ---

// Test 1: Discovery of SCORM 2004
await runTest("Find SCORM 2004 API", async () => {
  const api = trapCalls({ ...mockAPI2004 });
  global.window.API_1484_11 = api;

  await ScormClient.init();

  assert.strictEqual(ScormClient.version, "2004", "Should detect version 2004");
  assert.strictEqual(
    api.lastCall.method,
    "Initialize",
    "Should call Initialize"
  );
});

// Test 2: Discovery of SCORM 1.2
await runTest("Find SCORM 1.2 API", async () => {
  const api = trapCalls({ ...mockAPI12 });
  global.window.API = api;

  await ScormClient.init();

  assert.strictEqual(ScormClient.version, "1.2", "Should detect version 1.2");
  assert.strictEqual(
    api.lastCall.method,
    "LMSInitialize",
    "Should call LMSInitialize"
  );
});

// Test 3: Setting Score (SCORM 2004)
await runTest("Set Score (2004)", async () => {
  const api = trapCalls({ ...mockAPI2004 });
  global.window.API_1484_11 = api;
  await ScormClient.init(); // Initialize first to set version

  ScormClient.setScore(95);

  assert.strictEqual(api.lastCall.method, "SetValue", "Should call SetValue");
  assert.deepStrictEqual(
    api.lastCall.args,
    ["cmi.score.raw", "95"],
    "Should use 2004 data model"
  );
});

// Test 4: Setting Score (SCORM 1.2)
await runTest("Set Score (1.2)", async () => {
  const api = trapCalls({ ...mockAPI12 });
  global.window.API = api;
  await ScormClient.init();

  ScormClient.setScore(88);

  assert.strictEqual(
    api.lastCall.method,
    "LMSSetValue",
    "Should call LMSSetValue"
  );
  assert.deepStrictEqual(
    api.lastCall.args,
    ["cmi.core.score.raw", "88"],
    "Should use 1.2 data model (cmi.core.score.raw)"
  );
});

// Test 5: Pass Status (SCORM 1.2)
await runTest("Set Pass Status (1.2)", async () => {
  const api = trapCalls({ ...mockAPI12 });
  global.window.API = api;
  await ScormClient.init();

  ScormClient.setPassStatus(true);

  assert.strictEqual(api.lastCall.method, "LMSSetValue");
  assert.deepStrictEqual(api.lastCall.args, [
    "cmi.core.lesson_status",
    "passed",
  ]);
});

// Test 6: Termination (1.2)
await runTest("Terminate (1.2)", async () => {
  const api = trapCalls({ ...mockAPI12 });
  global.window.API = api;
  await ScormClient.init();

  ScormClient.terminate();

  assert.strictEqual(api.lastCall.method, "LMSFinish", "Should call LMSFinish");
});

console.log("\n========================");
console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
if (failed > 0) process.exit(1);
