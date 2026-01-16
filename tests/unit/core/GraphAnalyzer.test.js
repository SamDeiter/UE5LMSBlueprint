import { describe, it, expect, beforeEach } from "vitest";
import {
  GraphAnalyzer,
  IssueSeverity,
  IssueCategory,
} from "../../../src/core/GraphAnalyzer.js";

describe("GraphAnalyzer", () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new GraphAnalyzer();
  });

  describe("validateUnconnectedExecPins", () => {
    it("should detect unconnected output exec pins", () => {
      const nodes = [
        {
          id: "node-1",
          title: "Print String",
          nodeKey: "PrintString",
          pins: [
            { id: "node-1-exec", type: "exec", dir: "out", localId: "exec" },
          ],
        },
      ];
      const links = []; // No connections

      const result = analyzer.analyze({ nodes, links });
      const pinIssues = result.issues.filter(
        (i) => i.title === "Unconnected Execution Pin"
      );

      expect(pinIssues).toHaveLength(1);
      expect(pinIssues[0].nodeId).toBe("node-1");
    });

    it("should ignore unconnected exec pins on Branch or Sequence", () => {
      const nodes = [
        {
          id: "node-1",
          title: "Branch",
          nodeKey: "Branch",
          pins: [
            { id: "node-1-true", type: "exec", dir: "out" },
            { id: "node-1-false", type: "exec", dir: "out" },
          ],
        },
      ];
      const result = analyzer.analyze({ nodes, links: [] });
      const pinIssues = result.issues.filter(
        (i) => i.title === "Unconnected Execution Pin"
      );
      expect(pinIssues).toHaveLength(0);
    });
  });

  describe("validateOrphanedNodes", () => {
    it("should flag nodes that are not reachable from an Event", () => {
      const nodes = [
        {
          id: "event-1",
          title: "Begin Play",
          nodeKey: "EventBeginPlay",
          type: "event",
        },
        { id: "node-2", title: "Print 1", nodeKey: "PrintString" },
        { id: "node-3", title: "Print 2", nodeKey: "PrintString" },
      ];
      const links = [{ startPinId: "event-1-exec", endPinId: "node-2-exec" }];

      const result = analyzer.analyze({ nodes, links });
      const orphaned = result.issues.filter((i) => i.title === "Orphaned Node");

      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].nodeId).toBe("node-3");
    });

    it("should handle complex reachable chains", () => {
      const nodes = [
        { id: "node-e1", nodeKey: "EventBeginPlay", type: "event" },
        { id: "node-n1", nodeKey: "PrintString" },
        { id: "node-n2", nodeKey: "PrintString" },
      ];
      const links = [
        { startPinId: "node-e1-exec", endPinId: "node-n1-exec" },
        { startPinId: "node-n1-exec", endPinId: "node-n2-exec" },
      ];
      const result = analyzer.analyze({ nodes, links });
      expect(
        result.issues.filter((i) => i.title === "Orphaned Node")
      ).toHaveLength(0);
    });
  });

  describe("validateTickUsage", () => {
    it("should flag expensive nodes when a Tick event exists", () => {
      const nodes = [
        { id: "n1", nodeKey: "EventTick" },
        { id: "n2", nodeKey: "GetAllActorsOfClass", title: "Get All Actors" },
      ];
      const result = analyzer.analyze({ nodes, links: [] });
      const perfIssues = result.issues.filter(
        (i) => i.category === IssueCategory.PERFORMANCE
      );

      expect(perfIssues).toHaveLength(1);
      expect(perfIssues[0].severity).toBe(IssueSeverity.ERROR);
    });
  });

  describe("AnalysisResult", () => {
    it("should calculate score correctly based on issues", () => {
      const result = analyzer.analyze({ nodes: [], links: [] });
      expect(result.score).toBe(100);

      // Add one error (-15) and one warning (-5)
      result.addIssue({ severity: IssueSeverity.ERROR });
      result.addIssue({ severity: IssueSeverity.WARNING });

      expect(result.score).toBe(80);
    });
  });
});
