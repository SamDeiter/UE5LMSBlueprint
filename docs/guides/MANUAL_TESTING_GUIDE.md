# Manual Testing Guide for Blueprint Editor
**Version:** 1.0  
**Date:** 2025-11-25

This guide provides step-by-step instructions for manually testing all 20 assessment tasks.

---

## 🎯 Testing Instructions

### Before You Start
1. Open http://127.0.0.1:8000 in your browser
2. Open the browser console (F12) to check for errors
3. Have this guide open side-by-side with the application

### How to Test Each Task
1. Select the task from the dropdown
2. Click "Clear Graph" when prompted
3. Follow the steps to build the required Blueprint
4. Click "Compile" to validate
5. Check the "Task Status" tab for results
6. Mark ✅ if all requirements pass, ❌ if any fail

---

## Level 1: Fundamentals

### ✅ Task 1: Hello World
**Objective:** Print "Hello World" on BeginPlay

**Steps:**
1. Select "Hello World" from task dropdown
2. Right-click → Add "Event BeginPlay"
3. Right-click → Search "print" → Add "Print String"
4. Connect BeginPlay exec (white) to Print String exec
5. Click on Print String node → In Details panel, set "In String" to "Hello World"
6. Click **Compile**

**Expected Result:** All 3 requirements show green checkmarks
- ✅ Event BeginPlay node exists
- ✅ Print String node exists  
- ✅ BeginPlay connected to Print String

---

### ✅ Task 2: Basic Math
**Objective:** Add two integers and print the result

**Steps:**
1. Select "Basic Math" from task dropdown → Clear Graph
2. In "My Blueprint" panel → Click "+" next to Variables
3. Rename to "A", set type to Integer, set default value to 5
4. Add another variable "B", Integer, value 3
5. Right-click graph → Add "Event BeginPlay"
6. Drag variable "A" to graph → Select "Get A"
7. Drag variable "B" to graph → Select "Get B"
8. Right-click → Search "add int" → Add "Add (Integer)"
9. Connect A output to Add's first input
10. Connect B output to Add's second input
11. Right-click → Add "Print String"
12. Connect Add output to Print String input (auto-converts int→string)
13. Connect BeginPlay exec to Print String exec
14. Click **Compile**

**Expected Result:** All requirements pass
- ✅ Variables A and B exist
- ✅ Add (Integer) node exists
- ✅ Print String node exists
- ✅ Proper connections

---

## Level 2: Control Flow

### ✅ Task 3: Conditionals
**Objective:** Use Branch node with Boolean variable

**Steps:**
1. Select "Conditionals" → Clear Graph
2. Create Boolean variable "IsReady" (default: true)
3. Add Event BeginPlay
4. Add Get IsReady
5. Right-click → Search "branch" → Add "Branch"
6. Connect BeginPlay exec to Branch exec
7. Connect IsReady to Branch condition pin
8. Add two Print String nodes
9. Connect Branch "True" to first Print String (text: "Ready!")
10. Connect Branch "False" to second Print String (text: "Not Ready")
11. Click **Compile**

**Expected Result:** All requirements pass

---

### ✅ Task 4: Variable Modification
**Objective:** Increment a score variable

**Steps:**
1. Select "Variable Modification" → Clear Graph
2. Create Integer variable "Score" (default: 0)
3. Add Event BeginPlay
4. Add Get Score
5. Right-click → Search "add int" → Add "Add (Integer)"
6. Connect Score to Add's first input
7. On Add node, set second input literal to 1
8. Add Set Score
9. Connect Add output to Set Score input
10. Connect BeginPlay → Set Score (exec flow)
11. Click **Compile**

**Expected Result:** Score variable increments by 1

---

### ✅ Task 5: Multiple Operations
**Objective:** Chain arithmetic operations

**Steps:**
1. Select "Multiple Operations" → Clear Graph
2. Create Integer variables: X (10), Y (5), Result (0)
3. Add Event BeginPlay
4. Add Get X, Get Y
5. Add "Add (Integer)" - connect X and Y
6. Add "Multiply (Integer)" - connect Add result and literal 2
7. Add Set Result - connect Multiply output
8. Add Print String - connect Result
9. Connect execution flow: BeginPlay → Set Result → Print String
10. Click **Compile**

