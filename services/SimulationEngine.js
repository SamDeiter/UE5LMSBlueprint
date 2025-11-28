/* eslint-disable no-undef, no-unused-vars */
import { GraphValidator } from './GraphValidator.js';
import { scormClient } from './ScormClient.js';
import { Utils } from '../utils.js';
/**
 * Handles the runtime execution of the Blueprint graph.
 * Traversing execution pins and evaluating data dependencies.
 */


export class SimulationEngine {
    constructor(app) {
        this.app = app;
        this.isRunning = false;
        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.consoleOutput = document.getElementById('compiler-results');
        this.simInterval = null;
        this.validator = new GraphValidator(app);
        this.timelines = new Map();
        this.lastTickTime = 0;
        this.tickFrame = null;
        this.callStack = [];
        this.functionReturnValues = null;

        // Debugging State
        this.isPaused = false;
        this.pausedNode = null;
        this.isStepping = false;
        this.resolveStep = null; // Promise resolver for stepping

        this.watchedPins = new Set();
        this.createWatchPanel();
    }

    createWatchPanel() {
        this.watchPanel = document.createElement('div');
        this.watchPanel.id = 'watch-panel';
        this.watchPanel.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #444;
            border-radius: 4px;
            padding: 10px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            display: none;
            z-index: 100;
            min-width: 200px;
        `;
        this.watchPanel.innerHTML = '<div style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #555; padding-bottom: 3px;">Watched Values</div><div id="watch-list"></div>';
        document.getElementById('graph-editor').appendChild(this.watchPanel);
    }

    addWatch(pin) {
        this.watchedPins.add(pin.id);
        this.log(`Watching pin: ${pin.name}`, 'success');
        this.updateWatchPanel();
        this.watchPanel.style.display = 'block';
    }

    updateWatchPanel() {
        const list = this.watchPanel.querySelector('#watch-list');
        list.innerHTML = '';

        if (this.watchedPins.size === 0) {
            this.watchPanel.style.display = 'none';
            return;
        }

        this.watchedPins.forEach(pinId => {
            // Find pin (it might be on a different graph, so this is tricky if we switch graphs)
            // For MVP, we'll just look in the active graph or try to find it.
            // Actually, pin objects persist, but we need their current value.

            // We need to find the node and get its value.
            // Since we don't have a global pin registry, we have to search.
            let pin = null;
            for (const node of this.app.graph.nodes.values()) {
                pin = node.findPinById(pinId);
                if (pin) break;
            }

            if (pin) {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; justify-content: space-between; margin-bottom: 2px;';

                // Get value - this is the hard part. 
                // We need to capture values during execution.
                // For now, we'll just show "Pending..." or the last known value if we store it.
                const val = pin.node.tempValues ? (pin.node.tempValues[pin.name] !== undefined ? pin.node.tempValues[pin.name] : 'N/A') : 'N/A';

                row.innerHTML = `<span style="color: #aaa;">${pin.node.title}.${pin.name}:</span> <span style="color: #4CAF50;">${val}</span>`;
                list.appendChild(row);
            }
        });
    }

    /** Starts the simulation. */
    run() {
        if (this.isRunning && !this.isPaused) return;

        if (this.isPaused) {
            this.resume();
            return;
        }

        // FORCE VALIDATION BEFORE RUNNING
        // In UE5, you cannot Play In Editor (PIE) if there are compiler errors.
        const isValid = this.app.compiler.validate();
        if (!isValid) {
            this.log("Simulation halted: Fix compiler errors before playing.", "error");
            return;
        }

        this.isRunning = true;
        this.updateUI();
        this.log("--- Simulation Started ---", "success");

        // Find all EventBeginPlay nodes to start execution
        const startNodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === 'EventBeginPlay');

        // Even though validation ensures only 1 exists, we keep this generic loop structure.
        startNodes.forEach(node => {
            this.executeFlow(node);
        });

        // After execution, evaluate NeedNodes and report to SCORM
        this.evaluateNeedNodes();

        // Start the Tick Loop
        this.startTickLoop();
    }

    /** Stops the simulation. */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.pausedNode = null;
        if (this.tickFrame) {
            cancelAnimationFrame(this.tickFrame);
            this.tickFrame = null;
        }
        this.updateUI();
        this.log("--- Simulation Stopped ---", "error");

        // Clear active wire styling
        this.app.graph.clearActiveWires();

        if (this.app.debugger) this.app.debugger.update();
    }

    pause(node) {
        this.isPaused = true;
        this.isStepping = false; // Clear stepping flag as we have now paused
        this.pausedNode = node;
        this.log(`Paused at: ${node.title}`, 'warning');
        this.updateUI();

        // Highlight paused node
        if (node.element) {
            node.element.classList.add('paused-node');
        }

        if (this.app.debugger) this.app.debugger.update();
    }

    resume() {
        if (!this.isPaused) return;

        this.isPaused = false;
        if (this.pausedNode && this.pausedNode.element) {
            this.pausedNode.element.classList.remove('paused-node');
        }
        this.pausedNode = null;
        this.updateUI();
        this.log("Resuming execution...", "success");

        if (this.app.debugger) this.app.debugger.update();

        // Resolve the promise that was holding up execution
        if (this.resolveStep) {
            const resolve = this.resolveStep;
            this.resolveStep = null;
            resolve();
        }
    }

    stepOver() {
        if (!this.isPaused) return;
        this.isStepping = true;
        this.stepMode = 'over';
        this.stepOverStackDepth = this.callStack.length;
        this.resume();
    }

    stepInto() {
        if (!this.isPaused) return;
        this.isStepping = true;
        this.stepMode = 'into';
        this.resume();
    }

    /** Updates Play/Stop button state and UI visual cues. */
    updateUI() {
        if (this.playBtn) {
            this.playBtn.disabled = this.isRunning && !this.isPaused;
            this.playBtn.textContent = this.isPaused ? 'Resume' : 'Play';
        }
        if (this.stopBtn) this.stopBtn.disabled = !this.isRunning;

        const stepBtn = document.getElementById('step-btn');
        if (stepBtn) stepBtn.disabled = !this.isPaused;

        const stepIntoBtn = document.getElementById('step-into-btn');
        if (stepIntoBtn) stepIntoBtn.disabled = !this.isPaused;

        if (this.isPaused) {
            this.app.graph.editor.style.boxShadow = 'inset 0 0 0 4px #FFC107'; // Amber border for pause
        } else if (this.isRunning) {
            this.app.graph.editor.style.boxShadow = 'inset 0 0 0 2px #4CAF50'; // Green border
        } else {
            this.app.graph.editor.style.boxShadow = 'none';
        }
    }

    /** Logs runtime messages to the output panel. */
    log(msg, type = 'log') {
        const div = document.createElement('div');
        div.textContent = `[Runtime] ${msg}`;
        if (type === 'error') div.className = 'compiler-issue';
        else if (type === 'success') div.className = 'compiler-success';
        else div.className = 'compiler-log';
        this.consoleOutput.prepend(div);
    }

    /** Starts the requestAnimationFrame loop for Tick and Timelines. */
    startTickLoop() {
        this.lastTickTime = performance.now();

        const tick = (timestamp) => {
            if (!this.isRunning) return;

            const deltaTime = (timestamp - this.lastTickTime) / 1000; // Seconds
            this.lastTickTime = timestamp;

            // 1. Event Tick
            // Find all EventTick nodes
            const tickNodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === 'EventTick');
            tickNodes.forEach(node => {
                // Store delta time in a temp property so evaluateNodeValue can find it
                node.tempValues = { delta_seconds_out: deltaTime };
                this.executeFlow(node);
            });

            // 2. Timelines
            this.timelines.forEach((state, nodeId) => {
                if (!state.isPlaying) return;

                // Update time
                state.currentTime += deltaTime * state.direction;

                // Handle boundaries
                let finished = false;
                if (state.direction > 0 && state.currentTime >= state.length) {
                    if (state.loop) {
                        state.currentTime = 0;
                    } else {
                        state.currentTime = state.length;
                        state.isPlaying = false;
                        finished = true;
                    }
                } else if (state.direction < 0 && state.currentTime <= 0) {
                    if (state.loop) {
                        state.currentTime = state.length;
                    } else {
                        state.currentTime = 0;
                        state.isPlaying = false;
                        finished = true;
                    }
                }

                // Calculate Alpha (0-1)
                const alpha = Math.max(0, Math.min(1, state.currentTime / state.length));

                // Get the node to update its temp values
                const node = this.app.graph.nodes.get(nodeId);
                if (node) {
                    node.tempValues = {
                        alpha: alpha,
                        direction: state.direction
                    };

                    // Fire 'Update' pin
                    // We need to specifically fire the 'update' output pin
                    // executeFlow normally follows the first exec pin or the return of executeNodeLogic
                    // Here we manually trigger flow from a specific pin
                    this.executeFlow(node, 'update');

                    if (finished) {
                        this.executeFlow(node, 'finished');
                    }
                }
            });

            this.tickFrame = requestAnimationFrame(tick);
        };

        this.tickFrame = requestAnimationFrame(tick);
    }

    /** * Asynchronously follows the execution flow from a starting node.
     * @param {Node} startNode - The node to begin execution from.
     * @param {string} [startPinId] - Optional specific output pin ID to start from (e.g. 'update').
     */
    async executeFlow(startNode, startPinId = null) {
        let currentNode = startNode;

        // Safety limiter to prevent infinite loops crashing the browser in this phase
        let steps = 0;
        const maxSteps = 5000;

        while (currentNode && this.isRunning && steps < maxSteps) {
            steps++;

            // --- PAUSE / STEPPING LOGIC ---
            let shouldPause = false;

            if (this.isStepping) {
                if (this.stepMode === 'into') {
                    // Step Into: Pause at every node
                    shouldPause = true;
                } else if (this.stepMode === 'over') {
                    // Step Over: Pause only if we are at the same stack depth or lower
                    if (this.callStack.length <= this.stepOverStackDepth) {
                        shouldPause = true;
                    }
                }
            } else if (this.isPaused) {
                // Manual pause triggered externally
                shouldPause = true;
            }

            if (shouldPause) {
                this.pause(currentNode);
                // Wait for resume signal
                await new Promise(resolve => this.resolveStep = resolve);
                // After resume, we continue execution of the CURRENT node.
                // The isStepping flag is cleared in pause() to ensure we don't double-pause
                // unless the user requested another step.
            }

            // Execute Logic
            // Note: executeNodeLogic is async and might switch graphs!
            const nextPinId = await this.executeNodeLogic(currentNode);

            let outPin = null;

            if (nextPinId) {
                outPin = currentNode.findPinById(`${currentNode.id}-${nextPinId}`);
            } else {
                // Default: look for the first execution output pin
                outPin = currentNode.pinsOut.find(p => p.type === 'exec');
            }

            // If no valid output pin or it's unconnected, stop flow
            if (!outPin || !outPin.isConnected()) {
                currentNode = null;
                break;
            }

            // 3. Follow the wire to the next node
            const linkId = outPin.links[0]; // Execution pins only have one outgoing link
            const link = this.app.wiring.links.get(linkId);

            if (link) {
                currentNode = link.endPin.node;
                // Small delay to visualize flow could go here
            } else {
                currentNode = null;
            }
        }

        if (steps >= maxSteps) {
            this.log("Infinite loop detected or max steps reached. Stopping.", "error");
            this.stop();
        }
    }

    /** Executes the core logic of a specific node. */
    async executeNodeLogic(node) {
        // 0. Check for Function Call Nodes (Dynamic)
        if (node.nodeKey.startsWith('Func_')) {
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

            this.callStack.push({
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
                this.callStack.pop();
                return null;
            }

            // 5. Execute Function (Recursive)
            // We await this, so the outer loop pauses until the function completes
            await this.executeFlow(entryNode);

            // 6. Retrieve Return Values (set by FunctionResult)
            const returnValues = this.functionReturnValues || {};
            this.functionReturnValues = null; // Clear

            // 7. Restore Context
            this.app.switchGraph(callerGraph);
            this.callStack.pop();

            // 8. Store Outputs on the Call Node (so downstream nodes can read them)
            // We use tempValues on the Call Node itself
            node.tempValues = {};
            funcDef.outputs.forEach(output => {
                node.tempValues[`out_${output.name}`] = returnValues[output.name];
            });

            return 'exec_out';
        }

        // 0b. Check for Macro Nodes (Dynamic Expansion)
        if (node.nodeKey.startsWith('Macro_')) {
            const macroName = node.nodeKey.replace('Macro_', '');
            const macroDef = this.app.macroRegistry.getAll().find(m => m.name === macroName);

            if (!macroDef) {
                this.log(`Error: Macro '${macroName}' not found.`, 'error');
                return null;
            }

            // 1. Evaluate Inputs
            const inputValues = {};
            let execInputName = null;

            // We need to know WHICH exec pin triggered this macro to know where to start inside.
            // But executeNodeLogic doesn't know the entry pin.
            // Assumption: For MVP, we assume the first Exec input is the entry point.
            // TODO: Support multiple exec inputs by passing entryPinId to executeNodeLogic.

            macroDef.inputs.forEach(input => {
                if (input.type === 'exec') {
                    if (!execInputName) execInputName = input.name;
                } else {
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

            this.macroResult = null; // Reset result state
            await this.executeFlow(entryNode, execInputName); // Start flow from specific exec pin

            // 5. Handle Result
            const result = this.macroResult; // { exitPinName: 'Then', outputs: { ... } }
            this.macroResult = null;

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

        switch (node.nodeKey) {
            case 'EventBeginPlay':
            case 'FunctionEntry':
            case 'MacroEntry': // Pass through for flow start
                return null;

            case 'MacroResult': {
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
                    let exitPinName = 'Then'; // Default

                    macroDef.outputs.forEach(output => {
                        if (output.type === 'exec') {
                            exitPinName = output.name; // Take the last one? No, we need the triggered one.
                        } else {
                            // Evaluate data inputs
                            const pin = node.pins.find(p => p.name === output.name && p.dir === 'in');
                            if (pin) {
                                outputs[output.name] = this.evaluatePin(pin);
                            }
                        }
                    });

                    this.macroResult = {
                        exitPinName: exitPinName,
                        outputs: outputs
                    };
                }
                return null; // Stop flow in macro graph
            }

            case 'FunctionResult': {
                // Evaluate inputs (which are the function's return values)
                const funcName = this.app.activeGraph;
                const funcDef = this.app.functionRegistry.getAll().find(f => f.name === funcName);

                if (funcDef) {
                    this.functionReturnValues = {};
                    funcDef.outputs.forEach(output => {
                        // FunctionResult pins match output names
                        // But wait, FunctionResult pins are inputs.
                        // We need to find the pin on this node that corresponds to the output.
                        // Pin IDs are likely just the name or generated.
                        // Let's assume the pin name matches the output name.
                        // We need to find the pin ID.
                        const pin = node.pins.find(p => p.name === output.name && p.dir === 'in');
                        if (pin) {
                            const val = this.evaluatePin(pin);
                            this.functionReturnValues[output.name] = val;
                        }
                    });
                }
                return null; // End of flow
            }

            case 'PrintString': {
                const strVal = this.evaluateInput(node, 'str_in');
                this.log(`Print: ${strVal}`);
                return null;
            }

            case 'Branch': {
                const condition = this.evaluateInput(node, 'cond_in');
                return condition ? 'exec_true' : 'exec_false';
            }

            case 'Timeline': {
                // Ensure state exists
                let state = this.timelines.get(node.id);
                if (!state) {
                    state = {
                        currentTime: 0,
                        length: node.customProperties?.length || 5.0,
                        loop: node.customProperties?.loop || false,
                        isPlaying: false,
                        direction: 1 // 1 = forward, -1 = backward
                    };
                    this.timelines.set(node.id, state);
                }

                // Determine which input pin was triggered
                // executeNodeLogic doesn't strictly know *which* pin triggered it in this architecture
                // But we can infer or we might need to change how executeNodeLogic is called.
                // However, for MVP, we can check inputs. But wait, 'exec' inputs aren't "evaluated" like data inputs.
                // The current architecture has a limitation: executeNodeLogic is called when the node is visited.
                // It doesn't know *which* input pin was followed.

                // WORKAROUND: For now, we'll assume "Play" if we just arrived here.
                // To support multiple exec inputs properly, we'd need to pass the `entryPinId` to executeNodeLogic.

                // Let's check if we can determine the entry pin.
                // In executeFlow, we have `outPin` from the previous node.
                // `link.endPin` is the input pin on this node.

                // For this MVP, let's just default to Play/Resume.
                // Real implementation requires refactoring executeFlow to pass the input pin ID.

                state.isPlaying = true;
                state.direction = 1;
                return null;
            }

            default:
                // Handle Casting
                if (node.nodeKey.startsWith('CastTo_')) {
                    const targetType = node.nodeKey.replace('CastTo_', '');
                    const obj = this.evaluateInput(node, 'object_in');

                    // Simple type check (mocking inheritance/class system)
                    // We assume objects might have a _type property, or we check if the value ITSELF is the type name for simple tests
                    // For a robust system, we'd check obj._type === targetType

                    let isMatch = false;
                    if (obj && typeof obj === 'object' && obj._type === targetType) {
                        isMatch = true;
                    }
                    // Fallback for simple string testing if users pass a string as an "object"
                    else if (typeof obj === 'string' && obj === targetType) {
                        isMatch = true;
                    }

                    return isMatch ? 'exec_out' : 'cast_failed';
                }

                // Handle dynamic Set nodes
                if (node.nodeKey.startsWith('Set_')) {
                    const varName = node.nodeKey.replace('Set_', '');
                    const val = this.evaluateInput(node, 'val_in');

                    // Check Local Variables First
                    if (this.callStack.length > 0) {
                        const currentFrame = this.callStack[this.callStack.length - 1];
                        if (currentFrame.localVariables && currentFrame.localVariables.hasOwnProperty(varName)) {
                            currentFrame.localVariables[varName] = val;
                            return null;
                        }
                    }

                    const variable = this.app.variables.variables.get(varName);
                    if (variable) {
                        variable.defaultValue = val; // Update the runtime value
                        // Note: This mutates the 'default' value which persists in the UI.
                        // In a real engine, runtime state is separate from edit-time defaults.
                    }
                    return null;
                }
                return null;

            case 'NeedNode': {
                const needData = node.customData ? node.customData.needNodeData : null;
                if (!needData) {
                    console.warn(`NeedNode ${node.id} has no configuration data.`);
                    return 'exec_out';
                }

                // 1. Validate Criteria
                const validator = new GraphValidator(this.app);
                const results = validator.validate(needData.criteria);

                // 2. Calculate Score
                const total = results.length;
                const passedCount = results.filter(r => r.passed).length;
                const score = total > 0 ? Math.round((passedCount / total) * 100) : 0;
                const passed = score >= (needData.passThreshold || 80);

                console.log(`[NeedNode] Executed. Score: ${score}%, Passed: ${passed}`);

                // 3. Report to SCORM
                if (scormClient) {
                    scormClient.setScore(score, 100, 0);
                    if (passed) {
                        scormClient.setSuccess('passed');
                        scormClient.setCompletion('completed');
                    } else {
                        scormClient.setSuccess('failed');
                        scormClient.setCompletion('incomplete');
                    }
                    scormClient.save();
                }

                // 4. Update Output Pins (Runtime Values)
                // We need a way to set output values for the next nodes to read.
                // In this simplified engine, we can store them on the node itself or a runtime state map.
                // For now, let's store them in pinLiterals which act as the "current value" for outputs in this engine.
                const scorePin = node.findPinById(`${node.id}-score_out`);
                const passedPin = node.findPinById(`${node.id}-passed_out`);

                if (scorePin) node.pinLiterals.set(scorePin.id, score);
                if (passedPin) node.pinLiterals.set(passedPin.id, passed);

                // 5. Visual Feedback (Optional but good)
                node.devWarning = passed ? "Assessment Passed!" : "Assessment Failed";
                this.app.wiring.updateVisuals(node);

                return 'exec_out';
            }
        }
    }

    /** * Recursively evaluates the value of an input pin.
     * @param {Node} node - The node requesting the value.
     * @param {string} pinLocalId - The local ID of the input pin (e.g., 'a_in').
     */
    evaluateInput(node, pinLocalId) {
        const fullPinId = `${node.id}-${pinLocalId}`;
        const pin = node.findPinById(fullPinId);

        if (!pin) return null;
        return this.evaluatePin(pin);
    }

    evaluatePin(pin) {
        // Handle Split Pins
        if (pin.isSplit && pin.subPins) {
            if (pin.type === 'vector') {
                const x = this.evaluatePin(pin.subPins[0]) || 0;
                const y = this.evaluatePin(pin.subPins[1]) || 0;
                const z = this.evaluatePin(pin.subPins[2]) || 0;
                return `(${x},${y},${z})`;
            } else if (pin.type === 'rotator') {
                const r = this.evaluatePin(pin.subPins[0]) || 0;
                const p = this.evaluatePin(pin.subPins[1]) || 0;
                const y = this.evaluatePin(pin.subPins[2]) || 0;
                return `(R=${r},P=${p},Y=${y})`;
            } else if (pin.type === 'transform') {
                const loc = this.evaluatePin(pin.subPins[0]) || '(0,0,0)';
                const rot = this.evaluatePin(pin.subPins[1]) || '(R=0,P=0,Y=0)';
                const scale = this.evaluatePin(pin.subPins[2]) || '(1,1,1)';
                return `(${loc}|${rot}|${scale})`;
            }
        }

        // 1. If connected, pull value from the source node
        if (pin.isConnected()) {
            const linkId = pin.links[0]; // Data inputs only have one link
            const link = this.app.wiring.links.get(linkId);
            const sourcePin = link.startPin;
            const sourceNode = sourcePin.node;

            return this.evaluateNodeValue(sourceNode, sourcePin);
        }

        // 2. If not connected, use the literal value (or default)
        const literal = pin.node.pinLiterals.get(pin.id);
        return literal !== undefined ? literal : pin.defaultValue;
    }

    /** Evaluates the return value of a node (Pure nodes). */
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

        // 1. Variable Getters
        if (node.nodeKey.startsWith('Get_')) {
            const varName = node.nodeKey.replace('Get_', '');

            // Check Local Variables First (if in function context)
            if (this.callStack.length > 0) {
                const currentFrame = this.callStack[this.callStack.length - 1];
                // Local variables are stored where?
                // We need to initialize local variables when entering the function.
                // Let's assume we store them in the frame.
                if (currentFrame.localVariables && currentFrame.localVariables[varName] !== undefined) {
                    return currentFrame.localVariables[varName];
                }
            }

            const variable = this.app.variables.variables.get(varName);
            return variable ? variable.defaultValue : null;
        }

        // 2. Type Conversions
        if (node.nodeKey.startsWith('Conv_')) {
            const val = this.evaluateInput(node, 'val_in');
            // Basic string conversion
            return String(val);
        }

        // 3. Math Nodes
        if (node.nodeKey === 'AddInt') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return Number(a) + Number(b);
        }
        if (node.nodeKey === 'AddFloat') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return parseFloat(a) + parseFloat(b);
        }
        if (node.nodeKey === 'SubtractFloat') {
            const a = this.evaluateInput(node, 'a_in');
            const b = this.evaluateInput(node, 'b_in');
            return parseFloat(a) - parseFloat(b);
        }

        // 4. Cast Nodes (Data Output)
        if (node.nodeKey.startsWith('CastTo_')) {
            const targetType = node.nodeKey.replace('CastTo_', '');
            const obj = this.evaluateInput(node, 'object_in');

            // Same logic as executeNodeLogic
            if (obj && typeof obj === 'object' && obj._type === targetType) {
                return obj;
            }
            if (typeof obj === 'string' && obj === targetType) {
                return obj;
            }
            return null; // Cast failed
        }

        // 5. Vector / Rotator / Transform Operations
        switch (node.nodeKey) {
            case 'MakeVector': {
                const x = this.evaluateInput(node, 'x_in') || 0;
                const y = this.evaluateInput(node, 'y_in') || 0;
                const z = this.evaluateInput(node, 'z_in') || 0;
                return `(${x},${y},${z})`;
            }
            case 'BreakVector': {
                const vecStr = this.evaluateInput(node, 'vec_in') || '(0,0,0)';
                const parsed = Utils.parseVector(vecStr);

                if (pin && pin.id.endsWith('x_out')) return parsed.x;
                if (pin && pin.id.endsWith('y_out')) return parsed.y;
                if (pin && pin.id.endsWith('z_out')) return parsed.z;
                return 0;
            }
            case 'MakeRotator': {
                const r = this.evaluateInput(node, 'roll_in') || 0;
                const p = this.evaluateInput(node, 'pitch_in') || 0;
                const y = this.evaluateInput(node, 'yaw_in') || 0;
                return `(R=${r},P=${p},Y=${y})`;
            }
            case 'BreakRotator': {
                const rotStr = this.evaluateInput(node, 'rot_in') || '(R=0,P=0,Y=0)';
                const parsed = Utils.parseRotator(rotStr);

                if (pin && pin.id.endsWith('roll_out')) return parsed.roll;
                if (pin && pin.id.endsWith('pitch_out')) return parsed.pitch;
                if (pin && pin.id.endsWith('yaw_out')) return parsed.yaw;
                return 0;
            }
            case 'MakeTransform': {
                const loc = Utils.parseVector(this.evaluateInput(node, 'loc_in'));
                const rot = Utils.parseRotator(this.evaluateInput(node, 'rot_in'));
                const scale = Utils.parseVector(this.evaluateInput(node, 'scale_in'));

                // Return string format: (x,y,z|r,p,y|sx,sy,sz)
                return `(${loc.x},${loc.y},${loc.z}|${rot.roll},${rot.pitch},${rot.yaw}|${scale.x},${scale.y},${scale.z})`;
            }
            case 'BreakTransform': {
                const trans = this.evaluateInput(node, 'trans_in');
                const parsed = Utils.parseTransform(trans);

                if (pin && pin.id.endsWith('loc_out')) return `(${parsed.location.x},${parsed.location.y},${parsed.location.z})`;
                if (pin && pin.id.endsWith('rot_out')) return `(R=${parsed.rotation.roll},P=${parsed.rotation.pitch},Y=${parsed.rotation.yaw})`;
                if (pin && pin.id.endsWith('scale_out')) return `(${parsed.scale.x},${parsed.scale.y},${parsed.scale.z})`;
                return null;
            }
        }

        return null;
    }

    /**
     * Evaluates all NeedNodes in the graph and reports scores to SCORM LMS
     */
    evaluateNeedNodes() {
        // Find all NeedNodes in the graph
        const needNodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === 'NeedNode');

        if (needNodes.length === 0) {
            this.log("No NeedNodes found for assessment.");
            return;
        }

        this.log(`\n--- Assessment Results ---`, "success");

        let totalScore = 0;
        let totalWeight = 0;
        const results = [];

        // Evaluate each NeedNode
        needNodes.forEach(node => {
            const needData = node.customData?.needNodeData || node.needNodeData;
            if (!needData || !needData.criteria) {
                this.log(`NeedNode "${node.title}" has no criteria configured.`, "error");
                return;
            }

            // Use GraphValidator to check criteria
            const validatedCriteria = this.validator.validate(needData.criteria);

            // Calculate score for this NeedNode
            const passedCount = validatedCriteria.filter(c => c.passed).length;
            const nodeScore = validatedCriteria.length > 0
                ? Math.round((passedCount / validatedCriteria.length) * 100)
                : 0;

            const isPassing = nodeScore >= needData.passThreshold;

            // Log results
            this.log(`\nNeedNode: "${needData.title}"`);
            this.log(`  Score: ${nodeScore}% (Threshold: ${needData.passThreshold}%)`);
            this.log(`  Status: ${isPassing ? '✅ PASSED' : '❌ FAILED'}`, isPassing ? 'success' : 'error');

            validatedCriteria.forEach(c => {
                this.log(`    ${c.passed ? '✅' : '❌'} ${c.description}`);
            });

            // Accumulate for overall score
            totalScore += nodeScore;
            totalWeight += 100;

            // Update the node data with the validation results
            needData.criteria = validatedCriteria;

            // Trigger a re-render of the node to show visual feedback (checkmarks)
            if (this.app.wiring && this.app.wiring.updateVisuals) {
                this.app.wiring.updateVisuals(node);
            }

            results.push({
                title: needData.title,
                score: nodeScore,
                threshold: needData.passThreshold,
                passed: isPassing,
                criteria: validatedCriteria
            });
        });

        // Calculate overall score
        const overallScore = totalWeight > 0 ? Math.round(totalScore / needNodes.length) : 0;
        const allPassed = results.every(r => r.passed);

        this.log(`\n--- Overall Assessment ---`, "success");
        this.log(`Overall Score: ${overallScore}%`);
        this.log(`Status: ${allPassed ? '✅ ALL REQUIREMENTS MET' : '❌ SOME REQUIREMENTS NOT MET'}`,
            allPassed ? 'success' : 'error');

        // Report to SCORM LMS
        this.reportToSCORM(overallScore, allPassed);
    }

    // validateCriterion removed - logic moved to GraphValidator.js

    /**
     * Reports assessment results to SCORM LMS
     */
    reportToSCORM(score, passed) {
        // Initialize SCORM if not already done
        if (!scormClient.isInitialized) {
            const initialized = scormClient.initialize();
            if (!initialized) {
                this.log("\n[SCORM] API not available (local development mode)");
                this.log(`[SCORM] Would report: Score=${score}%, Status=${passed ? 'passed' : 'failed'}`);
                return;
            }
        }

        // Set score and success status
        scormClient.setScore(score);

        if (passed) {
            scormClient.setPassed(true);
        } else {
            scormClient.setPassed(false);
            // Optionally keep it incomplete until passed?
            // For now, let's mark it as failed but completed? 
            // Or just use setPassed(false) which sets success_status='failed' and completion_status='completed'
            // My ScormClient.setPassed does exactly that.
        }

        // scormClient.commit() is called inside setScore and setPassed

        this.log(`\n[SCORM] ✅ Reported to LMS: Score=${score}%, Status=${passed ? 'passed' : 'failed'}`, "success");
    }
}
