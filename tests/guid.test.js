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

    testRunner.addTest('GUID: Serialization Persistence', (app) => {
        // Clear graph to start fresh
        app.graph.nodes.forEach(node => app.graph.removeNode(node.id));
        app.wiring.links.clear();
        app.variables.variables.clear();

        // Create test entities
        const nodeA = app.graph.addNode('PrintString', 100, 100);
        const nodeB = app.graph.addNode('PrintString', 300, 100);
        app.variables.addVariable();

        const variable = [...app.variables.variables.values()][0];
        const pinA = nodeA.pins.find(p => p.type === 'exec' && p.dir === 'out');
        const pinB = nodeB.pins.find(p => p.type === 'exec' && p.dir === 'in');
        app.wiring.createConnection(pinA, pinB);

        const link = [...app.wiring.links.values()][0];

        // Store original GUIDs
        const originalNodeAId = nodeA.id;
        const originalNodeBId = nodeB.id;
        const originalVariableId = variable.id;
        const originalLinkId = link.id;

        // Verify they're all valid GUIDs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(originalNodeAId)) {
            throw new Error(`Node A ID ${originalNodeAId} is not a valid GUID`);
        }
        if (!uuidRegex.test(originalNodeBId)) {
            throw new Error(`Node B ID ${originalNodeBId} is not a valid GUID`);
        }
        if (!uuidRegex.test(originalVariableId)) {
            throw new Error(`Variable ID ${originalVariableId} is not a valid GUID`);
        }
        if (!uuidRegex.test(originalLinkId)) {
            throw new Error(`Link ID ${originalLinkId} is not a valid GUID`);
        }

        // Save state
        app.persistence.save(true);

        // Clear everything
        app.graph.nodes.forEach(node => app.graph.removeNode(node.id));
        app.wiring.links.clear();
        app.variables.variables.clear();

        // Verify cleared
        if (app.graph.nodes.size !== 0) {
            throw new Error('Graph not cleared before reload');
        }

        // Load state
        app.persistence.load();

        // Verify GUIDs are preserved (not regenerated)
        const loadedNodes = [...app.graph.nodes.values()];
        const loadedNodeA = loadedNodes.find(n => n.id === originalNodeAId);
        const loadedNodeB = loadedNodes.find(n => n.id === originalNodeBId);

        if (!loadedNodeA) {
            throw new Error(`Node A with ID ${originalNodeAId} not found after load`);
        }
        if (!loadedNodeB) {
            throw new Error(`Node B with ID ${originalNodeBId} not found after load`);
        }

        const loadedVariable = app.variables.variables.get(variable.name);
        if (!loadedVariable) {
            throw new Error(`Variable ${variable.name} not found after load`);
        }
        if (loadedVariable.id !== originalVariableId) {
            throw new Error(`Variable ID changed from ${originalVariableId} to ${loadedVariable.id}`);
        }

        const loadedLinks = [...app.wiring.links.values()];
        const loadedLink = loadedLinks.find(l => l.id === originalLinkId);
        if (!loadedLink) {
            throw new Error(`Link with ID ${originalLinkId} not found after load`);
        }

        return true;
    });
}