**Expected Result:** Calculation: (10 + 5) * 2 = 30

---

## Level 3: Advanced Concepts

### ✅ Task 6: Custom Events
**Objective:** Create and call custom events

**Steps:**
1. Select "Custom Events" → Clear Graph
2. In My Blueprint → Functions section → Add → Custom Event
3. Name it "OnScoreChanged"
4. Add Event BeginPlay
5. Right-click → Search "OnScoreChanged" → Call OnScoreChanged
6. Connect BeginPlay to Call OnScoreChanged
7. Add Print String to OnScoreChanged event
8. Click **Compile**

**Expected Result:** Custom event created and called

---

### ✅ Task 7: Float Mathematics
**Objective:** Calculate distance = Speed × Time

**Steps:**
1. Select "Float Mathematics" → Clear Graph
2. Create Float variables: Speed (10.0), Time (5.0), Distance (0.0)
3. Add Event BeginPlay
4. Add Get Speed, Get Time
5. Add "Multiply (Float)"
6. Connect Speed and Time to Multiply
7. Add Set Distance
8. Connect Multiply output to Distance input
9. Connect exec flow
10. Click **Compile**

**Expected Result:** Distance = 50.0

---

### ✅ Task 8: Component Basics
**Objective:** Add a PointLight component

**Steps:**
1. Select "Component Basics" → Clear Graph
2. In Components panel (top-left) → Click "Add" button
3. Search for "Point Light" → Add it
4. The component should appear in the hierarchy
5. Click **Compile**

**Expected Result:** PointLight component exists

---

### ✅ Task 9: String Manipulation
**Objective:** Combine first and last names

**Steps:**
1. Select "String Manipulation" → Clear Graph
2. Create String variables: FirstName ("John"), LastName ("Doe"), FullName ("")
3. Add Event BeginPlay
4. Add Get FirstName, Get LastName
5. Right-click → Search "append" → Add "Append"
6. Connect FirstName to Append's first input
7. Connect LastName to Append's second input
8. Add Set FullName
9. Connect Append output to FullName
10. Connect exec flow
11. Click **Compile**

**Expected Result:** FullName = "JohnDoe"

---

## Level 4: Complex Systems

### ✅ Task 10: Health System
**Objective:** Build health system with game over logic

**Steps:**
1. Select "Health System" → Clear Graph
2. Create Float variables: Health (100.0), MaxHealth (100.0)
3. Create Boolean: IsAlive (true)
4. Add Event BeginPlay
5. Add Get Health
6. Add "Less or Equal (<=)" comparison
7. Set second input to 0.0
8. Add Branch
9. Connect comparison to Branch condition
10. Add Set IsAlive on True branch (set to false)
11. Add Print String "Game Over"
12. Click **Compile**

**Expected Result:** Health system with death check

---

### ✅ Task 11: Simple State Machine
**Objective:** Manage game states

**Steps:**
1. Select "Simple State Machine" → Clear Graph
2. Create String variable: GameState ("Menu")
3. Add Event BeginPlay
4. Add Get GameState
5. Add "Equal (==)" comparison (compare with "Menu")
6. Add Branch
7. Add Print String nodes for different states
8. Click **Compile**

**Expected Result:** State machine logic implemented

---

### ✅ Task 12: Mini Game Logic
**Objective:** Complete scoring system with win condition

**Steps:**
1. Select "Mini Game Logic" → Clear Graph
2. Create Integer variables: Score (0), WinScore (100)
3. Create Boolean: HasWon (false)
4. Add Event BeginPlay
5. Add Get Score, Get WinScore
6. Add "Greater or Equal (>=)"
7. Add Branch
8. On True: Set HasWon to true, Print "You Win!"
9. On False: Print "Keep Playing"
10. Click **Compile**

**Expected Result:** Win condition system

---

## Level 5: Advanced Patterns

### ✅ Task 13: One-Time Initialization
**Objective:** Use DoOnce

**Steps:**
1. Select "One-Time Initialization" → Clear Graph
2. Add Event BeginPlay
3. Right-click → Search "doonce" → Add "DoOnce"
4. Connect BeginPlay to DoOnce
5. Add Print String to "Completed" output
6. Set text to "Initialized!"
7. Click **Compile**

**Expected Result:** DoOnce prevents repeated execution

---

