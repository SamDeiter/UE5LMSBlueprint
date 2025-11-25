# Blueprint Learning Tasks Guide

## Overview
This guide provides detailed instructions for all 12 assessment tasks in the UE5 Blueprint Editor. Tasks are organized by difficulty level and build upon each other progressively.

---

## 📘 LEVEL 1: FUNDAMENTALS

### Task 1: Hello World
**Objective:** Print "Hello World" to the console when the game starts.

**Steps:**
1. Add an **Event BeginPlay** node from the palette
2. Add a **Print String** node
3. Connect the execution pin from BeginPlay to Print String
4. (Optional) Set the text input to "Hello World"

**Learning Goals:**
- Understanding event nodes
- Basic execution flow
- Using the Print String node

---

### Task 2: Basic Math
**Objective:** Add two integers together and display the result.

**Steps:**
1. Create two Integer variables: **A** and **B**
2. Set their default values (e.g., A=5, B=10)
3. Add **Get A** and **Get B** nodes
4. Add an **Integer + Integer** node
5. Connect A and B to the Add node inputs
6. (Optional) Connect the result to a Print String node

**Learning Goals:**
- Creating and using variables
- Basic arithmetic operations
- Data flow vs execution flow

---

## 📗 LEVEL 2: CONTROL FLOW

### Task 3: Conditionals
**Objective:** Use a Boolean variable to control program flow.

**Steps:**
1. Create a Boolean variable: **IsActive**
2. Add a **Branch** node
3. Add a **Get IsActive** node and connect it to the Branch condition
4. Add two **Print String** nodes
5. Connect the True output to one Print String ("Active")
6. Connect the False output to another Print String ("Inactive")

**Learning Goals:**
- Boolean logic
- Conditional branching
- Multiple execution paths

---

### Task 4: Variable Modification
**Objective:** Increment a score variable by 10.

**Steps:**
1. Create an Integer variable: **Score** (default: 0)
2. Add **Event BeginPlay** node
3. Add **Get Score** node
4. Add **Integer + Integer** node
5. Set one input to 10 (literal value)
6. Connect Get Score to the other input
7. Add **Set Score** node
8. Connect the Add result to Set Score
9. Connect BeginPlay execution to Set Score

**Learning Goals:**
- Reading and writing variables
- Variable modification patterns
- Execution order importance

---

### Task 5: Multiple Operations
**Objective:** Calculate (X + Y) - 5 and store in Result.

**Steps:**
1. Create three Integer variables: **X**, **Y**, **Result**
2. Add **Get X** and **Get Y** nodes
3. Add **Integer + Integer** node (for X + Y)
4. Add **Integer - Integer** node (for result - 5)
5. Set the subtraction's second input to 5
6. Connect the operations in sequence
7. Add **Set Result** node and connect the final value

**Learning Goals:**
- Chaining operations
- Order of operations
- Complex calculations

---

## 📙 LEVEL 3: ADVANCED CONCEPTS

### Task 6: Custom Events
**Objective:** Create and call a custom event.

**Steps:**
1. Add a **Custom Event** node
2. **Double-click the header** and rename it to "OnScoreChanged"
3. Add **Event BeginPlay** node
4. Add a **Print String** node after the custom event
5. (Advanced) Add a **Call OnScoreChanged** node and connect it from BeginPlay

**Learning Goals:**
- Custom event creation
- **Renaming nodes** (important skill!)
- Event-driven programming
- Code organization

---

### Task 7: Float Mathematics
**Objective:** Calculate distance using Speed × Time.

**Steps:**
1. Create Float variables: **Speed**, **Time**, **Distance**
2. Set default values (e.g., Speed=10.0, Time=5.0)
3. Add **Get Speed** and **Get Time** nodes
4. Add **Float × Float** node
5. Connect Speed and Time to the multiply node
6. Add **Set Distance** node
7. Connect the multiplication result to Set Distance

