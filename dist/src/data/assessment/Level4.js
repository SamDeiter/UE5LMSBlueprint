export const LEVEL_4_TASKS = [
  {
    taskId: "task_10_health_system",
    level: 4,
    title: "Health System",
    description:
      "Build a complete health system: Create 'Health' and 'MaxHealth' variables. When health reaches 0, print 'Game Over'.",
    requirements: [
      {
        type: "variable_exists",
        name: "Health",
        varType: "float",
        description: "Create Float variable 'Health'",
      },
      {
        type: "variable_exists",
        name: "MaxHealth",
        varType: "float",
        description: "Create Float variable 'MaxHealth'",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Add a Branch node to check health",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Print 'Game Over' message",
      },
      {
        type: "node_exists",
        nodeType: "Get_Health",
        description: "Get Health variable",
      },
    ],
  },
  {
    taskId: "task_11_state_machine",
    level: 4,
    title: "Simple State Machine",
    description:
      "Create a 'GameState' String variable. Use branches to handle 'Menu', 'Playing', and 'GameOver' states.",
    requirements: [
      {
        type: "variable_exists",
        name: "GameState",
        varType: "string",
        description: "Create String variable 'GameState'",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        count: 2,
        description: "Add at least 2 Branch nodes",
      },
      {
        type: "node_exists",
        nodeType: "Get_GameState",
        description: "Get GameState variable",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 3,
        description: "Print messages for each state",
      },
    ],
  },
  {
    taskId: "task_12_complete_project",
    level: 4,
    title: "Mini Game Logic",
    description:
      "Build a simple scoring system: Start with Score=0, add points on BeginPlay, check if Score >= 100 to win.",
    requirements: [
      {
        type: "variable_exists",
        name: "Score",
        varType: "int",
        description: "Create Integer variable 'Score'",
      },
      {
        type: "variable_exists",
        name: "TargetScore",
        varType: "int",
        description: "Create Integer variable 'TargetScore'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay",
      },
      {
        type: "node_exists",
        nodeType: "AddInt",
        description: "Add points to score",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Check if target reached",
      },
      {
        type: "node_exists",
        nodeType: "Set_Score",
        description: "Update the score",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        count: 2,
        description: "Print win/continue messages",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Set_Score", pin: "exec_in" },
        description: "Connect BeginPlay to scoring logic",
      },
    ],
  },
];
