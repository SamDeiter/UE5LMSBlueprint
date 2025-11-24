/**
 * Extends BlueprintApp with graph switching capability
 * This file runs after app.js to add the switchGraph functionality
 */
import { GraphSwitcher } from './graph/GraphSwitcher.js';

// Wait for BlueprintApp to initialize
window.addEventListener('load', () => {
    // Small delay to ensure app.js init() has completed
    setTimeout(() => {
        if (window.app && window.app.graph) {
            window.app.graphSwitcher = new GraphSwitcher(window.app);
            window.app.switchGraph = (graphName) => window.app.graphSwitcher.switchGraph(graphName);
            console.log('GraphSwitcher initialized');
        } else {
            console.error('BlueprintApp (window.app) not found - cannot initialize GraphSwitcher');
        }
    }, 100);
});
