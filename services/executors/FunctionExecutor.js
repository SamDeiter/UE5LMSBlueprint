import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles function call nodes (Func_*, FunctionEntry, FunctionResult)
 */
export class FunctionExecutor extends BaseExecutor {
    async execute(node) {
        // Handle Function Call Nodes (Func_*)
        if (node.nodeKey.startsWith('Func_')) {
            return await this.executeFunctionCall(node);
        }

        // Handle FunctionEntry (pass-through)
        if (node.nodeKey === 'FunctionEntry') {
            return null;
        }

        // Handle FunctionResult
        if (node.nodeKey === 'FunctionResult') {
            return await this.executeFunctionResult(node);
        }

        return null;
    }

    /**
     * Execute a function call node
     */
    async executeFunctionCall(node) {
        const funcName = node.nodeKey.replace('Func_', '');
        const funcDef = this.app.functionRegistry.getAll().find(f => f.name === funcName);

        if (!funcDef) {
            this.log(`Error: Function '${funcName}' not found.`, 'error');
            return null;
        }

        // 1. Evaluate Inputs
        const inputValues = {};
        funcDef.inputs.forEach(input => {
            const val = this.evaluateInput(node, `in_${input.name}`);
            inputValues[input.name] = val;
        });

        // 2. Push Context
        const callerGraph = this.app.activeGraph;

        // Initialize Local Variables
        const localVars = {};
        if (funcDef.localVariables) {
            funcDef.localVariables.forEach(v => {
                localVars[v.name] = v.defaultValue;
            });
        }

        this.engine.callStack.push({
            callerGraph: callerGraph,
            callerNodeId: node.id,
            localVariables: localVars
        });

        // 3. Switch to Function Graph
        this.app.switchGraph(funcName);

        // 4. Find Entry Node and Set Inputs
        const entryNode = [...this.app.graph.nodes.values()].find(n => n.nodeKey === 'FunctionEntry');
        if (entryNode) {
            // Store inputs on the Entry node so internal nodes can read them
            entryNode.tempValues = {};
            funcDef.inputs.forEach(input => {
                // Map function input name to the Entry node's output pin ID format
                // Entry node pins are named same as function inputs
                entryNode.tempValues[input.name] = inputValues[input.name];
            });
        } else {
            this.log(`Error: FunctionEntry node missing in '${funcName}'.`, 'error');
            this.app.switchGraph(callerGraph);
            this.engine.callStack.pop();
            return null;
        }

        // 5. Execute Function (Recursive)
        // We await this, so the outer loop pauses until the function completes
        await this.engine.executeFlow(entryNode);

        // 6. Retrieve Return Values (set by FunctionResult)
        const returnValues = this.engine.functionReturnValues || {};
        this.engine.functionReturnValues = null; // Clear

        // 7. Restore Context
        this.app.switchGraph(callerGraph);
        this.engine.callStack.pop();

        // 8. Store Outputs on the Call Node (so downstream nodes can read them)
        // We use tempValues on the Call Node itself
        node.tempValues = {};
        funcDef.outputs.forEach(output => {
            node.tempValues[`out_${output.name}`] = returnValues[output.name];
        });

        return 'exec_out';
    }

    /**
     * Execute a function result node (return from function)
     */
    async executeFunctionResult(node) {
        // Evaluate inputs (which are the function's return values)
        const funcName = this.app.activeGraph;
        const funcDef = this.app.functionRegistry.getAll().find(f => f.name === funcName);

        if (funcDef) {
            this.engine.functionReturnValues = {};
            funcDef.outputs.forEach(output => {
                // FunctionResult pins match output names
                // But wait, FunctionResult pins are inputs.
                // We need to find the pin on this node that corresponds to the output.
                // Pin IDs are likely just the name or generated.
                // Let's assume the pin name matches the output name.
                // We need to find the pin ID.
                const pin = node.pins.find(p => p.name === output.name && p.dir === 'in');
                if (pin) {
                    const val = this.engine.evaluatePin(pin);
                    this.engine.functionReturnValues[output.name] = val;
                }
            });
        }
        return null; // End of flow
    }

    /**
     * Evaluate function entry outputs
     */
    evaluateValue(node, pin) {
        // FunctionEntry outputs are stored in tempValues
        if (node.nodeKey === 'FunctionEntry' && node.tempValues) {
            if (node.tempValues[pin.name] !== undefined) {
                return node.tempValues[pin.name];
            }
        }

        // Function call outputs are also stored in tempValues
        if (node.nodeKey.startsWith('Func_') && node.tempValues) {
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

        return null;
    }
}
