
import os

file_path = r'c:\Users\Sam Deiter\Documents\GitHub\UE5LMSBlueprint\src\services\SimulationEngine.js'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Imports
imports_to_add = """import { VectorExecutor } from './executors/VectorExecutor.js';
import { NodeDefinitions } from '../data/NodeDefinitions.js';"""

# Find the last import
last_import_idx = content.rfind("import { ActorExecutor }")
if last_import_idx != -1:
    # Insert after ActorExecutor import line
    end_of_line = content.find('\n', last_import_idx)
    content = content[:end_of_line+1] + imports_to_add + '\n' + content[end_of_line+1:]

# 2. Fix the initializeExecutors method
# The previous replace left a mess with "new import(...)". Let's fix it properly.

method_start = "initializeExecutors() {"
method_end = "    }" # This is risky, need to find the matching brace or just replace the block we know.

# We know what the block looks like now from the previous tool output.
# It starts with "initializeExecutors() {" and ends with the comment "// First, add imports." + "    }"

# Let's construct the correct method body
new_method_body = """    initializeExecutors() {
        // 1. Instantiate Executors
        const executors = {
            'Event': new EventExecutor(this),
            'FlowControl': new FlowControlExecutor(this),
            'Print': new PrintExecutor(this),
            'Math': new MathExecutor(this),
            'Vector': new VectorExecutor(this),
            'Variable': new VariableExecutor(this),
            'Cast': new CastExecutor(this),
            'Conversion': new ConversionExecutor(this),
            'Timeline': new TimelineExecutor(this),
            'Function': new FunctionExecutor(this),
            'Macro': new MacroExecutor(this),
            'NeedNode': new NeedNodeExecutor(this),
            'String': new StringExecutor(this),
            'Actor': new ActorExecutor(this)
        };

        // 2. Auto-Register Static Nodes from Metadata
        for (const [key, def] of Object.entries(NodeDefinitions)) {
            if (def.executor && executors[def.executor]) {
                this.executorRegistry.register(key, executors[def.executor]);
            }
        }

        // 3. Register Dynamic Patterns (Keep existing)
        this.executorRegistry.registerPattern(/^Get_/, executors['Variable']);
        this.executorRegistry.registerPattern(/^Set_/, executors['Variable']);
        this.executorRegistry.registerPattern(/^CastTo_/, executors['Cast']);
        this.executorRegistry.registerPattern(/^Conv_/, executors['Conversion']);
        this.executorRegistry.registerPattern(/^Func_/, executors['Function']);
        this.executorRegistry.registerPattern(/^Macro_/, executors['Macro']);
    }"""

# We need to replace the BROKEN method body with this new one.
# The broken body has: 'Vector': new import('./executors/VectorExecutor.js').VectorExecutor(this),

start_marker = "initializeExecutors() {"
end_marker = "// First, add imports." # From my previous tool call

start_idx = content.find(start_marker)
# Find the end of the method. The previous tool call replaced up to line 174.
# But since I messed up the replacement, I need to be careful.
# Let's look for the unique string I inserted: "new import('./executors/VectorExecutor.js')"

if "new import('./executors/VectorExecutor.js')" in content:
    # Okay, we found the broken part.
    # Let's find the start of the method and the end of the method.
    # The method starts at `initializeExecutors() {`
    # The previous replacement ended with `// First, add imports.\n    }`
    
    # Let's use regex to replace the whole function block
    import re
    
    # Match from initializeExecutors() { ... to ... // First, add imports.\n    }
    # Note: The previous tool output showed two "initializeExecutors" comments/headers because I added one.
    # "/**\n     * Initialize all node executors and register them\n     */\n    /**\n     * Initialize all node executors and register them\n     */"
    
    # Let's clean up the double comment too.
    double_comment = """    /**
     * Initialize all node executors and register them
     */
    /**
     * Initialize all node executors and register them
     */"""
    single_comment = """    /**
     * Initialize all node executors and register them
     */"""
    
    content = content.replace(double_comment, single_comment)
    
    # Now replace the function body
    # We can just search for the string "const executors = {" and replace until the end of the function.
    
    body_start = content.find("const executors = {")
    if body_start != -1:
        # Find the end of the function. It should be the closing brace after "// First, add imports."
        # But wait, I can just replace the whole method block if I can identify it.
        
        # Let's try to find the range from `initializeExecutors() {` to the closing brace.
        # Since I know I just wrote it, I know it ends with `// First, add imports.\n    }`
        
        end_pattern = "// First, add imports.\n    }"
        end_idx = content.find(end_pattern)
        
        if end_idx != -1:
            start_idx = content.find("initializeExecutors() {")
            
            # Replace the whole range
            content = content[:start_idx] + new_method_body + content[end_idx + len(end_pattern):]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed SimulationEngine.js imports and method body.")
