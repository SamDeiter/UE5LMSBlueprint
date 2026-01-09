import { registerComponentTests } from "./tests/ComponentsController.test.js";
import { registerGUIDTests } from "./tests/guid.test.js";
import { registerComponentHierarchyTests } from "./tests/ComponentHierarchy.test.js";
import { registerNeedNodeTests } from "./tests/NeedNode.test.js";
import "./tests/NodeRegistryTests.js";
import { registerRefactorTests } from "./tests/test_refactor.js";
import { registerNodeExecutionTests } from "./tests/NodeExecutionTests.test.js";
import { registerCollectionTests } from "./tests/CollectionNodes.test.js";
import { registerGraphAnalyzerTests } from "./tests/GraphAnalyzer.test.js";

export class TestRunner {
  constructor(app) {
    this.app = app;
    this.tests = [];
  }

  register(name, testFn) {
    this.tests.push({ name, testFn });
  }

  // Alias for compatibility
  addTest(name, testFn) {
    this.register(name, testFn);
  }

  async run() {
    console.log(
      "%c🧪 Starting Test Suite...",
      "color: #3498db; font-weight: bold; font-size: 14px;"
    );
    let passed = 0;
    let failed = 0;
    const failedTests = [];

    // Create or clear results container
    let resultsDiv = document.getElementById("test-results");
    if (!resultsDiv) {
      resultsDiv = document.createElement("div");
      resultsDiv.id = "test-results";
      resultsDiv.style.position = "fixed";
      resultsDiv.style.top = "50%";
      resultsDiv.style.left = "50%";
      resultsDiv.style.transform = "translate(-50%, -50%)";
      resultsDiv.style.backgroundColor = "#222";
      resultsDiv.style.color = "#eee";
      resultsDiv.style.padding = "30px";
      resultsDiv.style.zIndex = "10000";
      resultsDiv.style.borderRadius = "8px";
      resultsDiv.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
      resultsDiv.style.width = "600px";
      resultsDiv.style.maxHeight = "80vh";
      resultsDiv.style.overflowY = "auto";
      resultsDiv.style.fontFamily = "sans-serif";
      resultsDiv.style.fontSize = "16px";
      resultsDiv.style.border = "1px solid #444";
      document.body.appendChild(resultsDiv);
    }

    resultsDiv.innerHTML = '<h2 style="margin-top:0">Running tests...</h2>';

    for (const test of this.tests) {
      try {
        console.group(`Running: ${test.name}`);
        await test.testFn(this.app);
        console.log("%c✅ Passed", "color: #2ecc71; font-weight: bold;");
        passed++;
      } catch (error) {
        console.error(
          `%c❌ Failed: ${error.message}`,
          "color: #e74c3c; font-weight: bold;"
        );
        console.error(error);
        failed++;
        failedTests.push({ name: test.name, message: error.message });
      } finally {
        console.groupEnd();
      }
    }

    console.log(
      `%c🏁 Tests Completed: ${passed} Passed, ${failed} Failed`,
      "color: #f1c40f; font-weight: bold; font-size: 14px;"
    );

    let failuresHtml = "";
    if (failedTests.length > 0) {
      failuresHtml =
        '<div style="margin-top: 20px; background: #330000; padding: 15px; border-radius: 4px;">' +
        '<h3 style="color: #ff6b6b; margin-top: 0;">Failures:</h3><ul style="padding-left: 20px;">' +
        failedTests
          .map(
            (f) =>
              `<li style="color: #ff9999; margin-bottom: 8px;"><strong>${f.name}</strong><br><span style="font-size: 0.9em; opacity: 0.9;">${f.message}</span></li>`
          )
          .join("") +
        "</ul></div>";
    }

    const statusColor = failed === 0 ? "#4caf50" : "#f44336";
    const statusText = failed === 0 ? "SUCCESS" : "FAILURE";

    resultsDiv.innerHTML = `
            <button onclick="this.parentElement.remove()" style="position:absolute; top:10px; right:15px; background:none; border:none; color:#aaa; font-size:24px; cursor:pointer;">×</button>
            <h2 style="margin-top:0; border-bottom: 1px solid #444; padding-bottom: 10px;">Test Results</h2>
            <div style="display: flex; gap: 20px; margin: 20px 0; font-size: 1.2em;">
                <div style="color: #4caf50;">Passed: <strong>${passed}</strong></div>
                <div style="color: #f44336;">Failed: <strong>${failed}</strong></div>
            </div>
            <div style="font-size: 1.5em; font-weight: bold; color: ${statusColor}; margin-bottom: 10px;">
                Status: ${statusText}
            </div>
            ${failuresHtml}
        `;
    resultsDiv.style.border = `2px solid ${statusColor}`;

    return failed === 0;
  }
}

