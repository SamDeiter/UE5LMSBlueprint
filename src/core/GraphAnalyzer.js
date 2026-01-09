/**
 * GraphAnalyzer.js - Analyzes Blueprint graphs for common pitfalls
 * Core educational tool for detecting and teaching best practices
 */
import { EventBus } from "./EventBus.js";

/**
 * Issue severity levels
 */
export const IssueSeverity = {
  ERROR: "error", // Will cause crashes/failures
  WARNING: "warning", // Bad practice, potential bugs
  INFO: "info", // Suggestions for improvement
  HINT: "hint", // Educational tips
};

/**
 * Issue categories matching the pitfall document
 */
export const IssueCategory = {
  LOGIC_FLOW: "Logic Flow",
  ARCHITECTURE: "Architecture",
  PERFORMANCE: "Performance",
  NETWORKING: "Networking",
  ANIMATION: "Animation",
  BEST_PRACTICE: "Best Practice",
};

/**
 * Analysis issue object
 */
export class AnalysisIssue {
  constructor(options) {
    this.id = options.id || `issue-${Date.now()}`;
    this.nodeId = options.nodeId;
    this.pinId = options.pinId || null;
    this.severity = options.severity || IssueSeverity.WARNING;
    this.category = options.category || IssueCategory.BEST_PRACTICE;
    this.title = options.title;
    this.message = options.message;
    this.suggestion = options.suggestion || null;
    this.pitfallId = options.pitfallId || null; // Links to documented pitfall
    this.learnMoreUrl = options.learnMoreUrl || null;
  }
}

/**
 * Analysis result
 */
export class AnalysisResult {
  constructor() {
    this.issues = [];
    this.stats = {
      errors: 0,
      warnings: 0,
      info: 0,
      hints: 0,
    };
    this.analyzedAt = Date.now();
    this.score = 100; // Quality score 0-100
  }

  addIssue(issue) {
    this.issues.push(issue);
    this.stats[issue.severity + "s"]++;
    this._recalculateScore();
  }

  _recalculateScore() {
    // Deduct points based on severity
    let deductions = 0;
    deductions += this.stats.errors * 15;
    deductions += this.stats.warnings * 5;
    deductions += this.stats.infos * 1;
    this.score = Math.max(0, 100 - deductions);
  }

  hasErrors() {
    return this.stats.errors > 0;
  }

  getIssuesByNode(nodeId) {
    return this.issues.filter((i) => i.nodeId === nodeId);
  }

  getIssuesByCategory(category) {
    return this.issues.filter((i) => i.category === category);
  }
}

/**
 * GraphAnalyzer - Main analysis engine
 */
export class GraphAnalyzer {
  constructor() {
    this.validators = [];
    this._registerBuiltInValidators();
  }

  /**
   * Register a validator function
   * @param {Function} validator - (nodes, links, context) => AnalysisIssue[]
   */
  registerValidator(validator) {
    this.validators.push(validator);
  }

  /**
   * Analyze a graph for issues
   * @param {Object} graphData - { nodes: [], links: [] }
   * @param {Object} context - Additional context (graphName, app, etc.)
   * @returns {AnalysisResult}
   */
  analyze(graphData, context = {}) {
    const result = new AnalysisResult();
    const nodes = graphData.nodes || [];
    const links = graphData.links || [];

    // Run all validators
    this.validators.forEach((validator) => {
      try {
        const issues = validator(nodes, links, context);
        issues.forEach((issue) => result.addIssue(issue));
      } catch (e) {
        console.error("GraphAnalyzer: Validator error:", e);
      }
    });

    // Emit event for UI updates
    EventBus.emit("graph:analyzed", { result, graphData });

    return result;
  }

  /**
   * Register built-in validators
   */
  _registerBuiltInValidators() {
    // 1. Unconnected Execution Pins
    this.registerValidator(validateUnconnectedExecPins);

    // 2. Orphaned Nodes (not in exec flow)
    this.registerValidator(validateOrphanedNodes);

    // 3. Cast Failed Pins
    this.registerValidator(validateCastNodes);

    // 4. Event Tick Usage
    this.registerValidator(validateTickUsage);

    // 5. Missing Is Valid Checks
    this.registerValidator(validateNullReferenceRisks);

    // 6. Sequence Node Timing
    this.registerValidator(validateSequenceUsage);

    // 7. DoOnce Reset Issues
    this.registerValidator(validateDoOnceNodes);

    // 8. Comment Coverage
    this.registerValidator(validateCommentCoverage);
  }
}

