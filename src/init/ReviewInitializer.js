/**
 * ReviewInitializer.js
 *
 * Handles initialization of the ReviewCore SDK for the Blueprint Tool.
 * Maps TEST_SCENARIOS to review items.
 */

import { TEST_SCENARIOS } from "../data/assessment/TestScenarios.js";

export class ReviewInitializer {
  static init(App) {
    const params = new window.URLSearchParams(window.location.search);
    const isReviewMode = params.get("mode") === "review";

    if (!isReviewMode) return;

    console.log("ReviewCore SDK: Initializing in Review Mode...");

    // Map TEST_SCENARIOS to Review Items
    const reviewItems = TEST_SCENARIOS.map((scenario) => ({
      id: scenario.name.replace(/\s+/g, "-").toLowerCase(),
      title: scenario.name,
      description: scenario.description,
      metadata: {
        difficulty: scenario.difficulty,
        expectedIssues: scenario.expectedIssues,
      },
      // When this item is shown, load the scenario into the graph
      onActive: () => {
        if (App.history) {
          // Format scenario for the graph editor's persistence system
          const state = {
            activeGraph: "EventGraph",
            graphs: {
              EventGraph: {
                nodes: scenario.nodes || [],
                links: scenario.links || [],
              },
              ConstructionScript: { nodes: [], links: [] },
            },
            variables: scenario.variables || [],
            components: scenario.components || [],
            pendingRenames: [],
          };

          // Apply state to history and render
          const stateJSON = JSON.stringify(state);
          App.history.applyState(stateJSON);

          if (App.graph) {
            App.graph.renderAllNodes();
            requestAnimationFrame(() => App.graph.drawAllWires());
          }

          if (App.palette) App.palette.populateList();
          if (App.variables) App.variables.renderPanel();
          if (App.compiler) App.compiler.validate();
          if (App.grid) App.grid.draw();
        }
      },
    }));

    // Initialize ReviewCore
    const reviewCore = new window.ReviewCore({
      appId: "ue5-blueprint-tool",
      items: reviewItems,
      storage: new window.ReviewStorage.LocalStorage(),
      onShowItem: (item) => {
        console.log(`Reviewing item: ${item.title}`);
        if (item.onActive) item.onActive();
      },
    });

    // Create and attach UI using the factory
    window.ReviewUI.createBar(reviewCore);

    reviewCore.init().then(() => {
      console.log("ReviewCore SDK: Initialization complete.");
    });

    // Expose for debugging
    window.reviewCore = reviewCore;
  }
}
