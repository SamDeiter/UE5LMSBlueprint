
export function registerNeedNodeTests(testRunner) {
    testRunner.addTest('NeedNode: Registration', (app) => {
        if (!app.nodeRegistry.has('NeedNode')) {
            throw new Error('NeedNode is not registered in NodeRegistry');
        }
        return true;
    });

    testRunner.addTest('NeedNode: Instantiation', (app) => {
        const node = app.graph.addNode('NeedNode', 0, 0);
        if (!node) {
            throw new Error('Failed to create NeedNode');
        }
        if (node.nodeKey !== 'NeedNode') {
            throw new Error(`Created node has wrong key: ${node.nodeKey}`);
        }

        // Clean up
        app.graph.nodes.delete(node.id);
        if (node.element) node.element.remove();

        return true;
    });
}
