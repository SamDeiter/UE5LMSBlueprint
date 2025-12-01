# Phase 1 Testing Checklist - Variable System Enhancements

## ✅ Prerequisites
- [ ] Local server is running (`python -m http.server 8000`)
- [ ] Browser is open to `http://localhost:8000`
- [ ] Console is open (F12) to check for errors

## Test 1: Variable Type Selection
**Objective**: Verify that Double and Enum appear in the type dropdown

### Steps:
1. Click the **+ button** in the Variables section (My Blueprint panel)
2. A new variable should be created (e.g., "NewVar")
3. Select the newly created variable in My Blueprint panel
4. In the Details Panel (right side), locate the **Type** dropdown
5. Click the Type dropdown

### Expected Results:
- [ ] Dropdown opens without errors
- [ ] `Double` type is visible in the list
- [ ] `Enum` type is visible in the list
- [ ] All 14 types are present: bool, byte, int, int64, float, **double**, name, string, text, vector, rotator, transform, object, **enum**

### Screenshot Location:
`screenshots/test1_type_dropdown.png`

---

## Test 2: Variable Creation with New Types
**Objective**: Create variables of type Double and Enum

### Steps:
1. Create a variable named `Precision`
2. Set its type to `Double`
3. Create a variable named `GameState`
4. Set its type to `Enum`

### Expected Results:
- [ ] Both variables appear in My Blueprint panel
- [ ] `Precision` shows a green color indicator (slightly darker than float)
- [ ] `GameState` shows a forest green color indicator
- [ ] No console errors

### Screenshot Location:
`screenshots/test2_variable_creation.png`

---

## Test 3: Variable Color Coding
**Objective**: Verify that type colors display correctly in My Blueprint panel

### Steps:
1. Look at the color pills next to each variable in My Blueprint
2. Compare colors:
   - Float variable (if exists) should be bright green (#96EE35)
   - Double variable should be slightly darker green (#85DD24)
   - Enum variable should be forest green (#00BB55)

### Expected Results:
- [ ] `Precision` (Double) has correct color pill
- [ ] `GameState` (Enum) has correct color pill
- [ ] Colors are visually distinct from each other

### Screenshot Location:
`screenshots/test3_color_coding.png`

---

## Test 4: GET Node Creation
**Objective**: Verify GET nodes can be created for new types

### Steps:
1. Drag the `Precision` variable from My Blueprint onto the graph
2. A GET node should be created
3. Drag the `GameState` variable onto the graph
4. Another GET node should be created

### Expected Results:
- [ ] GET node for `Precision` is created successfully
- [ ] GET node for `GameState` is created successfully
- [ ] Output pins show correct colors:
  - Precision pin: darker green (#85DD24)
  - GameState pin: forest green (#00BB55)
- [ ] Pin dots are filled circles (not hollow)
- [ ] No console errors

### Screenshot Location:
`screenshots/test4_get_nodes.png`

---

## Test 5: SET Node Creation
**Objective**: Verify SET nodes can be created for new types

### Steps:
1. Right-click on the graph
2. Search for "Set Precision"
3. Add the SET node
4. Right-click again
5. Search for "Set GameState"
6. Add the SET node

### Expected Results:
- [ ] "Set Precision" appears in search results
- [ ] SET node for Precision is created
- [ ] "Set GameState" appears in search results
- [ ] SET node for GameState is created
- [ ] Input pins show correct colors matching the type
- [ ] Execution pins (white arrows) are present
- [ ] No console errors

### Screenshot Location:
`screenshots/test5_set_nodes.png`

---

## Test 6: Pin Connection Compatibility
**Objective**: Verify that pins of the same type can connect

### Steps:
1. Create a GET node for `Precision` (Double)
2. Create a SET node for `Precision` (Double)
3. Try to connect the output pin of GET to the input pin of SET
4. Repeat for `GameState` (Enum)

### Expected Results:
- [ ] Wire appears when dragging from GET output
- [ ] Wire snaps to SET input when hovering
- [ ] Connection is established successfully
- [ ] Wire color matches the pin type color
- [ ] Same test passes for Enum type
- [ ] No console errors

### Screenshot Location:
`screenshots/test6_pin_connections.png`

---

## Test 7: Default Values
**Objective**: Verify default values are set correctly

### Steps:
1. Select the `Precision` variable in My Blueprint
2. Check the Details Panel for "Default Value"
3. Verify it shows `0.0`
4. Select the `GameState` variable
5. Check its default value
6. Verify it shows `0`

### Expected Results:
- [ ] Double type default value is `0.0`
- [ ] Enum type default value is `0`
- [ ] Values can be edited in the Details Panel
- [ ] No console errors when changing values

### Screenshot Location:
`screenshots/test7_default_values.png`

---

## Test 8: Simulation Execution
**Objective**: Verify new types work during simulation

### Steps:
1. Create a simple graph:
   - Event BeginPlay
   - Set Precision (value: 3.14159)
   - Get Precision
   - Print String (connect Get Precision output)
2. Click Play button
3. Check the Compiler Results panel

### Expected Results:
- [ ] No compilation errors
- [ ] Simulation runs successfully
- [ ] Print String outputs the correct value
- [ ] No runtime errors in console

### Screenshot Location:
`screenshots/test8_simulation.png`

---

## Test 9: Variable Header Gradients
**Objective**: Verify variable node headers show correct colors

### Steps:
1. Create GET nodes for various types:
   - Float
   - Double
   - Enum
2. Compare the header gradients

### Expected Results:
- [ ] Float header: #6AA826 to #355413 (bright green)
- [ ] Double header: #5FA826 to #2F5413 (slightly darker green)
- [ ] Enum header: #006633 to #003319 (forest green)
- [ ] Gradients are visually distinct

### Screenshot Location:
`screenshots/test9_header_gradients.png`

---

## Test 10: Type Conversion (if applicable)
**Objective**: Verify type conversions work with new types

### Steps:
1. Try to connect a Double output to a String input
2. Check if auto-conversion node is offered
3. Try to connect an Enum output to an Int input

### Expected Results:
- [ ] Auto-conversion is offered or connection is allowed
- [ ] OR: Appropriate error message if conversion not supported
- [ ] No unexpected crashes or errors

### Screenshot Location:
`screenshots/test10_type_conversion.png`

---

## 🐛 Bug Tracking

### Bugs Found:
| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 |             |          |        |
| 2 |             |          |        |
| 3 |             |          |        |

### Notes:
- 
- 
- 

---

## ✅ Sign-Off

**Tester Name**: _________________  
**Date**: _________________  
**Overall Result**: ☐ PASS  ☐ FAIL  ☐ PASS WITH ISSUES

**Summary**:
