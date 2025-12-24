export const LEVEL_2_TASKS = [
  {
    taskId: "task_03_branching",
    level: 2,
    title: "Conditionals",
    description:
      "Use a Boolean variable 'IsActive' to control flow. If true, print 'Active'; otherwise print 'Inactive'.",
    requirements: [
      {
        type: "variable_exists",
        name: "IsActive",
        varType: "bool",
        description: "Create Boolean variable 'IsActive'",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Add a Branch node",
      },
      {
        type: "connection",
        from: { nodeType: "Get_IsActive", pin: "val_out" },
        to: { nodeType: "Branch", pin: "cond_in" },
        description: "Connect 'IsActive' to Branch Condition",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Add two Print String nodes",
      },
      {
        type: "connection",
        from: { nodeType: "Branch", pin: "exec_true" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect True branch to Print String",
      },
      {
        type: "connection",
        from: { nodeType: "Branch", pin: "exec_false" },
        to: { nodeType: "PrintString", pin: "exec_in" },
        description: "Connect False branch to Print String",
      },
    ],
  },
  {
    taskId: "task_04_variable_modification",
    level: 2,
    title: "Variable Modification",
    description:
      "Create a 'Score' variable and increment it by 10 when the game starts.",
    requirements: [
      {
        type: "variable_exists",
        name: "Score",
        varType: "int",
        description: "Create Integer variable 'Score'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Get_Score",
        description: "Get the Score variable",
      },
      {
        type: "node_exists",
        nodeType: "AddInt",
        description: "Add an Integer + Integer node",
      },
      {
        type: "node_exists",
        nodeType: "Set_Score",
        description: "Set the Score variable",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Set_Score", pin: "exec_in" },
        description: "Connect BeginPlay to Set Score",
      },
      {
        type: "connection",
        from: { nodeType: "Get_Score", pin: "val_out" },
        to: { nodeType: "AddInt", pin: "a_in" },
        description: "Connect Get Score to Add node",
      },
      {
        type: "connection",
        from: { nodeType: "AddInt", pin: "val_out" },
        to: { nodeType: "Set_Score", pin: "val_in" },
        description: "Connect Add result to Set Score",
      },
    ],
  },
  {
    taskId: "task_05_multiple_operations",
    level: 2,
    title: "Multiple Operations",
    description:
      "Create variables 'X' and 'Y'. Calculate (X + Y) - 5 and store in 'Result'.",
    requirements: [
      {
        type: "variable_exists",
        name: "X",
        varType: "int",
        description: "Create Integer variable 'X'",
      },
      {
        type: "variable_exists",
        name: "Y",
        varType: "int",
        description: "Create Integer variable 'Y'",
      },
      {
        type: "variable_exists",
        name: "Result",
        varType: "int",
        description: "Create Integer variable 'Result'",
      },
      {
        type: "node_exists",
        nodeType: "AddInt",
        description: "Add an Integer + Integer node",
      },
      {
        type: "node_exists",
        nodeType: "SubtractInt",
        description: "Add an Integer - Integer node",
      },
      {
        type: "node_exists",
        nodeType: "Set_Result",
        description: "Set the Result variable",
      },
    ],
  },
];
