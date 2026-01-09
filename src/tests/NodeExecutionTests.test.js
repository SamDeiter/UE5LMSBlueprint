/**
 * NodeExecutionTests - Tests that nodes actually execute their logic
 * Ensures math computes, flow control branches, etc.
 */

// Assertion Helper
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
};

export const registerNodeExecutionTests = (runner) => {
  // --- Math Tests ---

  runner.register("Math: AddFloat computes correctly", (app) => {
    const addNode = app.graph.addNode("AddFloat", 100, 100);
    assert(addNode !== null, "AddFloat node should be created");

    // Set input values using tempValues (simulating wired input)
    addNode.tempValues = { a_in: 5.0, b_in: 3.0 };

    // Also set pinLiterals with full ID format
    addNode.pinLiterals.set(`${addNode.id}-a_in`, 5.0);
    addNode.pinLiterals.set(`${addNode.id}-b_in`, 3.0);

    // Evaluate result
    const executor = app.sim.executorRegistry.getExecutor("AddFloat");
    const result = executor.evaluateValue(addNode, { id: "result_out" });

    assert(result === 8.0, `AddFloat should return 8.0, got ${result}`);
  });

  runner.register("Math: MultiplyFloat computes correctly", (app) => {
    const mulNode = app.graph.addNode("MultiplyFloat", 100, 100);
    assert(mulNode !== null, "MultiplyFloat node should be created");

    mulNode.tempValues = { a_in: 4.0, b_in: 2.5 };
    mulNode.pinLiterals.set(`${mulNode.id}-a_in`, 4.0);
    mulNode.pinLiterals.set(`${mulNode.id}-b_in`, 2.5);

    const executor = app.sim.executorRegistry.getExecutor("MultiplyFloat");
    const result = executor.evaluateValue(mulNode, { id: "result_out" });

    assert(result === 10.0, `MultiplyFloat should return 10.0, got ${result}`);
  });

  // --- Flow Control Tests ---

  runner.register("FlowControl: Branch returns correct pin", async (app) => {
    const branchNode = app.graph.addNode("Branch", 100, 100);
    assert(branchNode !== null, "Branch node should be created");

    const executor = app.sim.executorRegistry.getExecutor("Branch");

    // Test True condition
    branchNode.tempValues = { cond_in: true };
    branchNode.pinLiterals.set(`${branchNode.id}-cond_in`, true);
    let result = await executor.execute(branchNode, null);
    assert(
      result === "exec_true",
      `Branch with true should return 'exec_true', got ${result}`
    );

    // Test False condition
    branchNode.tempValues = { cond_in: false };
    branchNode.pinLiterals.set(`${branchNode.id}-cond_in`, false);
    result = await executor.execute(branchNode, null);
    assert(
      result === "exec_false",
      `Branch with false should return 'exec_false', got ${result}`
    );
  });

  runner.register("FlowControl: FlipFlop alternates", async (app) => {
    const flipNode = app.graph.addNode("FlipFlop", 100, 100);
    assert(flipNode !== null, "FlipFlop node should be created");

    const executor = app.sim.executorRegistry.getExecutor("FlipFlop");

    // First call should return A
    let result = await executor.execute(flipNode, null);
    assert(
      result === "exec_a",
      `First FlipFlop should return 'exec_a', got ${result}`
    );

    // Second call should return B
    result = await executor.execute(flipNode, null);
    assert(
      result === "exec_b",
      `Second FlipFlop should return 'exec_b', got ${result}`
    );

    // Third call should return A again
    result = await executor.execute(flipNode, null);
    assert(
      result === "exec_a",
      `Third FlipFlop should return 'exec_a', got ${result}`
    );
  });

  runner.register("FlowControl: DoOnce fires once", async (app) => {
    const doOnceNode = app.graph.addNode("DoOnce", 100, 100);
    assert(doOnceNode !== null, "DoOnce node should be created");

    const executor = app.sim.executorRegistry.getExecutor("DoOnce");

    // First call should fire
    let result = await executor.execute(doOnceNode, null);
    assert(
      result === "exec_completed",
      `First DoOnce should fire, got ${result}`
    );

    // Second call should NOT fire
    result = await executor.execute(doOnceNode, null);
    assert(result === null, `Second DoOnce should not fire, got ${result}`);
  });
};
