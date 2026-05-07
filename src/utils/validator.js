/**
 * BlueprintValidator - Validates blueprint graphs against task requirements.
 * Provides structural pattern matching to check if student blueprints meet assignment criteria
 * without executing the code. Supports checking for variable existence, node presence,
 * connections, and node properties.
 */


import { ASSESSMENT_TASKS } from '../data/AssessmentTasks.js';
import { LEVEL_7_TASKS } from '../data/assessment/Level7.js';
import { interfaceRegistry } from '../interfaces/InterfaceRegistry.js';

export class BlueprintValidator {
    constructor(app) {
        this.app = app;
    }

    /**
     * Validates the current graph against a task definition.
     * @param {Object} task - The task definition object.
     * @returns {Object} - Validation result { success: boolean, results: Array }
     */
    validateTask(task) {
        const results = [];
        let allPassed = true;

        console.group(`🔍 Validating Task: ${task.title}`);

        for (const req of task.requirements) {
            let passed = false;
            let message = "";

            try {
                switch (req.type) {
                    case 'variable_exists':
                        passed = this.checkVariable(req);
                        message = passed ? `Variable '${req.name}' exists` : `Missing variable '${req.name}'`;
                        break;
                    case 'node_exists':
                        passed = this.checkNode(req);
                        message = passed ? `Node '${req.nodeType}' exists` : `Missing node '${req.nodeType}'`;
                        break;
                    case 'connection':
                        passed = this.checkConnection(req);
                        message = passed ? `Connection valid` : `Missing connection`;
                        break;
                    case 'link_exists':
                        passed = this.checkLinkExists(req);
                        message = passed ? `Link from ${req.sourceNode}.${req.sourcePin} to ${req.targetNode}.${req.targetPin} exists` : `Missing specific link connection`;
                        break;
                    case 'node_property':
                        passed = this.checkNodeProperty(req);
                        message = passed ? `Property check passed for ${req.nodeKey}.${req.pinId}` : `Property value incorrect`;
                        break;
                    case 'singleton_check':
                        passed = this.checkSingleton(req);
                        message = passed ? `Singleton check passed for '${req.nodeType}'` : `Multiple instances of '${req.nodeType}' found`;
                        break;
                    case 'node_title':
                        passed = this.checkNodeTitle(req);
                        message = passed ? `Node titled '${req.title}' found` : `Node must be renamed to '${req.title}'`;
                        break;
                    case 'component_exists':
                        passed = this.checkComponent(req);
                        message = passed ? `Component '${req.componentType}' exists` : `Missing component '${req.componentType}'`;
                        break;
                    case 'dispatcher_exists':
                        passed = this.checkDispatcher(req);
                        message = passed ? `Dispatcher '${req.name}' exists` : `Missing dispatcher '${req.name}'`;
                        break;
                    case 'node_not_exists':
                        passed = !this.checkNode(req);
                        message = passed
                            ? `Node '${req.nodeType}' is correctly absent`
                            : `Node '${req.nodeType}' should not be present`;
                        break;
                    case 'interface_implemented':
                        passed = this.checkInterfaceImplemented(req);
                        message = passed
                            ? `Blueprint implements '${req.interfaceName}'`
                            : `Blueprint must implement '${req.interfaceName}'`;
                        break;
                    case 'interface_function_implemented':
                        passed = this.checkInterfaceFunctionImplemented(req);
                        message = passed
                            ? `Custom implementation of ${req.interfaceName}.${req.functionName} found`
                            : `Implement ${req.interfaceName}.${req.functionName} (graph still empty/default)`;
                        break;
                    case 'interface_message_sent':
                        passed = this.checkInterfaceMessageSent(req);
                        message = passed
                            ? `Message ${req.interfaceName}.${req.functionName} is sent`
                            : `Send ${req.interfaceName}.${req.functionName} message with target connected`;
                        break;
                    case 'interface_event_handled':
                        passed = this.checkInterfaceEventHandled(req);
                        message = passed
                            ? `Event ${req.interfaceName}.${req.functionName} is handled`
                            : `Hook up Event ${req.interfaceName}.${req.functionName}`;
                        break;
                    case 'custom_interface_defined':
                        passed = this.checkCustomInterfaceDefined(req);
                        message = passed
                            ? `Custom interface '${req.interfaceName}' is correctly defined`
                            : `Define custom interface '${req.interfaceName}' with the required functions`;
                        break;
                    default:
                        console.warn(`Unknown requirement type: ${req.type}`);
                        break;
                }
            } catch (e) {
                console.error(e);
                passed = false;
                message = `Error checking requirement: ${e.message}`;
            }

            results.push({
                description: req.description || message,
                passed: passed
            });

            if (!passed) allPassed = false;
            console.log(passed ? `✅ ${message}` : `❌ ${message}`);
        }

        console.groupEnd();
        return { success: allPassed, results };
    }

