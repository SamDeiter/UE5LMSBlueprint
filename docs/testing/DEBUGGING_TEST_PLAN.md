# Debugging Features Test Plan

## Overview
This document outlines comprehensive testing procedures for the Blueprint Editor's debugging features, including breakpoints, stepping controls, watch variables, and call stack visualization.

## Test Environment
- **Browser**: Chrome/Edge (latest)
- **Server**: `npm run serve` on localhost:8000
- **Test Graph**: Event Graph with multiple nodes and function calls

---

## Test Suite 1: Breakpoint Management

### Test 1.1: Set Single Breakpoint
**Steps:**
1. Right-click on "Event BeginPlay" node
2. Select "Toggle Breakpoint" from context menu
3. Verify red breakpoint icon appears on node header

**Expected Results:**
- ✓ Breakpoint icon visible (red circle with white border)
- ✓ Node header has `has-breakpoint` class
- ✓ Breakpoint persists after save/reload

### Test 1.2: Set Multiple Breakpoints
**Steps:**
1. Set breakpoints on 3-4 different nodes in sequence
2. Verify each shows breakpoint indicator
3. Start simulation

**Expected Results:**
- ✓ All breakpoints show visual indicators
- ✓ Execution pauses at first breakpoint encountered
- ✓ Can resume and hit subsequent breakpoints

### Test 1.3: Remove Breakpoint
**Steps:**
1. Set breakpoint on a node
2. Right-click and toggle breakpoint again
3. Verify breakpoint removed

**Expected Results:**
- ✓ Breakpoint icon removed
- ✓ `has-breakpoint` class removed
- ✓ Execution doesn't pause at that node

### Test 1.4: Breakpoint Persistence
**Steps:**
1. Set breakpoints on multiple nodes
2. Save the graph
3. Reload the page
4. Verify breakpoints restored

**Expected Results:**
- ✓ All breakpoints visible after reload
- ✓ Breakpoint state saved in JSON
- ✓ Functionality intact after reload

---

## Test Suite 2: Stepping Controls

### Test 2.1: Step Over
**Steps:**
1. Set breakpoint on "Event BeginPlay"
2. Add "Print String" → "Branch" → "Print String" sequence
3. Start simulation (pauses at breakpoint)
4. Click "Step Over" button repeatedly

**Expected Results:**
- ✓ Execution advances one node at a time
- ✓ Pauses at each node in sequence
- ✓ UI shows current paused node (highlighted)
- ✓ Step Over button enabled only when paused

### Test 2.2: Step Into (Function Calls)
**Steps:**
1. Create a custom function "MyFunction"
2. Add "Call MyFunction" node in Event Graph
3. Set breakpoint before function call
4. Start simulation, then click "Step Into"

**Expected Results:**
- ✓ Execution enters the function graph
- ✓ Graph view switches to function graph
- ✓ Pauses at FunctionEntry node
- ✓ Call stack shows function context

### Test 2.3: Step Out (Return from Function)
**Steps:**
1. Step into a function (as in 2.2)
2. Click "Step Out" button

**Expected Results:**
- ✓ Execution completes function
- ✓ Returns to calling graph
- ✓ Pauses at node after function call
- ✓ Call stack updates correctly

### Test 2.4: Step Over vs Step Into Behavior
**Steps:**
1. Set breakpoint before function call
2. Test "Step Over" - should NOT enter function
3. Reset, test "Step Into" - SHOULD enter function

**Expected Results:**
- ✓ Step Over skips function internals
- ✓ Step Into enters function
- ✓ Both correctly resume execution

---

## Test Suite 3: Watch Panel

### Test 3.1: Add Variable to Watch
**Steps:**
1. Create a variable "Health" (int)
2. Add "Get Health" and "Set Health" nodes
3. Right-click on "Health" output pin
4. Select "Add to Watch"

**Expected Results:**
- ✓ Watch panel appears (top-right)
- ✓ Shows "Health: [current value]"
- ✓ Panel persists during simulation

