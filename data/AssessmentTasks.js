
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
    }
];
