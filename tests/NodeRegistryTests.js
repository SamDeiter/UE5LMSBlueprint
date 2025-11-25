/**
 * Node Registry Tests
 * Verifies that all required nodes are properly registered
 */

import { nodeRegistry } from '../registries/NodeRegistry.js';

export class NodeRegistryTests {
    constructor() {
        this.results = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, condition, message = '') {
        const result = {
            name,
            passed: condition,
            message: message || (condition ? 'PASS' : 'FAIL')
        };
        this.results.push(result);

        if (condition) {
            this.passed++;
            console.log(`✅ ${name}: ${result.message}`);
        } else {
            this.failed++;
            console.error(`❌ ${name}: ${result.message}`);
        }

        return condition;
    }

    runAllTests() {
        console.log('🧪 Starting Node Registry Tests...\n');

        // Test new integer math nodes
        this.testIntegerMathNodes();

        // Test comparison operators
        this.testComparisonOperators();

        // Test string operations
        this.testStringOperations();

        // Test existing critical nodes
        this.testCriticalNodes();

        // Print summary
        this.printSummary();

        return this.failed === 0;
    }

    testIntegerMathNodes() {
        console.log('\n📐 Testing Integer Math Nodes...');

        this.test(
            'SubtractInt exists',
            nodeRegistry.has('SubtractInt'),
            'SubtractInt node is registered'
        );

        this.test(
            'MultiplyInt exists',
            nodeRegistry.has('MultiplyInt'),
            'MultiplyInt node is registered'
        );

        this.test(
            'DivideInt exists',
            nodeRegistry.has('DivideInt'),
            'DivideInt node is registered'
        );

        // Verify pin structure
        const subtractNode = nodeRegistry.get('SubtractInt');
        if (subtractNode) {
            this.test(
                'SubtractInt has correct pins',
                subtractNode.pins && subtractNode.pins.length === 3,
                `SubtractInt has ${subtractNode.pins?.length || 0} pins (expected 3)`
            );
        }
    }

    testComparisonOperators() {
        console.log('\n🔍 Testing Comparison Operators...');

        const operators = [
            'Greater',
            'GreaterEqual',
            'Less',
            'LessEqual',
            'EqualEqual',
            'NotEqual'
        ];

        operators.forEach(op => {
            this.test(
                `${op} exists`,
                nodeRegistry.has(op),
                `${op} operator is registered`
            );

            const node = nodeRegistry.get(op);
            if (node) {
                this.test(
                    `${op} returns boolean`,
                    node.pins && node.pins.some(p => p.type === 'bool' && p.dir === 'out'),
                    `${op} has boolean output pin`
                );
            }
        });
    }

    testStringOperations() {
        console.log('\n📝 Testing String Operations...');

        this.test(
            'Append exists',
            nodeRegistry.has('Append'),
            'Append (string concatenation) is registered'
        );

        const appendNode = nodeRegistry.get('Append');
        if (appendNode) {
            this.test(
                'Append has string inputs',
                appendNode.pins && appendNode.pins.filter(p => p.type === 'string' && p.dir === 'in').length === 2,
                'Append has 2 string input pins'
            );

            this.test(
                'Append has string output',
                appendNode.pins && appendNode.pins.some(p => p.type === 'string' && p.dir === 'out'),
                'Append has string output pin'
            );
        }
    }

    testCriticalNodes() {
        console.log('\n⚡ Testing Critical Nodes...');

        const criticalNodes = [
            'EventBeginPlay',
            'PrintString',
            'Branch',
            'AddInt',
            'AddFloat',
            'DoOnce',
            'Gate',
            'ForLoop',
            'Sequence',
            'FlipFlop',
            'AND',
            'OR',
            'NOT'
        ];

        criticalNodes.forEach(nodeKey => {
            this.test(
                `${nodeKey} exists`,
                nodeRegistry.has(nodeKey),
                `${nodeKey} is registered`
            );
        });
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`Pass Rate: ${((this.passed / this.results.length) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));

        if (this.failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results
                .filter(r => !r.passed)
                .forEach(r => console.log(`  - ${r.name}: ${r.message}`));
        } else {
            console.log('\n🎉 All tests passed!');
        }
    }

    getReport() {
        return {
            total: this.results.length,
            passed: this.passed,
            failed: this.failed,
            passRate: (this.passed / this.results.length) * 100,
            results: this.results
        };
    }
}

// Auto-run tests when imported
if (typeof window !== 'undefined') {
    window.runNodeTests = () => {
        const tests = new NodeRegistryTests();
        const success = tests.runAllTests();
        return tests.getReport();
    };

    console.log('💡 Node tests loaded. Run window.runNodeTests() to execute.');
}

export default NodeRegistryTests;
