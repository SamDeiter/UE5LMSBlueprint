/* eslint-disable no-undef, no-unused-vars */
import { GraphValidator } from './GraphValidator.js';
import { scormClient } from './ScormClient.js';
import { Utils } from '../utils.js';

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
import { StringExecutor } from './executors/StringExecutor.js';

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

        // Executor Registry
        this.executorRegistry = new ExecutorRegistry(this);
        this.initializeExecutors();

        // Debugging State
        this.isPaused = false;
        this.pausedNode = null;
        this.isStepping = false;
        this.resolveStep = null; // Promise resolver for stepping



    }


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
        const stringExecutor = new StringExecutor(this);

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

        // String Nodes
        this.executorRegistry.register('Append', stringExecutor);
        this.executorRegistry.register('Len', stringExecutor);
        this.executorRegistry.register('Contains', stringExecutor);

        // Math Nodes
        this.executorRegistry.register('ClampInt', mathExecutor);
        this.executorRegistry.register('ClampFloat', mathExecutor);
        this.executorRegistry.register('MinInt', mathExecutor);
        this.executorRegistry.register('MinFloat', mathExecutor);
        this.executorRegistry.register('MaxInt', mathExecutor);
        this.executorRegistry.register('MaxFloat', mathExecutor);
        this.executorRegistry.register('AbsInt', mathExecutor);
        this.executorRegistry.register('AbsFloat', mathExecutor);

        // Flow Control Nodes
        this.executorRegistry.register('DoN', flowControlExecutor);
        this.executorRegistry.register('DoOnce', flowControlExecutor);
        this.executorRegistry.register('Gate', flowControlExecutor);
        this.executorRegistry.register('MultiGate', flowControlExecutor);
        this.executorRegistry.register('FlipFlop', flowControlExecutor);
        this.executorRegistry.register('Sequence', flowControlExecutor);


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



    addWatch(pin) {
        if (this.app.debugger) {
            this.app.debugger.addWatch(pin);
            this.log(`Watching pin: ${pin.name}`, 'success');
        }
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
        this.log(`Paused at: ${node.title} `, 'warning');
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

    stepOut() {
        if (!this.isPaused) return;
        this.isStepping = true;
        this.stepMode = 'out';
        this.stepOutStackDepth = this.callStack.length;
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

        const stepOutBtn = document.getElementById('step-out-btn');
        if (stepOutBtn) stepOutBtn.disabled = !this.isPaused;

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
        div.textContent = `[Runtime] ${msg} `;
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
        let currentInputPin = null;
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
                } else if (this.stepMode === 'out') {
                    // Step Out: Pause only if we are at a lower stack depth
                    if (this.callStack.length < this.stepOutStackDepth) {
                        shouldPause = true;
                    }
                }
            } else if (currentNode.isBreakpoint) {
                shouldPause = true;
                this.log(`Breakpoint hit at: ${currentNode.title} `, 'warning');
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
            const nextPinId = await this.executeNodeLogic(currentNode, currentInputPin);

            let outPin = null;

            if (nextPinId) {
                outPin = currentNode.findPinById(`${currentNode.id} -${nextPinId} `);
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
                currentInputPin = link.endPin;
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
    async executeNodeLogic(node, inputPin) {
        const executor = this.executorRegistry.getExecutor(node.nodeKey);
        if (executor) {
            return await executor.execute(node, inputPin);
        }

        this.log(`Unknown node type: ${node.nodeKey} `, 'error');
        return null;
    }

    /** * Recursively evaluates the value of an input pin.
     * @param {Node} node - The node requesting the value.
     * @param {string} pinLocalId - The local ID of the input pin (e.g., 'a_in').
     */
    evaluateInput(node, pinLocalId) {
        const fullPinId = `${node.id} -${pinLocalId} `;
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
                return `(${x}, ${y}, ${z})`;
            } else if (pin.type === 'rotator') {
                const r = this.evaluatePin(pin.subPins[0]) || 0;
                const p = this.evaluatePin(pin.subPins[1]) || 0;
                const y = this.evaluatePin(pin.subPins[2]) || 0;
                return `(R = ${r}, P = ${p}, Y = ${y})`;
            } else if (pin.type === 'transform') {
                const loc = this.evaluatePin(pin.subPins[0]) || '(0,0,0)';
                const rot = this.evaluatePin(pin.subPins[1]) || '(R=0,P=0,Y=0)';
                const scale = this.evaluatePin(pin.subPins[2]) || '(1,1,1)';
                return `(${loc} | ${rot} | ${scale})`;
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

        // Delegate to executor
        const executor = this.executorRegistry.getExecutor(node.nodeKey);
        if (executor && executor.evaluateValue) {
            return executor.evaluateValue(node, pin);
        }

        return null;
    }

    evaluateNeedNodes() {
        // Find all NeedNodes in the graph
        const needNodes = [...this.app.graph.nodes.values()].filter(n => n.nodeKey === 'NeedNode');

        if (needNodes.length === 0) {
            this.log("No NeedNodes found for assessment.");
            return;
        }

        this.log(`\n-- - Assessment Results-- - `, "success");

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
            this.log(`  Status: ${isPassing ? '✅ PASSED' : '❌ FAILED'} `, isPassing ? 'success' : 'error');

            validatedCriteria.forEach(c => {
                this.log(`    ${c.passed ? '✅' : '❌'} ${c.description} `);
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

        this.log(`\n-- - Overall Assessment-- - `, "success");
        this.log(`Overall Score: ${overallScore}% `);
        this.log(`Status: ${allPassed ? '✅ ALL REQUIREMENTS MET' : '❌ SOME REQUIREMENTS NOT MET'} `,
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
                this.log(`[SCORM] Would report: Score = ${score}%, Status = ${passed ? 'passed' : 'failed'} `);
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

        this.log(`\n[SCORM] ✅ Reported to LMS: Score = ${score}%, Status = ${passed ? 'passed' : 'failed'} `, "success");
    }
}
