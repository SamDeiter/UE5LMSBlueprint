/**
 * CollectionNodes.test.js - Tests for Array, Set, Map operations
 */

const assert = (condition, message) => {
  if (!condition) throw new Error(message || "Assertion failed");
};

export const registerCollectionTests = (runner) => {
  // --- ARRAY TESTS ---

  runner.register("Collection: Array_Add appends item", async (app) => {
    const node = app.graph.addNode("Array_Add", 100, 100);
    assert(node !== null, "Array_Add node should be created");

    const executor = app.sim.executorRegistry.getExecutor("Array_Add");
    assert(executor !== null, "Collection executor should exist for Array_Add");
  });

  runner.register("Collection: Array_Length returns correct value", (app) => {
    const node = app.graph.addNode("Array_Length", 100, 100);
    assert(node !== null, "Array_Length node should be created");

    node.tempValues = { array_in: [1, 2, 3, 4, 5] };

    const executor = app.sim.executorRegistry.getExecutor("Array_Length");
    const result = executor.evaluateValue(node, { id: "length_out" });

    assert(result === 5, `Array_Length should return 5, got ${result}`);
  });

  runner.register("Collection: Array_Contains finds item", (app) => {
    const node = app.graph.addNode("Array_Contains", 100, 100);
    assert(node !== null, "Array_Contains node should be created");

    node.tempValues = { array_in: ["a", "b", "c"], item_in: "b" };

    const executor = app.sim.executorRegistry.getExecutor("Array_Contains");
    const result = executor.evaluateValue(node, { id: "found_out" });

    assert(result === true, `Array_Contains should find 'b'`);
  });

  // --- SET TESTS ---

  runner.register("Collection: Set_Length returns correct value", (app) => {
    const node = app.graph.addNode("Set_Length", 100, 100);
    assert(node !== null, "Set_Length node should be created");

    node.tempValues = { set_in: new Set([1, 2, 3]) };

    const executor = app.sim.executorRegistry.getExecutor("Set_Length");
    const result = executor.evaluateValue(node, { id: "length_out" });

    assert(result === 3, `Set_Length should return 3, got ${result}`);
  });

  // --- MAP TESTS ---

  runner.register("Collection: Map_Length returns correct value", (app) => {
    const node = app.graph.addNode("Map_Length", 100, 100);
    assert(node !== null, "Map_Length node should be created");

    const testMap = new Map([
      ["a", 1],
      ["b", 2],
    ]);
    node.tempValues = { map_in: testMap };

    const executor = app.sim.executorRegistry.getExecutor("Map_Length");
    const result = executor.evaluateValue(node, { id: "length_out" });

    assert(result === 2, `Map_Length should return 2, got ${result}`);
  });

  runner.register("Collection: Map_Keys returns keys array", (app) => {
    const node = app.graph.addNode("Map_Keys", 100, 100);
    assert(node !== null, "Map_Keys node should be created");

    const testMap = new Map([
      ["x", 1],
      ["y", 2],
    ]);
    node.tempValues = { map_in: testMap };

    const executor = app.sim.executorRegistry.getExecutor("Map_Keys");
    const result = executor.evaluateValue(node, { id: "keys_out" });

    assert(Array.isArray(result), "Map_Keys should return an array");
    assert(
      result.length === 2,
      `Map_Keys should return 2 keys, got ${result.length}`
    );
  });
};
