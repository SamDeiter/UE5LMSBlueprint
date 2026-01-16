/**
 * ReviewInitializer.js
 *
 * Handles initialization of the ReviewCore SDK for the Blueprint Tool.
 * Supports loading scenarios from:
 * - TEST_SCENARIOS (default, 5 test scenarios)
 * - raw_data.json (full 21+ scenarios from Scenario Tracker)
 *
 * URL Parameters:
 * - mode=review : Enable review mode
 * - source=full : Load all scenarios from raw_data.json
 * - source=test : Load only test scenarios (default)
 */
/* global fetch */

import { TEST_SCENARIOS } from "../data/assessment/TestScenarios.js";

export class ReviewInitializer {
  static async init(App) {
    const params = new window.URLSearchParams(window.location.search);
    const isReviewMode = params.get("mode") === "review";
    const source = params.get("source") || "test"; // 'test' or 'full'

    if (!isReviewMode) return;

    console.log("ReviewCore SDK: Initializing in Review Mode...");
    console.log(`Scenario source: ${source}`);

    // Hide the Task selector in Review Mode to simplify the UI
    const taskSelectorGroup = document
      .querySelector("#task-selector")
      ?.closest(".group");
    if (taskSelectorGroup) {
      taskSelectorGroup.style.display = "none";
    }

    // Load scenarios based on source parameter
    let reviewItems;
    if (source === "full") {
      reviewItems = await this.loadFullScenarios();
    } else {
      reviewItems = this.loadTestScenarios(App);
    }

    if (reviewItems.length === 0) {
      console.warn("ReviewCore SDK: No scenarios loaded!");
      return;
    }

    console.log(`Loaded ${reviewItems.length} scenarios for review`);

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

  /**
   * Load test scenarios (5 scenarios with node graphs)
   */
  static loadTestScenarios(App) {
    return TEST_SCENARIOS.map((scenario) => ({
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
  }

  /**
   * Load full scenarios from raw_data.json (46+ scenarios)
   * These are text-based scenarios without node graphs
   */
  static async loadFullScenarios() {
    try {
      // Try multiple possible locations for raw_data.json
      // Same-origin first to avoid CORS issues
      const possibleUrls = [
        "/raw_data.json", // Same server (preferred)
        "./raw_data.json", // Relative path
        "http://localhost:8080/raw_data.json", // Scenario Tracker server
      ];

      let rawData = null;
      for (const url of possibleUrls) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            rawData = await response.json();
            console.log(`Loaded scenarios from: ${url}`);
            break;
          }
        } catch {
          // Try next URL
        }
      }

      if (!rawData) {
        console.error("Could not load raw_data.json from any source");
        return [];
      }

      // Map to review items
      return rawData.map((entry, index) => {
        const scenario = entry.scenario;
        const key = entry.key;

        // Parse difficulty from key (e.g., "LightingRendering_Beginner")
        const difficultyMatch = key.match(/_([A-Za-z]+)$/);
        const difficulty = difficultyMatch ? difficultyMatch[1] : "Unknown";

        // Extract short issue hints from common_wrong_steps
        const expectedIssues = (scenario.common_wrong_steps || [])
          .slice(0, 2)
          .map(
            (step) =>
              step.step_description.split(" ").slice(0, 4).join(" ") + "...",
          );

        return {
          id: scenario.scenario_id || `scenario-${index}`,
          title: scenario.title,
          description: scenario.problem_description,
          metadata: {
            key: key,
            difficulty: difficulty,
            focusArea: scenario.focus_area,
            estimatedHours: scenario.estimated_hours,
            expectedIssues: expectedIssues,
            correctStepsCount: (scenario.correct_solution_steps || []).length,
          },
          fullData: scenario,
          onActive: () => {
            // For text-based scenarios, show info in console
            console.log("=== Scenario Details ===");
            console.log(`Title: ${scenario.title}`);
            console.log(`Focus Area: ${scenario.focus_area}`);
            console.log(`Estimated Time: ${scenario.estimated_hours} hours`);
            console.log(
              `Correct Steps: ${(scenario.correct_solution_steps || []).length}`,
            );
          },
        };
      });
    } catch (error) {
      console.error("Failed to load full scenarios:", error);
      return [];
    }
  }
}
