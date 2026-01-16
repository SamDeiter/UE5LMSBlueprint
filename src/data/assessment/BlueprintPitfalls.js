/**
 * BlueprintPitfalls.js
 * Advanced assessment tasks based on "The Blueprint Paradox: Top 100 Issues in UE5"
 * Tests understanding of common architectural, performance, and workflow mistakes.
 *
 * Organized by the 6 critical domains:
 * 1. Execution & Performance (Issues 1-20)
 * 2. Architecture, Memory & Asset Management (Issues 21-40)
 * 3. Data Integrity and Types (Issues 41-55)
 * 4. Networking and Replication (Issues 56-70)
 * 5. Subsystems (UI, Animation, Audio, AI) (Issues 71-85)
 * 6. Workflow, Stability & Deployment (Issues 86-100)
 */

// ============================================================================
// DOMAIN 1: EXECUTION & PERFORMANCE
// Tests understanding of VM overhead, tick abuse, and flow control pitfalls
// ============================================================================
export const PERFORMANCE_PITFALL_TASKS = [
  {
    taskId: "pitfall_01_tick_abuse",
    level: 4,
    title: "Performance Pitfall #1: Event Tick Abuse",
    description:
      "BROKEN: This Blueprint checks 'IsHealthZero' every frame in Event Tick. FIX IT by using an Event-Driven pattern instead. Create an OnDamageTaken custom event that only checks health when damage occurs.",
    pitfallId: 1,
    category: "Performance",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "EventTick",
        description: "Remove the Event Tick node (event-driven is better)",
      },
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        customName: "OnDamageTaken",
        description: "Create 'OnDamageTaken' custom event",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Add health check Branch only in damage event",
      },
    ],
  },
  {
    taskId: "pitfall_02_pure_function_redundancy",
    level: 4,
    title: "Performance Pitfall #2: Pure Function Evaluation",
    description:
      "ISSUE: A pure GetActorLocation is connected to 3 different nodes, executing 3 times. FIX IT by caching the result in a local variable first, then connecting that variable to all consumers.",
    pitfallId: 2,
    category: "Performance",
    requirements: [
      {
        type: "variable_exists",
        name: "CachedLocation",
        varType: "vector",
        description: "Create a local Vector variable to cache the result",
      },
      {
        type: "node_exists",
        nodeType: "Set_CachedLocation",
        description: "Set the cached location once",
      },
      {
        type: "node_exists",
        nodeType: "Get_CachedLocation",
        count: 3,
        description:
          "Read cached location (not GetActorLocation) multiple times",
      },
    ],
  },
  {
    taskId: "pitfall_05_get_all_actors",
    level: 5,
    title: "Performance Pitfall #5: GetAllActorsOfClass Abuse",
    description:
      "ANTI-PATTERN: A projectile uses GetAllActorsOfClass every Tick to find players. FIX IT using a Registration pattern: The player registers itself with a GameInstance manager on BeginPlay. The projectile then queries the manager directly.",
    pitfallId: 5,
    category: "Performance",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "GetAllActorsOfClass",
        description: "Remove GetAllActorsOfClass (too expensive)",
      },
      {
        type: "node_exists",
        nodeType: "GetGameInstance",
        description: "Get GameInstance for centralized registry",
      },
      {
        type: "node_exists",
        nodeType: "CastTo",
        description: "Cast to custom GameInstance type",
      },
    ],
  },
  {
    taskId: "pitfall_06_cast_hard_reference",
    level: 5,
    title: "Architecture Pitfall #6: Cast Hard References",
    description:
      "ISSUE: A PlayerCharacter casts directly to BP_BossEnemy, creating a hard reference. FIX IT using a Blueprint Interface instead. Create an 'IDamageable' interface with a 'GetHealth' function.",
    pitfallId: 6,
    category: "Memory",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "CastTo",
        description: "Remove direct Cast (creates hard reference)",
      },
      {
        type: "node_exists",
        nodeType: "DoesImplementInterface",
        description: "Check interface instead of casting",
      },
      {
        type: "node_exists",
        nodeType: "InterfaceMessage",
        description: "Call interface function (no hard reference)",
      },
    ],
  },
  {
    taskId: "pitfall_11_timeline_loop",
    level: 4,
    title: "Performance Pitfall #11: Timeline as Tick Replacement",
    description:
      "MYTH: Developer replaced Tick with a looping Timeline thinking it's more efficient. TRUTH: It has the same VM overhead. Convert to a Timer-based approach that fires at a fixed interval instead of every frame.",
    pitfallId: 11,
    category: "Performance",
    requirements: [
      {
        type: "node_exists",
        nodeType: "SetTimerByEvent",
        description: "Use Timer instead of looping Timeline",
      },
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        description: "Create custom event for timer callback",
      },
    ],
  },
  {
    taskId: "pitfall_14_physics_in_bp",
    level: 5,
    title: "Performance Pitfall #14: Physics in Blueprint Tick",
    description:
      "ISSUE: Custom trajectory prediction runs 50+ vector operations per frame in BP. BEST PRACTICE: Move heavy math to C++ or use built-in physics nodes. Demonstrate using PredictProjectilePath instead of manual calculation.",
    pitfallId: 14,
    category: "Performance",
    requirements: [
      {
        type: "node_exists",
        nodeType: "PredictProjectilePath",
        description: "Use built-in projectile prediction (native code)",
      },
      {
        type: "node_not_exists",
        nodeType: "ForEachLoop",
        description: "Avoid manual trajectory iteration in BP",
      },
    ],
  },
];