### Test 3.2: Watch Multiple Variables
**Steps:**
1. Create 3-4 variables of different types
2. Add each to watch panel
3. Run simulation that modifies these values

**Expected Results:**
- ✓ All watched variables listed
- ✓ Values update in real-time during simulation
- ✓ Different types display correctly (int, float, bool, string)

### Test 3.3: Watch Pin Values During Stepping
**Steps:**
1. Add "Delta Seconds" pin from Event Tick to watch
2. Set breakpoint on Event Tick
3. Run simulation and step through

**Expected Results:**
- ✓ Watch panel shows current delta time
- ✓ Value updates each tick
- ✓ Shows "N/A" for uninitialized values

### Test 3.4: Watch Panel Visibility
**Steps:**
1. Start with no watched variables
2. Add a variable to watch
3. Remove all watched variables

**Expected Results:**
- ✓ Panel hidden when empty
- ✓ Panel appears when first variable added
- ✓ Panel hides when last variable removed

---

## Test Suite 4: Call Stack Panel

### Test 4.1: Simple Call Stack
**Steps:**
1. Create function "FunctionA"
2. Call FunctionA from Event BeginPlay
3. Set breakpoint inside FunctionA
4. Run simulation

**Expected Results:**
- ✓ Call stack panel appears
- ✓ Shows "> FunctionA" (current)
- ✓ Shows "Event Graph" (caller)
- ✓ Stack in correct order

### Test 4.2: Nested Function Calls
**Steps:**
1. Create FunctionA calls FunctionB calls FunctionC
2. Set breakpoint in FunctionC
3. Run simulation

**Expected Results:**
- ✓ Call stack shows all 3 levels
- ✓ Current function highlighted
- ✓ Order: FunctionC → FunctionB → FunctionA → Event Graph

### Test 4.3: Navigate Call Stack
**Steps:**
1. Pause in nested function (as in 4.2)
2. Click on different stack frames in call stack panel

**Expected Results:**
- ✓ Graph view switches to clicked frame
- ✓ Caller node highlighted
- ✓ Can navigate up and down stack

### Test 4.4: Call Stack Updates on Step
**Steps:**
1. Set breakpoint before function call
2. Step Into function
3. Observe call stack
4. Step Out
5. Observe call stack again

**Expected Results:**
- ✓ Stack grows when entering function
- ✓ Stack shrinks when exiting function
- ✓ Always shows current execution context

---

## Test Suite 5: Integration Tests

### Test 5.1: Breakpoint + Watch + Call Stack
**Steps:**
1. Create function with local variable
2. Call function from Event Graph
3. Set breakpoint in function
4. Add local variable to watch
5. Run simulation

**Expected Results:**
- ✓ Pauses at breakpoint
- ✓ Watch panel shows variable value
- ✓ Call stack shows function context
- ✓ All panels update correctly

### Test 5.2: Complex Execution Flow
**Steps:**
1. Create graph with Branch node
2. Set breakpoints on both True and False paths
3. Add condition variable to watch
4. Run simulation multiple times with different conditions

**Expected Results:**
- ✓ Pauses at correct branch based on condition
- ✓ Watch shows condition value
- ✓ Can step through chosen path

### Test 5.3: Loop Debugging
**Steps:**
1. Create a loop (e.g., DoN with N=5)
2. Set breakpoint inside loop
3. Add loop counter to watch
4. Run and step through

**Expected Results:**
- ✓ Pauses on each iteration
- ✓ Watch shows incrementing counter
- ✓ Can step through all iterations
- ✓ Can resume to skip remaining iterations

### Test 5.4: Timeline Debugging
**Steps:**
1. Add Timeline node
2. Set breakpoint on Update pin output
3. Add Alpha value to watch
4. Run simulation

**Expected Results:**
- ✓ Pauses on each timeline update
- ✓ Watch shows changing alpha value (0 to 1)
- ✓ Can step through timeline progression