### ✅ Task 14: Gate Flow Control
**Objective:** Use Gate node

**Steps:**
1. Select "Gate Flow Control" → Clear Graph
2. Add "Gate" node
3. Add Event BeginPlay → Connect to Gate "Open"
4. Add Custom Event "TryPass"
5. Connect TryPass to Gate "Enter"
6. Add Print String to Gate "Exit"
7. Click **Compile**

**Expected Result:** Gate controls execution flow

---

### ✅ Task 15: Loop Iteration
**Objective:** Use ForLoop

**Steps:**
1. Select "Loop Iteration" → Clear Graph
2. Add Event BeginPlay
3. Add "ForLoop" node
4. Set First Index: 0, Last Index: 10
5. Connect BeginPlay to ForLoop
6. Add Print String to "Loop Body"
7. Connect Index output to Print String (auto-converts)
8. Click **Compile**

**Expected Result:** Loop iterates 0-10

---

### ✅ Task 16: Sequential Execution
**Objective:** Use Sequence node

**Steps:**
1. Select "Sequential Execution" → Clear Graph
2. Add Event BeginPlay
3. Add "Sequence" node
4. Connect BeginPlay to Sequence
5. Add two Print String nodes
6. Set first to "First", second to "Second"
7. Connect Sequence "Then 0" to first Print
8. Connect Sequence "Then 1" to second Print
9. Click **Compile**

**Expected Result:** Sequential execution

---

### ✅ Task 17: Boolean Logic Gates
**Objective:** Use AND logic

**Steps:**
1. Select "Boolean Logic Gates" → Clear Graph
2. Create Boolean variables: HasKey (true), DoorUnlocked (true)
3. Add Get HasKey, Get DoorUnlocked
4. Add "AND" node
5. Connect both to AND inputs
6. Add Branch
7. Connect AND output to Branch condition
8. Add Print Strings for True/False branches
9. Click **Compile**

**Expected Result:** AND logic works

---

### ✅ Task 18: Toggle Behavior
**Objective:** Use FlipFlop

**Steps:**
1. Select "Toggle Behavior" → Clear Graph
2. Add Event BeginPlay
3. Add "FlipFlop" node
4. Connect BeginPlay to FlipFlop
5. Add two Print String nodes ("State A", "State B")
6. Connect FlipFlop "A" to first Print
7. Connect FlipFlop "B" to second Print
8. Click **Compile**

**Expected Result:** FlipFlop alternates states

---

### ✅ Task 19: Type Conversion
**Objective:** Convert Int → Float → String

**Steps:**
1. Select "Type Conversion" → Clear Graph
2. Create Integer variable: MyNumber (10)
3. Add Get MyNumber
4. Add "To Float (Int)" conversion
5. Add "Multiply (Float)" - set second input to 1.5
6. Add "To String (Float)" conversion
7. Add Print String
8. Connect the conversion chain
9. Click **Compile**

**Expected Result:** 10 → 10.0 → 15.0 → "15.0"

---

### ✅ Task 20: Advanced Calculator
**Objective:** Multi-operation calculator

**Steps:**
1. Select "Advanced Calculator" → Clear Graph
2. Create Float variables: A (10.0), B (5.0), Result (0.0)
3. Create String variable: Operation ("+")
4. Add Get Operation
5. Add "Equal (==)" comparisons for "+", "-", "*"
6. Add Branch nodes for each operation
7. Add math nodes (Add, Subtract, Multiply)
8. Connect branches to appropriate operations
9. Add Set Result
10. Add Print String
11. Click **Compile**

**Expected Result:** Calculator with operation selection

---

## 📊 Test Results Tracking

After completing all tests, update `TESTING_REPORT.md` with:
- ✅ Tasks that passed
- ❌ Tasks that failed (with details)
- 🐛 Any bugs discovered
- 💡 Improvement suggestions

---

## 🔍 What to Look For

### Common Issues
- Missing nodes in palette
- Connection type mismatches
- Execution flow not working
- Variables not updating
- Compilation errors

### Success Criteria
- All requirements show green checkmarks
- No console errors
- Task completion animation appears
- Progress bar shows 100%

---

## 📝 Notes

- Take screenshots of any failures
- Document unexpected behavior
- Note any confusing UI elements
- Record time to complete each task

Good luck testing! 🚀
