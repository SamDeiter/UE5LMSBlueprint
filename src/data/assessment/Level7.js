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
  // Tier A: Comprehension & basic implementation
  {
    taskId: "task_711_mark_interactable",
    level: 7,
    title: "Mark a Blueprint as Interactable",
    description:
      "Open Class Settings (the cog icon in the My Blueprint panel) and add the 'IInteractable' interface from the dropdown. This declares your Blueprint as something the player can interact with.",
    requirements: [
      {
        type: "interface_implemented",
        interfaceName: "IInteractable",
        description: "Add IInteractable from Class Settings → Interfaces",
      },
    ],
  },
  {
    taskId: "task_712_implement_get_interaction_text",
    level: 7,
    title: "Implement GetInteractionText",
    description:
      "Open the 'GetInteractionText' implementation graph (click the function under IInteractable in Class Settings) and wire the Return Node's Text input to the literal value 'Press E to open'.",
    requirements: [
      {
        type: "interface_implemented",
        interfaceName: "IInteractable",
        description: "IInteractable must be implemented",
      },
      {
        type: "interface_function_implemented",
        interfaceName: "IInteractable",
        functionName: "GetInteractionText",
        expectedReturnPin: "Text",
        expectedReturn: "Press E to open",
        description:
          "Wire the Return Node's Text pin to 'Press E to open'",
      },
    ],
  },
  {
    taskId: "task_713_implement_can_interact",
    level: 7,
    title: "Implement CanInteract with branching logic",
    description:
      "In the 'CanInteract' implementation graph, return TRUE only when bIsActive is true AND Charges is greater than 0. Use Get bIsActive, Get Charges, a Greater Than (>) comparison, and an AND node, then wire the result to the Return Node.",
    requirements: [
      {
        type: "variable_exists",
        name: "bIsActive",
        varType: "bool",
        description: "Create Boolean variable 'bIsActive'",
      },
      {
        type: "variable_exists",
        name: "Charges",
        varType: "int",
        description: "Create Integer variable 'Charges'",
      },
      {
        type: "interface_implemented",
        interfaceName: "IInteractable",
        description: "IInteractable must be implemented",
      },
      {
        type: "interface_function_implemented",
        interfaceName: "IInteractable",
        functionName: "CanInteract",
        description:
          "CanInteract implementation graph must contain custom logic, not just the auto-stub",
      },
    ],
  },

  // Tier B: Calling interfaces — the core "why interfaces exist" payoff
  {
    taskId: "task_714_send_interface_message",
    level: 7,
    title: "Send an interface message",
    description:
      "In the Event Graph, on Event BeginPlay, send the 'Interact' message of IInteractable to the variable 'TargetActor' (Object). This calls Interact on whatever target your variable points at — it does NOT require a Cast.",
    requirements: [
      {
        type: "variable_exists",
        name: "TargetActor",
        varType: "object",
        description: "Create Object variable 'TargetActor'",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Add Event BeginPlay",
      },
      {
        type: "node_exists",
        nodeType: "Message_IInteractable_Interact",
        description: "Add a Message IInteractable.Interact node",
      },
      {
        type: "interface_message_sent",
        interfaceName: "IInteractable",
        functionName: "Interact",
        description:
          "The Message Interact node's Target pin must be connected (typically to Get TargetActor)",
      },
      {
        type: "link_exists",
        sourceNode: "EventBeginPlay",
        sourcePin: "exec_out",
        targetNode: "Message_IInteractable_Interact",
        targetPin: "exec_in",
        description: "Wire BeginPlay → Message Interact",
      },
    ],
  },
  {
    taskId: "task_715_refactor_cast_ladder",
    level: 7,
    title: "Refactor a Cast Ladder",
    description:
      "Your Event Graph has three Cast nodes — CastTo_Door, CastTo_Chest, and CastTo_Lever — each calling its own Open function. Replace ALL three Casts with a single 'Message IInteractable.Interact' call. This is the canonical reason interfaces exist.",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "CastTo_Door",
        description: "Remove CastTo_Door — it's no longer needed",
      },
      {
        type: "node_not_exists",
        nodeType: "CastTo_Chest",
        description: "Remove CastTo_Chest — it's no longer needed",
      },
      {
        type: "node_not_exists",
        nodeType: "CastTo_Lever",
        description: "Remove CastTo_Lever — it's no longer needed",
      },
      {
        type: "node_exists",
        nodeType: "Message_IInteractable_Interact",
        description: "Add the Message IInteractable.Interact node",
      },
      {
        type: "interface_message_sent",
        interfaceName: "IInteractable",
        functionName: "Interact",
        description: "Connect a Target object to the Message node's Target pin",
      },
    ],
  },
  {
    taskId: "task_716_defensive_check",
    level: 7,
    title: "Check before sending damage",
    description:
      "Before calling TakeDamage on TargetActor, use 'Does Implement Interface' to check it actually implements IDamageable, then route through a Branch. This avoids silent no-ops when the target type isn't guaranteed.",
    requirements: [
      {
        type: "variable_exists",
        name: "TargetActor",
        varType: "object",
        description: "Create Object variable 'TargetActor'",
      },
      {
        type: "node_exists",
        nodeType: "DoesImplementInterface",
        description: "Add a Does Implement Interface node",
      },
      {
        type: "node_property",
        nodeKey: "DoesImplementInterface",
        pinId: "interface_name_in",
        value: "IDamageable",
        description: "Set the Interface input to 'IDamageable'",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Add a Branch node",
      },
      {
        type: "link_exists",
        sourceNode: "DoesImplementInterface",
        sourcePin: "ret_out",
        targetNode: "Branch",
        targetPin: "cond_in",
        description: "Wire DoesImplementInterface's bool output to Branch condition",
      },
      {
        type: "node_exists",
        nodeType: "Message_IDamageable_TakeDamage",
        description: "Add Message IDamageable.TakeDamage",
      },
      {
        type: "interface_message_sent",
        interfaceName: "IDamageable",
        functionName: "TakeDamage",
        description: "Wire TargetActor into the message's Target pin",
      },
    ],
  },

  // Tier C: Designing interfaces — students author their own
  {
    taskId: "task_717_create_custom_interface",
    level: 7,
    title: "Create a Custom Interface (IPickup)",
    description:
      "In the My Blueprint panel, click + on Interfaces to create 'IPickup'. Give it two functions: OnPickedUp(Pickupper: Object) returning bool Success, and GetPickupValue (Pure) returning int Value.",
    requirements: [
      {
        type: "custom_interface_defined",
        interfaceName: "IPickup",
        requiredFunctions: [
          {
            name: "OnPickedUp",
            isPure: false,
            inputs: [{ name: "Pickupper", type: "object" }],
            outputs: [{ name: "Success", type: "bool" }],
          },
          {
            name: "GetPickupValue",
            isPure: true,
            outputs: [{ name: "Value", type: "int" }],
          },
        ],
        description:
          "IPickup must define OnPickedUp(Pickupper:Object → bool Success) and GetPickupValue (Pure → int Value)",
      },
    ],
  },
  {
    taskId: "task_718_implement_custom_interface",
    level: 7,
    title: "Implement IPickup on this Blueprint",
    description:
      "Add IPickup to this Blueprint via Class Settings, then implement both functions. Wire OnPickedUp to return Success = true (use a literal). Wire GetPickupValue to return Value = 10.",
    requirements: [
      {
        type: "custom_interface_defined",
        interfaceName: "IPickup",
        requiredFunctions: [{ name: "OnPickedUp" }, { name: "GetPickupValue" }],
        description: "IPickup must still exist (from task 717)",
      },
      {
        type: "interface_implemented",
        interfaceName: "IPickup",
        description: "Add IPickup from Class Settings → Interfaces",
      },
      {
        type: "interface_function_implemented",
        interfaceName: "IPickup",
        functionName: "OnPickedUp",
        expectedReturnPin: "Success",
        expectedReturn: "true",
        description: "OnPickedUp must return Success = true",
      },
      {
        type: "interface_function_implemented",
        interfaceName: "IPickup",
        functionName: "GetPickupValue",
        expectedReturnPin: "Value",
        expectedReturn: "10",
        description: "GetPickupValue must return Value = 10",
      },
    ],
  },
  {
    taskId: "task_719_consume_custom_interface",
    level: 7,
    title: "Consume the Custom Interface",
    description:
      "On Event Actor Begin Overlap, send the IPickup.OnPickedUp message to the overlapping actor and store the returned value in a Score variable. (You don't need to know the overlapping actor's class — that's the whole point of the interface.)",
    requirements: [
      {
        type: "variable_exists",
        name: "Score",
        varType: "int",
        description: "Create Integer variable 'Score'",
      },
      {
        type: "node_exists",
        nodeType: "EventActorBeginOverlap",
        description: "Add Event ActorBeginOverlap",
      },
      {
        type: "node_exists",
        nodeType: "Message_IPickup_OnPickedUp",
        description: "Add Message IPickup.OnPickedUp",
      },
      {
        type: "interface_message_sent",
        interfaceName: "IPickup",
        functionName: "OnPickedUp",
        description: "Wire the overlapping actor into the message's Target pin",
      },
      {
        type: "node_exists",
        nodeType: "Set_Score",
        description: "Add Set Score",
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