// ============================================================
// VALIDATOR IMPLEMENTATIONS
// ============================================================

/**
 * Pitfall #1: Unconnected Execution Pins
 * Flow nodes with exec pins that aren't connected
 */
function validateUnconnectedExecPins(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();

  // Collect all connected pin IDs
  links.forEach((link) => {
    linkedPinIds.add(link.startPinId);
    linkedPinIds.add(link.endPinId);
  });

  nodes.forEach((node) => {
    if (!node.pins) return;

    // Check output exec pins (excluding events which are entry points)
    const isEvent = node.nodeKey?.startsWith("Event");

    node.pins.forEach((pin) => {
      if (pin.type === "exec" && pin.dir === "out") {
        const pinId = pin.id || `${node.id}-${pin.localId}`;

        if (!linkedPinIds.has(pinId) && !isEvent) {
          // Exception: "Then" pins after Branch/Sequence are often intentionally empty
          if (!["Branch", "Sequence", "MultiGate"].includes(node.nodeKey)) {
            issues.push(
              new AnalysisIssue({
                nodeId: node.id,
                pinId: pinId,
                severity: IssueSeverity.WARNING,
                category: IssueCategory.LOGIC_FLOW,
                title: "Unconnected Execution Pin",
                message: `Node "${node.title}" has an unconnected output execution pin.`,
                suggestion: "Connect this pin or remove the node if unused.",
                pitfallId: 1,
              })
            );
          }
        }
      }
    });
  });

  return issues;
}

/**
 * Pitfall #9: Orphaned Nodes (Spaghetti Detection)
 * Flow nodes not connected to any execution chain
 */
function validateOrphanedNodes(nodes, links) {
  const issues = [];
  const connectedNodeIds = new Set();

  // Find all nodes connected via exec pins
  links.forEach((link) => {
    // Check if this is an exec link
    const isExecLink =
      link.startPinId?.includes("exec") ||
      link.endPinId?.includes("exec") ||
      link.startPinId?.includes("Then") ||
      link.endPinId?.includes("Then");

    if (isExecLink) {
      // Extract node IDs from pin IDs
      const startNodeId = extractNodeId(link.startPinId);
      const endNodeId = extractNodeId(link.endPinId);
      if (startNodeId) connectedNodeIds.add(startNodeId);
      if (endNodeId) connectedNodeIds.add(endNodeId);
    }
  });

  // Event nodes are always connected (entry points)
  nodes.forEach((node) => {
    if (node.nodeKey?.startsWith("Event") || node.type === "event") {
      connectedNodeIds.add(node.id);
    }
  });

  // Pure nodes (no exec) connected to flow nodes are OK
  const pureNodeTypes = ["pure-node", "variable-getter", "variable-setter"];

  nodes.forEach((node) => {
    if (pureNodeTypes.includes(node.type)) return; // Skip pure nodes
    if (node.nodeKey === "Comment") return; // Skip comments

    if (!connectedNodeIds.has(node.id)) {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.INFO,
          category: IssueCategory.LOGIC_FLOW,
          title: "Orphaned Node",
          message: `Node "${node.title}" is not connected to any execution flow.`,
          suggestion: "Connect to an event or remove if unused.",
          pitfallId: 9,
        })
      );
    }
  });

  return issues;
}

/**
 * Pitfall #2: Cast Failed Silence
 * Cast nodes with unconnected Cast Failed pins
 */
