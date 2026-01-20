
/**
 * AssessmentTasks.js
 * Comprehensive learning tasks organized by difficulty level.
 */

export const ASSESSMENT_TASKS = [
    // ==================== LEVEL 1: FUNDAMENTALS ====================
    {
        taskId: "task_01_hello_world",
        level: 1,
        title: "Hello World",
        description: "The classic first step. Print 'Hello World' to the console when the game starts.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add an Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add a Print String node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect BeginPlay to Print String"
            }
        ]
    },
    {
        taskId: "task_02_basic_math",
        level: 1,
        title: "Basic Math",
        description: "Create two Integer variables, 'A' and 'B'. Add them together and print the result.",
        requirements: [
            {
                type: "variable_exists",
                name: "A",
                varType: "int",
                description: "Create Integer variable 'A'"
            },
            {
                type: "variable_exists",
                name: "B",
                varType: "int",
                description: "Create Integer variable 'B'"
            },
            {
                type: "node_exists",
                nodeType: "Get_A",
                description: "Get variable 'A'"
            },
            {
                type: "node_exists",
                nodeType: "Get_B",
                description: "Get variable 'B'"
            },
            {
                type: "node_exists",
                nodeType: "AddInt",
                description: "Add an Integer + Integer node"
            },
            {
                type: "connection",
                from: { nodeType: "Get_A", pin: "val_out" },
                to: { nodeType: "AddInt", pin: "a_in" },
                description: "Connect 'A' to Add node"
            },
            {
                type: "connection",
                from: { nodeType: "Get_B", pin: "val_out" },
                to: { nodeType: "AddInt", pin: "b_in" },
                description: "Connect 'B' to Add node"
            }
        ]
    },

    // ==================== LEVEL 2: CONTROL FLOW ====================
    {
        taskId: "task_03_branching",
        level: 2,
        title: "Conditionals",
        description: "Use a Boolean variable 'IsActive' to control flow. If true, print 'Active'; otherwise print 'Inactive'.",
        requirements: [
            {
                type: "variable_exists",
                name: "IsActive",
                varType: "bool",
                description: "Create Boolean variable 'IsActive'"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                description: "Add a Branch node"
            },
            {
                type: "connection",
                from: { nodeType: "Get_IsActive", pin: "val_out" },
                to: { nodeType: "Branch", pin: "cond_in" },
                description: "Connect 'IsActive' to Branch Condition"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Add two Print String nodes"
            },
            {
                type: "connection",
                from: { nodeType: "Branch", pin: "exec_true" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect True branch to Print String"
            },
            {
                type: "connection",
                from: { nodeType: "Branch", pin: "exec_false" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect False branch to Print String"
            }
        ]
    },
    {
        taskId: "task_04_variable_modification",
        level: 2,
        title: "Variable Modification",
        description: "Create a 'Score' variable and increment it by 10 when the game starts.",
        requirements: [
            {
                type: "variable_exists",
                name: "Score",
                varType: "int",
                description: "Create Integer variable 'Score'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "Get_Score",
                description: "Get the Score variable"
            },
            {
                type: "node_exists",
                nodeType: "AddInt",
                description: "Add an Integer + Integer node"
            },
            {
                type: "node_exists",
                nodeType: "Set_Score",
                description: "Set the Score variable"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Set_Score", pin: "exec_in" },
                description: "Connect BeginPlay to Set Score"
            },
            {
                type: "connection",
                from: { nodeType: "Get_Score", pin: "val_out" },
                to: { nodeType: "AddInt", pin: "a_in" },
                description: "Connect Get Score to Add node"
            },
            {
                type: "connection",
                from: { nodeType: "AddInt", pin: "val_out" },
                to: { nodeType: "Set_Score", pin: "val_in" },
                description: "Connect Add result to Set Score"
            }
        ]
    },
    {
        taskId: "task_05_multiple_operations",
        level: 2,
        title: "Multiple Operations",
        description: "Create variables 'X' and 'Y'. Calculate (X + Y) - 5 and store in 'Result'.",
        requirements: [
            {
                type: "variable_exists",
                name: "X",
                varType: "int",
                description: "Create Integer variable 'X'"
            },
            {
                type: "variable_exists",
                name: "Y",
                varType: "int",
                description: "Create Integer variable 'Y'"
            },
            {
                type: "variable_exists",
                name: "Result",
                varType: "int",
                description: "Create Integer variable 'Result'"
            },
            {
                type: "node_exists",
                nodeType: "AddInt",
                description: "Add an Integer + Integer node"
            },
            {
                type: "node_exists",
                nodeType: "SubtractInt",
                description: "Add an Integer - Integer node"
            },
            {
                type: "node_exists",
                nodeType: "Set_Result",
                description: "Set the Result variable"
            }
        ]
    },

    // ==================== LEVEL 3: ADVANCED CONCEPTS ====================
    {
        taskId: "task_06_custom_event",
        level: 3,
        title: "Custom Events",
        description: "Create a Custom Event called 'OnScoreChanged' and call it from BeginPlay.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "CustomEvent",
                description: "Add a Custom Event node"
            },
            {
                type: "node_title",
                nodeType: "CustomEvent",
                title: "OnScoreChanged",
                description: "Rename the Custom Event to 'OnScoreChanged'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add a Print String node after the custom event"
            }
        ]
    },
    {
        taskId: "task_07_float_operations",
        level: 3,
        title: "Float Mathematics",
        description: "Create Float variables 'Speed' and 'Time'. Calculate Distance = Speed * Time.",
        requirements: [
            {
                type: "variable_exists",
                name: "Speed",
                varType: "float",
                description: "Create Float variable 'Speed'"
            },
            {
                type: "variable_exists",
                name: "Time",
                varType: "float",
                description: "Create Float variable 'Time'"
            },
            {
                type: "variable_exists",
                name: "Distance",
                varType: "float",
                description: "Create Float variable 'Distance'"
            },
            {
                type: "node_exists",
                nodeType: "Get_Speed",
                description: "Get Speed variable"
            },
            {
                type: "node_exists",
                nodeType: "Get_Time",
                description: "Get Time variable"
            },
            {
                type: "node_exists",
                nodeType: "MultiplyFloat",
                description: "Add a Float * Float node"
            },
            {
                type: "node_exists",
                nodeType: "Set_Distance",
                description: "Set Distance variable"
            }
        ]
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
                description: "Add a PointLight component"
            }
        ]
    },
    {
        taskId: "task_09_string_operations",
        level: 3,
        title: "String Manipulation",
        description: "Create String variables 'FirstName' and 'LastName'. Combine them and print the full name.",
        requirements: [
            {
                type: "variable_exists",
                name: "FirstName",
                varType: "string",
                description: "Create String variable 'FirstName'"
            },
            {
                type: "variable_exists",
                name: "LastName",
                varType: "string",
                description: "Create String variable 'LastName'"
            },
            {
                type: "node_exists",
                nodeType: "Get_FirstName",
                description: "Get FirstName variable"
            },
            {
                type: "node_exists",
                nodeType: "Get_LastName",
                description: "Get LastName variable"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Print the result"
            }
        ]
    },

    // ==================== LEVEL 4: COMPLEX SYSTEMS ====================
    {
        taskId: "task_10_health_system",
        level: 4,
        title: "Health System",
        description: "Build a complete health system: Create 'Health' and 'MaxHealth' variables. When health reaches 0, print 'Game Over'.",
        requirements: [
            {
                type: "variable_exists",
                name: "Health",
                varType: "float",
                description: "Create Float variable 'Health'"
            },
            {
                type: "variable_exists",
                name: "MaxHealth",
                varType: "float",
                description: "Create Float variable 'MaxHealth'"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                description: "Add a Branch node to check health"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Print 'Game Over' message"
            },
            {
                type: "node_exists",
                nodeType: "Get_Health",
                description: "Get Health variable"
            }
        ]
    },
    {
        taskId: "task_11_state_machine",
        level: 4,
        title: "Simple State Machine",
        description: "Create a 'GameState' String variable. Use branches to handle 'Menu', 'Playing', and 'GameOver' states.",
        requirements: [
            {
                type: "variable_exists",
                name: "GameState",
                varType: "string",
                description: "Create String variable 'GameState'"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                count: 2,
                description: "Add at least 2 Branch nodes"
            },
            {
                type: "node_exists",
                nodeType: "Get_GameState",
                description: "Get GameState variable"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 3,
                description: "Print messages for each state"
            }
        ]
    },
    {
        taskId: "task_12_complete_project",
        level: 4,
        title: "Mini Game Logic",
        description: "Build a simple scoring system: Start with Score=0, add points on BeginPlay, check if Score >= 100 to win.",
        requirements: [
            {
                type: "variable_exists",
                name: "Score",
                varType: "int",
                description: "Create Integer variable 'Score'"
            },
            {
                type: "variable_exists",
                name: "TargetScore",
                varType: "int",
                description: "Create Integer variable 'TargetScore'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay"
            },
            {
                type: "node_exists",
                nodeType: "AddInt",
                description: "Add points to score"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                description: "Check if target reached"
            },
            {
                type: "node_exists",
                nodeType: "Set_Score",
                description: "Update the score"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Print win/continue messages"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Set_Score", pin: "exec_in" },
                description: "Connect BeginPlay to scoring logic"
            }
        ]
    },

    // ==================== LEVEL 5: ADVANCED PATTERNS ====================
    {
        taskId: "task_13_do_once",
        level: 5,
        title: "One-Time Initialization",
        description: "Use DoOnce to ensure initialization code only runs once, even if called multiple times.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "DoOnce",
                description: "Add a DoOnce node"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Add two Print String nodes"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "DoOnce", pin: "exec_in" },
                description: "Connect BeginPlay to DoOnce"
            },
            {
                type: "connection",
                from: { nodeType: "DoOnce", pin: "exec_completed" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect DoOnce Completed to Print String"
            }
        ]
    },
    {
        taskId: "task_14_gate_control",
        level: 5,
        title: "Gate Flow Control",
        description: "Use a Gate to control when execution can pass through. Open the gate with one event, close with another.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "Gate",
                description: "Add a Gate node"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay to open the gate"
            },
            {
                type: "node_exists",
                nodeType: "CustomEvent",
                description: "Add a Custom Event to trigger gated logic"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Gate", pin: "open_in" },
                description: "Connect BeginPlay to Gate Open"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add Print String after gate exit"
            }
        ]
    },
    {
        taskId: "task_15_for_loop",
        level: 5,
        title: "Loop Iteration",
        description: "Use a ForLoop to count from 0 to 10 and print each number.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "ForLoop",
                description: "Add a ForLoop node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "ForLoop", pin: "exec_in" },
                description: "Connect BeginPlay to ForLoop"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Print the loop index"
            },
            {
                type: "connection",
                from: { nodeType: "ForLoop", pin: "exec_loop_body" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect Loop Body to Print String"
            },
            {
                type: "connection",
                from: { nodeType: "ForLoop", pin: "index_out" },
                to: { nodeType: "PrintString", pin: "str_in" },
                description: "Connect Index to Print String input"
            }
        ]
    },
    {
        taskId: "task_16_sequence_execution",
        level: 5,
        title: "Sequential Execution",
        description: "Use a Sequence node to execute multiple operations in order: print 'First', then 'Second'.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "Sequence",
                description: "Add a Sequence node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Sequence", pin: "exec_in" },
                description: "Connect BeginPlay to Sequence"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Add two Print String nodes"
            },
            {
                type: "connection",
                from: { nodeType: "Sequence", pin: "exec_0" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect Then 0 to first Print String"
            },
            {
                type: "connection",
                from: { nodeType: "Sequence", pin: "exec_1" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect Then 1 to second Print String"
            }
        ]
    },
    {
        taskId: "task_17_boolean_logic",
        level: 5,
        title: "Boolean Logic Gates",
        description: "Create two Boolean variables 'HasKey' and 'DoorUnlocked'. Use AND logic to check if both are true.",
        requirements: [
            {
                type: "variable_exists",
                name: "HasKey",
                varType: "bool",
                description: "Create Boolean variable 'HasKey'"
            },
            {
                type: "variable_exists",
                name: "DoorUnlocked",
                varType: "bool",
                description: "Create Boolean variable 'DoorUnlocked'"
            },
            {
                type: "node_exists",
                nodeType: "Get_HasKey",
                description: "Get HasKey variable"
            },
            {
                type: "node_exists",
                nodeType: "Get_DoorUnlocked",
                description: "Get DoorUnlocked variable"
            },
            {
                type: "node_exists",
                nodeType: "AND",
                description: "Add an AND logic node"
            },
            {
                type: "connection",
                from: { nodeType: "Get_HasKey", pin: "val_out" },
                to: { nodeType: "AND", pin: "a_in" },
                description: "Connect HasKey to AND node"
            },
            {
                type: "connection",
                from: { nodeType: "Get_DoorUnlocked", pin: "val_out" },
                to: { nodeType: "AND", pin: "b_in" },
                description: "Connect DoorUnlocked to AND node"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                description: "Use Branch to check the AND result"
            }
        ]
    },
    {
        taskId: "task_18_flipflop",
        level: 5,
        title: "Toggle Behavior",
        description: "Use FlipFlop to alternate between two states each time it's triggered.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "FlipFlop",
                description: "Add a FlipFlop node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "FlipFlop", pin: "exec_in" },
                description: "Connect BeginPlay to FlipFlop"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Add two Print String nodes for A and B outputs"
            },
            {
                type: "connection",
                from: { nodeType: "FlipFlop", pin: "exec_a" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect A output to Print String"
            },
            {
                type: "connection",
                from: { nodeType: "FlipFlop", pin: "exec_b" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect B output to Print String"
            }
        ]
    },
    {
        taskId: "task_19_type_conversion",
        level: 5,
        title: "Type Conversion",
        description: "Convert an Integer to a Float, multiply by 1.5, then convert back to String for printing.",
        requirements: [
            {
                type: "variable_exists",
                name: "MyNumber",
                varType: "int",
                description: "Create Integer variable 'MyNumber'"
            },
            {
                type: "node_exists",
                nodeType: "Get_MyNumber",
                description: "Get MyNumber variable"
            },
            {
                type: "node_exists",
                nodeType: "Conv_IntToFloat",
                description: "Add Int to Float conversion"
            },
            {
                type: "connection",
                from: { nodeType: "Get_MyNumber", pin: "val_out" },
                to: { nodeType: "Conv_IntToFloat", pin: "val_in" },
                description: "Connect MyNumber to conversion"
            },
            {
                type: "node_exists",
                nodeType: "MultiplyFloat",
                description: "Multiply the float value"
            },
            {
                type: "connection",
                from: { nodeType: "Conv_IntToFloat", pin: "val_out" },
                to: { nodeType: "MultiplyFloat", pin: "a_in" },
                description: "Connect converted float to multiply"
            },
            {
                type: "node_exists",
                nodeType: "Conv_FloatToString",
                description: "Convert result to String"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Print the final result"
            }
        ]
    },
    {
        taskId: "task_20_complex_calculator",
        level: 5,
        title: "Advanced Calculator",
        description: "Build a calculator: Create variables A, B, and Operation (string). Use branches to perform +, -, *, / based on Operation value.",
        requirements: [
            {
                type: "variable_exists",
                name: "A",
                varType: "float",
                description: "Create Float variable 'A'"
            },
            {
                type: "variable_exists",
                name: "B",
                varType: "float",
                description: "Create Float variable 'B'"
            },
            {
                type: "variable_exists",
                name: "Operation",
                varType: "string",
                description: "Create String variable 'Operation'"
            },
            {
                type: "variable_exists",
                name: "Result",
                varType: "float",
                description: "Create Float variable 'Result'"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                count: 2,
                description: "Add at least 2 Branch nodes for operation selection"
            },
            {
                type: "node_exists",
                nodeType: "AddFloat",
                description: "Add a Float + Float node"
            },
            {
                type: "node_exists",
                nodeType: "SubtractFloat",
                description: "Add a Float - Float node"
            },
            {
                type: "node_exists",
                nodeType: "MultiplyFloat",
                description: "Add a Float * Float node"
            },
            {
                type: "node_exists",
                nodeType: "Set_Result",
                description: "Set the Result variable"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Print the result"
            }
        ]
    },

    // ==================== NEW LEVEL 2-3 TASKS (Using Advanced Validation) ====================
    {
        taskId: "task_21_specific_connection",
        level: 2,
        title: "Precise Connections",
        description: "Connect EventBeginPlay's execution output specifically to PrintString's execution input.",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add Print String node"
            },
            {
                type: "link_exists",
                sourceNode: "EventBeginPlay",
                sourcePin: "exec_out",
                targetNode: "PrintString",
                targetPin: "exec_in",
                description: "Connect BeginPlay exec_out to PrintString exec_in"
            }
        ]
    },
    {
        taskId: "task_22_custom_message",
        level: 2,
        title: "Custom Print Message",
        description: "Print a specific message: Set the PrintString node's text to 'Welcome to Blueprints!'",
        requirements: [
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add Print String node"
            },
            {
                type: "node_property",
                nodeKey: "PrintString",
                pinId: "str_in",
                value: "Welcome to Blueprints!",
                description: "Set PrintString text to 'Welcome to Blueprints!'"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "PrintString", pin: "exec_in" },
                description: "Connect BeginPlay to PrintString"
            }
        ]
    },
    {
        taskId: "task_23_data_flow",
        level: 3,
        title: "Data Flow Validation",
        description: "Create variable 'PlayerName' and ensure it flows correctly to PrintString.",
        requirements: [
            {
                type: "variable_exists",
                name: "PlayerName",
                varType: "string",
                description: "Create String variable 'PlayerName'"
            },
            {
                type: "node_exists",
                nodeType: "Get_PlayerName",
                description: "Get PlayerName variable"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                description: "Add Print String node"
            },
            {
                type: "link_exists",
                sourceNode: "Get_PlayerName",
                sourcePin: "val_out",
                targetNode: "PrintString",
                targetPin: "str_in",
                description: "Connect PlayerName value to PrintString input"
            }
        ]
    },
    {
        taskId: "task_24_math_with_literal",
        level: 3,
        title: "Math with Specific Values",
        description: "Add 5 to variable 'Counter'. The literal value on the AddInt node must be exactly 5.",
        requirements: [
            {
                type: "variable_exists",
                name: "Counter",
                varType: "int",
                description: "Create Integer variable 'Counter'"
            },
            {
                type: "node_exists",
                nodeType: "Get_Counter",
                description: "Get Counter variable"
            },
            {
                type: "node_exists",
                nodeType: "AddInt",
                description: "Add an Integer + Integer node"
            },
            {
                type: "node_property",
                nodeKey: "AddInt",
                pinId: "b_in",
                value: "5",
                description: "Set the second input of AddInt to 5"
            },
            {
                type: "node_exists",
                nodeType: "Set_Counter",
                description: "Set Counter variable"
            },
            {
                type: "link_exists",
                sourceNode: "Get_Counter",
                sourcePin: "val_out",
                targetNode: "AddInt",
                targetPin: "a_in",
                description: "Connect Counter to first AddInt input"
            },
            {
                type: "link_exists",
                sourceNode: "AddInt",
                sourcePin: "val_out",
                targetNode: "Set_Counter",
                targetPin: "val_in",
                description: "Connect AddInt result to Set Counter"
            }
        ]
    },
    {
        taskId: "task_25_branch_with_comparison",
        level: 3,
        title: "Conditional with Comparison",
        description: "Check if 'Score' is greater than 50. Use a comparison node with the literal value 50.",
        requirements: [
            {
                type: "variable_exists",
                name: "Score",
                varType: "int",
                description: "Create Integer variable 'Score'"
            },
            {
                type: "node_exists",
                nodeType: "Get_Score",
                description: "Get Score variable"
            },
            {
                type: "node_exists",
                nodeType: "GreaterInt",
                description: "Add Integer > Integer comparison"
            },
            {
                type: "node_property",
                nodeKey: "GreaterInt",
                pinId: "b_in",
                value: "50",
                description: "Set comparison threshold to 50"
            },
            {
                type: "node_exists",
                nodeType: "Branch",
                description: "Add Branch node"
            },
            {
                type: "link_exists",
                sourceNode: "Get_Score",
                sourcePin: "val_out",
                targetNode: "GreaterInt",
                targetPin: "a_in",
                description: "Connect Score to comparison"
            },
            {
                type: "link_exists",
                sourceNode: "GreaterInt",
                sourcePin: "val_out",
                targetNode: "Branch",
                targetPin: "cond_in",
                description: "Connect comparison result to Branch condition"
            },
            {
                type: "node_exists",
                nodeType: "PrintString",
                count: 2,
                description: "Add two Print String nodes for true/false branches"
            }
        ]
    },
    // ==================== LEVEL 6: NEW FEATURES ====================
    {
        taskId: "task_21_double_precision",
        level: 6,
        title: "Double Precision",
        description: "Create a Double variable named 'PreciseValue' and set it to 3.14159 on BeginPlay.",
        requirements: [
            {
                type: "variable_exists",
                name: "PreciseValue",
                varType: "double",
                description: "Create Double variable 'PreciseValue'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "Set_PreciseValue",
                description: "Add Set PreciseValue node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Set_PreciseValue", pin: "exec_in" },
                description: "Connect BeginPlay to Set node"
            }
        ]
    },
    {
        taskId: "task_22_enum_usage",
        level: 6,
        title: "Enumerator Basics",
        description: "Create an Enum variable named 'Status' and set it on BeginPlay.",
        requirements: [
            {
                type: "variable_exists",
                name: "Status",
                varType: "enum",
                description: "Create Enum variable 'Status'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "Set_Status",
                description: "Add Set Status node"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Set_Status", pin: "exec_in" },
                description: "Connect BeginPlay to Set node"
            }
        ]
    },
    {
        taskId: "task_23_array_basics",
        level: 6,
        title: "Array Management",
        description: "Create an Integer Array named 'Inventory'. Add an item to it on BeginPlay.",
        requirements: [
            {
                type: "variable_exists",
                name: "Inventory",
                varType: "int",
                containerType: "array",
                description: "Create Integer Array 'Inventory'"
            },
            {
                type: "node_exists",
                nodeType: "EventBeginPlay",
                description: "Add Event BeginPlay node"
            },
            {
                type: "node_exists",
                nodeType: "Array_Add",
                description: "Add Array ADD node"
            },
            {
                type: "node_exists",
                nodeType: "Get_Inventory",
                description: "Get Inventory variable"
            },
            {
                type: "connection",
                from: { nodeType: "EventBeginPlay", pin: "exec_out" },
                to: { nodeType: "Array_Add", pin: "exec_in" },
                description: "Connect BeginPlay to Array Add"
            },
            {
                type: "connection",
                from: { nodeType: "Get_Inventory", pin: "val_out" },
                to: { nodeType: "Array_Add", pin: "array_in" },
                description: "Connect Inventory to Array Add"
            }
        ]
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
                description: "Create String Set 'UniqueNames'"
            },
            {
                type: "node_exists",
                nodeType: "Set_Add",
                description: "Add Set ADD node"
            },
            {
                type: "node_exists",
                nodeType: "Get_UniqueNames",
                description: "Get UniqueNames variable"
            },
            {
                type: "connection",
                from: { nodeType: "Get_UniqueNames", pin: "val_out" },
                to: { nodeType: "Set_Add", pin: "set_in" },
                description: "Connect UniqueNames to Set Add"
            }
        ]
    },
    {
        taskId: "task_25_map_lookup",
        level: 6,
        title: "Map Lookup",
        description: "Create a Map named 'PlayerScores' (String to Integer). Add a key-value pair.",
        requirements: [
            {
                type: "variable_exists",
                name: "PlayerScores",
                varType: "string", // Key type is usually primary type in this simple system, or we check containerType
                containerType: "map",
                description: "Create Map 'PlayerScores'"
            },
            {
                type: "node_exists",
                nodeType: "Map_Add",
                description: "Add Map ADD node"
            },
            {
                type: "node_exists",
                nodeType: "Get_PlayerScores",
                description: "Get PlayerScores variable"
            },
            {
                type: "connection",
                from: { nodeType: "Get_PlayerScores", pin: "val_out" },
                to: { nodeType: "Map_Add", pin: "map_in" },
                description: "Connect PlayerScores to Map Add"
            }
        ]
    }
];
