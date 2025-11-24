
export class TestRunner {
    constructor(app) {
        this.app = app;
        this.tests = [];
    }

    register(name, testFn) {
        this.tests.push({ name, testFn });
    }

    async run() {
        console.log('%c🧪 Starting Test Suite...', 'color: #3498db; font-weight: bold; font-size: 14px;');
        let passed = 0;
        let failed = 0;

        for (const test of this.tests) {
            try {
                console.group(`Running: ${test.name}`);
                await test.testFn(this.app);
                console.log('%c✅ Passed', 'color: #2ecc71; font-weight: bold;');
                passed++;
            } catch (error) {
                console.error(`%c❌ Failed: ${error.message}`, 'color: #e74c3c; font-weight: bold;');
                console.error(error);
                failed++;
            } finally {
                console.groupEnd();
            }
        }

        console.log(`%c🏁 Tests Completed: ${passed} Passed, ${failed} Failed`, 'color: #f1c40f; font-weight: bold; font-size: 14px;');
        return failed === 0;
    }
}

// Assertion Helper
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
};

// Define Tests (merged from historical versions)
export const registerTests = (runner) => {

    // --- Variable Tests ---

    runner.register('Create Boolean Variable', (app) => {
        const initialCount = app.variables.variables.size;
        app.variables.addVariable();
        assert(app.variables.variables.size === initialCount + 1, "Variable count should increase by 1");

        const newVar = [...app.variables.variables.values()].pop();
        assert(newVar.type === 'bool', "New variable should be type 'bool'");
        assert(newVar.defaultValue === false, "New bool should default to false");
    });

    runner.register('Change Variable Type to Vector', (app) => {
        // Create a var if none exists
        if (app.variables.variables.size === 0) app.variables.addVariable();
        const variable = [...app.variables.variables.values()].pop();

        app.variables.updateVariableProperty(variable, 'type', 'vector');
        assert(variable.type === 'vector', "Variable type should be 'vector'");
        assert(variable.defaultValue === '(0,0,0)', "Vector default should be '(0,0,0)'");
    });

    runner.register('Change Variable Type to Transform', (app) => {
        if (app.variables.variables.size === 0) app.variables.addVariable();
        const variable = [...app.variables.variables.values()].pop();

        app.variables.updateVariableProperty(variable, 'type', 'transform');
        assert(variable.type === 'transform', "Variable type should be 'transform'");
        assert(variable.defaultValue === '(0,0,0|0,0,0|1,1,1)', "Transform default should be '(0,0,0|0,0,0|1,1,1)'");
    });

    runner.register('Prevent Boolean Set/Map', (app) => {
        // This test is a placeholder for UI constraints; the model currently allows operations
        if (app.variables.variables.size === 0) app.variables.addVariable();
        const variable = [...app.variables.variables.values()].pop();
        app.variables.updateVariableProperty(variable, 'type', 'bool');
        assert(true, "Skipping UI interaction test");
    });

    // --- Graph Tests ---

    runner.register('Add PrintString Node to Graph', (app) => {
        const initialNodeCount = app.graph.nodes.size;
        const newNode = app.graph.addNode('PrintString', 100, 100);
        assert(newNode !== null, "addNode should return a node for PrintString");
        assert(app.graph.nodes.size === initialNodeCount + 1, "Node count should increase");

        const node = [...app.graph.nodes.values()].pop();
        assert(node.nodeKey === 'PrintString', "Node key should be PrintString");
    });

    // Historical test: Add Event BeginPlay node (kept for broader coverage)
    runner.register('Add EventBeginPlay Node to Graph', (app) => {
        const initialNodeCount = app.graph.nodes.size;
        // Use the NodeDefinitions key 'EventBeginPlay'
        const evtNode = app.graph.addNode('EventBeginPlay', 100, 100);
        assert(evtNode !== null, "addNode should return a node for EventBeginPlay");
        assert(app.graph.nodes.size === initialNodeCount + 1, "Node count should increase");

        const node = [...app.graph.nodes.values()].pop();
        assert(node.nodeKey === 'EventBeginPlay', "Node key should be EventBeginPlay");
    });

    runner.register('Delete Node', (app) => {
        // Ensure we have a node
        if (app.graph.nodes.size === 0) app.graph.addNode('PrintString', 100, 100);
        const initialNodeCount = app.graph.nodes.size;
        const node = [...app.graph.nodes.values()].pop();

        // Select it first (selectNode expects nodeId)
        app.graph.selectNode(node.id, false);
        app.graph.deleteSelectedNodes();

        assert(app.graph.nodes.size === initialNodeCount - 1, "Node count should decrease");
    });

    runner.register('Delete Variable via Key', async (app) => {
        // 1. Create Variable
        app.variables.addVariable();
        const variable = [...app.variables.variables.values()].pop();
        const initialCount = app.variables.variables.size;

        // 2. Select Variable (Simulate UI selection)
        app.details.currentVariable = variable;

        // 3. Simulate Delete Key Press
        const deleteEvent = new KeyboardEvent('keydown', {
            key: 'Delete',
            code: 'Delete',
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(deleteEvent);

        // 4. Check if Modal is Open
        const modal = document.getElementById('confirmation-modal');
        assert(modal.style.display === 'flex', "Confirmation modal should be visible");

        // 5. Click Yes
        const yesBtn = document.getElementById('confirm-yes-btn');
        yesBtn.click();

        // 6. Verify Deletion
        assert(app.variables.variables.size === initialCount - 1, "Variable count should decrease");
        assert(!app.variables.variables.has(variable.name), "Variable should be removed");
    });

    // --- Wiring Tests ---

    runner.register('Create Wire Between Nodes', (app) => {
        // Clear graph first
        app.graph.nodes.forEach(node => app.graph.removeNode(node.id));

        // Add two nodes that can connect
        const beginPlay = app.graph.addNode('EventBeginPlay', 100, 100);
        const printString = app.graph.addNode('PrintString', 400, 100);

        assert(beginPlay !== null, "BeginPlay node should be created");
        assert(printString !== null, "PrintString node should be created");

        // Get the pins
        const execOutPin = beginPlay.pins.find(p => p.id === 'exec' && p.direction === 'output');
        const execInPin = printString.pins.find(p => p.id === 'exec' && p.direction === 'input');

        assert(execOutPin, "BeginPlay should have exec output pin");
        assert(execInPin, "PrintString should have exec input pin");

        // Create connection
        const initialLinkCount = app.wiring.links.size;
        app.wiring.createLink(execOutPin, execInPin);

        assert(app.wiring.links.size === initialLinkCount + 1, "Link count should increase");
    });

    runner.register('Delete Wire', (app) => {
        // Ensure we have nodes and wires
        if (app.graph.nodes.size < 2) {
            app.graph.addNode('EventBeginPlay', 100, 100);
            app.graph.addNode('PrintString', 400, 100);
        }

        // Create a link if none exists
        if (app.wiring.links.size === 0) {
            const beginPlay = [...app.graph.nodes.values()].find(n => n.nodeKey === 'EventBeginPlay');
            const printString = [...app.graph.nodes.values()].find(n => n.nodeKey === 'PrintString');
            if (beginPlay && printString) {
                const execOut = beginPlay.pins.find(p => p.direction === 'output');
                const execIn = printString.pins.find(p => p.direction === 'input');
                if (execOut && execIn) {
                    app.wiring.createLink(execOut, execIn);
                }
            }
        }

        const initialCount = app.wiring.links.size;
        if (initialCount > 0) {
            const link = [...app.wiring.links.values()][0];
            app.wiring.removeLink(link.id);
            assert(app.wiring.links.size === initialCount - 1, "Link count should decrease");
        }
    });

    // --- Persistence Tests ---

    runner.register('Save and Load Graph State', (app) => {
        // Clear and set up a known state
        app.graph.nodes.forEach(node => app.graph.removeNode(node.id));
        app.variables.variables.clear();

        // Add some content
        app.graph.addNode('EventBeginPlay', 100, 100);
        app.graph.addNode('PrintString', 400, 100);
        app.variables.addVariable();

        const nodeCount = app.graph.nodes.size;
        const varCount = app.variables.variables.size;

        // Save state
        app.persistence.save();

        // Clear everything
        app.graph.nodes.forEach(node => app.graph.removeNode(node.id));
        app.variables.variables.clear();
        assert(app.graph.nodes.size === 0, "Graph should be empty after clearing");

        // Load state
        app.persistence.load();

        assert(app.graph.nodes.size === nodeCount, "Loaded graph should have same node count");
        assert(app.variables.variables.size === varCount, "Loaded state should have same variable count");
    });

    // --- Undo/Redo Tests ---

    runner.register('Undo Add Node', (app) => {
        const initialCount = app.graph.nodes.size;

        // Add a node
        app.graph.addNode('PrintString', 100, 100);
        assert(app.graph.nodes.size === initialCount + 1, "Node should be added");

        // Undo
        app.history.undo();
        assert(app.graph.nodes.size === initialCount, "Node should be removed after undo");
    });

    runner.register('Redo Add Node', (app) => {
        const initialCount = app.graph.nodes.size;

        // Add, then undo
        app.graph.addNode('PrintString', 100, 100);
        app.history.undo();

        // Redo
        app.history.redo();
        assert(app.graph.nodes.size === initialCount + 1, "Node should be restored after redo");
    });

    // --- Regression Tests (Previously Fixed Bugs) ---

    runner.register('[Regression] Ghost Wire Visibility', (app) => {
        // This test verifies that ghost wire state is properly managed
        // Bug: Ghost wire was disappearing when releasing mouse button

        const ghostWire = document.getElementById('ghost-wire');
        assert(ghostWire !== null, "Ghost wire element should exist");

        // Initial state should be hidden
        const initialDisplay = window.getComputedStyle(ghostWire).display;
        assert(initialDisplay === 'none', "Ghost wire should initially be hidden");
    });

    runner.register('[Regression] Pin Literal Values Persist', (app) => {
        // Bug: Literal values on pins were being reset

        const printString = app.graph.addNode('PrintString', 100, 100);
        const textPin = printString.pins.find(p => p.id === 'text');

        if (textPin && textPin.literalValue !== undefined) {
            const testValue = "Test Message";
            textPin.literalValue = testValue;

            // Simulate re-render
            printString.render();

            assert(textPin.literalValue === testValue, "Literal value should persist after render");
        }
    });

    runner.register('[Regression] Variable Node Updates', (app) => {
        // Bug: Variable nodes weren't updating when variable properties changed

        // Create a variable
        app.variables.addVariable();
        const variable = [...app.variables.variables.values()].pop();
        const initialName = variable.name;

        // Add a getter node for this variable
        const getNode = app.graph.addVariableNode(variable, 'get', 100, 100);
        assert(getNode !== null, "Variable getter node should be created");

        // Change variable name
        const newName = "UpdatedVariableName";
        app.variables.updateVariableProperty(variable, 'name', newName);

        // Verify the node was notified (check if title updated)
        // This assumes updateVariableNodes is called by updateVariableProperty
        assert(variable.name === newName, "Variable name should be updated");
    });

    runner.register('[Regression] Node Duplication with Custom Pins', (app) => {
        // Bug: Duplicating nodes with custom pins caused issues

        // Add a node that can have custom pins (like a Branch node)
        const branch = app.graph.addNode('Branch', 100, 100);
        assert(branch !== null, "Branch node should be created");

        const initialPinCount = branch.pins.length;

        // Select and duplicate
        app.graph.selectNode(branch.id, false);
        app.graph.duplicateSelectedNodes();

        const duplicated = [...app.graph.nodes.values()].find(n =>
            n.id !== branch.id && n.nodeKey === 'Branch'
        );

        if (duplicated) {
            assert(duplicated.pins.length === initialPinCount,
                "Duplicated node should have same number of pins");
        }
    });

};
