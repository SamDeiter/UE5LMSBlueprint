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
        const initialCount = app.variables.variables.size;
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
}