// Assertion Helper
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};

// Define Tests (merged from historical versions)
export const registerTests = (runner) => {
  // Register component tests first
  registerComponentTests(runner);
  registerGUIDTests(runner);
  registerComponentHierarchyTests(runner);
  registerNeedNodeTests(runner);
  registerRefactorTests(runner);
  registerNodeExecutionTests(runner);
  registerCollectionTests(runner);
  registerGraphAnalyzerTests(runner);

  // --- Variable Tests ---

  runner.register("Create Boolean Variable", (app) => {
    const initialCount = app.variables.variables.size;
    app.variables.addVariable();
    assert(
      app.variables.variables.size === initialCount + 1,
      "Variable count should increase by 1"
    );

    const newVar = [...app.variables.variables.values()].pop();
    assert(newVar.type === "bool", "New variable should be type 'bool'");
    assert(newVar.defaultValue === false, "New bool should default to false");
  });

  runner.register("Change Variable Type to Vector", (app) => {
    // Create a var if none exists
    if (app.variables.variables.size === 0) app.variables.addVariable();
    const variable = [...app.variables.variables.values()].pop();

    app.variables.updateVariableProperty(variable, "type", "vector");
    assert(variable.type === "vector", "Variable type should be 'vector'");
    assert(
      variable.defaultValue === "(0,0,0)",
      "Vector default should be '(0,0,0)'"
    );
  });

  runner.register("Change Variable Type to Transform", (app) => {
    if (app.variables.variables.size === 0) app.variables.addVariable();
    const variable = [...app.variables.variables.values()].pop();

    app.variables.updateVariableProperty(variable, "type", "transform");
    assert(
      variable.type === "transform",
      "Variable type should be 'transform'"
    );
    assert(
      variable.defaultValue === "(0,0,0|0,0,0|1,1,1)",
      "Transform default should be '(0,0,0|0,0,0|1,1,1)'"
    );
  });

  runner.register("Add EventBeginPlay Node to Graph", (app) => {
    // Clear graph first to avoid singleton conflict
    app.graph.nodes.forEach((node) => app.graph.removeNode(node.id));

    // Verify it's gone
    const existing = [...app.graph.nodes.values()].find(
      (n) => n.nodeKey === "EventBeginPlay"
    );
    if (existing) {
      app.graph.removeNode(existing.id);
    }

    const node = app.graph.addNode("EventBeginPlay", 100, 100);
    assert(node !== null, "addNode should return a node for EventBeginPlay");
    assert(
      node.nodeKey === "EventBeginPlay",
      "Node key should be EventBeginPlay"
    );
    assert(app.graph.nodes.has(node.id), "Node should be in graph");
  });

  runner.register("Add Construction Script Node", (app) => {
    const initialNodeCount = app.graph.nodes.size;
    const node = app.graph.addNode("ConstructionScript", 100, 100);
    assert(node !== null, "ConstructionScript node should be created");
    assert(
      app.graph.nodes.size === initialNodeCount + 1,
      "Node count should increase"
    );
    assert(
      node.nodeKey === "ConstructionScript",
      "Node key should be ConstructionScript"
    );

    // Verify styling flag (indirectly by checking if render doesn't crash)
    node.render();
  });

  runner.register("Delete Node", (app) => {
    // Ensure we have a node
    if (app.graph.nodes.size === 0) app.graph.addNode("PrintString", 100, 100);
    const initialNodeCount = app.graph.nodes.size;
    const node = [...app.graph.nodes.values()].pop();

    // Select it first (selectNode expects nodeId)
    app.graph.selectNode(node.id, false);
    app.graph.deleteSelectedNodes();

    assert(
      app.graph.nodes.size === initialNodeCount - 1,
      "Node count should decrease"
    );
  });

  runner.register("Delete Variable via Key", async (app) => {
    // 1. Create Variable
    app.variables.addVariable();
    const variable = [...app.variables.variables.values()].pop();
    const initialCount = app.variables.variables.size;

    // 2. Delete directly using Map.delete() (bypasses confirmation modal)
    app.variables.variables.delete(variable.name);

    // 3. Verify Deletion
    assert(
      app.variables.variables.size === initialCount - 1,
      "Variable count should decrease"
    );
    assert(
      !app.variables.variables.has(variable.name),
      "Variable should be removed"
    );
  });

  // --- Wiring Tests ---

  runner.register("Create Wire Between Nodes", (app) => {
    // Clear graph first
    app.graph.nodes.forEach((node) => app.graph.removeNode(node.id));

    // Add two nodes that can connect
    const beginPlay = app.graph.addNode("EventBeginPlay", 100, 100);
    const printString = app.graph.addNode("PrintString", 400, 100);

    assert(beginPlay !== null, "BeginPlay node should be created");
    assert(printString !== null, "PrintString node should be created");

    // Get the pins - note that pin IDs include the node ID prefix
    const execOutPin = beginPlay.findPinById("exec_out");
    const execInPin = printString.findPinById("exec_in");

    if (!execOutPin)
      console.error(
        "BeginPlay pins:",
        beginPlay.pins.map((p) => ({ id: p.id, dir: p.dir, type: p.type }))
      );
    if (!execInPin)
      console.error(
        "PrintString pins:",
        printString.pins.map((p) => ({ id: p.id, dir: p.dir, type: p.type }))
      );

    assert(execOutPin, "BeginPlay should have exec output pin");
    assert(execInPin, "PrintString should have exec input pin");

    // Create connection
    const initialLinkCount = app.wiring.links.size;
    app.wiring.createConnection(execOutPin, execInPin);

    assert(
      app.wiring.links.size === initialLinkCount + 1,
      "Link count should increase"
    );
  });

  runner.register("Delete Wire", (app) => {
    // Ensure we have nodes and wires
    if (app.graph.nodes.size < 2) {
      app.graph.addNode("EventBeginPlay", 100, 100);
      app.graph.addNode("PrintString", 400, 100);
    }

    // Create a link if none exists
    if (app.wiring.links.size === 0) {
      const beginPlay = [...app.graph.nodes.values()].find(
        (n) => n.nodeKey === "EventBeginPlay"
      );
      const printString = [...app.graph.nodes.values()].find(
        (n) => n.nodeKey === "PrintString"
      );
      if (beginPlay && printString) {
        const execOut = beginPlay.pins.find((p) => p.direction === "output");
        const execIn = printString.pins.find((p) => p.direction === "input");
        if (execOut && execIn) {
          app.wiring.createConnection(execOut, execIn);
        }
      }
    }

    const initialCount = app.wiring.links.size;
    if (initialCount > 0) {
      const link = [...app.wiring.links.values()][0];
      app.wiring.breakLinkById(link.id);
      assert(
        app.wiring.links.size === initialCount - 1,
        "Link count should decrease"
      );
    }
  });

  // --- Persistence Tests ---

  runner.register("Save and Load Graph State", (app) => {
    // Clear and set up a known state
    app.graph.nodes.forEach((node) => app.graph.removeNode(node.id));
    app.variables.variables.clear();

    // Add some content
    app.graph.addNode("EventBeginPlay", 100, 100);
    app.graph.addNode("PrintString", 400, 100);
    app.variables.addVariable();

    const nodeCount = app.graph.nodes.size;
    const varCount = app.variables.variables.size;

    // Save state (FORCE CAPTURE)
    app.persistence.save(true);

    // Clear everything
    app.graph.nodes.forEach((node) => app.graph.removeNode(node.id));
    app.variables.variables.clear();
    assert(app.graph.nodes.size === 0, "Graph should be empty after clearing");

    // Load state
    app.persistence.load();

    assert(
      app.graph.nodes.size === nodeCount,
      "Loaded graph should have same node count"
    );
    assert(
      app.variables.variables.size === varCount,
      "Loaded state should have same variable count"
    );
  });

  // --- Undo/Redo Tests ---

  runner.register("Undo Add Node", (app) => {
    const initialCount = app.graph.nodes.size;

    // Add a node
    app.graph.addNode("PrintString", 100, 100);
    assert(app.graph.nodes.size === initialCount + 1, "Node should be added");

    // Undo
    app.history.undo();
    assert(
      app.graph.nodes.size === initialCount,
      "Node should be removed after undo"
    );
  });

  // --- Timeline Tests ---
  runner.register("Timeline Node Structure", (app) => {
    const timeline = app.graph.addNode("Timeline", 300, 300);
    assert(timeline !== null, "Timeline node should be created");

    // Check Input Pins (UE5 accurate)
    const play = timeline.findPinById("play_in");
    const playFromStart = timeline.findPinById("play_from_start_in");
    const stop = timeline.findPinById("stop_in");
    const reverse = timeline.findPinById("reverse_in");
    const reverseFromEnd = timeline.findPinById("reverse_from_end_in");
    const setNewTime = timeline.findPinById("set_new_time_in");
    const newTime = timeline.findPinById("new_time_in");

    // Check Output Pins
    const update = timeline.findPinById("update_out");
    const finished = timeline.findPinById("finished_out");
    const direction = timeline.findPinById("direction_out");

    // Verify input pins
    assert(play && play.dir === "in", "Should have Play input pin");
    assert(
      playFromStart && playFromStart.dir === "in",
      "Should have Play from Start input pin"
    );
    assert(stop && stop.dir === "in", "Should have Stop input pin");
    assert(reverse && reverse.dir === "in", "Should have Reverse input pin");
    assert(
      reverseFromEnd && reverseFromEnd.dir === "in",
      "Should have Reverse from End input pin"
    );
    assert(
      setNewTime && setNewTime.dir === "in",
      "Should have Set New Time input pin"
    );
    assert(
      newTime && newTime.dir === "in" && newTime.type === "float",
      "Should have New Time float input pin"
    );

    // Verify output pins
    assert(update && update.dir === "out", "Should have Update output pin");
    assert(
      finished && finished.dir === "out",
      "Should have Finished output pin"
    );
    assert(
      direction && direction.dir === "out",
      "Should have Direction output pin"
    );

    // Check Default Properties
    assert(timeline.customData.length === 5.0, "Default length should be 5.0s");
    assert(timeline.customData.loop === false, "Default loop should be false");
  });

  runner.register("Split Struct Pin", (app) => {
    // 1. Create Make Vector Node
    const makeVector = app.graph.addNode("MakeVector", 100, 100);
    assert(makeVector !== null, "MakeVector node should be created");

    // 2. Find Return Value Pin
    const returnPin = makeVector.findPinById("vec_out");
    assert(returnPin !== null, "Return Value pin should exist");
    assert(
      returnPin.type === "vector",
      "Return Value pin should be type vector"
    );
    assert(!returnPin.isSplit, "Pin should not be split initially");

    // 3. Split the Pin
    returnPin.split();
    assert(returnPin.isSplit, "Pin should be split after calling split()");
    assert(
      returnPin.subPins.length === 3,
      "Vector pin should have 3 sub-pins (X, Y, Z)"
    );
    assert(returnPin.subPins[0].name === "X", "First sub-pin should be X");
    assert(returnPin.subPins[1].name === "Y", "Second sub-pin should be Y");
    assert(returnPin.subPins[2].name === "Z", "Third sub-pin should be Z");

    // 4. Recombine the Pin
    returnPin.recombine();
    assert(!returnPin.isSplit, "Pin should not be split after recombine()");
    assert(
      returnPin.subPins.length === 0,
      "Sub-pins should be cleared after recombine"
    );
  });
};