**Learning Goals:**
- Working with floating-point numbers
- Physics calculations
- Precision vs integers

---

### Task 8: Component Basics
**Objective:** Add a PointLight component to your Blueprint.

**Steps:**
1. Open the **Components** panel
2. Click **Add Component**
3. Search for "PointLight"
4. Add it to your Blueprint
5. (Optional) Adjust its properties in the Details panel

**Learning Goals:**
- Understanding components
- Blueprint composition
- Visual elements

---

### Task 9: String Manipulation
**Objective:** Combine first and last names.

**Steps:**
1. Create String variables: **FirstName**, **LastName**
2. Set default values (e.g., "John", "Doe")
3. Add **Get FirstName** and **Get LastName** nodes
4. Add a **Print String** node
5. (Advanced) Use an **Append** node to combine strings

**Learning Goals:**
- String data type
- Text manipulation
- Concatenation

---

## 📕 LEVEL 4: COMPLEX SYSTEMS

### Task 10: Health System
**Objective:** Build a health system with game over logic.

**Steps:**
1. Create Float variables: **Health** (100.0), **MaxHealth** (100.0)
2. Add **Get Health** node
3. Add a **Branch** node
4. Add a comparison node (Health <= 0)
5. Connect the comparison to the Branch condition
6. Add **Print String** node for "Game Over"
7. Connect the True branch to the print node

**Learning Goals:**
- Game systems design
- Health mechanics
- Comparison operators

---

### Task 11: Simple State Machine
**Objective:** Create a state machine with three states.

**Steps:**
1. Create String variable: **GameState** (default: "Menu")
2. Add **Get GameState** node
3. Add comparison nodes for each state
4. Add multiple **Branch** nodes
5. Add three **Print String** nodes (one per state)
6. Connect the branches to print the current state

**Learning Goals:**
- State management
- Complex branching
- Game architecture

---

### Task 12: Mini Game Logic
**Objective:** Build a complete scoring system with win condition.

**Steps:**
1. Create Integer variables: **Score** (0), **TargetScore** (100)
2. Add **Event BeginPlay** node
3. Add **Get Score** and add points using **Integer + Integer**
4. Add **Set Score** to update the score
5. Add comparison (Score >= TargetScore)
6. Add **Branch** node with the comparison
7. Add two **Print String** nodes:
   - True branch: "You Win!"
   - False branch: "Keep Playing"
8. Connect BeginPlay to Set Score

**Learning Goals:**
- Complete game loop
- Win conditions
- Integrating multiple concepts

---

## 💡 Tips for Success

### General Tips:
- **Save Often**: Use Ctrl+S to save your work
- **Test Frequently**: Click "Compile" to validate your graph
- **Use Comments**: Right-click → Add Comment to organize your graph
- **Clean Layout**: Keep your nodes organized and wires untangled

### Debugging Tips:
- **Print Debug Info**: Use Print String to see variable values
- **Check Connections**: Ensure all pins are properly connected
- **Verify Types**: Make sure data types match (int to int, float to float)
- **Execution Flow**: Follow the white execution wires to trace logic

### Common Mistakes:
- ❌ Forgetting to connect execution pins
- ❌ Mixing data types (int vs float)
- ❌ Not setting default variable values
- ❌ Connecting outputs to outputs (or inputs to inputs)

---

## 🎓 Learning Path

**Recommended Order:**
1. Complete all Level 1 tasks first
2. Move to Level 2 only after mastering Level 1
3. Practice each concept multiple times
4. Try creating your own variations

**Mastery Checklist:**
- [ ] Can create and use variables
- [ ] Understand execution vs data flow
- [ ] Can use Branch nodes effectively
- [ ] Can modify variables correctly
- [ ] Can chain multiple operations
- [ ] Can create custom events
- [ ] Can work with different data types
- [ ] Can build complete game systems

---

## 📊 Progress Tracking

