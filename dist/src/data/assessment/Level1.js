export const LEVEL_1_TASKS = [
  {
    taskId: "task_01_hello_world",
    level: 1,
    title: "Hello World",
    description:
      "The classic first step. Print 'Hello World' to the console when the game starts.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add an Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add a Print String node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect BeginPlay to Print String",
      },
    ],
  },
  {
    taskId: "task_02_basic_math",
    level: 1,
    title: "Basic Math",
    description:
      "Create two Integer variables, 'A' and 'B'. Add them together and print the result.",
    requirements: [
      {
        type: "variable_exists",
        name: "A",
        varType: "int",
        description: "Create Integer variable 'A'",
      },
      {
        type: "variable_exists",
        name: "B",
        varType: "int",
        description: "Create Integer variable 'B'",
      },
      {
        type: "node_exists",
        nodeType: "Get_A",
        description: "Get variable 'A'",
      },
      {
        type: "node_exists",
        nodeType: "Get_B",
        description: "Get variable 'B'",
      },
      {
        type: "node_exists",
        nodeType: "AddInt",
        description: "Add an Integer + Integer node",
      },
      {
        type: "connection",
        from: { nodeType: "Get_A", pin: "val_out" },
        to: { nodeType: "AddInt", pin: "a_in" },
        description: "Connect 'A' to Add node",
      },
      {
        type: "connection",
        from: { nodeType: "Get_B", pin: "val_out" },
        to: { nodeType: "AddInt", pin: "b_in" },
        description: "Connect 'B' to Add node",
      },
    ],
  },
];
