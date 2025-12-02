import { PIN_TYPES, PIN_COLORS } from '../config/Constants.js';
import { Utils } from '../utils.js';
import { Node } from '../graph/Node.js';

export const registerRefactorTests = (runner) => {
    runner.register('Constants Check', (app) => {
        if (PIN_TYPES.EXEC !== 'exec') throw new Error('PIN_TYPES.EXEC should be "exec"');
        if (PIN_COLORS.exec !== 'var(--color-exec)') throw new Error('PIN_COLORS.exec should be "var(--color-exec)"');
    });

    runner.register('Utils Constant Mapping', (app) => {
        const color = Utils.getPinColor('exec');
        if (color !== 'var(--color-exec)') throw new Error(`Utils.getPinColor('exec') returned ${color}`);

        const typeClass = Utils.getPinTypeClass('exec');
        if (typeClass !== 'exec-pin') throw new Error(`Utils.getPinTypeClass('exec') returned ${typeClass}`);
    });

    runner.register('Node Rendering Sanity', (app) => {
        // Create a dummy node data
        const nodeData = {
            title: 'Test Node',
            type: 'pure-node',
            pins: [
                { id: 'in', name: 'In', type: 'exec', dir: 'in' },
                { id: 'out', name: 'Out', type: 'exec', dir: 'out' }
            ]
        };
        const node = new Node('test-node-1', nodeData, 0, 0, 'TestNode', app);
        const element = node.render();

        if (!element) throw new Error('Node.render() returned null');
        if (element.tagName !== 'DIV') throw new Error('Node.render() should return a DIV');
        if (!element.classList.contains('pure-node')) throw new Error('Node element missing "pure-node" class');
    });
};
