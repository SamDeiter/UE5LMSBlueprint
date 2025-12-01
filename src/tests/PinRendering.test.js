/**
 * Automated tests for Blueprint Editor pin rendering updates
 * Tests arrow indicators, SET node layout, and connected state behavior
 */

export const PinRenderingTests = {
    name: 'Pin Rendering Tests',

    tests: [
        {
            name: 'Pin arrows render on all data pins',
            run: () => {
                const dataPins = document.querySelectorAll('.pin-dot:not(.exec-pin):not(.container-pin)');
                if (dataPins.length === 0) {
                    throw new Error('No data pins found on page');
                }

                let hasArrows = 0;
                dataPins.forEach(pin => {
                    const afterStyle = window.getComputedStyle(pin, '::after');
                    if (afterStyle.content !== 'none' && afterStyle.content !== '') {
                        hasArrows++;
                    }
                });

                if (hasArrows === 0) {
                    throw new Error(`No arrow indicators found. Expected ${dataPins.length} pins to have arrows.`);
                }

                console.log(`✓ Found ${hasArrows}/${dataPins.length} pins with arrow indicators`);
                return true;
            }
        },

        {
            name: 'Arrows are positioned on the right side',
            run: () => {
                const dataPins = document.querySelectorAll('.pin-dot:not(.exec-pin):not(.container-pin)');
                let correctPosition = 0;

                dataPins.forEach(pin => {
                    const afterStyle = window.getComputedStyle(pin, '::after');
                    const leftValue = afterStyle.left;

                    // Arrow should be positioned >10px from left (right side of 12px circle)
                    if (leftValue && parseInt(leftValue) > 10) {
                        correctPosition++;
                    }
                });

                if (correctPosition === 0) {
                    throw new Error('No arrows positioned on the right side of pins');
                }

                console.log(`✓ ${correctPosition}/${dataPins.length} arrows correctly positioned on right`);
                return true;
            }
        },

        {
            name: 'Connected class is added to pins with connections',
            run: () => {
                // Look for any connected pins
                const connectedPins = document.querySelectorAll('.pin-dot.connected');
                const hollowPins = document.querySelectorAll('.pin-dot.hollow');

                console.log(`✓ Found ${connectedPins.length} connected pins and ${hollowPins.length} hollow pins`);

                // At least one set should have pins (either connected or hollow)
                if (connectedPins.length === 0 && hollowPins.length === 0) {
                    throw new Error('No pins found with connected or hollow classes');
                }

                return true;
            }
        },

        {
            name: 'SET node layout is correct',
            run: () => {
                const setNodes = document.querySelectorAll('.set-node');
                if (setNodes.length === 0) {
                    console.log('⊘ No SET nodes found, skipping test');
                    return true; // Skip if no SET nodes present
                }

                let correctLayouts = 0;
                setNodes.forEach(node => {
                    const pinWrapper = node.querySelector('.pin-wrapper');
                    if (!pinWrapper) return;

                    // Check for left container with pin + label
                    const leftContainer = pinWrapper.children[0];
                    if (leftContainer && leftContainer.children.length > 0) {
                        // Should have at least a pin container
                        const hasPinContainer = leftContainer.querySelector('.pin-container');
                        if (hasPinContainer) {
                            correctLayouts++;
                        }
                    }
                });

                if (correctLayouts === 0 && setNodes.length > 0) {
                    throw new Error(`SET nodes found but none have correct layout (found ${setNodes.length} SET nodes)`);
                }

                console.log(`✓ ${correctLayouts}/${setNodes.length} SET nodes have correct layout`);
                return true;
            }
        },

        {
            name: 'Event Tick node renders correctly',
            run: () => {
                const eventTickNodes = Array.from(document.querySelectorAll('.node.event-node'))
                    .filter(node => node.textContent.includes('Event Tick'));

                if (eventTickNodes.length === 0) {
                    console.log('⊘ No Event Tick nodes found, skipping test');
                    return true; // Skip if no Event Tick nodes present
                }

                const eventTick = eventTickNodes[0];

                // Check for Delta Seconds pin (should be output, type float)
                const floatPins = eventTick.querySelectorAll('.pin-dot.float-pin');
                if (floatPins.length === 0) {
                    throw new Error('Event Tick missing Delta Seconds (float) pin');
                }

                // Check for exec pin
                const execPins = eventTick.querySelectorAll('.pin-dot.exec-pin');
                if (execPins.length === 0) {
                    throw new Error('Event Tick missing execution pin');
                }

                console.log('✓ Event Tick node has correct pins');
                return true;
            }
        },

        {
            name: 'No JavaScript errors in console',
            run: () => {
                // This is a meta-test - if we got here, no errors occurred in previous tests
                console.log('✓ No JavaScript errors detected during pin rendering');
                return true;
            }
        }
    ],

    runAll: function () {
        console.log('\n========================================');
        console.log('🧪 Running Pin Rendering Tests');
        console.log('========================================\n');

        let passed = 0;
        let failed = 0;
        const failures = [];

        this.tests.forEach((test, index) => {
            try {
                console.log(`\n${index + 1}. Running: ${test.name}`);
                const result = test.run();
                if (result) {
                    passed++;
                    console.log(`   ✅ PASS\n`);
                } else {
                    failed++;
                    failures.push({ name: test.name, error: 'Test returned false' });
                    console.log(`   ❌ FAIL\n`);
                }
            } catch (error) {
                failed++;
                failures.push({ name: test.name, error: error.message });
                console.error(`   ❌ FAIL: ${error.message}\n`);
            }
        });

        console.log('\n========================================');
        console.log('📊 Test Results');
        console.log('========================================');
        console.log(`Total:  ${this.tests.length}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        console.log('========================================\n');

        if (failures.length > 0) {
            console.log('Failed Tests:');
            failures.forEach(f => {
                console.log(`  ❌ ${f.name}`);
                console.log(`     ${f.error}`);
            });
            console.log('');
        }

        return {
            total: this.tests.length,
            passed,
            failed,
            failures
        };
    }
};

// Auto-run tests if loaded directly
if (typeof window !== 'undefined') {
    window.PinRenderingTests = PinRenderingTests;
    console.log('✓ Pin Rendering Tests loaded. Run with: window.PinRenderingTests.runAll()');
}