---

## Test Suite 6: Edge Cases & Error Handling

### Test 6.1: Breakpoint on Pure Node
**Steps:**
1. Try to set breakpoint on pure node (e.g., Add Float)
2. Verify behavior

**Expected Results:**
- ✓ Either: Breakpoint not allowed (grayed out in menu)
- ✓ Or: Breakpoint set but never triggered (pure nodes evaluated, not executed)

### Test 6.2: Infinite Loop Detection
**Steps:**
1. Create infinite loop (no exit condition)
2. Set breakpoint inside loop
3. Run simulation

**Expected Results:**
- ✓ Pauses at breakpoint on first iteration
- ✓ Can step through iterations
- ✓ Max steps safety limit prevents browser freeze

### Test 6.3: Watch Deleted Variable
**Steps:**
1. Add variable to watch
2. Delete the variable
3. Run simulation

**Expected Results:**
- ✓ Watch panel shows "N/A" or removes entry
- ✓ No errors in console
- ✓ Other watches still functional

### Test 6.4: Resume Without Pause
**Steps:**
1. Click Resume button when not paused
2. Verify no errors

**Expected Results:**
- ✓ No effect (button should be disabled)
- ✓ No console errors
- ✓ Simulation continues normally

---

## Test Suite 7: UI/UX Tests

### Test 7.1: Breakpoint Icon Visibility
**Steps:**
1. Set breakpoint on various node types
2. Zoom in/out on graph
3. Pan around

**Expected Results:**
- ✓ Icon always visible and properly positioned
- ✓ Icon scales with zoom
- ✓ Icon doesn't overlap with node content

### Test 7.2: Paused Node Highlighting
**Steps:**
1. Pause at breakpoint
2. Verify visual feedback

**Expected Results:**
- ✓ Paused node has distinct visual style
- ✓ Graph editor has amber border
- ✓ Play button changes to "Resume"

### Test 7.3: Panel Positioning
**Steps:**
1. Trigger watch and call stack panels
2. Resize browser window
3. Verify panels remain accessible

**Expected Results:**
- ✓ Panels don't overlap
- ✓ Panels stay in viewport
- ✓ Text remains readable

### Test 7.4: Button States
**Steps:**
1. Observe debug buttons in different states
2. Verify enabled/disabled correctly

**Expected Results:**
- ✓ Step buttons disabled when not paused
- ✓ Resume button disabled when not paused
- ✓ Stop button disabled when not running

---

## Performance Tests

### Test 8.1: Many Breakpoints
**Steps:**
1. Set 20+ breakpoints across graph
2. Run simulation
3. Monitor performance

**Expected Results:**
- ✓ No significant slowdown
- ✓ Breakpoints trigger correctly
- ✓ No memory leaks

### Test 8.2: Large Watch List
**Steps:**
1. Add 15+ variables to watch
2. Run simulation that updates all
3. Monitor panel performance

**Expected Results:**
- ✓ Panel updates smoothly
- ✓ No UI lag
- ✓ Values display correctly

---

## Regression Tests

### Test 9.1: Save/Load with Debug State
**Steps:**
1. Set breakpoints and watches
2. Save project
3. Reload page
4. Verify state restored

**Expected Results:**
- ✓ Breakpoints restored
- ✓ Watch list NOT restored (expected - runtime state)
- ✓ Can immediately debug

### Test 9.2: Switch Graphs During Debug
**Steps:**
1. Pause in function
2. Manually switch to different graph
3. Resume execution

**Expected Results:**
- ✓ Execution continues in correct graph
- ✓ No errors
- ✓ Call stack remains accurate

---

## Success Criteria
- ✅ All breakpoint operations work reliably
- ✅ Stepping controls function correctly in all scenarios
- ✅ Watch panel displays accurate real-time values
- ✅ Call stack accurately reflects execution context
- ✅ No console errors during any test
- ✅ UI remains responsive during debugging
- ✅ State persists correctly across save/load