function validateCastNodes(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();

  links.forEach((link) => {
    linkedPinIds.add(link.startPinId);
    linkedPinIds.add(link.endPinId);
  });

  nodes.forEach((node) => {
    if (!node.nodeKey?.startsWith("Cast")) return;
    if (!node.pins) return;

    // Find the Cast Failed pin
    const failedPin = node.pins.find(
      (p) =>
        p.name === "Cast Failed" ||
        p.localId === "cast_failed" ||
        p.localId === "CastFailed"
    );

    if (failedPin) {
      const pinId = failedPin.id || `${node.id}-${failedPin.localId}`;

      if (!linkedPinIds.has(pinId)) {
        issues.push(
          new AnalysisIssue({
            nodeId: node.id,
            pinId: pinId,
            severity: IssueSeverity.WARNING,
            category: IssueCategory.LOGIC_FLOW,
            title: "Unhandled Cast Failure",
            message: `Cast node "${node.title}" has no Cast Failed handler.`,
            suggestion:
              "Connect the Cast Failed pin to handle type mismatches gracefully.",
            pitfallId: 2,
          })
        );
      }
    }
  });

  return issues;
}

/**
 * Pitfall #5 (Performance): Event Tick Abuse
 * Heavy usage of Event Tick
 */
function validateTickUsage(nodes, links) {
  const issues = [];

  // Find EventTick node
  const tickNode = nodes.find((n) => n.nodeKey === "EventTick");
  if (!tickNode) return issues;

  // Count nodes connected to tick
  const connectedToTick = countConnectedFlowNodes(tickNode.id, nodes, links);

  // Flag expensive operations
  const expensiveNodes = [
    "LineTraceByChannel",
    "SphereOverlapActors",
    "GetAllActorsOfClass",
    "SpawnActor",
  ];

  const expensiveInTick = nodes.filter(
    (n) =>
      expensiveNodes.includes(n.nodeKey) &&
      isConnectedToNode(tickNode.id, n.id, links)
  );

  if (connectedToTick > 10) {
    issues.push(
      new AnalysisIssue({
        nodeId: tickNode.id,
        severity: IssueSeverity.WARNING,
        category: IssueCategory.PERFORMANCE,
        title: "Heavy Tick Usage",
        message: `Event Tick has ${connectedToTick} connected nodes.`,
        suggestion:
          "Consider using Timers or Event-Driven architecture instead.",
        pitfallId: "PERF-1",
      })
    );
  }

  expensiveInTick.forEach((node) => {
    issues.push(
      new AnalysisIssue({
        nodeId: node.id,
        severity: IssueSeverity.ERROR,
        category: IssueCategory.PERFORMANCE,
        title: "Expensive Operation in Tick",
        message: `"${node.title}" runs every frame - this is very costly.`,
        suggestion: "Use a Timer with longer interval or trigger on events.",
        pitfallId: "PERF-2",
      })
    );
  });

  return issues;
}

/**
 * Pitfall #1: Missing Is Valid Checks
 * Accessing object properties without null checks
 */
function validateNullReferenceRisks(nodes, links) {
  const issues = [];

  // Nodes that produce object references that might be null
  const nullRiskProducers = [
    "GetPlayerCharacter",
    "GetPlayerController",
    "GetOwner",
    "GetParentActor",
    "SpawnActor",
    "GetActorOfClass",
  ];

  nodes.forEach((node) => {
    if (!nullRiskProducers.includes(node.nodeKey)) return;

    // Check if followed by Is Valid
    const followingNodes = getFollowingNodes(node.id, links, nodes);
    const hasValidCheck = followingNodes.some(
      (n) => n.nodeKey === "IsValid" || n.nodeKey === "IsValidObject"
    );

    if (!hasValidCheck && followingNodes.length > 0) {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.WARNING,
          category: IssueCategory.LOGIC_FLOW,
          title: "Potential Null Reference",
          message: `"${node.title}" result used without Is Valid check.`,
          suggestion:
            "Add Is Valid node before accessing properties to prevent crashes.",
          pitfallId: 1,
        })
      );
    }
  });

  return issues;
}

/**
 * Pitfall #5: Sequence Node Timing Myths
 */
function validateSequenceUsage(nodes, links) {
  const issues = [];

  const sequenceNodes = nodes.filter((n) => n.nodeKey === "Sequence");

  sequenceNodes.forEach((seqNode) => {
    // Check if any branch contains a Delay
    const branches = getSequenceBranches(seqNode.id, links, nodes);

    let hasDelayBranch = false;
    let hasNonDelayBranch = false;

    branches.forEach((branch) => {
      const branchNodes = getNodesInBranch(branch, links, nodes);
      if (branchNodes.some((n) => n.nodeKey === "Delay")) {
        hasDelayBranch = true;
      } else {
        hasNonDelayBranch = true;
      }
    });

    if (hasDelayBranch && hasNonDelayBranch) {
      issues.push(
        new AnalysisIssue({
          nodeId: seqNode.id,
          severity: IssueSeverity.INFO,
          category: IssueCategory.LOGIC_FLOW,
          title: "Sequence with Mixed Timing",
          message:
            "Sequence has branches with Delay nodes. Remember: Sequence does NOT wait for delays.",
          suggestion:
            "All branches execute immediately. If order matters, chain delays instead.",
          pitfallId: 5,
        })
      );
    }
  });

  return issues;
}