    checkVariable(req) {
        const variable = this.app.variables.variables.get(req.name);
        if (!variable) return false;
        if (req.varType && variable.type !== req.varType) return false;
        if (req.containerType && variable.containerType !== req.containerType) return false;
        return true;
    }

    checkDispatcher(req) {
        const ctrl = this.app.eventDispatchers;
        if (!ctrl || !ctrl.dispatchers) return false;
        const list = [...ctrl.dispatchers.values()];
        const match = list.find((d) => d.name === req.name);
        if (!match) return false;
        if (typeof req.minParams === 'number') {
            const count = (match.parameters || []).length;
            if (count < req.minParams) return false;
        }
        if (req.paramType) {
            const found = (match.parameters || []).some((p) => p.type === req.paramType);
            if (!found) return false;
        }
        return true;
    }

    checkNode(req) {
        const nodes = [...this.app.graph.nodes.values()];
        const matcher = req.nodeKeyPrefix
            ? (n) => typeof n.nodeKey === "string" && n.nodeKey.startsWith(req.nodeKeyPrefix)
            : (n) => n.nodeKey === req.nodeType;
        const count = nodes.filter(matcher).length;
        if (req.count && count !== req.count) return false;
        return count > 0;
    }

    checkConnection(req) {
        // Find source node
        const nodes = [...this.app.graph.nodes.values()];
        const sourceNodes = nodes.filter(n => n.nodeKey === req.from.nodeType);
        const targetNodes = nodes.filter(n => n.nodeKey === req.to.nodeType);

        if (sourceNodes.length === 0 || targetNodes.length === 0) return false;

        // Check if ANY instance of source is connected to ANY instance of target via the specified pins
        for (const src of sourceNodes) {
            for (const tgt of targetNodes) {
                // Find the specific pins
                const srcPin = src.pins.find(p => p.id.endsWith(req.from.pin) || p.name === req.from.pin); // heuristic match
                const tgtPin = tgt.pins.find(p => p.id.endsWith(req.to.pin) || p.name === req.to.pin);

                if (srcPin && tgtPin) {
                    // Check if they are connected
                    // Fix: Iterate over Map values
                    const isConnected = [...this.app.wiring.links.values()].some(link =>
                        (link.startPin.id === srcPin.id && link.endPin.id === tgtPin.id)
                    );
                    if (isConnected) return true;
                }
            }
        }
        return false;
    }

    checkSingleton(req) {
        const nodes = [...this.app.graph.nodes.values()];
        const count = nodes.filter(n => n.nodeKey === req.nodeType).length;
        return count <= 1;
    }

    checkNodeProperty(req) {
        const nodes = [...this.app.graph.nodes.values()];
        const targetNodes = nodes.filter(n => n.nodeKey === req.nodeKey);

        for (const node of targetNodes) {
            // Check if this is a pin literal value check
            if (req.pinId) {
                const pin = node.pins.find(p => p.id.endsWith(req.pinId) || p.id === `${node.id}-${req.pinId}`);
                if (pin) {
                    const literalValue = node.pinLiterals.get(pin.id);
                    // Convert both to strings for comparison
                    if (String(literalValue) === String(req.value)) {
                        return true;
                    }
                }
            } else {
                // Check customData or direct properties
                const val = node.customData[req.property] !== undefined ? node.customData[req.property] : node[req.property];
                if (val == req.value) return true; // Loose equality for "100" vs 100
            }
        }
        return false;
    }

