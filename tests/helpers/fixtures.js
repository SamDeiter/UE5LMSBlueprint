/**
 * Test fixtures - Sample data for testing
 */

/**
 * Sample graph data
 */
export const sampleGraphData = {
  nodes: [
    {
      id: "node-1",
      nodeKey: "EventBeginPlay",
      x: 100,
      y: 100,
      pins: [{ name: "exec", type: "exec", direction: "output" }],
    },
    {
      id: "node-2",
      nodeKey: "Print",
      x: 300,
      y: 100,
      pins: [
        { name: "exec", type: "exec", direction: "input" },
        { name: "execout", type: "exec", direction: "output" },
        { name: "InString", type: "string", direction: "input" },
      ],
    },
  ],
  connections: [
    {
      fromNode: "node-1",
      fromPin: "exec",
      toNode: "node-2",
      toPin: "exec",
    },
  ],
};

/**
 * Sample task data
 */
export const sampleTask = {
  taskId: "task-1",
  title: "Print Hello World",
  description:
    'Create a blueprint that prints "Hello World" when the game starts',
  criteria: [
    {
      type: "nodeExists",
      nodeKey: "EventBeginPlay",
      description: "Event Begin Play node must exist",
    },
    {
      type: "nodeExists",
      nodeKey: "Print",
      description: "Print String node must exist",
    },
    {
      type: "connectionExists",
      from: { nodeKey: "EventBeginPlay", pinName: "exec" },
      to: { nodeKey: "Print", pinName: "exec" },
      description: "Nodes must be connected",
    },
  ],
};

/**
 * Sample variable data
 */
export const sampleVariable = {
  id: "var-1",
  name: "MyVariable",
  type: "int",
  defaultValue: 0,
  category: "Default",
};

/**
 * Sample component data
 */
export const sampleComponent = {
  id: "comp-1",
  name: "StaticMeshComponent",
  type: "StaticMesh",
  properties: {
    Mobility: "Static",
    CastShadow: true,
  },
};
