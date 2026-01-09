/**
 * GraphAnalyzer.test.js - Tests for Blueprint pitfall detection
 */
import { graphAnalyzer, IssueSeverity } from "../../core/GraphAnalyzer.js";
import {
  SCENARIO_NULL_REFERENCE,
  SCENARIO_CAST_FAILED,
  SCENARIO_TICK_ABUSE,
  SCENARIO_NETWORK_AUTHORITY,
  SCENARIO_ORPHANED_NODES,
} from "../../data/assessment/TestScenarios.js";

export function registerGraphAnalyzerTests(runner) {
  runner.registerTest("GraphAnalyzer - Detects Null Reference Risks", () => {
    const result = graphAnalyzer.analyze(SCENARIO_NULL_REFERENCE);

    const nullRefIssue = result.issues.find(
      (i) => i.title === "Potential Null Reference"
    );

    if (!nullRefIssue) {
      throw new Error("Expected to detect null reference risk");
    }

    return true;
  });

  runner.registerTest("GraphAnalyzer - Detects Unhandled Cast Failure", () => {
    const result = graphAnalyzer.analyze(SCENARIO_CAST_FAILED);

    const castIssue = result.issues.find(
      (i) => i.title === "Unhandled Cast Failure"
    );

    if (!castIssue) {
      throw new Error("Expected to detect unhandled cast failure");
    }

    return true;
  });

  runner.registerTest(
    "GraphAnalyzer - Detects Expensive Tick Operations",
    () => {
      const result = graphAnalyzer.analyze(SCENARIO_TICK_ABUSE);

      const tickIssues = result.issues.filter(
        (i) => i.category === "Performance"
      );

      if (tickIssues.length === 0) {
        throw new Error("Expected to detect performance issues in tick");
      }

      // Should have at least one ERROR severity for expensive operations
      const hasError = tickIssues.some(
        (i) => i.severity === IssueSeverity.ERROR
      );
      if (!hasError) {
        throw new Error("Expected ERROR severity for tick abuse");
      }

      return true;
    }
  );

  runner.registerTest(
    "GraphAnalyzer - Detects Network Authority Issues",
    () => {
      const result = graphAnalyzer.analyze(SCENARIO_NETWORK_AUTHORITY);

      const networkIssue = result.issues.find(
        (i) => i.category === "Networking"
      );

      if (!networkIssue) {
        throw new Error("Expected to detect network authority issues");
      }

      return true;
    }
  );

  runner.registerTest("GraphAnalyzer - Detects Orphaned Nodes", () => {
    const result = graphAnalyzer.analyze(SCENARIO_ORPHANED_NODES);

    const orphanIssue = result.issues.find((i) => i.title === "Orphaned Node");

    if (!orphanIssue) {
      throw new Error("Expected to detect orphaned nodes");
    }

    return true;
  });

  runner.registerTest("GraphAnalyzer - Quality Score Calculation", () => {
    const result = graphAnalyzer.analyze(SCENARIO_TICK_ABUSE);

    // Score should be less than 100 due to issues
    if (result.score >= 100) {
      throw new Error("Expected quality score to decrease with issues");
    }

    // Verify stats are tracked
    if (result.stats.errors === 0 && result.stats.warnings === 0) {
      throw new Error("Expected stats to track issues");
    }

    return true;
  });

  runner.registerTest("GraphAnalyzer - Clean Graph Returns High Score", () => {
    const cleanGraph = {
      nodes: [
        {
          id: "node-1",
          nodeKey: "EventBeginPlay",
          title: "Event BeginPlay",
          type: "event",
          pins: [],
        },
      ],
      links: [],
    };

    const result = graphAnalyzer.analyze(cleanGraph);

    // Simple clean graph should have high score
    if (result.score < 80) {
      throw new Error("Expected high score for clean graph");
    }

    return true;
  });
}
