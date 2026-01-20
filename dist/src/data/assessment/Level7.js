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
      "Macros are reusable Blueprint snippets. Create a macro called 'DebugLog' - you'll use this to add quick debug messages anywhere in your Blueprint.",
    requirements: [
      {
        type: "macro_exists",
        name: "DebugLog",
        description:
          "Create a macro named 'DebugLog' using the + button in My Blueprint > Macros",
      },
    ],
  },
  {
    taskId: "task_702_use_macro",
    level: 7,
    title: "Call Your Macro",
    description:
      "Now use your DebugLog macro! Drag it into the Event Graph and connect it to BeginPlay. When the game starts, your macro will execute.",
    requirements: [
      {
        type: "macro_exists",
        name: "DebugLog",
        description: "Your 'DebugLog' macro must still exist",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay node",
      },
      {
        type: "node_exists",
        nodeType: "Macro_DebugLog",
        description: "Drag your DebugLog macro into the graph",
      },
      {
        type: "link_exists",
        sourceNode: "EventBeginPlay",
        sourcePin: "exec_out",
        targetNode: "Macro_DebugLog",
        targetPin: "exec_in",
        description: "Connect BeginPlay → DebugLog macro",
      },
    ],
  },
  {
    taskId: "task_703_practical_macro",
    level: 7,
    title: "Create a Damage Flash Macro",
    description:
      "Create a practical macro called 'DamageFlash' that you could use to flash the screen when the player takes damage. This is a common game pattern!",
    requirements: [
      {
        type: "macro_exists",
        name: "DamageFlash",
        description: "Create macro 'DamageFlash'",
      },
    ],
  },
  {
    taskId: "task_704_multiple_macros",
    level: 7,
    title: "Build a Macro Library",
    description:
      "Good developers create libraries of reusable macros. Create a 'ClampHealth' macro that could be used to keep health between 0-100.",
    requirements: [
      {
        type: "macro_exists",
        name: "DamageFlash",
        description: "DamageFlash macro must exist (from previous task)",
      },
      {
        type: "macro_exists",
        name: "ClampHealth",
        description: "Create new macro 'ClampHealth'",
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
