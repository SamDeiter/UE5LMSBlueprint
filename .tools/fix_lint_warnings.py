"""
Fix ESLint unused variable warnings by prefixing them with underscore.
"""
import re

# List of (file, line, column, variable_name) from lint report
fixes = [
    # (file, line, old_name)
    ("scripts/file-size-monitor.js", 60, "err"),
    ("src/functions/FunctionRegistry.js", 1, "FunctionDefinition"),
    ("src/graph/GraphInteraction.js", 395, "zoom"),
    ("src/services/GraphValidator.js", 96, "operator"),
    ("src/services/HistoryManager.js", 105, "fData"),
    ("src/services/executors/ActorExecutor.js", 32, "pin"),
    ("src/services/executors/ActorExecutor.js", 103, "sweep"),
    ("src/services/executors/ActorExecutor.js", 104, "teleport"),
    ("src/services/executors/ActorExecutor.js", 129, "teleport"),
    ("src/services/executors/CastExecutor.js", 25, "pin"),
    ("src/services/executors/ConversionExecutor.js", 10, "node"),
    ("src/services/executors/ConversionExecutor.js", 17, "pin"),
    ("src/services/executors/EventExecutor.js", 11, "node"),
    ("src/services/executors/EventExecutor.js", 20, "pin"),
    ("src/services/executors/MathExecutor.js", 2, "Utils"),
    ("src/services/executors/MathExecutor.js", 11, "node"),
    ("src/services/executors/MathExecutor.js", 18, "pin"),
    ("src/services/executors/StringExecutor.js", 11, "node"),
    ("src/services/executors/TimelineExecutor.js", 47, "pin"),
    ("src/services/executors/TimerExecutor.js", 9, "inputPin"),
    ("src/services/executors/TimerExecutor.js", 18, "eventName"),
    ("src/services/executors/VariableExecutor.js", 40, "pin"),
    ("src/services/executors/VectorExecutor.js", 11, "node"),
    ("src/tests/test_refactor.js", 6, "app"),
    ("src/tests/test_refactor.js", 11, "app"),
    ("src/ui/EventDispatcherController.js", 5, "Utils"),
    ("src/ui/FunctionsController.js", 36, "e"),
    ("src/ui/LocalVariablesController.js", 4, "nodeRegistry"),
    ("src/ui/MacrosController.js", 33, "e"),
    ("src/ui/ParentClassModal.js", 5, "DOMElements"),
    ("src/utils.js", 5, "PIN_TYPES"),
]

base_path = r"C:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint"

for file_rel, line_num, var_name in fixes:
    file_path = f"{base_path}\\{file_rel.replace('/', '\\')}"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # Adjust for 0-indexed
        idx = line_num - 1
        if idx < len(lines):
            old_line = lines[idx]
            # Replace the variable name with _variable
            # Handle different patterns
            new_line = old_line
            
            # Pattern 1: import { VarName } or { VarName, ... }
            if f"{{ {var_name}" in old_line or f", {var_name}" in old_line or f"{var_name}," in old_line or f"{var_name} }}" in old_line:
                new_line = re.sub(rf'\b{var_name}\b', f'_{var_name}', old_line, count=1)
            # Pattern 2: const varName = or let varName =
            elif f"const {var_name}" in old_line or f"let {var_name}" in old_line:
                new_line = re.sub(rf'\b{var_name}\b', f'_{var_name}', old_line, count=1)
            # Pattern 3: function parameter (varName) or (varName,
            elif f"({var_name})" in old_line or f"({var_name}," in old_line or f", {var_name})" in old_line or f", {var_name}," in old_line:
                new_line = re.sub(rf'\b{var_name}\b', f'_{var_name}', old_line, count=1)
            else:
                # Generic replacement
                new_line = re.sub(rf'\b{var_name}\b', f'_{var_name}', old_line, count=1)
            
            if new_line != old_line:
                lines[idx] = new_line
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                print(f"Fixed: {file_rel}:{line_num} - {var_name} -> _{var_name}")
            else:
                print(f"No change: {file_rel}:{line_num} - Could not find {var_name}")
    except Exception as e:
        print(f"Error processing {file_rel}: {e}")

print("\nDone!")