The Task Status panel shows:
- **Progress Bar**: Visual completion percentage
- **Requirements List**: Individual criteria with checkmarks
- **Success Animation**: Trophy when task is complete

**Validation:**
- Click **Compile** to check your work
- Green checkmarks = requirement met
- Gray circles = requirement not met
- 100% = Task complete!

---

## 🆘 Getting Help

If you're stuck:
1. Review the task description carefully
2. Check the requirements list for what's missing
3. Look at the example screenshots (if provided)
4. Ask your instructor for guidance
5. Try a simpler task first to build confidence

---

## 🏆 Achievement Goals

**Bronze Level**: Complete all Level 1 tasks
**Silver Level**: Complete all Level 1 & 2 tasks  
**Gold Level**: Complete all Level 1, 2 & 3 tasks
**Platinum Level**: Complete ALL tasks (1-20)

---

## 📕 LEVEL 5: ADVANCED PATTERNS

### Task 13: One-Time Initialization
**Objective:** Use DoOnce to ensure code only runs once.

**Steps:**
1. Add **Event BeginPlay** node
2. Add **DoOnce** node
3. Connect BeginPlay execution to DoOnce input
4. Add two **Print String** nodes
5. Connect DoOnce "Completed" output to first Print String ("Initialized!")
6. (Optional) Add another path that tries to trigger DoOnce again

**Learning Goals:**
- One-time execution patterns
- Preventing duplicate initialization
- DoOnce vs regular execution

---

### Task 14: Gate Flow Control
**Objective:** Use a Gate to control when execution can pass through.

**Steps:**
1. Add **Gate** node
2. Add **Event BeginPlay** node
3. Connect BeginPlay to Gate's "Open" input
4. Add **Custom Event** node (name it "TryPass")
5. Connect Custom Event to Gate's "Enter" input
6. Add **Print String** node
7. Connect Gate's "Exit" output to Print String

**Learning Goals:**
- Flow control gates
- Opening/closing execution paths
- Event-driven gating

---

### Task 15: Loop Iteration
**Objective:** Use a ForLoop to count from 0 to 10.

**Steps:**
1. Add **Event BeginPlay** node
2. Add **ForLoop** node
3. Set "First Index" to 0
4. Set "Last Index" to 10
5. Connect BeginPlay to ForLoop
6. Add **Print String** node
7. Connect ForLoop "Loop Body" to Print String
8. Connect ForLoop "Index" output to Print String input (will need conversion)

**Learning Goals:**
- Loop iteration
- Index tracking
- Repeated execution

---

### Task 16: Sequential Execution
**Objective:** Execute multiple operations in order using Sequence.

**Steps:**
1. Add **Event BeginPlay** node
2. Add **Sequence** node
3. Connect BeginPlay to Sequence
4. Add two **Print String** nodes
5. Set first Print String text to "First"
6. Set second Print String text to "Second"
7. Connect Sequence "Then 0" to first Print String
8. Connect Sequence "Then 1" to second Print String

**Learning Goals:**
- Sequential execution
- Ordered operations
- Multiple execution paths

---

### Task 17: Boolean Logic Gates
**Objective:** Use AND logic to check multiple conditions.

**Steps:**
1. Create Boolean variables: **HasKey**, **DoorUnlocked**
2. Set both to true (for testing)
3. Add **Get HasKey** and **Get DoorUnlocked** nodes
4. Add **AND** logic node
5. Connect both Get nodes to AND inputs
6. Add **Branch** node
7. Connect AND output to Branch condition
8. Add **Print String** nodes for True/False branches

**Learning Goals:**
- Boolean logic operators
- Multiple condition checking
- AND/OR/NOT gates

---

### Task 18: Toggle Behavior
**Objective:** Use FlipFlop to alternate between states.

**Steps:**
1. Add **Event BeginPlay** node
2. Add **FlipFlop** node
3. Connect BeginPlay to FlipFlop
4. Add two **Print String** nodes
5. Set first to "State A"
6. Set second to "State B"
7. Connect FlipFlop "A" output to first Print String
8. Connect FlipFlop "B" output to second Print String