// ============================================================================
// DOMAIN 2: ARCHITECTURE, MEMORY & ASSET MANAGEMENT
// Tests understanding of references, dependencies, and data persistence
// ============================================================================
export const ARCHITECTURE_PITFALL_TASKS = [
  {
    taskId: "pitfall_21_soft_references",
    level: 5,
    title: "Memory Pitfall #21: Hard vs Soft References",
    description:
      "CRITICAL: An inventory system uses hard references (direct class types) for 500 weapon blueprints, loading ALL into RAM. Convert to Soft Object References and implement Async Load.",
    pitfallId: 21,
    category: "Memory",
    requirements: [
      {
        type: "variable_exists",
        name: "WeaponClass",
        varType: "softclassreference",
        description: "Use Soft Class Reference instead of hard reference",
      },
      {
        type: "node_exists",
        nodeType: "AsyncLoadAsset",
        description: "Load asset asynchronously when needed",
      },
      {
        type: "node_exists",
        nodeType: "IsValidSoftObjectReference",
        description: "Validate soft reference before loading",
      },
    ],
  },
  {
    taskId: "pitfall_27_data_persistence",
    level: 4,
    title: "Architecture Pitfall #27: Data Persistence Gap",
    description:
      "BUG: Player inventory resets between levels because it's stored in PlayerController. FIX IT by moving persistent data to the GameInstance, which survives level transitions.",
    pitfallId: 27,
    category: "Architecture",
    requirements: [
      {
        type: "node_exists",
        nodeType: "GetGameInstance",
        description: "Access GameInstance for persistent data",
      },
      {
        type: "variable_exists",
        name: "PlayerInventory",
        description: "Inventory stored in GameInstance, not Controller",
      },
    ],
  },
  {
    taskId: "pitfall_36_cast_fails_silently",
    level: 3,
    title: "Logic Pitfall #36: Unhandled Cast Failure",
    description:
      "BUG: Cast To fails silently when the target is null or wrong type, stopping execution. ALWAYS handle the Cast Failed pin. Connect it to error handling or fallback logic.",
    pitfallId: 36,
    category: "Logic Flow",
    requirements: [
      {
        type: "node_exists",
        nodeType: "CastTo",
        description: "Cast node present",
      },
      {
        type: "link_exists",
        sourceNode: "CastTo",
        sourcePin: "cast_failed",
        targetNode: "PrintString",
        targetPin: "exec_in",
        description: "Handle Cast Failed with error message",
      },
    ],
  },
  {
    taskId: "pitfall_39_event_dispatcher_leak",
    level: 5,
    title: "Memory Pitfall #39: Event Dispatcher Binding Leak",
    description:
      "LEAK: Actor binds to GameInstance dispatcher in BeginPlay but never unbinds. After level unload, the GameInstance holds a reference, preventing GC. Add Unbind in EndPlay.",
    pitfallId: 39,
    category: "Memory",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventEndPlay",
        description: "Handle EndPlay event for cleanup",
      },
      {
        type: "node_exists",
        nodeType: "UnbindEvent",
        description: "Unbind from dispatcher on destroy",
      },
    ],
  },
];

