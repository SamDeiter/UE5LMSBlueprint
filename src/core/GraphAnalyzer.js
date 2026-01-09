/**
 * GraphAnalyzer.js - Analyzes Blueprint graphs for common pitfalls
 * Core educational tool for detecting and teaching best practices
 */
import { EventBus } from "./EventBus.js";

/**
 * Issue severity levels
 */
export const IssueSeverity = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  HINT: "hint",
};

/**
 * Issue categories
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
 * Analysis issue
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
    this.pitfallId = options.pitfallId || null;
  }
}

/**
 * Analysis result
 */
export class AnalysisResult {
  constructor() {
    this.issues = [];
    this.stats = { errors: 0, warnings: 0, infos: 0, hints: 0 };
    this.analyzedAt = Date.now();
    this.score = 100;
  }

  addIssue(issue) {
    this.issues.push(issue);
    if (issue.severity === IssueSeverity.ERROR) this.stats.errors++;
    else if (issue.severity === IssueSeverity.WARNING) this.stats.warnings++;
    else if (issue.severity === IssueSeverity.INFO) this.stats.infos++;
    else this.stats.hints++;
    this._recalculateScore();
  }

  _recalculateScore() {
    let deductions =
      this.stats.errors * 15 + this.stats.warnings * 5 + this.stats.infos * 1;
    this.score = Math.max(0, 100 - deductions);
  }