    checkLinkExists(req) {
        const nodes = [...this.app.graph.nodes.values()];
        const sourceNodes = nodes.filter(n => n.nodeKey === req.sourceNode);
        const targetNodes = nodes.filter(n => n.nodeKey === req.targetNode);

        if (sourceNodes.length === 0 || targetNodes.length === 0) return false;

        // Check if ANY instance of source is connected to ANY instance of target via the specified pins
        for (const srcNode of sourceNodes) {
            for (const tgtNode of targetNodes) {
                const srcPin = srcNode.pins.find(p => p.id.endsWith(req.sourcePin) || p.name === req.sourcePin);
                const tgtPin = tgtNode.pins.find(p => p.id.endsWith(req.targetPin) || p.name === req.targetPin);

                if (!srcPin || !tgtPin) continue;

                // Check if there's a link between these specific pins
                const links = [...this.app.wiring.links.values()];
                const linkExists = links.some(link =>
                    link.startPin.id === srcPin.id && link.endPin.id === tgtPin.id
                );

                if (linkExists) return true;
            }
        }
        return false;
    }

    checkComponent(req) {
        if (!this.app.components) return false;
        const components = [...this.app.components.values()];
        return components.some(comp => comp.type === req.componentType);
    }

    checkNodeTitle(req) {
        const nodes = [...this.app.graph.nodes.values()];
        const targetNodes = nodes.filter(n => n.nodeKey === req.nodeType);

        // Check if any matching node has the required title
        return targetNodes.some(node => node.title === req.title);
    }

    // ---- Interface checks ---------------------------------------------------

