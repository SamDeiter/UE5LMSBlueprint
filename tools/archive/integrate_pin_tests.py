"""
Add Pin Rendering tests to the test runner
"""

import os

TESTS_FILE = os.path.join(os.path.dirname(__file__), 'src', 'tests.js')

# Read the file
with open(TESTS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the import section and add our new test
import_section_old = """import { registerComponentTests } from './tests/ComponentsController.test.js';
import { registerGUIDTests } from './tests/guid.test.js';
import { registerComponentHierarchyTests } from './tests/ComponentHierarchy.test.js';
import { registerNeedNodeTests } from './tests/NeedNode.test.js';
import './tests/NodeRegistryTests.js';"""

import_section_new = """import { registerComponentTests } from './tests/ComponentsController.test.js';
import { registerGUIDTests } from './tests/guid.test.js';
import { registerComponentHierarchyTests } from './tests/ComponentHierarchy.test.js';
import { registerNeedNodeTests } from './tests/NeedNode.test.js';
import './tests/NodeRegistryTests.js';
import { PinRenderingTests } from './tests/PinRendering.test.js';"""

content = content.replace(import_section_old, import_section_new)

# Add the pin rendering tests to the runner.register section
# Find where to add it (after registerNeedNodeTests)
register_section_old = """    registerComponentTests(runner);
    registerGUIDTests(runner);
    registerComponentHierarchyTests(runner);
    registerNeedNodeTests(runner);"""

register_section_new = """    registerComponentTests(runner);
    registerGUIDTests(runner);
    registerComponentHierarchyTests(runner);
    registerNeedNodeTests(runner);
    
    // Pin Rendering Tests
    PinRenderingTests.tests.forEach(test => {
        runner.register(test.name, () => test.run());
    });"""

content = content.replace(register_section_old, register_section_new)

# Write back
with open(TESTS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added Pin Rendering tests to test runner")
print("  Tests can now be run with window.runTests() in browser console")