  hasErrors() {
    return this.stats.errors > 0;
  }
  getIssuesByNode(nodeId) {
    return this.issues.filter((i) => i.nodeId === nodeId);
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

  registerValidator(validator) {
    this.validators.push(validator);
  }

  analyze(graphData, context = {}) {
    const result = new AnalysisResult();
    const nodes = graphData.nodes || [];
    const links = graphData.links || [];

    this.validators.forEach((validator) => {
      try {
        const issues = validator(nodes, links, context);
        issues.forEach((issue) => result.addIssue(issue));
      } catch (e) {
        console.error("GraphAnalyzer: Validator error:", e);
      }
    });

    EventBus.emit("graph:analyzed", { result, graphData });
    return result;
  }

  _registerBuiltInValidators() {
    this.registerValidator(validateUnconnectedExecPins);
    this.registerValidator(validateOrphanedNodes);
    this.registerValidator(validateCastNodes);
    this.registerValidator(validateTickUsage);
    this.registerValidator(validateNullReferenceRisks);
    this.registerValidator(validateSequenceUsage);
    this.registerValidator(validateDoOnceNodes);
    this.registerValidator(validateCommentCoverage);
    // Networking validators
    this.registerValidator(validateNetworkAuthority);
    this.registerValidator(validateRPCUsage);
    this.registerValidator(validateReplicationPatterns);
    // Animation validators
    this.registerValidator(validateAnimationPatterns);
  }
}

// ============================================================
// LOGIC FLOW VALIDATORS
// ============================================================

function validateUnconnectedExecPins(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();
  links.forEach((link) => {
    linkedPinIds.add(link.startPinId);
    linkedPinIds.add(link.endPinId);
  });

  nodes.forEach((node) => {
    if (!node.pins) return;
    const isEvent = node.nodeKey?.startsWith("Event");

    node.pins.forEach((pin) => {
      if (pin.type === "exec" && pin.dir === "out") {
        const pinId = pin.id || `${node.id}-${pin.localId}`;
        if (!linkedPinIds.has(pinId) && !isEvent) {
          if (!["Branch", "Sequence", "MultiGate"].includes(node.nodeKey)) {
            issues.push(
              new AnalysisIssue({
                nodeId: node.id,
                pinId,
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

function validateOrphanedNodes(nodes, links) {
  const issues = [];
  const connectedNodeIds = new Set();

  links.forEach((link) => {
    const isExecLink =
      link.startPinId?.includes("exec") || link.endPinId?.includes("exec");
    if (isExecLink) {
      const startId = extractNodeId(link.startPinId);
      const endId = extractNodeId(link.endPinId);
      if (startId) connectedNodeIds.add(startId);
      if (endId) connectedNodeIds.add(endId);
    }
  });

  nodes.forEach((node) => {
    if (node.nodeKey?.startsWith("Event")) connectedNodeIds.add(node.id);
  });

  const pureTypes = ["pure-node", "variable-getter", "variable-setter"];
  nodes.forEach((node) => {
    if (pureTypes.includes(node.type) || node.nodeKey === "Comment") return;
    if (!connectedNodeIds.has(node.id)) {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.INFO,
          category: IssueCategory.LOGIC_FLOW,
          title: "Orphaned Node",
          message: `Node "${node.title}" is not in any execution flow.`,
          suggestion: "Connect to an event or remove if unused.",
          pitfallId: 9,
        })
      );
    }
  });
  return issues;
}

function validateCastNodes(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();
  links.forEach((link) => {
    linkedPinIds.add(link.startPinId);
    linkedPinIds.add(link.endPinId);
  });

  nodes.forEach((node) => {
    if (!node.nodeKey?.startsWith("Cast")) return;
    const failedPin = node.pins?.find(
      (p) => p.name === "Cast Failed" || p.localId === "cast_failed"
    );
    if (failedPin) {
      const pinId = failedPin.id || `${node.id}-${failedPin.localId}`;
      if (!linkedPinIds.has(pinId)) {
        issues.push(
          new AnalysisIssue({
            nodeId: node.id,
            pinId,
            severity: IssueSeverity.WARNING,
            category: IssueCategory.LOGIC_FLOW,
            title: "Unhandled Cast Failure",
            message: `Cast node "${node.title}" has no Cast Failed handler.`,
            suggestion:
              "Connect the Cast Failed pin to handle type mismatches.",
            pitfallId: 2,
          })
        );
      }
    }
  });
  return issues;
}

function validateTickUsage(nodes, _links) {
  const issues = [];
  const tickNode = nodes.find((n) => n.nodeKey === "EventTick");
  if (!tickNode) return issues;

  const expensiveNodes = [
    "LineTraceByChannel",
    "SphereOverlapActors",
    "GetAllActorsOfClass",
    "SpawnActor",
  ];
  const expensiveInTick = nodes.filter((n) =>
    expensiveNodes.includes(n.nodeKey)
  );

  expensiveInTick.forEach((node) => {
    issues.push(
      new AnalysisIssue({
        nodeId: node.id,
        severity: IssueSeverity.ERROR,
        category: IssueCategory.PERFORMANCE,
        title: "Expensive Operation in Tick",
        message: `"${node.title}" should not run every frame.`,
        suggestion: "Use Timers or event-driven architecture.",
        pitfallId: "PERF-2",
      })
    );
  });
  return issues;
}

function validateNullReferenceRisks(nodes, links) {
  const issues = [];
  const nullRiskProducers = [
    "GetPlayerCharacter",
    "GetPlayerController",
    "GetOwner",
    "SpawnActor",
  ];

  nodes.forEach((node) => {
    if (!nullRiskProducers.includes(node.nodeKey)) return;
    const following = getFollowingNodes(node.id, links, nodes);
    const hasValidCheck = following.some((n) => n.nodeKey === "IsValid");

    if (!hasValidCheck && following.length > 0) {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.WARNING,
          category: IssueCategory.LOGIC_FLOW,
          title: "Potential Null Reference",
          message: `"${node.title}" used without Is Valid check.`,
          suggestion: "Add Is Valid node before accessing properties.",
          pitfallId: 1,
        })
      );
    }
  });
  return issues;
}

function validateSequenceUsage(nodes, _links) {
  const issues = [];
  const sequenceNodes = nodes.filter((n) => n.nodeKey === "Sequence");
  if (sequenceNodes.length > 3) {
    issues.push(
      new AnalysisIssue({
        nodeId: sequenceNodes[0].id,
        severity: IssueSeverity.INFO,
        category: IssueCategory.BEST_PRACTICE,
        title: "Many Sequence Nodes",
        message: `Graph has ${sequenceNodes.length} Sequence nodes.`,
        suggestion: "Consider refactoring into Functions for clarity.",
      })
    );
  }
  return issues;
}

function validateDoOnceNodes(nodes, links) {
  const issues = [];
  const linkedPinIds = new Set();
  links.forEach((l) => {
    linkedPinIds.add(l.startPinId);
    linkedPinIds.add(l.endPinId);
  });

  nodes
    .filter((n) => n.nodeKey === "DoOnce")
    .forEach((node) => {
      const resetPin = node.pins?.find((p) => p.localId === "reset");
      if (resetPin && !linkedPinIds.has(resetPin.id || `${node.id}-reset`)) {
        issues.push(
          new AnalysisIssue({
            nodeId: node.id,
            severity: IssueSeverity.HINT,
            category: IssueCategory.LOGIC_FLOW,
            title: "DoOnce Without Reset",
            message: "DoOnce has no Reset connection.",
            suggestion: "Consider if reset is needed.",
            pitfallId: 7,
          })
        );
      }
    });
  return issues;
}

function validateCommentCoverage(nodes, _links) {
  const issues = [];
  const nonComment = nodes.filter((n) => n.nodeKey !== "Comment");
  const comments = nodes.filter((n) => n.nodeKey === "Comment");

  if (nonComment.length > 15 && comments.length === 0) {
    issues.push(
      new AnalysisIssue({
        nodeId: null,
        severity: IssueSeverity.INFO,
        category: IssueCategory.BEST_PRACTICE,
        title: "No Comments",
        message: `Graph has ${nonComment.length} nodes but no comments.`,
        suggestion: "Add Comment nodes (C key) to document logic.",
      })
    );
  }
  return issues;
}

// ============================================================
// NETWORKING VALIDATORS
// ============================================================

function validateNetworkAuthority(nodes, _links) {
  const issues = [];
  const serverOnlyActions = [
    "SetHealth",
    "AddItem",
    "RemoveItem",
    "TakeDamage",
    "ApplyDamage",
  ];

  nodes.forEach((node) => {
    if (serverOnlyActions.includes(node.nodeKey)) {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.WARNING,
          category: IssueCategory.NETWORKING,
          title: "Server Authority Required",
          message: `"${node.title}" should only run on Server.`,
          suggestion: "Add Switch Has Authority check before this node.",
          pitfallId: 51,
        })
      );
    }
  });
  return issues;
}

function validateRPCUsage(nodes, _links) {
  const issues = [];
  nodes
    .filter((n) => n.nodeKey?.includes("RPC") || n.nodeKey?.includes("Server_"))
    .forEach((node) => {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.INFO,
          category: IssueCategory.NETWORKING,
          title: "RPC Detected",
          message: `"${node.title}" is a network RPC.`,
          suggestion: "Ensure actor ownership is correct for RPC calls.",
          pitfallId: 52,
        })
      );
    });
  return issues;
}