**Learning Goals:**
- Toggle patterns
- State alternation
- FlipFlop behavior

---

### Task 19: Type Conversion
**Objective:** Convert between data types.

**Steps:**
1. Create Integer variable: **MyNumber** (set to 10)
2. Add **Get MyNumber** node
3. Add **To Float (Int)** conversion node
4. Connect MyNumber to conversion
5. Add **Multiply (Float)** node
6. Set second input to 1.5
7. Connect converted float to multiply
8. Add **To String (Float)** conversion node
9. Add **Print String** node
10. Connect the conversion chain to print the result

**Learning Goals:**
- Type conversion
- Int → Float → String
- Data type compatibility

---

### Task 20: Advanced Calculator
**Objective:** Build a calculator with multiple operations.

**Steps:**
1. Create Float variables: **A** (10.0), **B** (5.0)
2. Create String variable: **Operation** ("+")
3. Create Float variable: **Result**
4. Add **Get Operation** node
5. Add comparison nodes to check Operation value
6. Add **Branch** nodes for each operation
7. Add **Add (Float)**, **Subtract (Float)**, **Multiply (Float)** nodes
8. Connect appropriate branches to each math operation
9. Add **Set Result** node
10. Add **Print String** to display result

**Learning Goals:**
- Complex branching logic
- String-based operation selection
- Complete calculator system

---

## 💡 Tips for Success

### General Tips:
- **Save Often**: Use Ctrl+S to save your work
- **Test Frequently**: Click "Compile" to validate your graph
- **Use Comments**: Right-click → Add Comment to organize your graph
- **Clean Layout**: Keep your nodes organized and wires untangled

### Debugging Tips:
- **Print Debug Info**: Use Print String to see variable values
- **Check Connections**: Ensure all pins are properly connected
- **Verify Types**: Make sure data types match (int to int, float to float)
- **Execution Flow**: Follow the white execution wires to trace logic

### Common Mistakes:
- ❌ Forgetting to connect execution pins
- ❌ Mixing data types (int vs float)
- ❌ Not setting default variable values
- ❌ Connecting outputs to outputs (or inputs to inputs)

---

## 🎓 Learning Path

**Recommended Order:**
1. Complete all Level 1 tasks first
2. Move to Level 2 only after mastering Level 1
3. Practice each concept multiple times
4. Try creating your own variations

**Mastery Checklist:**
- [ ] Can create and use variables
- [ ] Understand execution vs data flow
- [ ] Can use Branch nodes effectively
- [ ] Can modify variables correctly
- [ ] Can chain multiple operations
- [ ] Can create custom events
- [ ] Can work with different data types
- [ ] Can build complete game systems
- [ ] Can use advanced flow control (DoOnce, Gate, FlipFlop)
- [ ] Can implement loops and iterations
- [ ] Can perform type conversions

---

## 📊 Progress Tracking

The Task Status panel shows:
- **Progress Bar**: Visual completion percentage
- **Requirements List**: Individual criteria with checkmarks
- **Success Animation**: Trophy when task is complete

**Validation:**
- Click **Compile** to check your work
- Green checkmarks = requirement met
- Gray circles = requirement not met
- 100% = Task complete!

---

## 🆘 Getting Help

If you're stuck:
1. Review the task description carefully
2. Check the requirements list for what's missing
3. Look at the example screenshots (if provided)
4. Ask your instructor for guidance
5. Try a simpler task first to build confidence

---

## 🏆 Achievement Goals

**Bronze Level**: Complete all Level 1 tasks
**Silver Level**: Complete all Level 1 & 2 tasks  
**Gold Level**: Complete all Level 1, 2 & 3 tasks
**Platinum Level**: Complete ALL tasks (1-20)

Good luck, and happy Blueprint building! 🎮
