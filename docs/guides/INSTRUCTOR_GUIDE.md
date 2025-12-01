# Instructor Quick Reference

## Assessment System Overview

### Available Tasks (15 Total)

| Level | Task ID | Title | Key Concepts |
|-------|---------|-------|--------------|
| **1** | task_01_hello_world | Hello World | Events, Print String |
| **1** | task_02_basic_math | Basic Math | Variables, Addition |
| **2** | task_03_branching | Conditionals | Boolean, Branch |
| **2** | task_04_variable_modification | Variable Modification | Get/Set, Increment |
| **2** | task_05_multiple_operations | Multiple Operations | Chained Math |
| **3** | task_06_custom_event | Custom Events | Event Creation |
| **3** | task_07_float_operations | Float Mathematics | Float Math |
| **3** | task_08_component_basics | Component Basics | Components |
| **3** | task_09_string_operations | String Manipulation | Strings |
| **4** | task_10_health_system | Health System | Game Systems |
| **4** | task_11_state_machine | Simple State Machine | State Management |
| **4** | task_12_complete_project | Mini Game Logic | Integration |
| **0** | task_01_health | Sample: Health Init | Variables, Events |
| **0** | level1_task1 | Health Initialization | Full System |
| **0** | level1_task2 | Print Message | Basic Flow |

---

## Validation Types

### Available Validators

```javascript
// Check if a node exists
{
    type: "node_exists",
    nodeType: "EventBeginPlay",
    count: 1,  // Optional: exact count
    description: "Add Event BeginPlay"
}

// Check if a variable exists
{
    type: "variable_exists",
    name: "Health",
    varType: "float",  // Optional: int, bool, string, etc.
    description: "Create Float variable 'Health'"
}

// Check if pins are connected
{
    type: "connection",
    from: { nodeType: "EventBeginPlay", pin: "exec_out" },
    to: { nodeType: "PrintString", pin: "exec_in" },
    description: "Connect BeginPlay to Print String"
}

// Check if a component exists
{
    type: "component_exists",
    type: "PointLight",  // or use name: "MyLight"
    description: "Add PointLight component"
}

// Check singleton (only one instance)
{
    type: "singleton_check",
    nodeType: "EventBeginPlay",
    description: "Only one BeginPlay allowed"
}

// Check node property (advanced)
{
    type: "node_property",
    nodeType: "PrintString",
    property: "customData",
    value: "Hello",
    description: "Check property value"
}

// Check node title (for renamed nodes)
{
    type: "node_title",
    nodeType: "CustomEvent",
    title: "OnScoreChanged",
    description: "Rename the Custom Event to 'OnScoreChanged'"
}
```

---

## Creating New Tasks

### Task Template

```javascript
{
    taskId: "task_XX_name",        // Unique ID
    level: 1,                       // 1-4 difficulty
    title: "Task Title",            // Display name
    description: "What to build",   // Instructions
    requirements: [
        // Add validation requirements here
    ]
}
```

### Adding to System

1. Edit `data/AssessmentTasks.js`
2. Add new task object to `ASSESSMENT_TASKS` array
3. Save file - task appears automatically in dropdown
4. Test validation by building the solution

---

## Student Progress Monitoring

### Via Task Status Panel
- Progress bar shows completion percentage
- Individual requirements show green checkmarks
- Trophy animation on 100% completion

### Via Console
```javascript
// Check current task
app.taskManager.getCurrentTask()

// Get validation results
app.taskManager.validateCurrentTask()

// Get progress percentage
app.taskManager.getTaskProgress()

// Get summary
app.taskManager.getSummary()
```

### Via SCORM
- Scores automatically reported to LMS
- Pass threshold: 80% (configurable in NeedNodes)
- Completion status tracked

---

## Common Student Issues

### "My task won't validate"
**Checklist:**
- [ ] All required nodes added?
- [ ] Variables created with correct names and types?
- [ ] All connections made correctly?
- [ ] Execution pins connected (white wires)?
- [ ] Data pins connected (colored wires)?

