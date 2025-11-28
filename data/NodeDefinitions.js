/**
 * Defines the static library of all available nodes that can be spawned.
 * Includes detailed pin definitions to ensure proper rendering.
 */
export const NodeDefinitions = {
    // --- CONVERSION NODES (Compact Style) ---
    "Conv_FloatToString": {
        title: "To String (Float)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "float", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_IntToString": {
        title: "To String (Int)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "int", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_BoolToString": {
        title: "To String (Bool)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "bool", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_ByteToString": {
        title: "To String (Byte)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "byte", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_NameToString": {
        title: "To String (Name)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "name", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_TextToString": {
        title: "To String (Text)",
        type: "pure-node",
        category: "String",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "text", dir: "in" },
            { id: "val_out", name: "", type: "string", dir: "out" }
        ]
    },
    "Conv_IntToFloat": {
        title: "To Float (Int)",
        type: "pure-node",
        category: "Math|Float",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "int", dir: "in" },
            { id: "val_out", name: "", type: "float", dir: "out" }
        ]
    },
    "Conv_ByteToInt": {
        title: "To Int (Byte)",
        type: "pure-node",
        category: "Math|Integer",
        icon: "●",
        pins: [
            { id: "val_in", name: "", type: "byte", dir: "in" },
            { id: "val_out", name: "", type: "int", dir: "out" }
        ]
    },

    // --- EVENTS ---
    "ConstructionScript": {
        title: "Construction Script",
        type: "event-node",
        category: "Events",
        icon: "fa-tools",
        isSingleton: true,
        hidden: false,
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "EventBeginPlay": {
        title: "Event BeginPlay",
        type: "event-node",
        category: "Events",
        icon: "fa-play",
        isSingleton: true, // Marks this node as unique in the graph
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "EventTick": {
        title: "Event Tick",
        type: "event-node",
        category: "Events",
        icon: "fa-clock",
        isSingleton: true, // Marks this node as unique in the graph
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "delta_seconds_out", name: "Delta Seconds", type: "float", dir: "out" }
        ]
    },
    "CustomEvent": {
        title: "Custom Event",
        type: "event-node",
        category: "Events",
        icon: "fa-bolt",
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
            // Removed delegate_out
        ]
    },
    "Timeline": {
        title: "Timeline",
        type: "flow-node",
        category: "Utilities|Time",
        icon: "fa-clock",
        pins: [
            { id: "play", name: "Play", type: "exec", dir: "in" },
            { id: "stop", name: "Stop", type: "exec", dir: "in" },
            { id: "reverse", name: "Reverse", type: "exec", dir: "in" },
            { id: "reverse_from_end", name: "Reverse From End", type: "exec", dir: "in" },
            { id: "update", name: "Update", type: "exec", dir: "out" },
            { id: "finished", name: "Finished", type: "exec", dir: "out" },
            { id: "alpha", name: "Alpha", type: "float", dir: "out", defaultValue: 0.0 },
            { id: "direction", name: "Direction", type: "int", dir: "out", defaultValue: 1 }
        ],
        customData: {
            length: 5.0,
            loop: false
        }
    },
    "EventActorBeginOverlap": {
        title: "Event ActorBeginOverlap",
        type: "event-node",
        category: "Events",
        icon: "fa-door-open",
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "other_actor_out", name: "Other Actor", type: "object", dir: "out" }
        ]
    },
    "EventOnClicked": {
        title: "Event OnClicked",
        type: "event-node",
        category: "Events",
        icon: "fa-mouse-pointer",
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    // --- FLOW CONTROL ---
    "Branch": {
        title: "Branch",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-code-branch",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "cond_in", name: "Condition", type: "bool", dir: "in", defaultValue: true },
            { id: "exec_true", name: "True", type: "exec", dir: "out" },
            { id: "exec_false", name: "False", type: "exec", dir: "out" }
        ]
    },
    "Sequence": {
        title: "Sequence",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-list-ol",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "exec_0", name: "Then 0", type: "exec", dir: "out" },
            { id: "exec_1", name: "Then 1", type: "exec", dir: "out" }
        ]
    },
    "DoOnce": {
        title: "DoOnce",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-step-forward",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "reset_in", name: "Reset", type: "exec", dir: "in" },
            { id: "exec_completed", name: "Completed", type: "exec", dir: "out" }
        ]
    },
    "DoN": {
        title: "Do N",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-redo-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "reset_in", name: "Reset", type: "exec", dir: "in" },
            { id: "n_in", name: "N", type: "int", dir: "in" },
            { id: "exec_counter", name: "Counter", type: "exec", dir: "out" },
            { id: "exit_int", name: "Count", type: "int", dir: "out" }
        ]
    },
    "FlipFlop": {
        title: "FlipFlop",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-toggle-on",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "exec_a", name: "A", type: "exec", dir: "out" },
            { id: "exec_b", name: "B", type: "exec", dir: "out" },
            { id: "is_a_bool", name: "Is A", type: "bool", dir: "out" }
        ]
    },
    "ForLoop": {
        title: "ForLoop",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-sync-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "first_index_in", name: "First Index", type: "int", dir: "in" },
            { id: "last_index_in", name: "Last Index", type: "int", dir: "in" },
            { id: "exec_loop_body", name: "Loop Body", type: "exec", dir: "out" },
            { id: "index_out", name: "Index", type: "int", dir: "out" },
            { id: "exec_completed", name: "Completed", type: "exec", dir: "out" }
        ]
    },
    "ForEachLoop": {
        title: "ForEachLoop",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-sync-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Array", type: "object", dir: "in", containerType: "array" },
            { id: "exec_loop_body", name: "Loop Body", type: "exec", dir: "out" },
            { id: "array_element_out", name: "Array Element", type: "object", dir: "out" },
            { id: "array_index_out", name: "Array Index", type: "int", dir: "out" },
            { id: "exec_completed", name: "Completed", type: "exec", dir: "out" }
        ]
    },
    "Gate": {
        title: "Gate",
        type: "flow-node",
        category: "Flow Control",
        icon: "fa-dungeon",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "enter_in", name: "Enter", type: "exec", dir: "in" },
            { id: "open_in", name: "Open", type: "exec", dir: "in" },
            { id: "close_in", name: "Close", type: "exec", dir: "in" },
            { id: "toggle_in", name: "Toggle", type: "exec", dir: "in" },
            { id: "exec_exit", name: "Exit", type: "exec", dir: "out" }
        ]
    },
    // --- FUNCTIONS ---
    "FunctionEntry": {
        title: "Function Entry",
        type: "event-node",
        category: "Function",
        icon: "f",
        isSingleton: true,
        pins: [
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "FunctionResult": {
        title: "Return Node",
        type: "flow-node",
        category: "Function",
        icon: "fa-sign-out-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" }
        ]
    },
    "PrintString": {
        title: "Print String",
        type: "function-node",
        category: "String",
        icon: "f",
        devWarning: "Development Only",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "str_in", name: "In String", type: "string", dir: "in", defaultValue: "Hello" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    // --- MATH (PURE) ---
    "AddInt": {
        title: "Add (Integer)",
        type: "pure-node",
        category: "Math|Integer",
        icon: "fa-plus",
        pins: [
            { id: "a_in", name: "A", type: "int", dir: "in" },
            { id: "b_in", name: "B", type: "int", dir: "in" },
            { id: "ret_out", name: "Return Value", type: "int", dir: "out" }
        ]
    },
    "SubtractInt": {
        title: "Subtract (Integer)",
        type: "pure-node",
        category: "Math|Integer",
        icon: "-",
        pins: [
            { id: "a_in", name: "A", type: "int", dir: "in" },
            { id: "b_in", name: "B", type: "int", dir: "in" },
            { id: "ret_out", name: "Return Value", type: "int", dir: "out" }
        ]
    },
    "MultiplyInt": {
        title: "Multiply (Integer)",
        type: "pure-node",
        category: "Math|Integer",
        icon: "×",
        pins: [
            { id: "a_in", name: "A", type: "int", dir: "in" },
            { id: "b_in", name: "B", type: "int", dir: "in" },
            { id: "ret_out", name: "Return Value", type: "int", dir: "out" }
        ]
    },
    "DivideInt": {
        title: "Divide (Integer)",
        type: "pure-node",
        category: "Math|Integer",
        icon: "÷",
        pins: [
            { id: "a_in", name: "A", type: "int", dir: "in", defaultValue: 1 },
            { id: "b_in", name: "B", type: "int", dir: "in", defaultValue: 1 },
            { id: "ret_out", name: "Return Value", type: "int", dir: "out" }
        ]
    },
    "AddFloat": {
        title: "Add (Float)",
        type: "pure-node",
        category: "Math|Float",
        icon: "+",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "float", dir: "out" }
        ]
    },
    "SubtractFloat": {
        title: "Subtract (Float)",
        type: "pure-node",
        category: "Math|Float",
        icon: "-",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 1.0 },
            { id: "ret_out", name: "Return Value", type: "float", dir: "out" }
        ]
    },
    "MultiplyFloat": {
        title: "Multiply (Float)",
        type: "pure-node",
        category: "Math|Float",
        icon: "×",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 1.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 1.0 },
            { id: "ret_out", name: "Return Value", type: "float", dir: "out" }
        ]
    },
    "DivideFloat": {
        title: "Divide (Float)",
        type: "pure-node",
        category: "Math|Float",
        icon: "÷",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 1.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 1.0 },
            { id: "ret_out", name: "Return Value", type: "float", dir: "out" }
        ]
    },
    // --- BOOLEAN LOGIC ---
    "OR": {
        title: "OR",
        type: "pure-node",
        category: "Math|Boolean",
        icon: "∨",
        pins: [
            { id: "a_in", name: "A", type: "bool", dir: "in", defaultValue: false },
            { id: "b_in", name: "B", type: "bool", dir: "in", defaultValue: false },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "AND": {
        title: "AND",
        type: "pure-node",
        category: "Math|Boolean",
        icon: "∧",
        pins: [
            { id: "a_in", name: "A", type: "bool", dir: "in", defaultValue: false },
            { id: "b_in", name: "B", type: "bool", dir: "in", defaultValue: false },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "NOT": {
        title: "NOT",
        type: "pure-node",
        category: "Math|Boolean",
        icon: "¬",
        pins: [
            { id: "a_in", name: "A", type: "bool", dir: "in", defaultValue: false },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    // --- COMPARISON OPERATORS ---
    "Greater": {
        title: "> (Greater)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "\u003e",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "GreaterEqual": {
        title: ">= (Greater or Equal)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "≥",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "Less": {
        title: "< (Less)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "\u003c",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "LessEqual": {
        title: "<= (Less or Equal)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "≤",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "EqualEqual": {
        title: "== (Equal)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "=",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ]
    },
    "NotEqual": {
        title: "!= (Not Equal)",
        type: "pure-node",
        category: "Math|Comparison",
        icon: "≠",
        pins: [
            { id: "a_in", name: "A", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "b_in", name: "B", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "ret_out", name: "Return Value", type: "bool", dir: "out" }
        ],
    },
    // --- VECTOR OPERATIONS ---
    "MakeVector": {
        title: "Make Vector",
        category: "Math|Vector",
        type: "pure-node",
        icon: "fa-plus",
        pins: [
            { id: "x_in", name: "X", type: "float", dir: "in", defaultValue: 0 },
            { id: "y_in", name: "Y", type: "float", dir: "in", defaultValue: 0 },
            { id: "z_in", name: "Z", type: "float", dir: "in", defaultValue: 0 },
            { id: "vec_out", name: "Return Value", type: "vector", dir: "out" }
        ]
    },
    "BreakVector": {
        title: "Break Vector",
        category: "Math|Vector",
        type: "pure-node",
        icon: "fa-minus",
        pins: [
            { id: "vec_in", name: "Vector", type: "vector", dir: "in" },
            { id: "x_out", name: "X", type: "float", dir: "out" },
            { id: "y_out", name: "Y", type: "float", dir: "out" },
            { id: "z_out", name: "Z", type: "float", dir: "out" }
        ]
    },

    // --- ROTATOR OPERATIONS ---
    "MakeRotator": {
        title: "Make Rotator",
        category: "Math|Rotator",
        type: "pure-node",
        icon: "fa-sync",
        pins: [
            { id: "roll_in", name: "Roll (X)", type: "float", dir: "in", defaultValue: 0 },
            { id: "pitch_in", name: "Pitch (Y)", type: "float", dir: "in", defaultValue: 0 },
            { id: "yaw_in", name: "Yaw (Z)", type: "float", dir: "in", defaultValue: 0 },
            { id: "rot_out", name: "Return Value", type: "rotator", dir: "out" }
        ]
    },
    "BreakRotator": {
        title: "Break Rotator",
        category: "Math|Rotator",
        type: "pure-node",
        icon: "fa-sync",
        pins: [
            { id: "rot_in", name: "Rotator", type: "rotator", dir: "in" },
            { id: "roll_out", name: "Roll", type: "float", dir: "out" },
            { id: "pitch_out", name: "Pitch", type: "float", dir: "out" },
            { id: "yaw_out", name: "Yaw", type: "float", dir: "out" }
        ]
    },

    // --- TRANSFORM OPERATIONS ---
    "MakeTransform": {
        title: "Make Transform",
        category: "Math|Transform",
        type: "pure-node",
        icon: "fa-cube",
        pins: [
            { id: "loc_in", name: "Location", type: "vector", dir: "in" },
            { id: "rot_in", name: "Rotation", type: "rotator", dir: "in" },
            { id: "scale_in", name: "Scale", type: "vector", dir: "in" }, // Default scale usually 1,1,1 but we'll handle in logic or default
            { id: "trans_out", name: "Return Value", type: "transform", dir: "out" }
        ]
    },
    "BreakTransform": {
        title: "Break Transform",
        category: "Math|Transform",
        type: "pure-node",
        icon: "fa-cube",
        pins: [
            { id: "trans_in", name: "Transform", type: "transform", dir: "in" },
            { id: "loc_out", name: "Location", type: "vector", dir: "out" },
            { id: "rot_out", name: "Rotation", type: "rotator", dir: "out" },
            { id: "scale_out", name: "Scale", type: "vector", dir: "out" }
        ]
    },

    // --- STRING OPERATIONS ---
    "Append": {
        title: "Append",
        type: "pure-node",
        category: "String",
        icon: "+",
        pins: [
            { id: "a_in", name: "A", type: "string", dir: "in", defaultValue: "" },
            { id: "b_in", name: "B", type: "string", dir: "in", defaultValue: "" },
            { id: "ret_out", name: "Return Value", type: "string", dir: "out" }
        ]
    },
    // --- UTILITY ---
    "Comment": {
        title: "New Comment",
        type: "comment-node",
        category: "Development",
        icon: "fa-comment-dots",
        pins: []
    },
    // --- GENERIC SET NODES (Templates) ---
    "Set_bool": {
        title: "Set (Boolean)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "bool", dir: "in", defaultValue: false },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "bool", dir: "out" }
        ]
    },
    "Set_byte": {
        title: "Set (Byte)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "byte", dir: "in", defaultValue: 0 },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "byte", dir: "out" }
        ]
    },
    "Set_int": {
        title: "Set (Integer)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "int", dir: "in", defaultValue: 0 },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "int", dir: "out" }
        ]
    },
    "Set_int64": {
        title: "Set (Integer64)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "int64", dir: "in", defaultValue: 0 },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "int64", dir: "out" }
        ]
    },
    "Set_float": {
        title: "Set (Float)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "float", dir: "in", defaultValue: 0.0 },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "float", dir: "out" }
        ]
    },
    "Set_name": {
        title: "Set (Name)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "name", dir: "in", defaultValue: "None" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "name", dir: "out" }
        ]
    },
    "Set_string": {
        title: "Set (String)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "string", dir: "in", defaultValue: "" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "string", dir: "out" }
        ]
    },
    "Set_text": {
        title: "Set (Text)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "text", dir: "in", defaultValue: "" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "text", dir: "out" }
        ]
    },
    "Set_vector": {
        title: "Set (Vector)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "vector", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "vector", dir: "out" }
        ]
    },
    "Set_rotator": {
        title: "Set (Rotator)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "rotator", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "rotator", dir: "out" }
        ]
    },
    "Set_transform": {
        title: "Set (Transform)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "transform", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "transform", dir: "out" }
        ]
    },
    "Set_object": {
        title: "Set (Object)",
        type: "variable-node",
        icon: "fa-arrow-circle-up",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "val_in", name: "Value", type: "object", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "val_out", name: "Output", type: "object", dir: "out" }
        ]
    },
    // --- CASTING ---
    "CastTo_Character": {
        title: "Cast To Character",
        type: "flow-node",
        category: "Casting",
        icon: "fa-cube",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "object_in", name: "Object", type: "object", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "cast_failed", name: "Cast Failed", type: "exec", dir: "out" },
            { id: "as_character", name: "As Character", type: "object", dir: "out" }
        ]
    },
    // --- COMPONENT UTILS ---
    "SetVisibility": {
        title: "Set Visibility",
        type: "function-node",
        category: "Rendering",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "target", name: "Target", type: "scenecomponent", dir: "in" },
            { id: "new_visibility", name: "New Visibility", type: "bool", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "GetWorldLocation": {
        title: "Get World Location",
        type: "pure-node",
        category: "Transformation",
        pins: [
            { id: "target", name: "Target", type: "scenecomponent", dir: "in" },
            { id: "location", name: "Return Value", type: "vector", dir: "out" }
        ]
    },
    "CastTo_Pawn": {
        title: "Cast To Pawn",
        type: "flow-node",
        category: "Casting",
        icon: "fa-chess-pawn",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "object_in", name: "Object", type: "object", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "cast_failed", name: "Cast Failed", type: "exec", dir: "out" },
            { id: "as_pawn", name: "As Pawn", type: "object", dir: "out" }
        ]
    },

    "NeedNode": {
        title: "Need Node",
        type: "assessment-node",
        category: "Assessment",
        icon: "fa-clipboard-check",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "score_out", name: "Score", type: "int", dir: "out" },
            { id: "passed_out", name: "Passed", type: "bool", dir: "out" }
        ]
    },

    // --- ARRAY OPERATIONS ---
    "Array_Add": {
        title: "ADD (Array)",
        type: "function-node",
        category: "Utilities|Array",
        icon: "fa-plus-square",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array", isRef: true },
            { id: "item_in", name: "New Item", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "index_out", name: "Output Index", type: "int", dir: "out" }
        ]
    },
    "Array_RemoveIndex": {
        title: "Remove Index",
        type: "function-node",
        category: "Utilities|Array",
        icon: "fa-minus-square",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array", isRef: true },
            { id: "index_in", name: "Index", type: "int", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "Array_RemoveItem": {
        title: "Remove Item",
        type: "function-node",
        category: "Utilities|Array",
        icon: "fa-minus-square",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array", isRef: true },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "removed_out", name: "Removed", type: "bool", dir: "out" }
        ]
    },
    "Array_Get": {
        title: "GET (Array)",
        type: "pure-node",
        category: "Utilities|Array",
        icon: "fa-th",
        pins: [
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array" },
            { id: "index_in", name: "Index", type: "int", dir: "in" },
            { id: "item_out", name: "Item", type: "wildcard", dir: "out" }
        ]
    },
    "Array_SetElem": {
        title: "Set Array Elem",
        type: "function-node",
        category: "Utilities|Array",
        icon: "fa-edit",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array", isRef: true },
            { id: "index_in", name: "Index", type: "int", dir: "in" },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "size_change_out", name: "Size to Fit", type: "bool", dir: "out" }
        ]
    },
    "Array_Length": {
        title: "Length",
        type: "pure-node",
        category: "Utilities|Array",
        icon: "fa-ruler-horizontal",
        pins: [
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array" },
            { id: "length_out", name: "Length", type: "int", dir: "out" }
        ]
    },
    "Array_Clear": {
        title: "Clear",
        type: "function-node",
        category: "Utilities|Array",
        icon: "fa-trash-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array", isRef: true },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "Array_Contains": {
        title: "Contains",
        type: "pure-node",
        category: "Utilities|Array",
        icon: "fa-search",
        pins: [
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array" },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "found_out", name: "Found", type: "bool", dir: "out" }
        ]
    },
    "Array_Find": {
        title: "Find Item",
        type: "pure-node",
        category: "Utilities|Array",
        icon: "fa-search-location",
        pins: [
            { id: "array_in", name: "Target Array", type: "wildcard", dir: "in", containerType: "array" },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "index_out", name: "Index", type: "int", dir: "out" }
        ]
    },

    // --- SET OPERATIONS ---
    "Set_Add": {
        title: "ADD (Set)",
        type: "function-node",
        category: "Utilities|Set",
        icon: "fa-plus-circle",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set", isRef: true },
            { id: "item_in", name: "New Item", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "added_out", name: "Added", type: "bool", dir: "out" }
        ]
    },
    "Set_Remove": {
        title: "Remove (Set)",
        type: "function-node",
        category: "Utilities|Set",
        icon: "fa-minus-circle",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set", isRef: true },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "removed_out", name: "Removed", type: "bool", dir: "out" }
        ]
    },
    "Set_Contains": {
        title: "Contains (Set)",
        type: "pure-node",
        category: "Utilities|Set",
        icon: "fa-search",
        pins: [
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set" },
            { id: "item_in", name: "Item", type: "wildcard", dir: "in" },
            { id: "found_out", name: "Found", type: "bool", dir: "out" }
        ]
    },
    "Set_Clear": {
        title: "Clear (Set)",
        type: "function-node",
        category: "Utilities|Set",
        icon: "fa-trash-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set", isRef: true },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "Set_Length": {
        title: "Length (Set)",
        type: "pure-node",
        category: "Utilities|Set",
        icon: "fa-ruler-horizontal",
        pins: [
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set" },
            { id: "length_out", name: "Length", type: "int", dir: "out" }
        ]
    },
    "Set_ToArray": {
        title: "To Array (Set)",
        type: "pure-node",
        category: "Utilities|Set",
        icon: "fa-list",
        pins: [
            { id: "set_in", name: "Target Set", type: "wildcard", dir: "in", containerType: "set" },
            { id: "array_out", name: "Array", type: "wildcard", dir: "out", containerType: "array" }
        ]
    },

    // --- MAP OPERATIONS ---
    "Map_Add": {
        title: "ADD (Map)",
        type: "function-node",
        category: "Utilities|Map",
        icon: "fa-plus-square",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map", isRef: true },
            { id: "key_in", name: "Key", type: "wildcard", dir: "in" },
            { id: "value_in", name: "Value", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "added_out", name: "Added", type: "bool", dir: "out" }
        ]
    },
    "Map_Remove": {
        title: "Remove (Map)",
        type: "function-node",
        category: "Utilities|Map",
        icon: "fa-minus-square",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map", isRef: true },
            { id: "key_in", name: "Key", type: "wildcard", dir: "in" },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" },
            { id: "removed_out", name: "Removed", type: "bool", dir: "out" }
        ]
    },
    "Map_Find": {
        title: "Find (Map)",
        type: "pure-node",
        category: "Utilities|Map",
        icon: "fa-search",
        pins: [
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map" },
            { id: "key_in", name: "Key", type: "wildcard", dir: "in" },
            { id: "value_out", name: "Value", type: "wildcard", dir: "out" },
            { id: "found_out", name: "Found", type: "bool", dir: "out" }
        ]
    },
    "Map_Clear": {
        title: "Clear (Map)",
        type: "function-node",
        category: "Utilities|Map",
        icon: "fa-trash-alt",
        pins: [
            { id: "exec_in", name: "Exec", type: "exec", dir: "in" },
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map", isRef: true },
            { id: "exec_out", name: "Exec", type: "exec", dir: "out" }
        ]
    },
    "Map_Length": {
        title: "Length (Map)",
        type: "pure-node",
        category: "Utilities|Map",
        icon: "fa-ruler-horizontal",
        pins: [
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map" },
            { id: "length_out", name: "Length", type: "int", dir: "out" }
        ]
    },
    "Map_Keys": {
        title: "Keys (Map)",
        type: "pure-node",
        category: "Utilities|Map",
        icon: "fa-key",
        pins: [
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map" },
            { id: "keys_out", name: "Keys", type: "wildcard", dir: "out", containerType: "array" }
        ]
    },
    "Map_Values": {
        title: "Values (Map)",
        type: "pure-node",
        category: "Utilities|Map",
        icon: "fa-list-ul",
        pins: [
            { id: "map_in", name: "Target Map", type: "wildcard", dir: "in", containerType: "map" },
            { id: "values_out", name: "Values", type: "wildcard", dir: "out", containerType: "array" }
        ]
    }

};