    /**
     * Verify the active Blueprint declares it implements the named interface.
     * Reads from classSettings (legacy) AND the asset manager (modern); a hit
     * in either path counts. Mirrors what `_addInterface` writes.
     */
    checkInterfaceImplemented(req) {
        const name = req.interfaceName || req.name;
        if (!name) return false;

        const cs = this.app.classSettings;
        if (cs && Array.isArray(cs.interfaces) && cs.interfaces.includes(name)) {
            return true;
        }
        const am = this.app.assetManager;
        if (am) {
            const asset = am.getAsset(am.activeAssetId);
            if (asset && asset.implementsInterface && asset.implementsInterface(name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verify the impl graph for an interface function exists AND is "non-trivial":
     * the auto-stub is just Entry → Result with no data wiring, so we require
     * at least one of:
     *   - more than 2 nodes (student added logic), or
     *   - more than 1 link (student wired a return value), or
     *   - a node_property match if `req.value` is provided (literal on Result pin).
     */
    checkInterfaceFunctionImplemented(req) {
        const graphName = `Interface_${req.interfaceName}_${req.functionName}`;
        const graph = this._getGraphData(graphName);
        if (!graph) return false;

        const nodes = graph.nodes || [];
        const links = graph.links || [];

        // For 'pass-through' interfaces (no outputs) the bar is just "wired
        // through past Entry into something other than Result", which our
        // node-count check covers.
        if (nodes.length > 2) return true;
        if (links.length > 1) return true;

        // Optional literal check on the Result node — useful when the task
        // expects a specific return value (e.g. "Press E to open").
        if (req.expectedReturn !== undefined && req.expectedReturnPin) {
            const result = nodes.find((n) => n.nodeKey === 'InterfaceFunctionResult');
            if (result) {
                const literals = result.pinLiterals || result._pinLiterals || {};
                for (const [pinId, val] of Object.entries(literals)) {
                    if (
                        pinId.endsWith(req.expectedReturnPin) &&
                        String(val) === String(req.expectedReturn)
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Verify a Message_<Iface>_<Func> node exists in the active graph (or in
     * `req.inGraph` if specified) AND its `target_in` pin is connected.
     */
    checkInterfaceMessageSent(req) {
        const nodeKey = `Message_${req.interfaceName}_${req.functionName}`;

        // Pin connection check requires runtime Pin objects, so we look at the
        // live graph for the active-graph case. For non-active graphs, fall
        // back to inspecting saved link/pin id structure.
        if (!req.inGraph || req.inGraph === this.app.activeGraph) {
            const messageNodes = [...this.app.graph.nodes.values()].filter(
                (n) => n.nodeKey === nodeKey
            );
            if (messageNodes.length === 0) return false;
            return messageNodes.some((n) => {
                const targetPin = n.pins.find(
                    (p) => p.id.endsWith('target_in') || p.name === 'Target'
                );
                return targetPin && targetPin.links && targetPin.links.length > 0;
            });
        }

        const graph = this._getGraphData(req.inGraph);
        if (!graph) return false;
        const messageNodes = (graph.nodes || []).filter((n) => n.nodeKey === nodeKey);
        if (messageNodes.length === 0) return false;
        const links = graph.links || [];
        return messageNodes.some((n) => {
            const targetPin = (n.pins || []).find(
                (p) => p.id.endsWith('target_in') || p.name === 'Target'
            );
            if (!targetPin) return false;
            const fullId = targetPin.id.includes(n.id)
                ? targetPin.id
                : `${n.id}-${targetPin.id}`;
            return links.some(
                (l) => l.startPinId === fullId || l.endPinId === fullId
            );
        });
    }

    /**
     * Verify an Event_<Iface>_<Func> node exists and its exec_out is wired.
     */
    checkInterfaceEventHandled(req) {
        const nodeKey = `Event_${req.interfaceName}_${req.functionName}`;

        if (!req.inGraph || req.inGraph === this.app.activeGraph) {
            const eventNodes = [...this.app.graph.nodes.values()].filter(
                (n) => n.nodeKey === nodeKey
            );
            return eventNodes.some((n) => {
                const execPin = n.pins.find((p) => p.id.endsWith('exec_out'));
                return execPin && execPin.links && execPin.links.length > 0;
            });
        }

        const graph = this._getGraphData(req.inGraph);
        if (!graph) return false;
        const eventNodes = (graph.nodes || []).filter((n) => n.nodeKey === nodeKey);
        const links = graph.links || [];
        return eventNodes.some((n) => {
            const execPin = (n.pins || []).find((p) => p.id.endsWith('exec_out'));
            if (!execPin) return false;
            const fullId = execPin.id.includes(n.id)
                ? execPin.id
                : `${n.id}-${execPin.id}`;
            return links.some((l) => l.startPinId === fullId);
        });
    }

    /**
     * Verify a custom interface is registered with the required function
     * signatures. Use for tasks like "create IPickup with OnPickedUp + GetPickupValue".
     *
     * req shape:
     *   { interfaceName, requiredFunctions: [{ name, isPure?, inputs?: [{name,type}], outputs?: [{name,type}] }] }
     */
    checkCustomInterfaceDefined(req) {
        const iface = interfaceRegistry.get(req.interfaceName);
        if (!iface) return false;

        for (const required of req.requiredFunctions || []) {
            const fn = iface.getFunction(required.name);
            if (!fn) return false;
            if (typeof required.isPure === 'boolean' && fn.isPure !== required.isPure) {
                return false;
            }
            if (required.inputs) {
                if ((fn.inputs || []).length < required.inputs.length) return false;
                for (const ri of required.inputs) {
                    const match = (fn.inputs || []).find(
                        (i) => i.name === ri.name && (!ri.type || i.type === ri.type)
                    );
                    if (!match) return false;
                }
            }
            if (required.outputs) {
                if ((fn.outputs || []).length < required.outputs.length) return false;
                for (const ro of required.outputs) {
                    const match = (fn.outputs || []).find(
                        (o) => o.name === ro.name && (!ro.type || o.type === ro.type)
                    );
                    if (!match) return false;
                }
            }
        }
        return true;
    }

    // ---- helpers ------------------------------------------------------------

    /**
     * Resolve a graph by name, preferring the live active graph (so we read
     * its current in-memory state) over the persisted-but-not-active version.
     */
    _getGraphData(graphName) {
        if (this.app.activeGraph === graphName && this.app.graph) {
            // Serialize the live graph so we get a uniform shape with nodes/links.
            return {
                nodes: this.app.persistence.serializeNodes(),
                links: this.app.persistence.serializeLinks(),
            };
        }
        if (this.app.graphs && this.app.graphs[graphName]) {
            return this.app.graphs[graphName];
        }
        const am = this.app.assetManager;
        if (am) {
            const asset = am.getAsset(am.activeAssetId);
            if (asset && asset.graphs.has(graphName)) {
                return asset.graphs.get(graphName);
            }
        }
        return null;
    }
}

// Sample Task Definition
export const SAMPLE_TASK = {
    taskId: "task_01_health",
    title: "Initialize Health",
    description: "Create a float variable named 'Health' and set it to 100 on BeginPlay.",
    requirements: [
        {
            type: "variable_exists",
            name: "Health",
            varType: "float",
            description: "Create a Float variable named 'Health'"
        },
        {
            type: "node_exists",
            nodeType: "EventBeginPlay",
            description: "Add Event BeginPlay node"
        },
        {
            type: "singleton_check",
            nodeType: "EventBeginPlay",
            description: "Ensure only one BeginPlay node exists"
        },
        {
            type: "node_exists",
            nodeType: "Set_Health",
            description: "Add Set Health node"
        },
        {
            type: "connection",
            from: { nodeType: "EventBeginPlay", pin: "exec_out" },
            to: { nodeType: "Set_Health", pin: "exec_in" },
            description: "Connect BeginPlay to Set Health"
        }
    ]
};

// ===== LEVEL 1: FUNDAMENTALS =====

/**
 * Task 1.1: Health Initialization
 * Verify understanding of variables, events, and basic execution flow.
 */
export const TASK_1_1_HEALTH_INIT = {
    taskId: "level1_task1",
    level: 1,
    title: "Health Initialization",
    description: "Create a system to initialize a player's health when the game starts.",
    requirements: [
        {
            type: "variable_exists",
            name: "Health",
            varType: "float",
            description: "1. Create a Float variable named 'Health'"
        },
        {
            type: "node_exists",
            nodeType: "EventBeginPlay",
            description: "3. Add an Event BeginPlay node"
        },
        {
            type: "singleton_check",
            nodeType: "EventBeginPlay",
            description: "Ensure only one BeginPlay node exists"
        },
        {
            type: "node_exists",
            nodeType: "Set_Health",
            description: "4. Add a Set Health node"
        },
        {
            type: "connection",
            from: { nodeType: "EventBeginPlay", pin: "exec_out" },
            to: { nodeType: "Set_Health", pin: "exec_in" },
            description: "5. Connect BeginPlay to Set Health"
        }
    ]
};

/**
 * Task 1.2: Simple Logic
 * Print a message to the screen.
 */
export const TASK_1_2_PRINT_MESSAGE = {
    taskId: "level1_task2",
    level: 1,
    title: "Simple Logic - Print Message",
    description: "Print a message to the screen when the game starts.",
    requirements: [
        {
            type: "node_exists",
            nodeType: "EventBeginPlay",
            description: "1. Add an Event BeginPlay node"
        },
        {
            type: "singleton_check",
            nodeType: "EventBeginPlay",
            description: "Ensure only one BeginPlay node exists"
        },
        {
            type: "node_exists",
            nodeType: "PrintString",
            description: "2. Add a Print String node"
        },
        {
            type: "connection",
            from: { nodeType: "EventBeginPlay", pin: "exec_out" },
            to: { nodeType: "PrintString", pin: "exec_in" },
            description: "3. Connect BeginPlay to Print String"
        }
    ]
};

// Task Library - All available tasks
export const ALL_TASKS = [
    SAMPLE_TASK,
    TASK_1_1_HEALTH_INIT,
    TASK_1_2_PRINT_MESSAGE,
    ...ASSESSMENT_TASKS,
    ...LEVEL_7_TASKS,
];
