/**
 * Unit Tests for GUID System
 * Tests GUID generation, uniqueness, and integration
 */

import { generateGUID } from '../utils/guid.js';

export function registerGUIDTests(testRunner) {
    testRunner.addTest('GUID: Generate GUID', () => {
        const id1 = generateGUID();
        const id2 = generateGUID();

        if (!id1 || !id2) {
            throw new Error('generateGUID returned empty or null');
        }

        if (id1 === id2) {
            throw new Error('generateGUID returned duplicate IDs');
        }

        // Basic UUID v4 format check (approximate)
        // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        // Note: The fallback might not be strictly v4 compliant in all chars, but should be close.
        // Our implementation uses crypto.randomUUID() which is v4.

        if (!uuidRegex.test(id1)) {
            // If fallback is used, it might not match strict regex if not implemented perfectly, 
            // but let's assume we want it to look like a UUID.
            // The fallback in guid.js: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            // So it should match.
            throw new Error(`GUID ${id1} does not match UUID format`);
        }

        return true;
    });

    testRunner.addTest('GUID: Graph Node ID Integration', (app) => {
        const node = app.graph.addNode('PrintString', 100, 100);
        if (!node) throw new Error('Failed to create node');

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(node.id)) {
            throw new Error(`Node ID ${node.id} is not a valid GUID`);
        }

        // Cleanup
        app.graph.deleteSelectedNodes(); // Might not delete if not selected
        app.graph.nodes.delete(node.id);
        node.element.remove();

        return true;
    });

    testRunner.addTest('GUID: Variable ID Integration', (app) => {

        app.variables.addVariable();

        // Get the new variable
        const variables = [...app.variables.variables.values()];
        const newVar = variables[variables.length - 1];

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(newVar.id)) {
            throw new Error(`Variable ID ${newVar.id} is not a valid GUID`);
        }

        return true;
    });

    testRunner.addTest('GUID: Link ID Integration', (app) => {
        const nodeA = app.graph.addNode('PrintString', 0, 0);
        const nodeB = app.graph.addNode('PrintString', 200, 0);

        if (!nodeA || !nodeB) {
            throw new Error('Failed to create nodes for link test');
        }

        const pinA = nodeA.pins.find(p => p.type === 'exec' && p.dir === 'out');
        const pinB = nodeB.pins.find(p => p.type === 'exec' && p.dir === 'in');

        if (!pinA || !pinB) {
            throw new Error('Failed to find exec pins');
        }

        app.wiring.createConnection(pinA, pinB);

        const links = [...app.wiring.links.values()];
        const newLink = links[links.length - 1];

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(newLink.id)) {
            throw new Error(`Link ID ${newLink.id} is not a valid GUID`);
        }

        // Cleanup
        app.wiring.breakLinkById(newLink.id);
        app.graph.nodes.delete(nodeA.id);
        app.graph.nodes.delete(nodeB.id);
        nodeA.element.remove();
        nodeB.element.remove();

        return true;
    });

    testRunner.addTest('GUID: Duplication', (app) => {
        const node = app.graph.addNode('PrintString', 100, 100);
        app.graph.selectNode(node.id);

        // Duplicate
        app.graph.duplicateSelectedNodes();

        // Find the new node (should be the one selected now, or just find the one with different ID)
        const nodes = [...app.graph.nodes.values()];
        const duplicateNode = nodes.find(n => n.nodeKey === 'PrintString' && n.id !== node.id);

        if (!duplicateNode) {
            throw new Error('Duplication failed to create a new node');
        }

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(duplicateNode.id)) {
            throw new Error(`Duplicate Node ID ${duplicateNode.id} is not a valid GUID`);
        }

        if (duplicateNode.id === node.id) {
            throw new Error('Duplicate node has same ID as original');
        }

        // Cleanup
        app.graph.selectNode(duplicateNode.id);
        app.graph.deleteSelectedNodes();
        app.graph.selectNode(node.id);
        app.graph.deleteSelectedNodes();

        return true;
    });
}