// ============================================================================
// DOMAIN 3: DATA INTEGRITY AND TYPES
// Tests understanding of type safety, precision, and data handling
// ============================================================================
export const DATA_INTEGRITY_PITFALL_TASKS = [
  {
    taskId: "pitfall_43_array_get_copy",
    level: 4,
    title: "Data Pitfall #43: Array Get Returns Copy",
    description:
      "BUG: Developer modifies struct from array Get, thinking it updates the array. Get returns a COPY. Use SetArrayElem or break/make struct with Set Members in Struct to modify correctly.",
    pitfallId: 43,
    category: "Data",
    requirements: [
      {
        type: "node_exists",
        nodeType: "SetArrayElem",
        description: "Use SetArrayElem to modify array contents",
      },
      {
        type: "node_exists",
        nodeType: "BreakStruct",
        description: "Break struct to access members",
      },
      {
        type: "node_exists",
        nodeType: "MakeStruct",
        description: "Make struct with modified values",
      },
    ],
  },
  {
    taskId: "pitfall_52_pure_random_bug",
    level: 3,
    title: "Data Pitfall #52: Pure Random Evaluation",
    description:
      "BUG: A pure RandomInt node is connected to both a Branch condition AND the print node. Result: different random values in each! Cache the random value in a variable first.",
    pitfallId: 52,
    category: "Data",
    requirements: [
      {
        type: "variable_exists",
        name: "RandomResult",
        varType: "int",
        description: "Create local variable to cache random value",
      },
      {
        type: "node_exists",
        nodeType: "Set_RandomResult",
        description: "Cache random value before using",
      },
      {
        type: "node_count",
        nodeType: "RandomIntInRange",
        count: 1,
        description: "Only ONE random node should exist",
      },
    ],
  },
  {
    taskId: "pitfall_53_null_check",
    level: 3,
    title: "Logic Pitfall #53: Missing IsValid Check",
    description:
      "ERROR: Accessing properties of a dynamically spawned actor without checking IsValid causes 'Accessed None' errors. Add IsValid check before property access.",
    pitfallId: 53,
    category: "Logic Flow",
    requirements: [
      {
        type: "node_exists",
        nodeType: "IsValid",
        description: "Add IsValid check for dynamic actors",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Branch on IsValid result",
      },
      {
        type: "link_exists",
        sourceNode: "IsValid",
        sourcePin: "bool_out",
        targetNode: "Branch",
        targetPin: "cond_in",
        description: "Connect validity check to branch",
      },
    ],
  },
  {
    taskId: "pitfall_54_do_once_reset",
    level: 3,
    title: "Logic Pitfall #54: DoOnce Without Reset",
    description:
      "BUG: Power-up only works once in entire game because DoOnce never resets. Wire the Reset pin to a relevant event (e.g., OnRespawn).",
    pitfallId: 54,
    category: "Logic Flow",
    requirements: [
      {
        type: "node_exists",
        nodeType: "DoOnce",
        description: "DoOnce node present",
      },
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        customName: "OnRespawn",
        description: "Create respawn event that resets DoOnce",
      },
      {
        type: "link_exists",
        sourceNode: "CustomEvent",
        targetNode: "DoOnce",
        targetPin: "reset",
        description: "Connect respawn event to DoOnce Reset pin",
      },
    ],
  },
];

