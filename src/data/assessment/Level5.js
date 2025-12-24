export const LEVEL_5_TASKS = [
  {
    taskId: "task_13_do_once",
    level: 5,
    title: "One-Time Initialization",
    description:
      "Use DoOnce to ensure initialization code only runs once, even if called multiple times.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "DoOnce",
        description: "Add a DoOnce node",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Add two Print String nodes",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "DoOnce", pin: "exec_in" },
        description: "Connect BeginPlay to DoOnce",
      },
      {
        type: "connection",
        from: { nodeType: "DoOnce", pin: "exec_completed" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect DoOnce Completed to Print String",
      },
    ],
  },
  {
    taskId: "task_14_gate_control",
    level: 5,
    title: "Gate Flow Control",
    description:
      "Use a Gate to control when execution can pass through. Open the gate with one event, close with another.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "Gate",
        description: "Add a Gate node",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay to open the gate",
      },
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        description: "Add a Custom Event to trigger gated logic",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Gate", pin: "open_in" },
        description: "Connect BeginPlay to Gate Open",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add Print String after gate exit",
      },
    ],
  },
  {
    taskId: "task_15_for_loop",
    level: 5,
    title: "Loop Iteration",
    description: "Use a ForLoop to count from 0 to 10 and print each number.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "ForLoop",
        description: "Add a ForLoop node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "ForLoop", pin: "exec_in" },
        description: "Connect BeginPlay to ForLoop",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Print the loop index",
      },
      {
        type: "connection",
        from: { nodeType: "ForLoop", pin: "exec_loop_body" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect Loop Body to Print String",
      },
      {
        type: "connection",
        from: { nodeType: "ForLoop", pin: "index_out" },
        to: { nodeType: "PrintString", pin: "str_in" },
        description: "Connect Index to Print String input",
      },
    ],
  },
  {
    taskId: "task_16_sequence_execution",
    level: 5,
    title: "Sequential Execution",
    description:
      "Use a Sequence node to execute multiple operations in order: print 'First', then 'Second'.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Sequence",
        description: "Add a Sequence node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Sequence", pin: "exec_in" },
        description: "Connect BeginPlay to Sequence",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Add two Print String nodes",
      },
      {
        type: "connection",
        from: { nodeType: "Sequence", pin: "exec_0" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect Then 0 to first Print String",
      },
      {
        type: "connection",
        from: { nodeType: "Sequence", pin: "exec_1" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect Then 1 to second Print String",
      },
    ],
  },
  {
    taskId: "task_17_boolean_logic",
    level: 5,
    title: "Boolean Logic Gates",
    description:
      "Create two Boolean variables 'HasKey' and 'DoorUnlocked'. Use AND logic to check if both are true.",
    requirements: [
      {
        type: "variable_exists",
        name: "HasKey",
        varType: "bool",
        description: "Create Boolean variable 'HasKey'",
      },
      {
        type: "variable_exists",
        name: "DoorUnlocked",
        varType: "bool",
        description: "Create Boolean variable 'DoorUnlocked'",
      },
      {
        type: "node_exists",
        nodeType: "Get_HasKey",
        description: "Get HasKey variable",
      },
      {
        type: "node_exists",
        nodeType: "Get_DoorUnlocked",
        description: "Get DoorUnlocked variable",
      },
      {
        type: "node_exists",
        nodeType: "AND",
        description: "Add an AND logic node",
      },
      {
        type: "connection",
        from: { nodeType: "Get_HasKey", pin: "val_out" },
        to: { nodeType: "AND", pin: "a_in" },
        description: "Connect HasKey to AND node",
      },
      {
        type: "connection",
        from: { nodeType: "Get_DoorUnlocked", pin: "val_out" },
        to: { nodeType: "AND", pin: "b_in" },
        description: "Connect DoorUnlocked to AND node",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Use Branch to check the AND result",
      },
    ],
  },
  {
    taskId: "task_18_flipflop",
    level: 5,
    title: "Toggle Behavior",
    description:
      "Use FlipFlop to alternate between two states each time it's triggered.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "FlipFlop",
        description: "Add a FlipFlop node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "FlipFlop", pin: "exec_in" },
        description: "Connect BeginPlay to FlipFlop",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Add two Print String nodes for A and B outputs",
      },
      {
        type: "connection",
        from: { nodeType: "FlipFlop", pin: "exec_a" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect A output to Print String",
      },
      {
        type: "connection",
        from: { nodeType: "FlipFlop", pin: "exec_b" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect B output to Print String",
      },
    ],
  },
  {
    taskId: "task_19_type_conversion",
    level: 5,
    title: "Type Conversion",
    description:
      "Convert an Integer to a Float, multiply by 1.5, then convert back to String for printing.",
    requirements: [
      {
        type: "variable_exists",
        name: "MyNumber",
        varType: "int",
        description: "Create Integer variable 'MyNumber'",
      },
      {
        type: "node_exists",
        nodeType: "Get_MyNumber",
        description: "Get MyNumber variable",
      },
      {
        type: "node_exists",
        nodeType: "Conv_IntToFloat",
        description: "Add Int to Float conversion",
      },
      {
        type: "connection",
        from: { nodeType: "Get_MyNumber", pin: "val_out" },
        to: { nodeType: "Conv_IntToFloat", pin: "val_in" },
        description: "Connect MyNumber to conversion",
      },
      {
        type: "node_exists",
        nodeType: "MultiplyFloat",
        description: "Multiply the float value",
      },
      {
        type: "connection",
        from: { nodeType: "Conv_IntToFloat", pin: "val_out" },
        to: { nodeType: "MultiplyFloat", pin: "a_in" },
        description: "Connect converted float to multiply",
      },
      {
        type: "node_exists",
        nodeType: "Conv_FloatToString",
        description: "Convert result to String",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Print the final result",
      },
    ],
  },
  {
    taskId: "task_20_complex_calculator",
    level: 5,
    title: "Advanced Calculator",
    description:
      "Build a calculator: Create variables A, B, and Operation (string). Use branches to perform +, -, *, / based on Operation value.",
    requirements: [
      {
        type: "variable_exists",
        name: "A",
        varType: "float",
        description: "Create Float variable 'A'",
      },
      {
        type: "variable_exists",
        name: "B",
        varType: "float",
        description: "Create Float variable 'B'",
      },
      {
        type: "variable_exists",
        name: "Operation",
        varType: "string",
        description: "Create String variable 'Operation'",
      },
      {
        type: "variable_exists",
        name: "Result",
        varType: "float",
        description: "Create Float variable 'Result'",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        count: 2,
        description: "Add at least 2 Branch nodes for operation selection",
      },
      {
        type: "node_exists",
        nodeType: "AddFloat",
        description: "Add a Float + Float node",
      },
      {
        type: "node_exists",
        nodeType: "SubtractFloat",
        description: "Add a Float - Float node",
      },
      {
        type: "node_exists",
        nodeType: "MultiplyFloat",
        description: "Add a Float * Float node",
      },
      {
        type: "node_exists",
        nodeType: "Set_Result",
        description: "Set the Result variable",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Print the result",
      },
    ],
  },
];