function validateReplicationPatterns(nodes, _links) {
  const issues = [];
  const multicastNodes = nodes.filter((n) => n.nodeKey?.includes("Multicast"));
  const stateChangeNodes = [
    "SetActorHiddenInGame",
    "SetActorEnableCollision",
    "DestroyActor",
  ];

  multicastNodes.forEach((node) => {
    issues.push(
      new AnalysisIssue({
        nodeId: node.id,
        severity: IssueSeverity.INFO,
        category: IssueCategory.NETWORKING,
        title: "Multicast RPC",
        message: `"${node.title}" runs on all clients.`,
        suggestion:
          "Use for cosmetic effects only. Use Replicated Variables for state.",
        pitfallId: 53,
      })
    );
  });

  nodes
    .filter((n) => stateChangeNodes.includes(n.nodeKey))
    .forEach((node) => {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.WARNING,
          category: IssueCategory.NETWORKING,
          title: "State Change Node",
          message: `"${node.title}" changes replicated state.`,
          suggestion: "Run on Server only; let replication sync to clients.",
          pitfallId: 54,
        })
      );
    });
  return issues;
}

// ============================================================
// ANIMATION VALIDATORS
// ============================================================

function validateAnimationPatterns(nodes, _links) {
  const issues = [];

  // Check for direct pawn access in anim nodes
  const animNodes = nodes.filter(
    (n) => n.nodeKey?.includes("Anim") || n.nodeKey?.includes("Montage")
  );
  const pawnAccessNodes = [
    "GetActorLocation",
    "GetVelocity",
    "GetActorRotation",
  ];

  animNodes.forEach((node) => {
    issues.push(
      new AnalysisIssue({
        nodeId: node.id,
        severity: IssueSeverity.INFO,
        category: IssueCategory.ANIMATION,
        title: "Animation Node",
        message: `"${node.title}" controls animation.`,
        suggestion:
          "Ensure anim data is updated in Thread Safe Update if performance-critical.",
        pitfallId: 60,
      })
    );
  });

  // Check for expensive calculations that might run in anim
  nodes
    .filter((n) => pawnAccessNodes.includes(n.nodeKey))
    .forEach((node) => {
      issues.push(
        new AnalysisIssue({
          nodeId: node.id,
          severity: IssueSeverity.HINT,
          category: IssueCategory.ANIMATION,
          title: "Pawn Data Access",
          message: `"${node.title}" accesses actor data.`,
          suggestion: "For Anim Blueprints, cache this in Thread Safe Update.",
          pitfallId: 61,
        })
      );
    });

  return issues;
}

// ============================================================
// HELPERS
// ============================================================

function extractNodeId(pinId) {
  if (!pinId) return null;
  const parts = pinId.split("-");
  return parts.length >= 5 ? parts.slice(0, 5).join("-") : null;
}

function getFollowingNodes(nodeId, links, nodes) {
  const following = [];
  links.forEach((link) => {
    if (extractNodeId(link.startPinId) === nodeId) {
      const node = nodes.find((n) => n.id === extractNodeId(link.endPinId));
      if (node) following.push(node);
    }
  });
  return following;
}

// Singleton
export const graphAnalyzer = new GraphAnalyzer();
