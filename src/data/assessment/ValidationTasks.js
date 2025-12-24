export const VALIDATION_TASKS = [
  {
    taskId: "task_21_specific_connection",
    level: 2,
    title: "Precise Connections",
    description:
      "Connect EventBeginPlay's execution output specifically to PrintString's execution input.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add Print String node",
      },
      {
        type: "link_exists",
        sourceNode: "EventBeginPlay",
        sourcePin: "exec_out",
        targetNode: "PrintString",
        targetPin: "exec_in",
        description: "Connect BeginPlay exec_out to PrintString exec_in",
      },
    ],
  },
  {
    taskId: "task_22_custom_message",
    level: 2,
    title: "Custom Print Message",
    description:
      "Print a specific message: Set the PrintString node's text to 'Welcome to Blueprints!'",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add Print String node",
      },
      {
        type: "node_property",
        nodeKey: "PrintString",
        pinId: "str_in",
        value: "Welcome to Blueprints!",
        description: "Set PrintString text to 'Welcome to Blueprints!'",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect BeginPlay to PrintString",
      },
    ],
  },
  {
    taskId: "task_23_data_flow",
    level: 3,
    title: "Data Flow Validation",
    description:
      "Create variable 'PlayerName' and ensure it flows correctly to PrintString.",
    requirements: [
      {
        type: "variable_exists",
        name: "PlayerName",
        varType: "string",
        description: "Create String variable 'PlayerName'",
      },
      {
        type: "node_exists",
        nodeType: "Get_PlayerName",
        description: "Get PlayerName variable",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add Print String node",
      },
      {
        type: "link_exists",
        sourceNode: "Get_PlayerName",
        sourcePin: "val_out",
        targetNode: "PrintString",
        targetPin: "str_in",
        description: "Connect PlayerName value to PrintString input",
      },
    ],
  },
  {
    taskId: "task_24_math_with_literal",
    level: 3,
    title: "Math with Specific Values",
    description:
      "Add 5 to variable 'Counter'. The literal value on the AddInt node must be exactly 5.",
    requirements: [
      {
        type: "variable_exists",
        name: "Counter",
        varType: "int",
        description: "Create Integer variable 'Counter'",
      },
      {
        type: "node_exists",
        nodeType: "Get_Counter",
        description: "Get Counter variable",
      },
      {
        type: "node_exists",
        nodeType: "AddInt",
        description: "Add an Integer + Integer node",
      },
      {
        type: "node_property",
        nodeKey: "AddInt",
        pinId: "b_in",
        value: "5",
        description: "Set the second input of AddInt to 5",
      },
      {
        type: "node_exists",
        nodeType: "Set_Counter",
        description: "Set Counter variable",
      },
      {
        type: "link_exists",
        sourceNode: "Get_Counter",
        sourcePin: "val_out",
        targetNode: "AddInt",
        targetPin: "a_in",
        description: "Connect Counter to first AddInt input",
      },
      {
        type: "link_exists",
        sourceNode: "AddInt",
        sourcePin: "val_out",
        targetNode: "Set_Counter",
        targetPin: "val_in",
        description: "Connect AddInt result to Set Counter",
      },
    ],
  },
  {
    taskId: "task_25_branch_with_comparison",
    level: 3,
    title: "Conditional with Comparison",
    description:
      "Check if 'Score' is greater than 50. Use a comparison node with the literal value 50.",
    requirements: [
      {
        type: "variable_exists",
        name: "Score",
        varType: "int",
        description: "Create Integer variable 'Score'",
      },
      {
        type: "node_exists",
        nodeType: "Get_Score",
        description: "Get Score variable",
      },
      {
        type: "node_exists",
        nodeType: "GreaterInt",
        description: "Add Integer > Integer comparison",
      },
      {
        type: "node_property",
        nodeKey: "GreaterInt",
        pinId: "b_in",
        value: "50",
        description: "Set comparison threshold to 50",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Add Branch node",
      },
      {
        type: "link_exists",
        sourceNode: "Get_Score",
        sourcePin: "val_out",
        targetNode: "GreaterInt",
        targetPin: "a_in",
        description: "Connect Score to comparison",
      },
      {
        type: "link_exists",
        sourceNode: "GreaterInt",
        sourcePin: "val_out",
        targetNode: "Branch",
        targetPin: "cond_in",
        description: "Connect comparison result to Branch condition",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Add two Print String nodes for true/false branches",
      },
    ],
  },
];
