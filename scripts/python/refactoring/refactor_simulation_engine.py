#!/usr/bin/env python3
"""
Refactor SimulationEngine.js to use the Executor Pattern
"""

def refactor_simulation_engine():
    with open('services/SimulationEngine.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the imports section
    import_section_end = content.find('/**\n * Handles the runtime execution')
    
    # Add executor imports
    executor_imports = """
// Executor Pattern Imports
import { ExecutorRegistry } from './executors/ExecutorRegistry.js';
import { EventExecutor } from './executors/EventExecutor.js';
import { FlowControlExecutor } from './executors/FlowControlExecutor.js';
import { PrintExecutor } from './executors/PrintExecutor.js';
import { MathExecutor } from './executors/MathExecutor.js';
import { VariableExecutor } from './executors/VariableExecutor.js';
import { CastExecutor } from './executors/CastExecutor.js';
import { ConversionExecutor } from './executors/ConversionExecutor.js';
import { TimelineExecutor } from './executors/TimelineExecutor.js';
import { FunctionExecutor } from './executors/FunctionExecutor.js';
import { MacroExecutor } from './executors/MacroExecutor.js';
import { NeedNodeExecutor } from './executors/NeedNodeExecutor.js';

"""
    
    # Insert executor imports before the class comment
    content = content[:import_section_end] + executor_imports + content[import_section_end:]
    
    # Find constructor and add executor registry initialization
    constructor_end = content.find('        this.consoleOutput = document.getElementById(\'console-output\');')
    if constructor_end != -1:
        constructor_end = content.find('\n', constructor_end) + 1
        
        registry_init = """
        // Initialize Executor Registry
        this.executorRegistry = new ExecutorRegistry(this);
        this.initializeExecutors();
"""
        content = content[:constructor_end] + registry_init + content[constructor_end:]
    
    # Add initializeExecutors method after constructor
    constructor_method_end = content.find('    createWatchPanel()')
    if constructor_method_end != -1:
        init_executors_method = """
    /**
     * Initialize all node executors and register them
     */
    initializeExecutors() {
        // Create executor instances
        const eventExecutor = new EventExecutor(this);
        const flowControlExecutor = new FlowControlExecutor(this);
        const printExecutor = new PrintExecutor(this);
        const mathExecutor = new MathExecutor(this);
        const variableExecutor = new VariableExecutor(this);
        const castExecutor = new CastExecutor(this);
        const conversionExecutor = new ConversionExecutor(this);
        const timelineExecutor = new TimelineExecutor(this);
        const functionExecutor = new FunctionExecutor(this);
        const macroExecutor = new MacroExecutor(this);
        const needNodeExecutor = new NeedNodeExecutor(this);

        // Register exact match executors
        this.executorRegistry.register('EventBeginPlay', eventExecutor);
        this.executorRegistry.register('EventTick', eventExecutor);
        this.executorRegistry.register('FunctionEntry', functionExecutor);
        this.executorRegistry.register('FunctionResult', functionExecutor);
        this.executorRegistry.register('MacroEntry', macroExecutor);
        this.executorRegistry.register('MacroResult', macroExecutor);
        this.executorRegistry.register('Branch', flowControlExecutor);
        this.executorRegistry.register('PrintString', printExecutor);
        this.executorRegistry.register('Timeline', timelineExecutor);
        this.executorRegistry.register('NeedNode', needNodeExecutor);
        
        // Math nodes
        this.executorRegistry.register('AddInt', mathExecutor);
        this.executorRegistry.register('AddFloat', mathExecutor);
        this.executorRegistry.register('SubtractFloat', mathExecutor);
        this.executorRegistry.register('MultiplyFloat', mathExecutor);
        this.executorRegistry.register('DivideFloat', mathExecutor);

        // Register pattern-based executors
        this.executorRegistry.registerPattern(/^Get_/, variableExecutor);
        this.executorRegistry.registerPattern(/^Set_/, variableExecutor);
        this.executorRegistry.registerPattern(/^CastTo_/, castExecutor);
        this.executorRegistry.registerPattern(/^Conv_/, conversionExecutor);
        this.executorRegistry.registerPattern(/^Func_/, functionExecutor);
        this.executorRegistry.registerPattern(/^Macro_/, macroExecutor);
    }

    """
        content = content[:constructor_method_end] + init_executors_method + content[constructor_method_end:]
    
    # Now replace executeNodeLogic method
    # Find the start of executeNodeLogic
    execute_node_logic_start = content.find('    /** Executes the core logic of a specific node. */\n    async executeNodeLogic(node) {')
    if execute_node_logic_start == -1:
        execute_node_logic_start = content.find('    async executeNodeLogic(node) {')
    
    # Find the end of executeNodeLogic (next method starts with "    /**" or "    async" or "    evaluateInput")
    execute_node_logic_end = content.find('    /** * Recursively evaluates the value of an input pin.', execute_node_logic_start + 100)
    
    if execute_node_logic_start != -1 and execute_node_logic_end != -1:
        new_execute_node_logic = """    /** Executes the core logic of a specific node. */
    async executeNodeLogic(node) {
        const executor = this.executorRegistry.getExecutor(node.nodeKey);
        if (executor) {
            return await executor.execute(node);
        }
        
        this.log(`Unknown node type: ${node.nodeKey}`, 'error');
        return null;
    }

"""
        content = content[:execute_node_logic_start] + new_execute_node_logic + content[execute_node_logic_end:]
    
    # Now replace evaluateNodeValue method
    # Find evaluateNodeValue
    evaluate_node_value_start = content.find('    /** Evaluates the return value of a node (Pure nodes). */\n    evaluateNodeValue(node, pin) {')
    if evaluate_node_value_start == -1:
        evaluate_node_value_start = content.find('    evaluateNodeValue(node, pin) {')
    
    # Find the end (next method or evaluateNeedNodes)
    evaluate_node_value_end = content.find('    // Evaluates all NeedNodes in the graph', evaluate_node_value_start + 100)
    if evaluate_node_value_end == -1:
        evaluate_node_value_end = content.find('    evaluateNeedNodes()', evaluate_node_value_start + 100)
    
    if evaluate_node_value_start != -1 and evaluate_node_value_end != -1:
        new_evaluate_node_value = """    /** Evaluates the return value of a node (Pure nodes). */
    evaluateNodeValue(node, pin) {
        // 0. Check Temp Values (for FunctionEntry, Call Nodes, etc.)
        if (node.tempValues) {
            // Try to match pin ID suffix with tempValue key
            // Pin ID format: nodeId-pinName. We need pinName.
            // But wait, pins on FunctionEntry are named "InputName".
            // tempValues keys are "InputName".
            // So we need to extract the pin name from the pin ID or object.

            // If pin object is passed:
            if (pin) {
                // Check exact match first
                if (node.tempValues[pin.name] !== undefined) {
                    return node.tempValues[pin.name];
                }

                // Check if pin ID ends with any key (for generated IDs)
                for (const key in node.tempValues) {
                    if (pin.id.endsWith(key)) {
                        return node.tempValues[key];
                    }
                }
            }
        }

        // Delegate to executor
        const executor = this.executorRegistry.getExecutor(node.nodeKey);
        if (executor && executor.evaluateValue) {
            return executor.evaluateValue(node, pin);
        }

        return null;
    }

"""
        content = content[:evaluate_node_value_start] + new_evaluate_node_value + content[evaluate_node_value_end:]
    
    # Write the refactored content
    with open('services/SimulationEngine.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("[OK] SimulationEngine.js refactored to use Executor Pattern")
    print("     - Added executor imports")
    print("     - Added executorRegistry initialization")
    print("     - Added initializeExecutors() method")
    print("     - Replaced executeNodeLogic() with delegation")
    print("     - Replaced evaluateNodeValue() with delegation")

if __name__ == '__main__':
    refactor_simulation_engine()
