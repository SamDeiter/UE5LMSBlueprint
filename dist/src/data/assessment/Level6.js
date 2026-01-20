export const LEVEL_6_TASKS = [
  {
    taskId: "task_21_double_precision",
    level: 6,
    title: "Double Precision",
    description:
      "Create a Double variable named 'PreciseValue' and set it to 3.14159 on BeginPlay.",
    requirements: [
      {
        type: "variable_exists",
        name: "PreciseValue",
        varType: "double",
        description: "Create Double variable 'PreciseValue'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Set_PreciseValue",
        description: "Add Set PreciseValue node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Set_PreciseValue", pin: "exec_in" },
        description: "Connect BeginPlay to Set node",
      },
    ],
  },
  {
    taskId: "task_22_enum_usage",
    level: 6,
    title: "Enumerator Basics",
    description:
      "Create an Enum variable named 'Status' and set it to a specific value on BeginPlay.",
    requirements: [
      {
        type: "variable_exists",
        name: "Status",
        varType: "enum",
        description: "Create Enum variable 'Status'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Set_Status",
        description: "Add Set Status node",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Set_Status", pin: "exec_in" },
        description: "Connect BeginPlay to Set node",
      },
    ],
  },
  {
    taskId: "task_23_array_basics",
    level: 6,
    title: "Array Management",
    description:
      "Create an Integer Array named 'Inventory'. Add an item to it on BeginPlay.",
    requirements: [
      {
        type: "variable_exists",
        name: "Inventory",
        varType: "int",
        containerType: "array",
        description: "Create Integer Array 'Inventory'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Array_Add",
        description: "Add Array ADD node",
      },
      {
        type: "node_exists",
        nodeType: "Get_Inventory",
        description: "Get Inventory variable",
      },
      {
        type: "connection",
        from: { nodeType: "EventBeginPlay", pin: "exec_out" },
        to: { nodeType: "Array_Add", pin: "exec_in" },
        description: "Connect BeginPlay to Array Add",
      },
      {
        type: "connection",
        from: { nodeType: "Get_Inventory", pin: "val_out" },
        to: { nodeType: "Array_Add", pin: "array_in" },
        description: "Connect Inventory to Array Add",
      },
    ],
  },
  {
    taskId: "task_24_set_unique",
    level: 6,
    title: "Set Uniqueness",
    description: "Create a String Set named 'UniqueNames'. Add a name to it.",
    requirements: [
      {
        type: "variable_exists",
        name: "UniqueNames",
        varType: "string",
        containerType: "set",
        description: "Create String Set 'UniqueNames'",
      },
      {
        type: "node_exists",
        nodeType: "Set_Add",
        description: "Add Set ADD node",
      },
      {
        type: "node_exists",
        nodeType: "Get_UniqueNames",
        description: "Get UniqueNames variable",
      },
      {
        type: "connection",
        from: { nodeType: "Get_UniqueNames", pin: "val_out" },
        to: { nodeType: "Set_Add", pin: "set_in" },
        description: "Connect UniqueNames to Set Add",
      },
    ],
  },
  {
    taskId: "task_25_map_lookup",
    level: 6,
    title: "Map Lookup",
    description:
      "Create a Map named 'PlayerScores' (String to Integer). Add a key-value pair.",
    requirements: [
      {
        type: "variable_exists",
        name: "PlayerScores",
        varType: "string", // Key type is usually primary type in this simple system, or we check containerType
        containerType: "map",
        description: "Create Map 'PlayerScores'",
      },
      {
        type: "node_exists",
        nodeType: "Map_Add",
        description: "Add Map ADD node",
      },
      {
        type: "node_exists",
        nodeType: "Get_PlayerScores",
        description: "Get PlayerScores variable",
      },
      {
        type: "connection",
        from: { nodeType: "Get_PlayerScores", pin: "val_out" },
        to: { nodeType: "Map_Add", pin: "map_in" },
        description: "Connect PlayerScores to Map Add",
      },
    ],
  },
];
