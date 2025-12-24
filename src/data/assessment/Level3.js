export const LEVEL_3_TASKS = [
  {
    taskId: "task_06_custom_event",
    level: 3,
    title: "Custom Events",
    description:
      "Create a Custom Event called 'OnScoreChanged' and call it from BeginPlay.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        description: "Add a Custom Event node",
      },
      {
        type: "node_title",
        nodeType: "CustomEvent",
        title: "OnScoreChanged",
        description: "Rename the Custom Event to 'OnScoreChanged'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add a Print String node after the custom event",
      },
    ],
  },
  {
    taskId: "task_07_float_operations",
    level: 3,
    title: "Float Mathematics",
    description:
      "Create Float variables 'Speed' and 'Time'. Calculate Distance = Speed * Time.",
    requirements: [
      {
        type: "variable_exists",
        name: "Speed",
        varType: "float",
        description: "Create Float variable 'Speed'",
      },
      {
        type: "variable_exists",
        name: "Time",
        varType: "float",
        description: "Create Float variable 'Time'",
      },
      {
        type: "variable_exists",
        name: "Distance",
        varType: "float",
        description: "Create Float variable 'Distance'",
      },
      {
        type: "node_exists",
        nodeType: "Get_Speed",
        description: "Get Speed variable",
      },
      {
        type: "node_exists",
        nodeType: "Get_Time",
        description: "Get Time variable",
      },
      {
        type: "node_exists",
        nodeType: "MultiplyFloat",
        description: "Add a Float * Float node",
      },
      {
        type: "node_exists",
        nodeType: "Set_Distance",
        description: "Set Distance variable",
      },
    ],
  },
  {
    taskId: "task_08_component_basics",
    level: 3,
    title: "Component Basics",
    description: "Add a PointLight component to your Blueprint.",
    requirements: [
      {
        type: "component_exists",
        componentType: "PointLight",
        description: "Add a PointLight component",
      },
    ],
  },
  {
    taskId: "task_09_string_operations",
    level: 3,
    title: "String Manipulation",
    description:
      "Create String variables 'FirstName' and 'LastName'. Combine them and print the full name.",
    requirements: [
      {
        type: "variable_exists",
        name: "FirstName",
        varType: "string",
        description: "Create String variable 'FirstName'",
      },
      {
        type: "variable_exists",
        name: "LastName",
        varType: "string",
        description: "Create String variable 'LastName'",
      },
      {
        type: "node_exists",
        nodeType: "Get_FirstName",
        description: "Get FirstName variable",
      },
      {
        type: "node_exists",
        nodeType: "Get_LastName",
        description: "Get LastName variable",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Print the result",
      },
    ],
  },
];