// ============================================================================
// DOMAIN 4: NETWORKING AND REPLICATION
// Tests understanding of server authority and replication
// ============================================================================
export const NETWORKING_PITFALL_TASKS = [
  {
    taskId: "pitfall_56_client_authority",
    level: 6,
    title: "Network Pitfall #56: Client-Side Authority",
    description:
      "CRITICAL: Client modifies Health variable directly. Server doesn't know, value gets overwritten. FIX IT with a Server RPC that asks the server to apply damage.",
    pitfallId: 56,
    category: "Networking",
    requirements: [
      {
        type: "node_exists",
        nodeType: "ServerRPC",
        customName: "Server_ApplyDamage",
        description: "Create Server RPC for damage",
      },
      {
        type: "node_exists",
        nodeType: "SwitchHasAuthority",
        description: "Check authority before applying damage",
      },
    ],
  },
  {
    taskId: "pitfall_58_repnotify",
    level: 5,
    title: "Network Pitfall #58: RepNotify vs Tick",
    description:
      "INEFFICIENT: Using Tick to check if Health changed and update UI. Use RepNotify instead - it fires ONLY when the replicated variable actually changes.",
    pitfallId: 58,
    category: "Networking",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "EventTick",
        description: "Remove Tick-based health checking",
      },
      {
        type: "function_exists",
        name: "OnRep_Health",
        description: "Create RepNotify function for Health",
      },
    ],
  },
  {
    taskId: "pitfall_59_authority_filter",
    level: 5,
    title: "Network Pitfall #59: Missing Authority Check",
    description:
      "BUG: Damage logic runs on both server AND client, applying damage twice. Add Switch Has Authority to ensure damage only applies on server.",
    pitfallId: 59,
    category: "Networking",
    requirements: [
      {
        type: "node_exists",
        nodeType: "SwitchHasAuthority",
        description: "Add authority switch",
      },
      {
        type: "link_exists",
        sourceNode: "SwitchHasAuthority",
        sourcePin: "authority",
        description: "Connect authority-only logic to Authority pin",
      },
    ],
  },
  {
    taskId: "pitfall_60_playerstate",
    level: 5,
    title: "Network Pitfall #60: Wrong Data Container",
    description:
      "BUG: Kill count stored in PlayerController, invisible to other players for scoreboard. Move to PlayerState which replicates to all clients.",
    pitfallId: 60,
    category: "Networking",
    requirements: [
      {
        type: "node_exists",
        nodeType: "GetPlayerState",
        description: "Access PlayerState for shared data",
      },
      {
        type: "variable_exists",
        name: "KillCount",
        replicationType: "Replicated",
        description: "KillCount in PlayerState, replicated",
      },
    ],
  },
];

// ============================================================================
// DOMAIN 5: SUBSYSTEMS (UI, Animation, Audio, AI)
// Tests understanding of domain-specific Blueprint patterns
// ============================================================================
export const SUBSYSTEM_PITFALL_TASKS = [
  {
    taskId: "pitfall_71_umg_binding",
    level: 5,
    title: "UI Pitfall #71: UMG Binding Performance",
    description:
      "SLOW: Health bar uses function binding, executing every frame. Convert to Event-Driven updates - only call SetPercent when Health actually changes via RepNotify.",
    pitfallId: 71,
    category: "UI",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "BindWidget",
        description: "Remove per-frame binding",
      },
      {
        type: "node_exists",
        nodeType: "SetPercent",
        description: "Directly set progress bar value",
      },
      {
        type: "node_exists",
        nodeType: "EventDispatcher",
        customName: "OnHealthChanged",
        description: "Fire event when health changes",
      },
    ],
  },
  {
    taskId: "pitfall_72_widget_construction",
    level: 4,
    title: "UI Pitfall #72: Widget in Tick",
    description:
      "CRASH: Create Widget is called in Tick, spawning thousands of widgets. Create widget ONCE in BeginPlay, store reference, reuse.",
    pitfallId: 72,
    category: "UI",
    requirements: [
      {
        type: "node_not_exists",
        nodeType: "EventTick",
        description: "Remove Tick from UI creation flow",
      },
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Create widget in BeginPlay only",
      },
      {
        type: "variable_exists",
        name: "HealthBarWidget",
        varType: "widget",
        description: "Store widget reference for reuse",
      },
    ],
  },
  {
    taskId: "pitfall_73_anim_fast_path",
    level: 6,
    title: "Animation Pitfall #73: Fast Path Broken",
    description:
      "SLOW: AnimBP uses Blueprint math in Anim Graph, breaking Fast Path. Move calculations to Event Graph (Thread Safe Update), read cached values in Anim Graph.",
    pitfallId: 73,
    category: "Animation",
    requirements: [
      {
        type: "node_exists",
        nodeType: "ThreadSafeUpdate",
        description: "Use Thread Safe Update for calculations",
      },
      {
        type: "variable_exists",
        name: "CachedSpeed",
        varType: "float",
        description: "Cache animation values in Event Graph",
      },
    ],
  },
  {
    taskId: "pitfall_77_enhanced_input",
    level: 3,
    title: "Input Pitfall #77: Missing Mapping Context",
    description:
      "BUG: Enhanced Input actions defined but don't work. Must call Add Mapping Context on Local Player Subsystem in BeginPlay.",
    pitfallId: 77,
    category: "Input",
    requirements: [
      {
        type: "node_exists",
        nodeType: "EventBeginPlay",
        description: "Setup input in BeginPlay",
      },
      {
        type: "node_exists",
        nodeType: "GetLocalPlayerSubsystem",
        description: "Get Enhanced Input Local Player Subsystem",
      },
      {
        type: "node_exists",
        nodeType: "AddMappingContext",
        description: "Add the Input Mapping Context",
      },
    ],
  },
  {
    taskId: "pitfall_79_ai_service_tick",
    level: 5,
    title: "AI Pitfall #79: Behavior Tree Service Performance",
    description:
      "SLOW: BT Service runs expensive 'Find Nearest Player' every tick for 100 AI. Set Service to tick at random interval (0.5-1.0s) to spread load.",
    pitfallId: 79,
    category: "AI",
    requirements: [
      {
        type: "node_property",
        nodeKey: "BTService",
        property: "Interval",
        value: "0.5",
        description: "Set minimum tick interval",
      },
      {
        type: "node_property",
        nodeKey: "BTService",
        property: "RandomDeviation",
        value: "0.25",
        description: "Add random deviation to spread load",
      },
    ],
  },
];

