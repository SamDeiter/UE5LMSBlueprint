# Phase 2 Testing Checklist - Vector, Rotator, Transform Nodes

## ✅ Prerequisites
- [ ] Local server is running (`python -m http.server 8000`)
- [ ] Browser is open to `http://localhost:8000`
- [ ] Console is open (F12) to check for errors

## Test 1: Make Vector
**Objective**: Verify Make Vector node works correctly.

### Steps:
1. Right-click on graph -> Search "Make Vector".
2. Add the node.
3. Set X=1, Y=2, Z=3 (using default values on pins).
4. Create a "Print String" node.
5. Connect "Return Value" of Make Vector to "In String" of Print String.
   - *Note: Auto-conversion might trigger, or it might just work if Print String accepts wildcard/string.*
6. Connect Event BeginPlay to Print String.
7. Click Play.

### Expected Results:
- [ ] Output should be `(1,2,3)` (or similar format).

## Test 2: Break Vector
**Objective**: Verify Break Vector node works correctly.

### Steps:
1. Right-click -> Search "Break Vector".
2. Add the node.
3. Connect the output of "Make Vector" (from Test 1) to "Vector" input of Break Vector.
4. Create 3 Print String nodes.
5. Connect Event BeginPlay -> Print String 1 -> Print String 2 -> Print String 3.
6. Connect Break Vector X -> Print String 1.
7. Connect Break Vector Y -> Print String 2.
8. Connect Break Vector Z -> Print String 3.
9. Click Play.

### Expected Results:
- [ ] Output should be `1`, `2`, `3` in sequence.

## Test 3: Make Rotator
**Objective**: Verify Make Rotator node works.

### Steps:
1. Add "Make Rotator" node.
2. Set Roll=10, Pitch=20, Yaw=30.
3. Print the output.

### Expected Results:
- [ ] Output should be `(R=10,P=20,Y=30)`.

## Test 4: Break Rotator
**Objective**: Verify Break Rotator node works.

### Steps:
1. Add "Break Rotator" node.
2. Connect Make Rotator output to Break Rotator input.
3. Print Roll, Pitch, Yaw.

### Expected Results:
- [ ] Output should be `10`, `20`, `30`.

## Test 5: Make Transform
**Objective**: Verify Make Transform node works.

### Steps:
1. Add "Make Transform" node.
2. Connect Make Vector (1,2,3) to Location.
3. Connect Make Rotator (10,20,30) to Rotation.
4. Leave Scale as default (or connect a Make Vector (1,1,1)).
5. Print the output.

### Expected Results:
- [ ] Output should be `(1,2,3|10,20,30|1,1,1)` (or similar format).

## Test 6: Break Transform
**Objective**: Verify Break Transform node works.

### Steps:
1. Add "Break Transform" node.
2. Connect Make Transform output to Break Transform input.
3. Print Location (should be vector string).
4. Print Rotation (should be rotator string).
5. Print Scale (should be vector string).

### Expected Results:
- [ ] Location: `(1,2,3)`
- [ ] Rotation: `(R=10,P=20,Y=30)`
- [ ] Scale: `(1,1,1)`

## Test 7: Split Struct Pin (New Feature)
**Objective**: Verify "Split Struct Pin" functionality on a Make Vector node.

### Steps:
1. Add "Make Vector" node.
2. Right-click on the "Return Value" output pin.
3. Select "Split Struct Pin".
4. Verify the pin expands to show X, Y, Z output pins.
5. Connect the new X output pin to a Print String node.
6. Set Make Vector input X to 99.
7. Click Play.

### Expected Results:
- [ ] Pin should visually expand with indented X, Y, Z sub-pins.
- [ ] Output should be `99`.
- [ ] Right-clicking the split pin header should show "Recombine Struct Pin".
- [ ] Clicking "Recombine" should restore the single "Return Value" pin.

## Test 8: Visual Regression (Ground Truth)
**Objective**: Capture ground truth images to prevent future UI regressions.

### Steps:
1. Arrange a clean graph with standard nodes (Event BeginPlay, Make Vector, Print String).
2. Take a screenshot of the entire Graph Editor.
3. Save as `tests/ground_truth/graph_editor_standard.png`.
4. Open the "My Blueprint" panel and expand all sections.
5. Take a screenshot of the Left Panel.
6. Save as `tests/ground_truth/left_panel_standard.png`.
7. Select a node to populate the Details Panel.
8. Take a screenshot of the Right Panel.
9. Save as `tests/ground_truth/details_panel_standard.png`.

### Expected Results:
- [ ] Screenshots saved and verified as correct reference.

## 🐛 Bug Tracking

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 |             |          |        |

## ✅ Sign-Off

**Tester Name**: _________________
**Date**: _________________
**Overall Result**: ☐ PASS  ☐ FAIL
