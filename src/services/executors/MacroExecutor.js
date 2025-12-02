import { BaseExecutor } from './BaseExecutor.js';

/**
 * Handles macro nodes (Macro_*, MacroEntry, MacroResult)
 */
export class MacroExecutor extends BaseExecutor {
    async execute(node, inputPin) {
        // Handle Macro Call Nodes (Macro_*)
        if (node.nodeKey.startsWith('Macro_')) {
            return await this.executeMacroCall(node, inputPin);
        }

        // Handle MacroEntry (pass-through)
        if (node.nodeKey === 'MacroEntry') {
            return null;
        }

        // Handle MacroResult
        if (node.nodeKey === 'MacroResult') {
            return await this.executeMacroResult(node, inputPin);
        }

        return null;
    }

    /**
     * Execute a macro call node
     */
    async executeMacroCall(node, inputPin) {
        const macroName = node.nodeKey.replace('Macro_', '');
        const macroDef = this.app.macroRegistry.getAll().find(m => m.name === macroName);

        if (!macroDef) {
            this.log(`Error: Macro '${macroName}' not found.`, 'error');
            return null;
        }

        // 1. Evaluate Inputs
        const inputValues = {};
        
        // Determine entry point from inputPin
        // Input pin on call node is named like the input (e.g. "Exec", "Reset")
        const execInputName = inputPin ? inputPin.name : (macroDef.inputs.find(i => i.type === 'exec')?.name || 'Exec');

        // Evaluate Data Inputs
        macroDef.inputs.forEach(input => {
            if (input.type !== 'exec') {
                const val = this.evaluateInput(node, `in_${input.name}`);
                inputValues[input.name] = val;
            }
        });


        // 2. Switch Context (Virtual)
        // Macros don't push a new call stack frame in the same way functions do (no local vars).
        // But we need to switch the "active graph" context to the macro's graph to execute its nodes.
        // And we need to map the MacroEntry node's outputs to the inputValues we just calculated.

        const callerGraph = this.app.activeGraph;
        this.app.switchGraph(macroName);

        // 3. Find Entry Node
        const entryNode = [...this.app.graph.nodes.values()].find(n => n.nodeKey === 'MacroEntry');
        if (entryNode) {
            entryNode.tempValues = inputValues;
            // We also need to know which Exec pin on the Entry node to fire.
            // It should match the execInputName.
            // executeFlow will start from the Entry node.
            // We need to tell it which output pin (Exec) to follow.
            // The Entry node has Outputs that match the Macro's Inputs.
            // So if we entered via "Execute", we fire the "Execute" output of the Entry node.
        } else {
            this.log(`Error: MacroEntry node missing in '${macroName}'.`, 'error');
            this.app.switchGraph(callerGraph);
            return null;
        }

        // 4. Execute Macro Graph
        // We await this. The macro graph will eventually hit a MacroResult node.
        // When it does, we need to capture which Exec output of the Result node was triggered.

        this.engine.macroResult = null; // Reset result state
        await this.engine.executeFlow(entryNode, execInputName); // Start flow from specific exec pin

        // 5. Handle Result
        const result = this.engine.macroResult; // { exitPinName: 'Then', outputs: { ... } }
        this.engine.macroResult = null;

        // 6. Restore Context
        this.app.switchGraph(callerGraph);

        if (result) {
            // Store output values on the Macro node for downstream
            node.tempValues = {};
            macroDef.outputs.forEach(output => {
                if (output.type !== 'exec') {
                    node.tempValues[`out_${output.name}`] = result.outputs[output.name];
                }
            });

            // Return the name of the output exec pin to follow
            // The Macro node has output pins named `out_${exitPinName}`
            return `out_${result.exitPinName}`;
        }

        return null;
    }

    /**
     * Execute a macro result node (exit from macro)
     */
    async executeMacroResult(node, inputPin) {
        // Determine which Exec input was triggered?
        // Again, we don't know which input pin triggered us.
        // We assume the first connected one or we need that entryPinId.
        // For MVP, if we are here, we are exiting.
        // We need to find which Exec input pin is connected/active.
        // Since we don't track active path, we'll just take the first Exec input.
        // OR better: The MacroResult node has Inputs matching the Macro Outputs.
        // We need to know which "Exit" we are taking.

        // Let's assume we take the first Exec input for now.
        // TODO: Fix this when we have entryPinId.

        const macroName = this.app.activeGraph;
        const macroDef = this.app.macroRegistry.getAll().find(m => m.name === macroName);

        if (macroDef) {
            const outputs = {};
            
            // Determine exit point from inputPin
            // MacroResult inputs match Macro Outputs.
            const exitPinName = inputPin ? inputPin.name : (macroDef.outputs.find(o => o.type === 'exec')?.name || 'Then');

            macroDef.outputs.forEach(output => {
                if (output.type !== 'exec') {
                    // Evaluate data inputs
                    const pin = node.pins.find(p => p.name === output.name && p.dir === 'in');
                    if (pin) {
                        outputs[output.name] = this.engine.evaluatePin(pin);
                    }
                }
            });


            this.engine.macroResult = {
                exitPinName: exitPinName,
                outputs: outputs
            };
        }
        return null; // Stop flow in macro graph
    }

    /**
     * Evaluate macro entry and call outputs
     */
    evaluateValue(node, pin) {
        // MacroEntry outputs are stored in tempValues
        if (node.nodeKey === 'MacroEntry' && node.tempValues) {
            if (node.tempValues[pin.name] !== undefined) {
                return node.tempValues[pin.name];
            }
        }

        // Macro call outputs are also stored in tempValues
        if (node.nodeKey.startsWith('Macro_') && node.tempValues) {
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