/**
 * Pitfall #7: DoOnce Reset Failures
 */
function validateDoOnceNodes(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();

  links.forEach((link) => {
    linkedPinIds.add(link.startPinId);
    linkedPinIds.add(link.endPinId);
  });

  const doOnceNodes = nodes.filter((n) => n.nodeKey === "DoOnce");

  doOnceNodes.forEach((node) => {
    // Check if Reset pin is connected
    const resetPin = node.pins?.find(
      (p) => p.name === "Reset" || p.localId === "reset"
    );

    if (resetPin) {
      const pinId = resetPin.id || `${node.id}-${resetPin.localId}`;

      if (!linkedPinIds.has(pinId)) {
        issues.push(
          new AnalysisIssue({
            nodeId: node.id,
            severity: IssueSeverity.HINT,
            category: IssueCategory.LOGIC_FLOW,
            title: "DoOnce Without Reset",
            message: "DoOnce node has no Reset connection.",
            suggestion:
              "Consider if you need to reset this gate. If intentionally one-time, ignore.",
            pitfallId: 7,
          })
        );
      }
    }
  });

  return issues;
}

/**
 * Best Practice: Comment Coverage
 */
function validateCommentCoverage(nodes, _links) {
  const issues = [];

  const nonCommentNodes = nodes.filter((n) => n.nodeKey !== "Comment");
  const commentNodes = nodes.filter((n) => n.nodeKey === "Comment");

  if (nonCommentNodes.length > 15 && commentNodes.length === 0) {
    issues.push(
      new AnalysisIssue({
        nodeId: null,
        severity: IssueSeverity.INFO,
        category: IssueCategory.BEST_PRACTICE,
        title: "No Comments in Graph",
        message: `Graph has ${nonCommentNodes.length} nodes but no comment boxes.`,
        suggestion:
          "Add Comment nodes (C key) to document complex logic sections.",
        pitfallId: 9,
      })
    );
  }

  return issues;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function extractNodeId(pinId) {
  if (!pinId) return null;
  const parts = pinId.split("-");
  if (parts.length >= 5) {
    return parts.slice(0, 5).join("-");
  }
  return null;
}

function countConnectedFlowNodes(startNodeId, nodes, links) {
  const visited = new Set();
  const queue = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    // Find outgoing exec links
    links.forEach((link) => {
      const startId = extractNodeId(link.startPinId);
      const endId = extractNodeId(link.endPinId);

      if (startId === nodeId && endId && !visited.has(endId)) {
        queue.push(endId);
      }
    });
  }

  return visited.size;
}

function isConnectedToNode(fromNodeId, toNodeId, links) {
  // Simple check - would need full graph traversal for accuracy
  return links.some((link) => {
    const startId = extractNodeId(link.startPinId);
    const endId = extractNodeId(link.endPinId);
    return (
      (startId === fromNodeId && endId === toNodeId) ||
      (startId === toNodeId && endId === fromNodeId)
    );
  });
}

function getFollowingNodes(nodeId, links, nodes) {
  const following = [];
  links.forEach((link) => {
    const startId = extractNodeId(link.startPinId);
    const endId = extractNodeId(link.endPinId);

    if (startId === nodeId) {
      const node = nodes.find((n) => n.id === endId);
      if (node) following.push(node);
    }
  });
  return following;
}

function getSequenceBranches(seqNodeId, _links, _nodes) {
  // Simplified - returns empty for now
  return [];
}

function getNodesInBranch(_branchPinId, _links, _nodes) {
  // Simplified - returns empty for now
  return [];
}

// Singleton instance
export const graphAnalyzer = new GraphAnalyzer();