// ============================================================================
// DOMAIN 6: WORKFLOW, STABILITY & DEPLOYMENT
// Tests understanding of production-safe practices
// ============================================================================
export const WORKFLOW_PITFALL_TASKS = [
  {
    taskId: "pitfall_93_delta_time",
    level: 3,
    title: "Workflow Pitfall #93: Frame-Rate Dependent Logic",
    description:
      "BUG: Force applied in Tick without Delta Seconds - objects move faster at 60fps than 30fps. ALWAYS multiply by Delta Seconds for frame-rate independence.",
    pitfallId: 93,
    category: "Workflow",
    requirements: [
      {
        type: "node_exists",
        nodeType: "GetWorldDeltaSeconds",
        description: "Get Delta Seconds for frame independence",
      },
      {
        type: "node_exists",
        nodeType: "Multiply",
        description: "Multiply movement by Delta Seconds",
      },
      {
        type: "link_exists",
        sourceNode: "GetWorldDeltaSeconds",
        targetNode: "Multiply",
        description: "Connect Delta Seconds to multiplication",
      },
    ],
  },
  {
    taskId: "pitfall_94_none_access",
    level: 3,
    title: "Stability Pitfall #94: None Access Violation",
    description:
      "ERROR: Accessing null reference causes 'Accessed None' log spam and broken execution. Add IsValid checks for ALL dynamic object references.",
    pitfallId: 94,
    category: "Stability",
    requirements: [
      {
        type: "node_exists",
        nodeType: "IsValid",
        description: "Check validity before access",
      },
      {
        type: "node_exists",
        nodeType: "Branch",
        description: "Branch based on validity",
      },
    ],
  },
  {
    taskId: "pitfall_12_delay_limitations",
    level: 4,
    title: "Logic Pitfall #12: Delay Node Limitations",
    description:
      "ERROR: Tried to use Delay inside a Function - won't compile. Latent actions (Delay) only work in Event Graph. Refactor using Custom Event + Delay pattern.",
    pitfallId: 12,
    category: "Logic Flow",
    requirements: [
      {
        type: "node_exists",
        nodeType: "CustomEvent",
        customName: "DoDelayedAction",
        description: "Create custom event for delayed logic",
      },
      {
        type: "node_exists",
        nodeType: "Delay",
        description: "Delay in Event Graph context",
      },
      {
        type: "link_exists",
        sourceNode: "Delay",
        targetNode: "CustomEvent",
        description: "Chain delay to custom event",
      },
    ],
  },
];

// Combined export for all pitfall tasks
export const BLUEPRINT_PITFALL_TASKS = [
  ...PERFORMANCE_PITFALL_TASKS,
  ...ARCHITECTURE_PITFALL_TASKS,
  ...DATA_INTEGRITY_PITFALL_TASKS,
  ...NETWORKING_PITFALL_TASKS,
  ...SUBSYSTEM_PITFALL_TASKS,
  ...WORKFLOW_PITFALL_TASKS,
];
