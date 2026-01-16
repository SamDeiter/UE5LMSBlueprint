/**
 * Level7.js - Advanced Features Assessment
 * Tests: Macros, Interfaces, Local Variables, Timeline
 */

export const LEVEL_7_TASKS = [
  // =====================
  // MACRO TASKS
  // =====================
  {
    taskId: "task_701_create_macro",
    level: 7,
    title: "Create Your First Macro",
    description:
      "Create a macro called 'DebugLog' that prints a message. Macros allow you to reuse Blueprint logic.",
    requirements: [
      {
        type: "macro_exists",
        name: "DebugLog",
        description: "Create a macro named 'DebugLog'",
      },
      {
        type: "node_exists_in_macro",
        macroName: "DebugLog",
        nodeType: "PrintString",
        description: "Add a PrintString node inside the macro",
      },
    ],
  },
  {
    taskId: "task_702_use_macro",
    level: 7,
    title: "Use a Macro in Event Graph",
    description:
      "Call the 'DebugLog' macro from Event BeginPlay to execute reusable logic.",
    requirements: [
      {
        type: "macro_exists",
        name: "DebugLog",
        description: "Macro 'DebugLog' must exist",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay",
      },
      {
        type: "node_exists",
        nodeType: "Macro_DebugLog",
        description: "Add the DebugLog macro node",
      },
      {
        type: "link_exists",
        sourceNode: "EventBeginPlay",
        sourcePin: "exec_out",
        targetNode: "Macro_DebugLog",
        targetPin: "exec_in",
        description: "Connect BeginPlay to the macro",
      },
    ],
  },
  {
    taskId: "task_703_macro_with_inputs",
    level: 7,
    title: "Macro with Input Parameters",
    description:
      "Create a macro 'LogMessage' with a String input parameter called 'Message'. This teaches you how to pass data into macros.",
    requirements: [
      {
        type: "macro_exists",
        name: "LogMessage",
        description: "Create macro 'LogMessage'",
      },
    ],
  },

  // =====================
  // INTERFACE TASKS
  // =====================
  {
    taskId: "task_711_implement_interface",
    level: 7,
    title: "Implement an Interface",
    description:
      "Add the 'IInteractable' interface to your Blueprint. Interfaces define contracts for interaction.",
    requirements: [
      {
        type: "interface_implemented",
        interfaceName: "IInteractable",
        description: "Implement the IInteractable interface",
      },
    ],
  },
  {
    taskId: "task_712_interface_function",
    level: 7,
    title: "Implement Interface Function",
    description:
      "After implementing IInteractable, add the 'Interact' function event and connect it to PrintString.",
    requirements: [
      {
        type: "interface_implemented",
        interfaceName: "IInteractable",
        description: "IInteractable must be implemented",
      },
      {
        type: "node_exists",
        nodeType: "EventInteract",
        description: "Add the Interact event from IInteractable",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add PrintString",
      },
      {
        type: "link_exists",
        sourceNode: "EventInteract",
        sourcePin: "exec_out",
        targetNode: "PrintString",
        targetPin: "exec_in",
        description: "Connect Interact event to PrintString",
      },
    ],
  },
  {
    taskId: "task_713_damageable_interface",
    level: 7,
    title: "Implement IDamageable",
    description:
      "Implement the IDamageable interface and handle the TakeDamage function.",
    requirements: [
      {
        type: "interface_implemented",
        interfaceName: "IDamageable",
        description: "Implement IDamageable interface",
      },
      {
        type: "node_exists",
        nodeType: "EventTakeDamage",
        description: "Add the TakeDamage event",
      },
      {
        type: "variable_exists",
        name: "Health",
        varType: "float",
        description: "Create Health variable",
      },
    ],
  },

  // =====================
  // LOCAL VARIABLE TASKS
  // =====================
  {
    taskId: "task_721_local_variable",
    level: 7,
    title: "Create a Local Variable",
    description:
      "Inside a function, create a local variable 'TempValue' to store intermediate calculations.",
    requirements: [
      {
        type: "function_exists",
        name: "CalculateScore",
        description: "Create a function 'CalculateScore'",
      },
      {
        type: "local_variable_exists",
        functionName: "CalculateScore",
        localVarName: "TempValue",
        description: "Add local variable 'TempValue' in CalculateScore",
      },
    ],
  },
  {
    taskId: "task_722_use_local_variable",
    level: 7,
    title: "Use Local Variable in Function",
    description:
      "Get and Set the local variable 'TempValue' within your function logic.",
    requirements: [
      {
        type: "function_exists",
        name: "CalculateScore",
        description: "Function CalculateScore must exist",
      },
      {
        type: "local_variable_exists",
        functionName: "CalculateScore",
        localVarName: "TempValue",
        description: "Local variable TempValue must exist",
      },
      {
        type: "node_exists_in_function",
        functionName: "CalculateScore",
        nodeType: "Get_TempValue",
        description: "Get TempValue in the function",
      },
      {
        type: "node_exists_in_function",
        functionName: "CalculateScore",
        nodeType: "Set_TempValue",
        description: "Set TempValue in the function",
      },
    ],
  },

  // =====================
  // TIMELINE TASKS
  // =====================
  {
    taskId: "task_731_add_timeline",
    level: 7,
    title: "Add a Timeline",
    description:
      "Add a Timeline node to create time-based animations. Timelines interpolate values over time.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "Timeline",
        description: "Add a Timeline node",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay",
      },
      {
        type: "link_exists",
        sourceNode: "EventBeginPlay",
        sourcePin: "exec_out",
        targetNode: "Timeline",
        targetPin: "Play",
        description: "Connect BeginPlay to Timeline Play input",
      },
    ],
  },
  {
    taskId: "task_732_timeline_update",
    level: 7,
    title: "Use Timeline Update Output",
    description:
      "Connect the Timeline's Update output to continuously update a value while the timeline plays.",
    requirements: [
      {
        type: "node_exists",
        nodeType: "Timeline",
        description: "Timeline node must exist",
      },
      {
        type: "node_exists",
        nodeType: "PrintString",
        description: "Add PrintString",
      },
      {
        type: "link_exists",
        sourceNode: "Timeline",
        sourcePin: "Update",
        targetNode: "PrintString",
        targetPin: "exec_in",
        description: "Connect Timeline Update to PrintString",
      },
    ],
  },
];
