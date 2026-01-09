/**
 * CollectionNodes.test.js - Tests for Array, Set, Map operations
 */

const assert = (condition, message) => {
  if (!condition) throw new Error(message || "Assertion failed");
};

export const registerCollectionTests = (runner) => {
  // --- EXECUTOR EXISTENCE TESTS ---

  runner.register("Collection: Array executor exists", async (app) => {
    const executor = app.sim.executorRegistry.getExecutor("Array_Length");
    assert(
      executor !== null,
      "Collection executor should exist for Array_Length"
    );
  });

  runner.register("Collection: Set executor exists", async (app) => {
    const executor = app.sim.executorRegistry.getExecutor("Set_Length");
    assert(
      executor !== null,
      "Collection executor should exist for Set_Length"
    );
  });

  runner.register("Collection: Map executor exists", async (app) => {
    const executor = app.sim.executorRegistry.getExecutor("Map_Length");
    assert(
      executor !== null,
      "Collection executor should exist for Map_Length"
    );
  });

  // --- NODE CREATION TESTS ---

  runner.register("Collection: Array_Add node creates", (app) => {
    const node = app.graph.addNode("Array_Add", 100, 100);
    assert(node !== null, "Array_Add node should be created");
    assert(node.nodeKey === "Array_Add", "Node key should be Array_Add");
  });

  runner.register("Collection: Map_Keys node creates", (app) => {
    const node = app.graph.addNode("Map_Keys", 100, 100);
    assert(node !== null, "Map_Keys node should be created");
    assert(node.nodeKey === "Map_Keys", "Node key should be Map_Keys");
  });

  runner.register("Collection: Array_Contains node creates", (app) => {
    const node = app.graph.addNode("Array_Contains", 100, 100);
    assert(node !== null, "Array_Contains node should be created");
  });
};