### "I can't find a node"
**Solutions:**
- Right-click on graph → Search
- Check variable nodes are created first
- Some nodes require specific contexts

### "My variables don't work"
**Common Fixes:**
- Variable names are case-sensitive
- Must create variable before using Get/Set nodes
- Check variable type matches (int vs float)

---

## Grading Guidelines

### Recommended Rubric

| Criteria | Points | Description |
|----------|--------|-------------|
| **Completion** | 40% | All requirements met |
| **Efficiency** | 20% | Clean, organized graph |
| **Understanding** | 20% | Demonstrates concept mastery |
| **Testing** | 20% | Works correctly when run |

### Assessment Levels

- **Level 1**: Foundational (required for all)
- **Level 2**: Intermediate (standard curriculum)
- **Level 3**: Advanced (honors/extension)
- **Level 4**: Expert (capstone projects)

---

## Customization Options

### Modify Existing Tasks
Edit `data/AssessmentTasks.js` and update requirements

### Change Pass Threshold
Default is 100% (all requirements must pass)
- Can be adjusted per-task if needed
- NeedNodes support custom thresholds

### Add Hints
Currently manual - consider adding:
- Hint text in task descriptions
- Progressive hints after failed attempts
- Example solution screenshots

---

## Technical Details

### File Locations
```
data/AssessmentTasks.js      - Task definitions
utils/validator.js           - Validation logic
services/TaskManager.js      - Task state management
ui/TaskController.js         - UI and display
services/GraphValidator.js   - Graph validation engine
```

### Validation Flow
1. Student selects task from dropdown
2. Builds solution in graph editor
3. Clicks "Compile" or "Play"
4. `TaskManager` calls `BlueprintValidator`
5. Each requirement checked individually
6. Results displayed in Task Status panel
7. Score reported to SCORM LMS

---

## Best Practices

### Task Design
✅ **DO:**
- Start simple, build complexity
- One concept per task
- Clear, specific requirements
- Provide context/motivation

❌ **DON'T:**
- Assume prior knowledge
- Make tasks too long
- Use ambiguous language
- Skip foundational concepts

### Requirement Writing
✅ **DO:**
- Be specific and measurable
- Use consistent naming
- Provide helpful descriptions
- Test your own tasks

❌ **DON'T:**
- Use vague terms
- Require hidden knowledge
- Make impossible requirements
- Forget to test edge cases

---

## Support Resources

### Documentation
- `docs/TASK_GUIDE.md` - Student guide
- `docs/ASSESSMENT_SYSTEM_SUMMARY.md` - System overview
- `docs/NEED_NODE_USER_GUIDE.md` - NeedNode details

### Testing
```javascript
// Run all unit tests
window.runTests()

// Validate specific task
window.setTask('task_01_hello_world')
window.validateTask()
```

### Troubleshooting
1. Check browser console for errors
2. Verify server is running (http://localhost:3000)
3. Clear browser cache if needed
4. Check task IDs are unique

---

## Quick Commands

```javascript
// Task Management
app.taskManager.getAllTasks()
app.taskManager.setCurrentTask('task_id')
app.taskManager.validateCurrentTask()
app.taskManager.clearTask()

// Manual Validation
app.validator.validateTask(taskObject)

// SCORM Testing
app.sim.run()  // Runs simulation and reports to SCORM
```

---

## Future Enhancements

### Planned Features
- [ ] Visual task editor
- [ ] Bulk task import/export
- [ ] Student analytics dashboard
- [ ] Automated hint system
- [ ] Video tutorial integration
- [ ] Peer review system

### Request Features
Contact the development team to request:
- New validation types
- Custom node types
- Integration with other LMS platforms
- Additional assessment tools

---

**Last Updated:** 2025-11-25
**Version:** 1.0
**Contact:** [Your contact information]
